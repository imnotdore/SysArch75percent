const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

// Sa EmailService class, idagdag ito:

async sendPickupNotification(residentEmail, residentName, fileName, details = {}) {
  try {
    const mailOptions = {
      from: `"Barangay Management System" <${process.env.EMAIL_USER}>`,
      to: residentEmail,
      subject: '📦 Your Document is Ready for Pickup',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { 
              background: #e3f2fd; 
              padding: 15px; 
              border-left: 4px solid #2196F3;
              margin: 20px 0;
              border-radius: 5px;
            }
            .instructions { 
              background: #fff8e1; 
              padding: 15px; 
              border-left: 4px solid #ffc107;
              margin: 20px 0;
              border-radius: 5px;
            }
            .button { 
              background: #2196F3; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Document Ready for Pickup!</h1>
            </div>
            <div class="content">
              <h3>Hello ${residentName},</h3>
              
              <p>Your requested document is now ready for pickup at the Barangay Office.</p>
              
              <div class="details">
                <p><strong>📄 Document:</strong> ${fileName}</p>
                ${details.requestDate ? `<p><strong>📅 Request Date:</strong> ${details.requestDate}</p>` : ''}
                ${details.pickupDeadline ? `<p><strong>⏰ Pickup Deadline:</strong> ${details.pickupDeadline}</p>` : ''}
              </div>
              
              ${details.instructions ? `
              <div class="instructions">
                <p><strong>📋 Special Instructions:</strong></p>
                <p>${details.instructions}</p>
              </div>
              ` : ''}
              
              <p><strong>📍 Pickup Location:</strong> ${process.env.BARANGAY_ADDRESS || 'Barangay Office'}</p>
              <p><strong>📞 Contact:</strong> ${process.env.BARANGAY_CONTACT || '(02) 123-4567'}</p>
              
              <p><strong>🕐 Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM</p>
              
              <div class="footer">
                <p><strong>Barangay Administration Office</strong></p>
                <p>${process.env.BARANGAY_ADDRESS || '123 Barangay Sto Domingo, Quezon City Philippines'}</p>
                <p>Please bring a valid ID for verification when claiming.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Pickup notification email sent to ${residentEmail}`);
    return true;
    
  } catch (error) {
    console.error('❌ Pickup email sending failed:', error);
    throw error;
  }
}

async sendScheduleNotification(residentEmail, residentName, scheduleDetails) {
  try {
    const mailOptions = {
      from: `"Barangay Management System" <${process.env.EMAIL_USER}>`,
      to: residentEmail,
      subject: '✅ Your Schedule/Item is Ready',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .schedule-info { 
              background: #e8f5e9; 
              padding: 15px; 
              border-left: 4px solid #4CAF50;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Schedule/Item Ready!</h1>
            </div>
            <div class="content">
              <h3>Hello ${residentName},</h3>
              
              <p>Your scheduled item is now ready for pickup/use.</p>
              
              <div class="schedule-info">
                <p><strong>📦 Item:</strong> ${scheduleDetails.item}</p>
                ${scheduleDetails.quantity ? `<p><strong>📊 Quantity:</strong> ${scheduleDetails.quantity}</p>` : ''}
                ${scheduleDetails.date_from ? `<p><strong>📅 From:</strong> ${new Date(scheduleDetails.date_from).toLocaleDateString('en-PH')}</p>` : ''}
                ${scheduleDetails.date_to ? `<p><strong>📅 To:</strong> ${new Date(scheduleDetails.date_to).toLocaleDateString('en-PH')}</p>` : ''}
                ${scheduleDetails.time_from ? `<p><strong>⏰ Time:</strong> ${scheduleDetails.time_from} - ${scheduleDetails.time_to || ''}</p>` : ''}
              </div>
              
              <p><strong>📍 Location:</strong> ${process.env.BARANGAY_ADDRESS || 'Barangay Office'}</p>
              <p><strong>📞 Contact:</strong> ${process.env.BARANGAY_CONTACT || '(02) 123-4567'}</p>
              
              <div class="footer">
                <p><strong>Barangay Administration Office</strong></p>
                <p>Please bring valid ID for verification and plastic bottle as your exchange to your file.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Schedule notification email sent to ${residentEmail}`);
    return true;
    
  } catch (error) {
    console.error('❌ Schedule email sending failed:', error);
    throw error;
  }
}
}

module.exports = new EmailService();