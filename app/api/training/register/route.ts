import { NextResponse } from 'next/server';
import { sendTrainingWhatsAppNotification } from '../../services/whatsapp';
import { sendTrainingConfirmationEmail } from '../../services/email';
import { sendTrainingPushNotification } from '../../services/fcm';

/**
 * API handler for training registration
 */
export async function POST(request: Request) {
  try {
    // Parse the JSON body from the request
    const data = await request.json();
    
    // Validate required fields
    if (!data.fullName || !data.email || !data.phoneNumber || !data.course) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find the course title from the course ID (in a real app, we'd query a database)
    const courses = {
      'nail-art': 'Professional Nail Art',
      'lash-extensions': 'Lash Extension Mastery',
      'microblading': 'Microblading Certification'
    };
    
    const courseTitle = courses[data.course as keyof typeof courses] || data.course;
    
    // Create a registration object with a unique ID
    const registration = {
      id: `TR-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      course: courseTitle,
      previousExperience: data.previousExperience || '',
      message: data.message || '',
      date: new Date().toLocaleDateString(),
    };
    
    // Send WhatsApp notification
    await sendTrainingWhatsAppNotification(registration);
    
    // Send confirmation email to user
    await sendTrainingConfirmationEmail(registration);
    
    // Send push notification
    await sendTrainingPushNotification(registration);
    
    // Return success response with registration details
    return NextResponse.json({ 
      success: true, 
      message: 'Training registration successful', 
      registrationId: registration.id,
      redirectUrl: `/training/success?id=${registration.id}&course=${encodeURIComponent(courseTitle)}&date=${encodeURIComponent(registration.date)}`
    });
    
  } catch (error) {
    console.error('Error processing training registration:', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
