import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const getLogoUrl = () => {
  // Replace with your actual logo URL
  return process.env.NEXT_PUBLIC_APP_URL + '/images/Pearl4Nails_logo.png';
};

export const sendAppointmentConfirmation = async (appointment: any) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pearl4Nails Appointment Confirmation</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
          }
          
          .header {
            text-align: center;
            padding: 40px 0;
            background-color: #fff5f7;
            border-bottom: 2px solid #ff69b4;
          }
          
          .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 20px;
          }
          
          .main-content {
            padding: 30px;
          }
          
          .appointment-details {
            background-color: #fff5f7;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
          }
          
          .details-item {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #fff;
            border-radius: 5px;
            border-left: 4px solid #ff69b4;
          }
          
          .preparation-tips {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
          }
          
          .tip-item {
            background-color: #fff;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border: 1px solid #eee;
          }
          
          .footer {
            text-align: center;
            padding: 30px;
            background-color: #f8f9fa;
            border-top: 1px solid #eee;
          }
          
          .footer-links {
            margin-top: 20px;
          }
          
          .footer-link {
            display: inline-block;
            margin: 0 10px;
            text-decoration: none;
            color: #ff69b4;
            font-weight: 500;
          }
          
          .social-icons {
            margin-top: 20px;
          }
          
          .social-icon {
            display: inline-block;
            margin: 0 10px;
            font-size: 24px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" class="logo" />
            <h1 style="color: #ff69b4; font-size: 24px; margin: 0;">Appointment Confirmation</h1>
          </div>

          <div class="main-content">
            <p>Dear ${appointment.customer.name},</p>
            <p>Thank you for booking your appointment with Pearl4Nails! We're excited to help you achieve your desired look.</p>

            <div class="appointment-details">
              <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Appointment Details</h3>
              <div class="details-item">
                <strong>Service:</strong> ${appointment.service}
              </div>
              <div class="details-item">
                <strong>Date:</strong> ${appointment.date}
              </div>
              <div class="details-item">
                <strong>Time:</strong> ${appointment.time}
              </div>
              
              ${appointment.nailShape ? `<div class="details-item">
                <strong>Nail Shape:</strong> ${appointment.nailShape}
              </div>` : ''}
              
              ${appointment.nailDesign ? `<div class="details-item">
                <strong>Nail Design:</strong> ${appointment.nailDesign}
              </div>` : ''}
              
              ${appointment.tattooLocation ? `<div class="details-item">
                <strong>Tattoo Location:</strong> ${appointment.tattooLocation}
              </div>` : ''}
              
              ${appointment.tattooSize ? `<div class="details-item">
                <strong>Tattoo Size:</strong> ${appointment.tattooSize}
              </div>` : ''}
              
              ${appointment.specialRequests ? `<div class="details-item">
                <strong>Special Requests:</strong> ${appointment.specialRequests}
              </div>` : ''}
            </div>

            <div class="preparation-tips">
              <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Preparation Tips</h3>
              ${appointment.preparation.map((tip: string) => `
                <div class="tip-item">
                  ${tip}
                </div>
              `).join('')}
            </div>

            <p style="margin-top: 30px;">If you need to cancel or reschedule your appointment, please do so at least 24 hours before your scheduled time.</p>
            <p style="margin-top: 20px;">Thank you for choosing Pearl4Nails!</p>
          </div>

          <div class="footer">
            <p style="color: #666; margin-bottom: 20px;">The Pearl4Nails Team</p>
            <div class="footer-links">
              <a href="mailto:${appointment.contact.email}" class="footer-link">Email Us</a>
              <a href="tel:${appointment.contact.phone}" class="footer-link">Call Us</a>
            </div>
            <div class="social-icons">
              <a href="#" style="color: #666; text-decoration: none;">&copy; ${new Date().getFullYear()} Pearl4Nails</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const data = {
      from: 'Pearl4Nails <noreply@pearl4nails.com>',
      to: appointment.customer.email,
      subject: 'Your Pearl4Nails Appointment is Confirmed!',
      html,
    };

    await resend.emails.send(data);
    return { success: true };
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    throw error;
  }
};

export const sendCancellationNotification = async (appointment: any) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pearl4Nails Appointment Cancellation</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 2px 15px rgba(0,0,0,0.05);
          }
          
          .header {
            text-align: center;
            padding: 40px 0;
            background-color: #fff5f7;
            border-bottom: 2px solid #ff69b4;
          }
          
          .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 20px;
          }
          
          .main-content {
            padding: 30px;
          }
          
          .appointment-details {
            background-color: #fff5f7;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
          }
          
          .details-item {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #fff;
            border-radius: 5px;
            border-left: 4px solid #ff69b4;
          }
          
          .footer {
            text-align: center;
            padding: 30px;
            background-color: #f8f9fa;
            border-top: 1px solid #eee;
          }
          
          .footer-links {
            margin-top: 20px;
          }
          
          .footer-link {
            display: inline-block;
            margin: 0 10px;
            text-decoration: none;
            color: #ff69b4;
            font-weight: 500;
          }
          
          .social-icons {
            margin-top: 20px;
          }
          
          .social-icon {
            display: inline-block;
            margin: 0 10px;
            font-size: 24px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" class="logo" />
            <h1 style="color: #ff69b4; font-size: 24px; margin: 0;">Appointment Cancellation</h1>
          </div>

          <div class="main-content">
            <p>Dear ${appointment.customer.name},</p>
            <p>We regret to inform you that your appointment with Pearl4Nails has been cancelled. Here were your appointment details:</p>

            <div class="appointment-details">
              <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Appointment Details</h3>
              <div class="details-item">
                <strong>Service:</strong> ${appointment.service}
              </div>
              <div class="details-item">
                <strong>Date:</strong> ${appointment.date}
              </div>
              <div class="details-item">
                <strong>Time:</strong> ${appointment.time}
              </div>
            </div>

            <p style="margin-top: 30px;">If you would like to reschedule your appointment, please contact us at ${appointment.contact.email} or ${appointment.contact.phone}.</p>
            <p style="margin-top: 20px;">Thank you for understanding.</p>
          </div>

          <div class="footer">
            <p style="color: #666; margin-bottom: 20px;">The Pearl4Nails Team</p>
            <div class="footer-links">
              <a href="mailto:${appointment.contact.email}" class="footer-link">Email Us</a>
              <a href="tel:${appointment.contact.phone}" class="footer-link">Call Us</a>
            </div>
            <div class="social-icons">
              <a href="#" style="color: #666; text-decoration: none;">&copy; ${new Date().getFullYear()} Pearl4Nails</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const data = {
      from: 'Pearl4Nails <noreply@pearl4nails.com>',
      to: appointment.customer.email,
      subject: 'Your Pearl4Nails Appointment has been Cancelled',
      html,
    };

    await resend.emails.send(data);
    return { success: true };
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    throw error;
  }
};

export async function sendCancellationEmail(appointment: any): Promise<boolean> {
  try {
    const logoUrl = await getLogoUrl();
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="${logoUrl}" alt="Pearl4Nails Logo" style="width: 200px; margin-bottom: 20px;" />
        
        <h2 style="color: #333;">Appointment Cancellation Confirmation</h2>
        
        <p>Dear ${appointment.customer.name},</p>
        
        <p>We have received your request to cancel your appointment. Here are the details:</p>
        
        <div style="background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <p><strong>Service:</strong> ${appointment.service}</p>
          <p><strong>Date:</strong> ${appointment.date}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
        </div>
        
        <p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>The Pearl4Nails Team</p>
      </div>
    `;

    const data = {
      from: 'Pearl4Nails <noreply@pearl4nails.com>',
      to: appointment.customer.email,
      subject: 'Appointment Cancellation Confirmation',
      html: emailContent
    };

    await resend.emails.send(data);
    console.log('Cancellation email sent successfully to:', appointment.customer.email);
    return true;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return false;
  }
}
