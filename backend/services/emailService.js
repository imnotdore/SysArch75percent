// emailServiceFixed.js - COMPLETE FIXED VERSION
const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    // ✅ WALANG TOP-LEVEL AWAIT
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // ================= COMPUTER BORROWING NOTIFICATION =================
  async sendComputerBorrowingNotification(residentEmail, residentName, details) {
    try {
      const { pc, date, startTime, endTime, status } = details;
      
      const subject = status === 'Approved' 
        ? `✅ Computer Borrowing Request Approved - ${pc}` 
        : status === 'Cancelled'
        ? `❌ Computer Borrowing Request Cancelled - ${pc}`
        : `📋 Computer Borrowing Request Update - ${pc}`;
      
      const statusMessage = status === 'Approved'
        ? `Your computer borrowing request has been approved! Please see the details below:`
        : status === 'Cancelled'
        ? `Your computer borrowing request has been cancelled by the staff.`
        : status === 'Done'
        ? `Your computer borrowing session has been marked as completed.`
        : `Your computer borrowing request status has been updated.`;
      
      const html = this.generateComputerBorrowingHTML(residentName, details, status, statusMessage);
      
      const mailOptions = {
        from: `"Barangay Computer System" <${process.env.EMAIL_USER}>`,
        to: residentEmail,
        subject: subject,
        html: html
      };
      
      await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Computer borrowing notification sent to ${residentEmail} (Status: ${status})`);
      return true;
    } catch (error) {
      console.error('❌ Error sending computer borrowing notification:', error);
      throw error;
    }
  }

  // ================= HELPER METHODS =================
  generateComputerBorrowingHTML(residentName, details, status, statusMessage) {
    const { pc, date, startTime, endTime } = details;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { 
            background: #f9f9f9; 
            padding: 30px; 
            border-radius: 0 0 10px 10px; 
          }
          .details { 
            background: white; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
            border-left: 4px solid #28D69F; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .detail-row { 
            display: flex; 
            margin-bottom: 10px; 
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label { 
            font-weight: bold; 
            width: 140px; 
            color: #555; 
            flex-shrink: 0;
          }
          .detail-value { 
            flex: 1; 
            color: #2c3e50;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #666; 
            font-size: 14px; 
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .status-badge { 
            display: inline-block; 
            padding: 8px 20px; 
            border-radius: 20px; 
            font-weight: bold; 
            margin-bottom: 20px;
            font-size: 14px;
            ${status === 'Approved' ? 'background: #d4edda; color: #155724; border: 2px solid #c3e6cb;' : 
              status === 'Cancelled' ? 'background: #f8d7da; color: #721c24; border: 2px solid #f5c6cb;' :
              status === 'Done' ? 'background: #d1ecf1; color: #0c5460; border: 2px solid #bee5eb;' :
              'background: #fff3cd; color: #856404; border: 2px solid #ffecb5;'}
          }
          .instructions {
            background: #e7f5ff;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #2196F3;
          }
          .highlight {
            background: #fff8e1;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border: 2px solid #ffd54f;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Computer Borrowing Request Update</h1>
            <p>Barangay Computer Reservation System</p>
          </div>
          
          <div class="content">
            <div style="text-align: center;">
              <div class="status-badge">Status: ${status}</div>
            </div>
            
            <p>Hello <strong>${residentName}</strong>,</p>
            
            <p>${statusMessage}</p>
            
            <div class="details">
              <h3 style="margin-top: 0; color: #2c3e50;">📋 Request Details:</h3>
              <div class="detail-row">
                <div class="detail-label">💻 Computer:</div>
                <div class="detail-value">${pc}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">📅 Date:</div>
                <div class="detail-value">${new Date(date).toLocaleDateString('en-PH', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">⏰ Time:</div>
                <div class="detail-value">${this.formatTime(startTime)} - ${this.formatTime(endTime)}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">🕐 Duration:</div>
                <div class="detail-value">${this.calculateDuration(startTime, endTime)}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">📝 Request ID:</div>
                <div class="detail-value">#${details.requestId || 'N/A'}</div>
              </div>
            </div>
            
            ${status === 'Approved' ? `
            <div class="instructions">
              <h4 style="margin-top: 0; color: #1976d2;">📌 Important Reminders:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>✅ Please arrive <strong>5-10 minutes early</strong> for your reservation</li>
                <li>✅ Bring your <strong>valid ID</strong> for verification</li>
                <li>✅ Report to the barangay staff upon arrival</li>
                <li>✅ Clean up after using the computer</li>
                <li>✅ Follow proper computer usage guidelines</li>
              </ul>
            </div>
            
            <div class="highlight">
              <h4 style="margin-top: 0; color: #e65100;">⚠️ Please Note:</h4>
              <p>If you fail to arrive within <strong>15 minutes</strong> of your scheduled time, your reservation may be cancelled.</p>
            </div>
            ` : ''}
            
            ${status === 'Cancelled' ? `
            <div class="instructions">
              <h4 style="margin-top: 0; color: #d32f2f;">❌ Request Cancelled</h4>
              <p>Your computer borrowing request has been cancelled. You may submit a new request if needed.</p>
              ${details.cancellationReason ? `<p><strong>Reason:</strong> ${details.cancellationReason}</p>` : ''}
            </div>
            ` : ''}
            
            <p><strong>📍 Location:</strong> ${process.env.BARANGAY_ADDRESS || 'Barangay Office'}</p>
            <p><strong>📞 Contact:</strong> ${process.env.BARANGAY_CONTACT || '(02) 123-4567'}</p>
            <p><strong>🕐 Office Hours:</strong> Monday to Saturday, 8:00 AM - 10:00 PM</p>
            
            <div class="footer">
              <p><strong>Barangay Management System</strong></p>
              <p>Computer Borrowing Service</p>
              <p>This is an automated message, please do not reply to this email.</p>
              <p style="font-size: 12px; color: #999; margin-top: 10px;">
                If you did not make this request, please contact the barangay office immediately.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  formatTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  calculateDuration(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  }

  // ================= EXISTING EMAIL FUNCTIONS =================
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

  // ================= ADDITIONAL EMAIL FUNCTIONS =================
  async sendApprovalEmail(email, fullName, username) {
    try {
      const mailOptions = {
        from: `"Barangay Management System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✅ Account Approved - Welcome to Barangay Services',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .account-info { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #4CAF50; }
              .feature-list { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .feature-item { margin: 10px 0; padding-left: 25px; position: relative; }
              .feature-item:before { content: "✓"; position: absolute; left: 0; color: #4CAF50; font-weight: bold; }
              .login-btn { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Account Approved! 🎉</h1>
                <p>Welcome to Barangay Services Portal</p>
              </div>
              <div class="content">
                <h3>Dear ${fullName},</h3>
                
                <p>We are pleased to inform you that your Barangay Services account has been approved!</p>
                
                <div class="account-info">
                  <p><strong>Username:</strong> ${username}</p>
                  <p><strong>Status:</strong> ✅ Active</p>
                  <p><strong>Access Granted:</strong> Full Resident Services</p>
                </div>
                
                <p>You can now access all our services including:</p>
                
                <div class="feature-list">
                  <div class="feature-item">📄 Document Printing Services</div>
                  <div class="feature-item">📅 Equipment/Item Borrowing</div>
                  <div class="feature-item">💻 Computer Reservation</div>
                  <div class="feature-item">📋 Request Tracking</div>
                  <div class="feature-item">🔔 Real-time Notifications</div>
                </div>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="login-btn">
                    Login to Your Account
                  </a>
                </div>
                
                <p><strong>Need Help?</strong></p>
                <p>📍 Location: ${process.env.BARANGAY_ADDRESS || 'Barangay Office'}</p>
                <p>📞 Contact: ${process.env.BARANGAY_CONTACT || '(02) 123-4567'}</p>
                <p>🕐 Office Hours: Monday to Saturday, 8:00 AM - 5:00 PM</p>
                
                <div class="footer">
                  <p><strong>Barangay Management System</strong></p>
                  <p>Automated Notification System</p>
                  <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Approval email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Approval email sending failed:', error);
      throw error;
    }
  }

  async sendRejectionEmail(email, fullName) {
    try {
      const mailOptions = {
        from: `"Barangay Management System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '❌ Account Registration Update',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .notice { background: #ffebee; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f44336; }
              .steps { background: #fff8e1; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .step { margin: 10px 0; padding-left: 25px; position: relative; }
              .step:before { content: "•"; position: absolute; left: 10px; font-size: 20px; color: #f57c00; }
              .contact-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Registration Update</h1>
              </div>
              <div class="content">
                <h3>Dear ${fullName},</h3>
                
                <p>Thank you for your interest in registering for Barangay Services.</p>
                
                <div class="notice">
                  <h4 style="margin-top: 0; color: #d32f2f;">Registration Status: Not Approved</h4>
                  <p>After reviewing your application, we regret to inform you that we are unable to approve your registration at this time.</p>
                </div>
                
                <p>This decision may be due to one of the following reasons:</p>
                
                <div class="steps">
                  <div class="step">Incomplete or unclear identification documents</div>
                  <div class="step">Information that doesn't match our records</div>
                  <div class="step">Duplicate registration attempt</div>
                  <div class="step">Other verification issues</div>
                </div>
                
                <div class="contact-info">
                  <h4 style="margin-top: 0; color: #1976d2;">📞 For Assistance:</h4>
                  <p>If you believe this is an error or would like to appeal, please visit our office with:</p>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Valid government-issued ID</li>
                    <li>Proof of residence</li>
                    <li>Any other supporting documents</li>
                  </ul>
                </div>
                
                <p><strong>Office Information:</strong></p>
                <p>📍 Location: ${process.env.BARANGAY_ADDRESS || 'Barangay Office'}</p>
                <p>📞 Contact: ${process.env.BARANGAY_CONTACT || '(02) 123-4567'}</p>
                <p>🕐 Office Hours: Monday to Saturday, 8:00 AM - 5:00 PM</p>
                
                <div class="footer">
                  <p><strong>Barangay Management System</strong></p>
                  <p>Thank you for your understanding.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Rejection email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Rejection email sending failed:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();