import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

// Save file locally and return the local URL
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

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Convert file to buffer and save locally
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return local URL that can be used for preview
    const localUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      localUrl,
      fileName: file.name,
      filePath // For server-side cleanup later
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}

// Upload to Cloudinary (to be called when booking is confirmed)
export async function PUT(request: Request) {
  try {
    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }

    // Import Cloudinary dynamically since we only need it for this endpoint
    const { v2: cloudinary } = require('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        join(process.cwd(), 'public', filePath),
        { folder: 'pearl4nails' },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result);
        }
      );
    });

    // Delete the local file after successful upload
    await deleteFile(join(process.cwd(), 'public', filePath));

    return NextResponse.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload to Cloudinary' },
      { status: 500 }
    );
  }
}
