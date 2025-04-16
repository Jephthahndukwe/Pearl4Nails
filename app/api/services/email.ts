import nodemailer from 'nodemailer';

// Create a transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const getLogoUrl = () => {
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
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #fff5f7;
            border-bottom: 2px solid #ff69b4;
          }
          .appointment-details {
            background-color: #fff5f7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .details-item {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #fff;
            border-radius: 5px;
            border-left: 4px solid #ff69b4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" style="max-width: 200px;" />
            <h1 style="color: #ff69b4; font-size: 24px; margin: 10px 0;">Appointment Confirmation</h1>
          </div>

          <div style="padding: 20px;">
            <p>Dear ${appointment.customer.name},</p>
            <p>Thank you for booking your appointment with Pearl4Nails! We're excited to help you achieve your desired look.</p>

            <div class="appointment-details">
              <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Appointment Details</h3>
              <div class="details-item">
                <strong>Service:</strong> ${appointment.serviceTypeName || appointment.serviceName || appointment.service}
              </div>
              ${appointment.servicePrice ? `
              <div class="details-item">
                <strong>Price:</strong> ${appointment.servicePrice}
              </div>` : ''}
              ${appointment.serviceDuration ? `
              <div class="details-item">
                <strong>Duration:</strong> ${appointment.serviceDuration}
              </div>` : ''}
              <div class="details-item">
                <strong>Date:</strong> ${appointment.date}
              </div>
              <div class="details-item">
                <strong>Time:</strong> ${appointment.time}
              </div>
              <div class="details-item">
                <strong>Location:</strong> ${appointment.location}
              </div>
            </div>

            <p>If you need to reschedule or cancel your appointment, please contact us at our email or phone.</p>
            <p>We look forward to seeing you!</p>
            
            <p>Best regards,<br>The Pearl4Nails Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: `"Pearl4Nails" <${process.env.EMAIL_USER}>`,
      to: appointment.customer.email,
      subject: 'Your Pearl4Nails Appointment Confirmation',
      html: html
    };

    console.log('Sending appointment confirmation email to:', appointment.customer.email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    return { success: false, error };
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
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #fff5f7;
            border-bottom: 2px solid #ff69b4;
          }
          .appointment-details {
            background-color: #fff5f7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .details-item {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #fff;
            border-radius: 5px;
            border-left: 4px solid #ff69b4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" style="max-width: 200px;" />
            <h1 style="color: #ff69b4; font-size: 24px; margin: 10px 0;">Appointment Cancellation</h1>
          </div>

          <div style="padding: 20px;">
            <p>Dear ${appointment.customer.name},</p>
            <p>We regret to inform you that your appointment with Pearl4Nails has been cancelled. Here were your appointment details:</p>

            <div class="appointment-details">
              <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Appointment Details</h3>
              <div class="details-item">
                <strong>Service:</strong> ${appointment.serviceTypeName || appointment.serviceName || appointment.service}
              </div>
              ${appointment.servicePrice ? `
              <div class="details-item">
                <strong>Price:</strong> ${appointment.servicePrice}
              </div>` : ''}
              ${appointment.serviceDuration ? `
              <div class="details-item">
                <strong>Duration:</strong> ${appointment.serviceDuration}
              </div>` : ''}
              <div class="details-item">
                <strong>Date:</strong> ${appointment.date}
              </div>
              <div class="details-item">
                <strong>Time:</strong> ${appointment.time}
              </div>
              <div class="details-item">
                <strong>Location:</strong> ${appointment.location}
              </div>
            </div>

            <p>If you would like to reschedule your appointment, please contact us at our email or phone.</p>
            <p>Thank you for understanding.</p>
            
            <p>Best regards,<br>The Pearl4Nails Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: `"Pearl4Nails" <${process.env.EMAIL_USER}>`,
      to: appointment.customer.email,
      subject: 'Your Pearl4Nails Appointment has been Cancelled',
      html: html
    };

    console.log('Sending appointment cancellation email to:', appointment.customer.email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    return { success: false, error };
  }
};

/**
 * Send confirmation email for training registration
 */
export const sendTrainingConfirmationEmail = async (registration: any) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pearl4Nails Training Registration Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #fff5f7;
            border-bottom: 2px solid #ff69b4;
          }
          .registration-details {
            background-color: #fff5f7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .details-item {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #fff;
            border-radius: 5px;
            border-left: 4px solid #ff69b4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" style="max-width: 200px;" />
            <h1 style="color: #ff69b4; font-size: 24px; margin: 10px 0;">Training Registration Confirmation</h1>
          </div>

          <div style="padding: 20px;">
            <p>Dear ${registration.fullName},</p>
            <p>Thank you for registering for our training course at Pearl4Nails! We're excited to help you develop your skills.</p>

            <div class="registration-details">
              <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Registration Details</h3>
              <div class="details-item">
                <strong>Course:</strong> ${registration.course}
              </div>
              <div class="details-item">
                <strong>Registration Date:</strong> ${registration.date}
              </div>
              <div class="details-item">
                <strong>Registration ID:</strong> ${registration.id}
              </div>
            </div>

            <p>We will contact you shortly with detailed information about your training schedule, materials, and any preparations needed.</p>
            <p>If you have any questions or need any further information, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>The Pearl4Nails Training Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: `"Pearl4Nails Training" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: 'Your Pearl4Nails Training Registration Confirmation',
      html: html
    };

    console.log('Sending training registration confirmation email to:', registration.email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending training registration confirmation email:', error);
    return { success: false, error };
  }
};

export async function sendCancellationEmail(appointment: any): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" style="width: 200px; margin-bottom: 20px;" />
        
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

    // Mail options
    const mailOptions = {
      from: `"Pearl4Nails" <${process.env.EMAIL_USER}>`,
      to: appointment.customer.email,
      subject: 'Appointment Cancellation Confirmation',
      html: html
    };

    console.log('Sending cancellation email to:', appointment.customer.email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    
    return true;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return false;
  }
}