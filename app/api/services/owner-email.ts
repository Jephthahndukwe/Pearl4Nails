import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com', 'smtp.outlook.com'
    port: parseInt(process.env.SMTP_PORT || '587'), // 587 for TLS, 465 for SSL
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_FROM, // your email address
      pass: process.env.EMAIL_PASSWORD, // your email password or app-specific password
    },
    // Optional: for self-signed certificates
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Helper function to send email with Nodemailer
const sendEmailWithNodemailer = async (emailData: {
  from: { email: string; name?: string };
  to: Array<{ email: string; name?: string }>;
  subject: string;
  html: string;
  text?: string;
  replyTo?: { email: string; name?: string };
  bcc?: Array<{ email: string; name?: string }>;
  cc?: Array<{ email: string; name?: string }>;
}): Promise<any> => {
  try {
    const transporter = createTransporter();

    // Format addresses for Nodemailer
    const formatAddress = (addr: { email: string; name?: string }) =>
      addr.name ? `"${addr.name}" <${addr.email}>` : addr.email;

    const formatAddresses = (addresses: Array<{ email: string; name?: string }>) =>
      addresses.map(formatAddress).join(', ');

    const mailOptions = {
      from: formatAddress(emailData.from),
      to: formatAddresses(emailData.to),
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      ...(emailData.replyTo && { replyTo: formatAddress(emailData.replyTo) }),
      ...(emailData.cc && { cc: formatAddresses(emailData.cc) }),
      ...(emailData.bcc && { bcc: formatAddresses(emailData.bcc) }),
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Nodemailer Error:', error);
    throw new Error(`Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const getLogoUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL + "/images/Pearl4Nails_logo.png"
}

// Common email styles (matching the customer email styles)
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

// Helper function to generate plain text from HTML
const generateTextFromHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

export const sendOwnerAppointmentNotification = async (appointment: any) => {
  try {
    // Generate services list HTML
    let servicesHtml = ""

    if (appointment.services && appointment.services.length > 0) {
      servicesHtml = appointment.services
        .map(
          (service: any, index: number) => `
        <div class="details-item">
          <strong>${index + 1}. Service:</strong> ${service.serviceName} - ${Array.isArray(service.serviceTypeName) ? service.serviceTypeName.join(', ') : service.serviceTypeName}
        </div>
         ${service.nailShape ? `
            <div class="details-item">
              <strong>Nail Shape:</strong> ${service.nailShape}
            </div>` : ''}
            ${service.nailDesign ? `
            <div class="details-item">
              <strong>Nail Design:</strong> ${service.nailDesign}
            </div>` : ''}
        ${service.servicePrice ? `
        <div class="details-item">
          <strong>Price:</strong> ${service.servicePrice}
        </div>` : ""}
        ${service.serviceDuration ? `
        <div class="details-item">
          <strong>Duration:</strong> ${service.serviceDuration}
        </div>` : ""}
      `)
        .join("")

      // Add total duration if available
      if (appointment.totalDuration) {
        servicesHtml += `
        <div class="details-item">
          <strong>Total Duration:</strong> ${appointment.totalDuration}
        </div>`;
      }

      // Add total price if available
      if (appointment.totalPrice) {
        const { min, max } = appointment.totalPrice;
        const priceText = min === max
          ? `₦${min.toLocaleString()}`
          : `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;

        servicesHtml += `
        <div class="details-item">
          <strong>Total Price:</strong> ${priceText}
        </div>`;
      }
      if (appointment.referenceImage) {
        servicesHtml += `
        <div class="details-item" style="text-align: center; margin-top: 20px;">
          <h4 style="color: #ff69b4; margin-bottom: 10px;">Client's Inspo Image</h4>
          <img src="${appointment.referenceImage}" alt="Reference Image" style="max-width: 100%; border-radius: 8px; border: 2px solid #ffd1e0;" />
          <p style="font-size: 12px; color: #999; margin-top: 5px;">
            If the image doesn't display, you can view it <a href="${appointment.referenceImage}" target="_blank" style="color: #ff69b4; text-decoration: underline;">here</a>.
          </p>
        </div>`}
    } else {
      // Single service (legacy format)
      servicesHtml = `
      <div class="details-item">
       <strong>Service:</strong> ${Array.isArray(appointment.serviceTypeName) ? appointment.serviceTypeName.join(', ') : appointment.serviceTypeName || appointment.serviceName || appointment.service || 'N/A'}
      </div>
      ${appointment.nailShape ? `
      <div class="details-item">
        <strong>Nail Shape:</strong> ${appointment.nailShape}
      </div>` : ''}
      ${appointment.nailDesign ? `
      <div class="details-item">
        <strong>Nail Design:</strong> ${appointment.nailDesign}
      </div>` : ''}
      ${appointment.servicePrice ? `
      <div class="details-item">
        <strong>Price:</strong> ${appointment.servicePrice}
      </div>` : ""}
      ${appointment.serviceDuration ? `
      <div class="details-item">
        <strong>Duration:</strong> ${appointment.serviceDuration}
      </div>` : ""}
      ${appointment.referenceImage ? `
      <div class="details-item" style="text-align: center; margin-top: 20px;">
        <h4 style="color: #ff69b4; margin-bottom: 10px;">Client's Inspo Image</h4>
        <img src="${appointment.referenceImage}" alt="Reference Image" style="max-width: 100%; border-radius: 8px; border: 2px solid #ffd1e0;" />
        <p style="font-size: 12px; color: #999; margin-top: 5px;">
          If the image doesn't display, you can view it <a href="${appointment.referenceImage}" target="_blank" style="color: #ff69b4; text-decoration: underline;">here</a>.
        </p>
      </div>` : ""}
    `;
    }

    // Format the date
    const appointmentDate = new Date(appointment.date)
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Create email HTML
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Appointment Notification</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" style="max-width: 200px;" />
          <h1 style="color: #ff69b4; font-size: 24px; margin: 10px 0;">New Appointment Notification</h1>
        </div>

        <div style="padding: 20px;">
          <p>A new appointment has been booked!</p>

          <div class="appointment-details">
            <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Client Information</h3>
            <div class="details-item">
              <strong>Name:</strong> ${appointment.name}
            </div>
            <div class="details-item">
              <strong>Email:</strong> ${appointment.email}
            </div>
            <div class="details-item">
              <strong>Phone:</strong> ${appointment.phone}
            </div>
            ${appointment.notes ? `
            <div class="details-item">
              <strong>Notes:</strong> ${appointment.notes}
            </div>` : ''}
          </div>

          <div class="appointment-details">
            <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Appointment Details</h3>
            <div class="details-item">
              <strong>Appointment ID:</strong> ${appointment.appointmentId}
            </div>
            <div class="details-item">
              <strong>Date:</strong> ${formattedDate}
            </div>
            <div class="details-item">
              <strong>Time:</strong> ${appointment.time}
            </div>
          </div>

          <div class="appointment-details">
            <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Services Booked</h3>
            ${servicesHtml}
          </div>
          
          <p>Best regards,<br>Pearl4Nails System</p>
          
          <p>This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
    `

    // Prepare email data for Nodemailer
    const emailData = {
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Pearl4Nails'
      },
      to: [{
        email: process.env.NODE_ENV === 'production'
          ? (process.env.OWNER_EMAIL || process.env.EMAIL_FROM)
          : (process.env.TEST_EMAIL || 'test@example.com')
      }],
      subject: `New Appointment Booked By: ${appointment.name} - ${formattedDate} at ${appointment.time}`,
      html: emailHtml,
      text: generateTextFromHtml(emailHtml),
    };

    // Send email using Nodemailer
    await sendEmailWithNodemailer(emailData);

    return true
  } catch (error) {
    console.error('Error sending owner notification email:', error)
    return false
  }
}

// Send owner cancellation notification email
export const sendOwnerCancellationNotification = async (appointment: any) => {
  try {
    // Format the appointment date
    const appointmentDate = new Date(appointment.date)
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Generate services list HTML
    let servicesHtml = ''
    if (appointment.services && appointment.services.length > 0) {
      servicesHtml = appointment.services
        .map(
          (service: any, index: number) => `
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
        .join('')
    } else {
      servicesHtml = `
      <div class="details-item">
        <strong>Service:</strong> ${appointment.serviceTypeName || appointment.serviceName || appointment.service || 'N/A'}
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

    // Create email HTML
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Cancellation Notification</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" style="max-width: 200px;" />
          <h1 style="color: #ff69b4; font-size: 24px; margin: 10px 0;">Appointment Cancellation</h1>
        </div>

        <div style="padding: 20px;">
          <p>An appointment has been cancelled.</p>

          <div class="appointment-details">
            <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Cancelled Appointment Details</h3>
            <div class="details-item">
              <strong>Appointment ID:</strong> ${appointment.appointmentId || 'N/A'}
            </div>
            <div class="details-item">
              <strong>Date:</strong> ${formattedDate}
            </div>
            <div class="details-item">
              <strong>Time:</strong> ${appointment.time}
            </div>
          </div>

          <div class="appointment-details">
            <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Services</h3>
            ${servicesHtml}
          </div>

          <div class="appointment-details">
            <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Client Information</h3>
            <div class="details-item">
              <strong>Name:</strong> ${appointment.name}
            </div>
            <div class="details-item">
              <strong>Email:</strong> ${appointment.email}
            </div>
            <div class="details-item">
              <strong>Phone:</strong> ${appointment.phone || 'Not provided'}
            </div>
            ${appointment.notes ? `
            <div class="details-item">
              <strong>Notes:</strong> ${appointment.notes}
            </div>` : ''}
          </div>

          <p>This is an automated notification.</p>
          
          <p>Best regards,<br>Pearl4Nails System</p>
        </div>
      </div>
    </body>
    </html>
    `

    // Prepare email data for Nodemailer
    const emailData = {
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Pearl4Nails'
      },
      to: [{
        email: process.env.NODE_ENV === 'production'
          ? (process.env.OWNER_EMAIL || process.env.EMAIL_FROM)
          : (process.env.TEST_EMAIL || 'test@example.com')
      }],
      subject: `Appointment Cancelled: ${appointment.name} - ${formattedDate} at ${appointment.time}`,
      html: emailHtml,
      text: generateTextFromHtml(emailHtml),
    };

    // Send cancellation email using Nodemailer
    await sendEmailWithNodemailer(emailData);

    return true
  } catch (error) {
    console.error('Error sending cancellation notification to owner:', error)
    return false
  }
}

// Send owner notification email for training registrations
export const sendOwnerTrainingNotification = async (registration: any) => {
  try {
    // Format the registration date
    const registrationDate = new Date(registration.date || new Date())
    const formattedDate = registrationDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Create email HTML
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Training Registration Notification</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" style="max-width: 200px;" />
          <h1 style="color: #ff69b4; font-size: 24px; margin: 10px 0;">New Training Registration</h1>
        </div>

        <div style="padding: 20px;">
          <p>A new training registration has been received!</p>

          <div class="appointment-details">
            <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Registration Details</h3>
            <div class="details-item">
              <strong>Registration ID:</strong> ${registration.id || 'N/A'}
            </div>
            <div class="details-item">
              <strong>Registration Date:</strong> ${formattedDate}
            </div>
          </div>

          <div class="appointment-details">
            <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Course Information</h3>
            <div class="details-item">
              <strong>Course:</strong> ${registration.course || 'N/A'}
            </div>
            <div class="details-item">
              <strong>Duration:</strong> ${registration.duration || 'N/A'}
            </div>
            <div class="details-item">
              <strong>Equipment Option:</strong> ${registration.equipment || 'N/A'}
            </div>
            <div class="details-item">
              <strong>Price:</strong> ${registration.price || 'N/A'}
            </div>
          </div>

          <div class="appointment-details">
            <h3 style="color: #ff69b4; margin: 0 0 15px 0; font-size: 18px;">Student Information</h3>
            <div class="details-item">
              <strong>Full Name:</strong> ${registration.fullName}
            </div>
            <div class="details-item">
              <strong>Email:</strong> ${registration.email}
            </div>
            <div class="details-item">
              <strong>Phone:</strong> ${registration.phone || 'Not provided'}
            </div>
            ${registration.message ? `
            <div class="details-item">
              <strong>Message:</strong> ${registration.message}
            </div>` : ''}
          </div>

          <p>This is an automated notification.</p>
          
          <p>Best regards,<br>Pearl4Nails System</p>
        </div>
      </div>
    </body>
    </html>
    `

    // Prepare email data for Nodemailer
    const emailData = {
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Pearl4Nails'
      },
      to: [{
        email: process.env.NODE_ENV === 'production'
          ? (process.env.OWNER_EMAIL || process.env.EMAIL_FROM)
          : (process.env.TEST_EMAIL || 'test@example.com')
      }],
      subject: `New Training Registration From: ${registration.fullName} - ${registration.course || 'Training'}`,
      html: emailHtml,
      text: generateTextFromHtml(emailHtml),
    };

    // Send training notification email using Nodemailer
    await sendEmailWithNodemailer(emailData);

    return true
  } catch (error) {
    console.error('Error sending training registration notification email:', error)
    return false
  }
}