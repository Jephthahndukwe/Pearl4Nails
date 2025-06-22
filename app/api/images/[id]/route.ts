import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

/**
 * API endpoint to serve reference images by appointment ID
 * This endpoint will retrieve images from our database, Cloudinary, or local storage
 * and serve them to the client with proper content types and caching headers
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get appointment ID from params
    const id = params.id;
    
    if (!id) {
      return new NextResponse('Missing appointment ID', { status: 400 });
    }
    
    // Get appointment from MongoDB using the ID
    const { getAppointmentCollection } = await import('@/app/lib/mongodb');
    const { ObjectId } = await import('mongodb');
    
    let appointment;
    try {
      const collection = await getAppointmentCollection();
      appointment = await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error('Error finding appointment:', error);
      return servePlaceholderImage();
    }
    
    // If no appointment or no reference image, serve placeholder
    if (!appointment?.referenceImage) {
      return servePlaceholderImage();
    }
    
    const referenceImage = appointment.referenceImage;
    
    // Case 1: Image is a Cloudinary URL or external URL
    if (typeof referenceImage === 'string' && 
        (referenceImage.startsWith('http') || referenceImage.startsWith('https'))) {
      try {
        // For external URLs, redirect to the URL
        const url = new URL(referenceImage);
        return new NextResponse(null, {
          status: 302,
          headers: {
            Location: url.toString(),
            'Cache-Control': 'public, max-age=86400', // Cache for 1 day
          },
        });
      } catch (error) {
        console.error('Invalid image URL:', error);
        return servePlaceholderImage();
      }
    }
    
    // Case 2: Image is a base64 data URL
    if (typeof referenceImage === 'string' && referenceImage.startsWith('data:image/')) {
      try {
        const base64Data = referenceImage.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid base64 image data');
        }
        
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const contentType = referenceImage.match(/^data:(image\/[a-z]+);/)?.[1] || 'image/jpeg';
        
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // Cache for 1 day
          },
        });
      } catch (error) {
        console.error('Error processing base64 image:', error);
        return servePlaceholderImage();
      }
    }
    
    // Case 3: Image is a local file path
    if (typeof referenceImage === 'string' && referenceImage.startsWith('/')) {
      try {
        const imagePath = path.join(process.cwd(), 'public', referenceImage);
        
        if (!fs.existsSync(imagePath)) {
          console.error('Local image not found:', imagePath);
          return servePlaceholderImage();
        }
        
        // Determine content type from file extension
        const ext = path.extname(imagePath).toLowerCase().substring(1);
        const contentType = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
        }[ext] || 'application/octet-stream';
        
        const imageBuffer = fs.readFileSync(imagePath);
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // Cache for 1 day
          },
        });
      } catch (error) {
        console.error('Error serving local image:', error);
        return servePlaceholderImage();
      }
    }
    
    // If we get here, the format is not recognized
    console.error('Unsupported image format:', typeof referenceImage);
    return servePlaceholderImage();
    
  } catch (error) {
    console.error('Error in image serving endpoint:', error);
    return servePlaceholderImage();
  }
}

/**
 * Serves a placeholder image when the requested image is not available
 */
async function servePlaceholderImage() {
  try {
    const imagePath = path.join(process.cwd(), 'public', 'images', 'placeholder-reference.jpg');
    
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600', // Shorter cache for placeholder
        },
      });
    }
  } catch (error) {
    console.error('Error serving placeholder image:', error);
  }
  
  // If we can't serve the placeholder, return a 404
  return new NextResponse('Image not found', { 
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
    },
  });
}
