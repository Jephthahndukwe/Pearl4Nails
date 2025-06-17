import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Get logo URL
const getLogoUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL + "/images/Pearl4Nails_logo.png";
};

// Helper function to send email with retry logic
const sendEmailWithRetry = async (
  mailOptions: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
    bcc?: string | string[];
    cc?: string | string[];
    headers?: Record<string, string>;
  },
  maxRetries = 3,
  baseDelay = 1000
): Promise<boolean> => {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to send email to ${mailOptions.to}`);
      
      // For testing, only redirect owner notifications to test email
      const isOwnerNotification = process.env.EMAIL_FROM && 
        mailOptions.to === process.env.EMAIL_FROM;
      
      const toEmail = (process.env.NODE_ENV !== 'production' && isOwnerNotification)
        ? (process.env.TEST_EMAIL || 'onboarding@resend.dev')
        : mailOptions.to;
        
      console.log(`Sending email to:`, toEmail, isOwnerNotification ? '(owner notification)' : '(client email)');
      
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Pearl4Nails <noreply@pearl4nails.com>',
        to: toEmail,
        subject: mailOptions.subject,
        html: mailOptions.html,
        replyTo: mailOptions.replyTo,
        bcc: process.env.NODE_ENV === 'production' ? mailOptions.bcc : undefined,
        cc: process.env.NODE_ENV === 'production' ? mailOptions.cc : undefined,
        headers: {
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'Precedence': 'bulk',
          ...(mailOptions.headers || {})
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log(`✅ Email sent successfully (Attempt ${attempt}):`, data?.id);
      return true;
      
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed to send email:`, {
        error: error.message,
        code: error.name,
        statusCode: error.statusCode,
      });
      
      // If this is a permanent failure, don't retry
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        console.error('Permanent failure, not retrying');
        break;
      }
      
      // If this is the last attempt, don't wait
      if (attempt === maxRetries) break;
      
      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) * (0.8 + 0.4 * Math.random()),
        30000
      );
      
      console.log(`Retrying in ${Math.round(delay / 1000)} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error('All email sending attempts failed:', {
    to: mailOptions.to,
    subject: mailOptions.subject,
    error: lastError?.message,
    code: lastError?.name,
    statusCode: lastError?.statusCode,
  });
  
  throw lastError || new Error('Failed to send email after multiple attempts');
};

// Generate services HTML for email templates
const generateServicesHtml = (appointment: any): string => {
  let servicesHtml = "";

  if (appointment.services && appointment.services.length > 0) {
    // Multiple services
    servicesHtml = appointment.services
      .map((service: any, index: number) => `
        <div class="details-item">
          <strong>${index + 1}. Service:</strong> ${service.serviceName} - ${service.serviceTypeName}
        </div>
        ${service.servicePrice ? `
        <div class="details-item">
          <strong>Price:</strong> ${service.servicePrice}
        </div>` : ""}
        ${service.serviceDuration ? `
        <div class="details-item">
          <strong>Duration:</strong> ${service.serviceDuration}
        </div>` : ""}
      `)
      .join("");

    // Add total duration if available
    if (appointment.totalDuration) {
      servicesHtml += `
        <div class="details-item">
          <strong>Total Duration:</strong> ${appointment.totalDuration}
        </div>`;
    }
  } else {
    // Single service (legacy format)
    servicesHtml = `
      <div class="details-item">
        <strong>Service:</strong> ${appointment.serviceTypeName || appointment.serviceName || appointment.service}
      </div>
      ${appointment.servicePrice ? `
      <div class="details-item">
        <strong>Price:</strong> ${appointment.servicePrice}
      </div>` : ""}
      ${appointment.serviceDuration ? `
      <div class="details-item">
        <strong>Duration:</strong> ${appointment.serviceDuration}
      </div>` : ""}
    `;
  }

  return servicesHtml;
};

// Common email styles
const emailStyles = `
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
`;

// Send appointment confirmation email
export const sendAppointmentConfirmation = async (appointment: any): Promise<boolean> => {
  try {
    const servicesHtml = generateServicesHtml(appointment);
    const customerName = appointment.customer?.name || appointment.name;
    const customerEmail = appointment.customer?.email || appointment.email;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pearl4Nails Appointment Confirmation</title>
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" style="max-width: 200px;" />
            <h1 style="color: #ff69b4; font-size: 24px; margin: 10px 0;">Appointment Confirmation</h1>
          </div>

          <div style="padding: 20px;">
            <p>Dear ${customerName},</p>
            <p>Thank you for booking your appointment with Pearl4Nails! We're excited to help you achieve your desired look.</p>

            <div class="appointment-details">
              <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Appointment Details</h3>
              ${servicesHtml}
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

    console.log("Sending appointment confirmation email to:", customerEmail);
    
    return await sendEmailWithRetry({
      to: customerEmail,
      subject: "Your Pearl4Nails Appointment Confirmation",
      html: html,
    });

  } catch (error) {
    console.error("Error in sendAppointmentConfirmation:", error);
    return false;
  }
};

// Send appointment cancellation email
export const sendCancellationEmail = async (appointment: any): Promise<boolean> => {
  try {
    const servicesHtml = generateServicesHtml(appointment);
    const customerName = appointment.customer?.name || appointment.name;
    const customerEmail = appointment.customer?.email || appointment.email;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pearl4Nails Appointment Cancellation</title>
        ${emailStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" style="max-width: 200px;" />
            <h1 style="color: #ff69b4; font-size: 24px; margin: 10px 0;">Appointment Cancellation</h1>
          </div>

          <div style="padding: 20px;">
            <p>Dear ${customerName},</p>
            <p>We have confirmed the cancellation of your appointment. Here were your appointment details:</p>

            <div class="appointment-details">
              <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Cancelled Appointment Details</h3>
              ${servicesHtml}
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

    console.log("Sending appointment cancellation email to:", customerEmail);
    return await sendEmailWithRetry({
      to: customerEmail,
      subject: "Your Pearl4Nails Appointment has been Cancelled",
      html: html,
    });

  } catch (error) {
    console.error("Error in sendCancellationEmail:", error);
    return false;
  }
};

// Send training registration confirmation email
export const sendTrainingConfirmationEmail = async (registration: any): Promise<{ success: boolean; error?: any }> => {
  try {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pearl4Nails Training Registration Confirmation</title>
        ${emailStyles}
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

            <div class="appointment-details">
              <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Registration Details</h3>
              <div class="details-item">
                <strong>Course:</strong> ${registration.course}
              </div>
              <div class="details-item">
                <strong>Duration:</strong> ${registration.duration}
              </div>
              <div class="details-item">
                <strong>Equipment Option:</strong> ${registration.equipment}
              </div>
              <div class="details-item">
                <strong>Price:</strong> ${registration.price}
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

    console.log("Sending training registration confirmation email to:", registration.email);
    const success = await sendEmailWithRetry({
      to: registration.email,
      subject: "Your Pearl4Nails Training Registration Confirmation",
      html: html,
    });
    return { success };

  } catch (error) {
    console.error("Error sending training registration confirmation email:", error);
    return { success: false, error };
  }
};

// API route handler for email service
export async function POST(req: Request) {
  try {
    const appointment = await req.json();
    const success = await sendAppointmentConfirmation(appointment);
    
    return new Response(JSON.stringify({ success }), {
      headers: { "Content-Type": "application/json" },
      status: success ? 200 : 500,
    });
  } catch (error) {
    console.error("Error in email service API:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}