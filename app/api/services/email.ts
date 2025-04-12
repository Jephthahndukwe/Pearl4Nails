import { MailerSend } from 'mailersend';

const mailerSend = new MailerSend({
  api_key: process.env.MAILERSEND_API_KEY,
});

export const sendBookingConfirmationEmail = async (bookingDetails: any) => {
  try {
    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pearl4Nails Appointment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; padding: 20px 0; background-color: #fff5f7;">
                  <img 
                    src="https://pearl4nails.com/images/logo.png" 
                    alt="Pearl4Nails Logo" 
                    style="max-width: 200px; margin: 0 auto;"
                  />
                  <h1 style="color: #ff69b4;">Appointment Confirmation</h1>
              </div>

              <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2>Dear ${bookingDetails.customer.name},</h2>
                  <p>Thank you for booking your appointment with Pearl4Nails! We're excited to help you achieve your desired look.</p>

                  <div style="margin: 20px 0; padding: 15px; background-color: #fff5f7; border-radius: 6px;">
                      <h3>Appointment Details</h3>
                      <p><strong>Service:</strong> ${bookingDetails.service}</p>
                      <p><strong>Date:</strong> ${bookingDetails.date}</p>
                      <p><strong>Time:</strong> ${bookingDetails.time}</p>
                      
                      ${bookingDetails.nailShape ? `<p><strong>Nail Shape:</strong> ${bookingDetails.nailShape}</p>` : ''}
                      ${bookingDetails.nailDesign ? `<p><strong>Nail Design:</strong> ${bookingDetails.nailDesign}</p>` : ''}

                      <p><strong>Location:</strong> ${bookingDetails.location}</p>
                  </div>

                  <h3>Preparation Tips</h3>
                  <ul style="list-style-type: disc; padding-left: 20px;">
                      ${bookingDetails.preparation.map(tip => `<li>${tip}</li>`).join('')}
                  </ul>

                  <p>If you need to reschedule or cancel your appointment, please let us know at least 24 hours in advance.</p>

                  <p>Looking forward to seeing you!</p>
                  <p>The Pearl4Nails Team</p>
              </div>

              <div style="text-align: center; padding: 20px; background-color: #f8f9fa;">
                  <p>Need to contact us? <a href="mailto:${bookingDetails.contact.email}" style="display: inline-block; padding: 10px 20px; background-color: #ff69b4; color: white; text-decoration: none; border-radius: 4px;">Email Us</a></p>
                  <p>Follow us on social media for more updates and inspiration!</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const response = await mailerSend.email.send({
      from: {
        email: 'no-reply@pearl4nails.com',
        name: 'Pearl4Nails',
      },
      to: [
        {
          email: bookingDetails.customer.email,
          name: bookingDetails.customer.name,
        },
      ],
      subject: 'Your Pearl4Nails Appointment Confirmation',
      html: template,
    });

    return response.status === 202;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
