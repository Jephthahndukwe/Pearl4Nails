import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API endpoint to serve reference images by appointment ID
 * This endpoint will retrieve images from our database or storage 
 * and serve them to WhatsApp or other applications
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get appointment ID from params - correctly await it for Next.js App Router
    const id = params.id;
    
    if (!id) {
      return new NextResponse('Missing appointment ID', { status: 400 });
    }
    
        // Get appointment from MongoDB using the ID
    const { getAppointmentCollection } = await import('@/app/lib/mongodb');
    const { ObjectId } = await import('mongodb');
    
    const collection = await getAppointmentCollection();
    let appointment;
    
    try {
      appointment = await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error('Error finding appointment:', error);
      // Continue execution to use placeholder image
    }
    
    if (!appointment || !appointment.referenceImage) {
      // If no appointment found or no reference image, use a placeholder
      const imagePath = path.join(process.cwd(), 'public', 'images', 'placeholder-reference.jpg');
      
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        return new NextResponse('Image not found', { status: 404 });
      }
      
      // Read the placeholder file
      const imageBuffer = fs.readFileSync(imagePath);
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        },
      });
    }
    
    // If we have a reference image, it's in base64 format - decode and return it
    const imageData = appointment.referenceImage;
    const base64Data = imageData.split(',')[1]; // Remove the data:image/jpeg;base64, part
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Return image with proper content type
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
    
    // NOTE: In a production environment, you would:
    // 1. Retrieve the actual image data for the appointment from DB
    // 2. Convert from base64 if needed 
    // 3. Serve with proper content type
    // 4. Add authentication to prevent unauthorized access
    
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
