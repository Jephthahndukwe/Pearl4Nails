import { NextResponse } from 'next/server';
import { Readable } from 'stream';
// Use require to avoid TypeScript errors with Cloudinary
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file: File): Promise<{secure_url: string, public_id: string}> => {
  try {
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Convert buffer to stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // Signals the end of the stream
    
    // Create a promise to handle the upload
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'pearl4nails' },
        (error: any, result: any) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id
          });
        }
      );
      
      // Pipe the file buffer to Cloudinary
      readable.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

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

    // Upload to Cloudinary
    const { secure_url, public_id } = await uploadToCloudinary(file);
    
    return NextResponse.json({
      success: true,
      secure_url,
      public_id,
      fileName: file.name
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
