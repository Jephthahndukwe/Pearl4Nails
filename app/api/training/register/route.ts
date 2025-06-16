import { NextResponse } from 'next/server';
import { sendTrainingWhatsAppNotification } from '../../services/whatsapp';
import { sendTrainingConfirmationEmail } from '../../services/email';
import { sendTrainingPushNotification } from '../../services/fcm';
import { sendOwnerTrainingNotification } from '../../services/owner-email';

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
    
    // Find the course title from the course ID
    const courses = {
      'nail-art': 'Professional Nail Art',
      'lash-extensions': 'Lash Extension Mastery',
      'microblading': 'Microblading Certification'
    };
    
    // Map duration IDs to readable names
    const durations = {
      '4-weeks': '4 Weeks Course',
      '3-months': '3 Months Course',
      '6-months': '6 Months Course',
      '1-week': '1 Week Course',
      '2-weeks': '2 Weeks Course',
      '3-days': '3 Days Course'
    };
    
    // Map equipment options to readable names
    const equipmentOptions = {
      'provided': 'Equipment Provided by Pearl4Nails',
      'self': 'Student Provides Own Equipment'
    };
    
    // Price matrix for different course/duration/equipment combinations
    const priceMatrix = {
      // Nail Art
      'nail-art-4-weeks-provided': '₦250,000',
      'nail-art-4-weeks-self': '₦150,000',
      'nail-art-3-months-provided': '₦500,000',
      'nail-art-3-months-self': '₦350,000',
      'nail-art-6-months-provided': '₦750,000',
      'nail-art-6-months-self': '₦550,000',
      
      // Lash Extensions
      'lash-extensions-1-week-provided': '₦200,000',
      'lash-extensions-1-week-self': '₦120,000',
      'lash-extensions-2-weeks-provided': '₦300,000',
      'lash-extensions-2-weeks-self': '₦220,000',
      
      // Microblading
      'microblading-3-days-provided': '₦280,000',
      'microblading-3-days-self': '₦180,000',
      'microblading-1-week-provided': '₦380,000',
      'microblading-1-week-self': '₦280,000'
    };
    
    const courseTitle = courses[data.course as keyof typeof courses] || data.course;
    const durationName = durations[data.duration as keyof typeof durations] || data.duration;
    const equipmentName = equipmentOptions[data.equipment as keyof typeof equipmentOptions] || data.equipment;
    const priceKey = `${data.course}-${data.duration}-${data.equipment}`;
    const price = priceMatrix[priceKey as keyof typeof priceMatrix] || 'Price not found';
    
    // Validate required fields
    if (!data.duration || !data.equipment) {
      return NextResponse.json({ error: 'Missing duration or equipment selection' }, { status: 400 });
    }
    
    // Create a registration object with a unique ID
    const registration = {
      id: `TR-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      course: courseTitle,
      duration: durationName,
      equipment: equipmentName,
      price: price,
      previousExperience: data.previousExperience || '',
      message: data.message || '',
      date: new Date().toLocaleDateString(),
    };
    
    // Send all notifications in parallel
    await Promise.all([
      // Send WhatsApp notification
      sendTrainingWhatsAppNotification(registration).catch(error => 
        console.error('Failed to send WhatsApp notification:', error)
      ),
      
      // Send confirmation email to user
      sendTrainingConfirmationEmail(registration).catch(error => 
        console.error('Failed to send confirmation email:', error)
      ),
      
      // Send push notification
      sendTrainingPushNotification(registration).catch(error => 
        console.error('Failed to send push notification:', error)
      ),
      
      // Send notification to owner
      sendOwnerTrainingNotification(registration).catch(error =>
        console.error('Failed to send owner notification:', error)
      )
    ]);
    
    // Return success response with registration details
    return NextResponse.json({ 
      success: true, 
      message: 'Training registration successful', 
      registrationId: registration.id,
      redirectUrl: `/training/success?id=${registration.id}&course=${encodeURIComponent(courseTitle)}&duration=${encodeURIComponent(durationName)}&equipment=${encodeURIComponent(equipmentName)}&price=${encodeURIComponent(price)}&date=${encodeURIComponent(registration.date)}`
    });
    
  } catch (error) {
    console.error('Error processing training registration:', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
