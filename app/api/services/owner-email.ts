import nodemailer from "nodemailer"

// Create a transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const getLogoUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL + "/images/Pearl4Nails_logo.png"
}

export const sendOwnerAppointmentNotification = async (appointment: any) => {
  try {
    // Generate services list HTML
    let servicesHtml = ""

    if (appointment.services && appointment.services.length > 0) {
      servicesHtml = appointment.services
        .map(
          (service: any, index: number) => `
        <div class="details-item" style="margin-bottom: 15px;">
          <strong>${index + 1}. ${service.serviceName} - ${service.serviceTypeName}</strong>
          <div style="margin-left: 20px; margin-top: 5px;">
            ${service.servicePrice ? `<div>Price: ${service.servicePrice}</div>` : ''}
            ${service.serviceDuration ? `<div>Duration: ${service.serviceDuration}</div>` : ''}
          </div>
        </div>`
        )
        .join("")

      // Add total duration if available
      if (appointment.totalDuration) {
        servicesHtml += `
        <div class="details-item" style="margin-top: 10px; font-weight: bold;">
          Total Duration: ${appointment.totalDuration}
        </div>`
      }
    } else {
      // Single service (legacy format)
      servicesHtml = `
      <div class="details-item">
        <strong>Service:</strong> ${appointment.serviceTypeName || appointment.serviceName || appointment.service || 'N/A'}
      </div>`
      
      if (appointment.servicePrice) {
        servicesHtml += `
        <div class="details-item">
          <strong>Price:</strong> ${appointment.servicePrice}
        </div>`
      }
      
      if (appointment.serviceDuration) {
        servicesHtml += `
        <div class="details-item">
          <strong>Duration:</strong> ${appointment.serviceDuration}
        </div>`
      }
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
    <html>
      <head>
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
            border: 1px solid #e0e0e0;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 10px;
          }
          .details {
            margin: 20px 0;
          }
          .details-item {
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" class="logo">
            <h1>New Appointment Notification</h1>
          </div>
          
          <div class="details">
            <h2>Appointment Details</h2>
            <div class="details-item">
              <strong>Appointment ID:</strong> ${appointment.appointmentId}
            </div>
            <div class="details-item">
              <strong>Date:</strong> ${formattedDate}
            </div>
            <div class="details-item">
              <strong>Time:</strong> ${appointment.time}
            </div>
            
            <h3 style="margin-top: 20px;">Services Booked</h3>
            ${servicesHtml}
            
            <h3 style="margin-top: 20px;">Client Information</h3>
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
          
          <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Pearl4Nails. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `

    // Send email
    await transporter.sendMail({
      from: `"Pearl4Nails" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER || '',
      subject: `New Appointment Booked By: ${appointment.name} - ${formattedDate} at ${appointment.time}`,
      html: emailHtml,
    })

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
        <div class="details-item" style="margin-bottom: 15px;">
          <strong>${index + 1}. ${service.serviceName} - ${service.serviceTypeName}</strong>
          <div style="margin-left: 20px; margin-top: 5px;">
            ${service.servicePrice ? `<div>Price: ${service.servicePrice}</div>` : ''}
            ${service.serviceDuration ? `<div>Duration: ${service.serviceDuration}</div>` : ''}
          </div>
        </div>`
        )
        .join('')
    } else {
      servicesHtml = `
      <div class="details-item">
        <strong>Service:</strong> ${appointment.serviceTypeName || appointment.serviceName || appointment.service || 'N/A'}
      </div>`
      
      if (appointment.servicePrice) {
        servicesHtml += `
        <div class="details-item">
          <strong>Price:</strong> ${appointment.servicePrice}
        </div>`
      }
      
      if (appointment.serviceDuration) {
        servicesHtml += `
        <div class="details-item">
          <strong>Duration:</strong> ${appointment.serviceDuration}
        </div>`
      }
    }

    // Create email HTML
    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
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
            border: 1px solid #e0e0e0;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 10px;
          }
          .details {
            margin: 20px 0;
          }
          .details-item {
            margin-bottom: 10px;
            padding: 10px;
            background-color: #fff5f5;
            border-radius: 5px;
            border-left: 4px solid #ff6b6b;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" class="logo">
            <h1>Appointment Cancellation</h1>
          </div>
          
          <div class="details">
            <div class="details-item" style="background-color: #ffebee; border-left-color: #f44336;">
              <h2 style="color: #d32f2f; margin: 0;">An appointment has been cancelled</h2>
            </div>
            
            <h3 style="margin-top: 20px;">Appointment Details</h3>
            <div class="details-item">
              <strong>Appointment ID:</strong> ${appointment.appointmentId || 'N/A'}
            </div>
            <div class="details-item">
              <strong>Date:</strong> ${formattedDate}
            </div>
            <div class="details-item">
              <strong>Time:</strong> ${appointment.time}
            </div>
            
            <h3 style="margin-top: 20px;">Services</h3>
            ${servicesHtml}
            
            <h3 style="margin-top: 20px;">Client Information</h3>
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
            
            <div class="details-item" style="margin-top: 20px; background-color: #f5f5f5; border-left-color: #9e9e9e;">
              <strong>Status:</strong> <span style="color: #d32f2f; font-weight: bold;">CANCELLED</span>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Pearl4Nails. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `

    // Send email
    await transporter.sendMail({
      from: `"Pearl4Nails Notifications" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER || '',
      subject: `Appointment Cancelled: ${appointment.name} - ${formattedDate} at ${appointment.time}`,
      html: emailHtml,
    })

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
    <html>
      <head>
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
            border: 1px solid #e0e0e0;
            border-radius: 8px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 10px;
          }
          .details {
            margin: 20px 0;
          }
          .details-item {
            margin-bottom: 10px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
            border-left: 4px solid #ff69b4;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${getLogoUrl()}" alt="Pearl4Nails Logo" class="logo">
            <h1>New Training Registration</h1>
          </div>
          
          <div class="details">
            <h2>Registration Details</h2>
            <div class="details-item">
              <strong>Registration ID:</strong> ${registration.id || 'N/A'}
            </div>
            <div class="details-item">
              <strong>Registration Date:</strong> ${formattedDate}
            </div>
            
            <h3 style="margin-top: 20px;">Course Information</h3>
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
            
            <h3 style="margin-top: 20px;">Student Information</h3>
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
          
          <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Pearl4Nails. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `

    // Send email
    await transporter.sendMail({
      from: `"Pearl4Nails Training" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER || '',
      subject: `New Training Registration From: ${registration.fullName} - ${registration.course || 'Training'}`,
      html: emailHtml,
    })

    return true
  } catch (error) {
    console.error('Error sending training registration notification email:', error)
    return false
  }
}
