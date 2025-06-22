import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Check if we're in a serverless environment (like Netlify)
const IS_SERVERLESS = process.env.NETLIFY === 'true' || process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Local storage configuration
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Helper function to ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw new Error('Failed to create upload directory');
  }
}

// Helper function to delete a file
async function deleteFile(filePath: string) {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', filePath, error);
  }
}

// Upload file to Cloudinary
async function uploadToCloudinary(buffer: Buffer, fileName: string) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'pearl4nails',
        public_id: fileName.split('.')[0],
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('No result from Cloudinary'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format
        });
      }
    );

    // Write the buffer to the upload stream
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
}

// Save file and return the URL
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExt}`;

    if (IS_SERVERLESS) {
      // In production/serverless environment, upload directly to Cloudinary
      try {
        const result = await uploadToCloudinary(buffer, fileName);
        return NextResponse.json({
          success: true,
          url: result.url,
          fileName: file.name,
          isCloudinary: true
        });
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        return NextResponse.json(
          { error: 'Failed to upload to Cloudinary' },
          { status: 500 }
        );
      }
    } else {
      // In development, save locally
      try {
        await ensureUploadDir();
        const filePath = join(UPLOAD_DIR, fileName);
        await writeFile(filePath, buffer);
        const localUrl = `/uploads/${fileName}`;
        
        return NextResponse.json({
          success: true,
          url: localUrl,
          fileName: file.name,
          isCloudinary: false,
          filePath // For server-side cleanup later
        });
      } catch (error) {
        console.error('Local file save failed:', error);
        return NextResponse.json(
          { error: 'Failed to save file locally' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}

// This endpoint is no longer needed in the new flow
// as we handle Cloudinary uploads directly in the POST handler
export async function PUT() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use POST for direct uploads.' },
    { status: 410 } // 410 Gone
  );
}
