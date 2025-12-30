const nodemailer = require('nodemailer');

// Initialize AWS SES client (Priority 0 - Best deliverability for university emails!)
let sesClient = null;
if (process.env.AWS_SES_ACCESS_KEY && process.env.AWS_SES_SECRET_KEY) {
  const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
  sesClient = new SESClient({
    region: process.env.AWS_SES_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SES_SECRET_KEY,
    },
  });
  console.log('✅ AWS SES initialized for emails');
}

// Initialize Brevo HTTP API client (Priority 1 - works on Render!)
let brevoClient = null;
if (process.env.BREVO_API_KEY && !sesClient) {
  const SibApiV3Sdk = require('@getbrevo/brevo');
  brevoClient = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKey = brevoClient.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  console.log('✅ Brevo HTTP API initialized for emails');
}

// Initialize Resend client only if no SES or Brevo
let resendClient = null;
if (process.env.RESEND_API_KEY && !sesClient && !brevoClient) {
  const { Resend } = require('resend');
  resendClient = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend HTTP API initialized for emails');
}



// Create nodemailer transporter (works with Brevo, Gmail, or any SMTP)
const createTransporter = () => {
  // If EMAIL_HOST is set, use custom SMTP (Brevo, etc.)
  if (process.env.EMAIL_HOST) {
    console.log('📧 Using SMTP:', process.env.EMAIL_HOST);
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });
  }

  // Fallback to Gmail service
  console.log('📧 Using Gmail service');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });
};

// Get the correct "from" email address
const getFromEmail = () => {
  if (process.env.EMAIL_FROM) {
    return `E-Complaint System <${process.env.EMAIL_FROM}>`;
  }
  if (process.env.EMAIL_USER) {
    return `E-Complaint System <${process.env.EMAIL_USER}>`;
  }
  return 'E-Complaint System <noreply@ecomplaint.com>';
};

// Send email using AWS SES (Priority 0), Brevo (Priority 1), Resend (Priority 2), or SMTP fallback
const sendEmail = async ({ to, subject, html, text }) => {
  // Priority 0: Use AWS SES if available (Best for university emails!)
  if (sesClient) {
    console.log('📧 Sending email via AWS SES to:', to);
    try {
      const { SendEmailCommand } = require('@aws-sdk/client-ses');
      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@ecomplaint.com';

      const command = new SendEmailCommand({
        Source: `E-Complaint System <${fromEmail}>`,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
            Text: {
              Data: text || 'Please view this email in HTML format.',
              Charset: 'UTF-8',
            },
          },
        },
      });

      const response = await sesClient.send(command);
      console.log('✅ Email sent via AWS SES:', response.MessageId);
      return { success: true, messageId: response.MessageId };
    } catch (error) {
      console.error('AWS SES error:', error);
      throw new Error(error.message || 'Failed to send email via AWS SES');
    }
  }

  // Priority 1: Use Brevo HTTP API if available (works on Render!)
  if (brevoClient) {
    console.log('📧 Sending email via Brevo HTTP API to:', to);
    try {
      const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@ecomplaint.com';
      const sendSmtpEmail = {
        sender: { name: 'E-Complaint System', email: fromEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text,
      };


      const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Email sent via Brevo:', response.messageId);
      return { success: true, messageId: response.messageId };
    } catch (error) {
      console.error('Brevo error:', error);
      throw new Error(error.message || 'Failed to send email via Brevo');
    }
  }

  // Priority 2: Use nodemailer SMTP if EMAIL_HOST is configured
  if (process.env.EMAIL_HOST) {
    console.log('📧 Sending email via SMTP to:', to);
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: getFromEmail(),
      to,
      subject,
      html,
      text,
    });
    console.log('✅ Email sent via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  }


  // Priority 2: Use Resend HTTP API if available
  if (resendClient) {
    console.log('📧 Sending email via Resend HTTP API to:', to);
    const { data, error } = await resendClient.emails.send({
      from: getFromEmail(),
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message || 'Failed to send email via Resend');
    }

    console.log('✅ Email sent via Resend:', data?.id);
    return { success: true, messageId: data?.id };
  }

  // Priority 3: Fallback to Gmail
  console.log('📧 Sending email via Gmail to:', to);
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: getFromEmail(),
    to,
    subject,
    html,
    text,
  });

  console.log('✅ Email sent via Gmail:', info.messageId);
  return { success: true, messageId: info.messageId };
};


/**
 * Send password reset email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 * @param {String} options.resetToken - Password reset token
 * @param {String} options.resetUrl - Full reset URL
 */
const sendPasswordResetEmail = async ({ email, name, resetToken, resetUrl }) => {
  try {
    // If no email configuration (neither SES, Brevo, Resend, nor Gmail), log for development
    if (!process.env.AWS_SES_ACCESS_KEY && !process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      console.log('\n=== PASSWORD RESET EMAIL (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`Token: ${resetToken}`);
      console.log('===============================================\n');
      return { success: true, message: 'Reset link logged to console (email not configured)' };
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">E-Complaint System</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          
          <p>Hello ${name || 'User'},</p>
          
          <p>We received a request to reset your password for your E-Complaint System account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Important:</strong> This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message. Please do not reply to this email.<br>
            © 2025 E-Complaint System. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request - E-Complaint System
      
      Hello ${name || 'User'},
      
      We received a request to reset your password for your E-Complaint System account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
      
      © 2025 E-Complaint System. All rights reserved.
    `;

    const result = await sendEmail({
      to: email,
      subject: 'Password Reset Request - E-Complaint System',
      html,
      text,
    });

    console.log('Password reset email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send complaint created notification email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 * @param {Object} options.complaint - Complaint object
 * @param {String} options.complaintUrl - URL to view complaint
 */
const sendComplaintCreatedEmail = async ({ email, name, complaint, complaintUrl }) => {
  try {
    // If no email configuration (neither SES, Brevo, Resend, nor Gmail), log for development
    if (!process.env.AWS_SES_ACCESS_KEY && !process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      console.log('\n=== COMPLAINT CREATED EMAIL (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`Complaint: ${complaint.title}`);
      console.log(`Complaint Number: ${complaint.complaintNumber || complaint._id}`);
      console.log(`URL: ${complaintUrl}`);
      console.log('===================================================\n');
      return { success: true, message: 'Email logged to console (email not configured)' };
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complaint Submitted</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">E-Complaint System</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0;">Complaint Submitted Successfully</h2>
          
          <p>Hello ${name || 'User'},</p>
          
          <p>Your complaint has been submitted successfully and is being reviewed by our team.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1976d2;">
            <p style="margin: 0 0 10px 0;"><strong>Complaint Number:</strong> ${complaint.complaintNumber || complaint._id}</p>
            <p style="margin: 0 0 10px 0;"><strong>Title:</strong> ${complaint.title}</p>
            <p style="margin: 0 0 10px 0;"><strong>Category:</strong> ${complaint.category}</p>
            <p style="margin: 0 0 10px 0;"><strong>Priority:</strong> ${complaint.priority}</p>
            <p style="margin: 0 0 10px 0;"><strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">${complaint.status || 'Pending'}</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${complaintUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              View Complaint
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            You will receive email notifications when there are updates to your complaint.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message. Please do not reply to this email.<br>
            © 2025 E-Complaint System. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Complaint Submitted Successfully - E-Complaint System
      
      Hello ${name || 'User'},
      
      Your complaint has been submitted successfully.
      
      Complaint Number: ${complaint.complaintNumber || complaint._id}
      Title: ${complaint.title}
      Category: ${complaint.category}
      Priority: ${complaint.priority}
      Status: ${complaint.status || 'Pending'}
      
      View your complaint: ${complaintUrl}
      
      You will receive email notifications when there are updates to your complaint.
      
      © 2025 E-Complaint System. All rights reserved.
    `;

    const result = await sendEmail({
      to: email,
      subject: `Complaint Submitted - ${complaint.complaintNumber || complaint._id}`,
      html,
      text,
    });

    console.log('Complaint created email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending complaint created email:', error);
    // Don't throw - email failures shouldn't break complaint creation
    return { success: false, error: error.message };
  }
};

/**
 * Send complaint status update email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 * @param {Object} options.complaint - Complaint object
 * @param {String} options.oldStatus - Previous status
 * @param {String} options.newStatus - New status
 * @param {String} options.complaintUrl - URL to view complaint
 */
const sendComplaintStatusUpdateEmail = async ({ email, name, complaint, oldStatus, newStatus, complaintUrl }) => {
  try {
    // If no email configuration (neither SES, Brevo, Resend, nor Gmail), log for development
    if (!process.env.AWS_SES_ACCESS_KEY && !process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      console.log('\n=== COMPLAINT STATUS UPDATE EMAIL (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`Complaint: ${complaint.title}`);
      console.log(`Status Changed: ${oldStatus} → ${newStatus}`);
      console.log(`URL: ${complaintUrl}`);
      console.log('==========================================================\n');
      return { success: true, message: 'Email logged to console (email not configured)' };
    }

    const statusColors = {
      'Pending': '#ff9800',
      'In Progress': '#2196f3',
      'Resolved': '#4caf50',
      'Rejected': '#f44336'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complaint Status Updated</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">E-Complaint System</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0;">Complaint Status Updated</h2>
          
          <p>Hello ${name || 'User'},</p>
          
          <p>The status of your complaint has been updated.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${statusColors[newStatus] || '#1976d2'};">
            <p style="margin: 0 0 10px 0;"><strong>Complaint Number:</strong> ${complaint.complaintNumber || complaint._id}</p>
            <p style="margin: 0 0 10px 0;"><strong>Title:</strong> ${complaint.title}</p>
            <p style="margin: 0 0 10px 0;"><strong>Previous Status:</strong> ${oldStatus}</p>
            <p style="margin: 0 0 10px 0;"><strong>New Status:</strong> <span style="color: ${statusColors[newStatus] || '#1976d2'}; font-weight: bold;">${newStatus}</span></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${complaintUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              View Complaint
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message. Please do not reply to this email.<br>
            © 2025 E-Complaint System. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Complaint Status Updated - E-Complaint System
      
      Hello ${name || 'User'},
      
      The status of your complaint has been updated.
      
      Complaint Number: ${complaint.complaintNumber || complaint._id}
      Title: ${complaint.title}
      Previous Status: ${oldStatus}
      New Status: ${newStatus}
      
      View your complaint: ${complaintUrl}
      
      © 2025 E-Complaint System. All rights reserved.
    `;

    const result = await sendEmail({
      to: email,
      subject: `Complaint Status Updated - ${complaint.complaintNumber || complaint._id}`,
      html,
      text,
    });

    console.log('Complaint status update email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending complaint status update email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send comment added notification email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 * @param {Object} options.complaint - Complaint object
 * @param {String} options.comment - Comment text
 * @param {String} options.commentedBy - Name of person who commented
 * @param {String} options.complaintUrl - URL to view complaint
 */
const sendCommentAddedEmail = async ({ email, name, complaint, comment, commentedBy, complaintUrl }) => {
  try {
    // If no email configuration (neither SES, Brevo, Resend, nor Gmail), log for development
    if (!process.env.AWS_SES_ACCESS_KEY && !process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      console.log('\n=== COMMENT ADDED EMAIL (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`Complaint: ${complaint.title}`);
      console.log(`Comment by: ${commentedBy}`);
      console.log(`URL: ${complaintUrl}`);
      console.log('================================================\n');
      return { success: true, message: 'Email logged to console (email not configured)' };
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Comment</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">E-Complaint System</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0;">New Comment Added</h2>
          
          <p>Hello ${name || 'User'},</p>
          
          <p>A new comment has been added to your complaint.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1976d2;">
            <p style="margin: 0 0 10px 0;"><strong>Complaint:</strong> ${complaint.title}</p>
            <p style="margin: 0 0 10px 0;"><strong>Complaint Number:</strong> ${complaint.complaintNumber || complaint._id}</p>
            <p style="margin: 10px 0 5px 0;"><strong>Comment by:</strong> ${commentedBy}</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
              <p style="margin: 0; font-style: italic;">"${comment}"</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${complaintUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              View Complaint & Comment
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message. Please do not reply to this email.<br>
            © 2025 E-Complaint System. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Comment Added - E-Complaint System
      
      Hello ${name || 'User'},
      
      A new comment has been added to your complaint.
      
      Complaint: ${complaint.title}
      Complaint Number: ${complaint.complaintNumber || complaint._id}
      Comment by: ${commentedBy}
      
      Comment:
      "${comment}"
      
      View your complaint: ${complaintUrl}
      
      © 2025 E-Complaint System. All rights reserved.
    `;

    const result = await sendEmail({
      to: email,
      subject: `New Comment on Complaint - ${complaint.complaintNumber || complaint._id}`,
      html,
      text,
    });

    console.log('Comment added email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending comment added email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP verification email for registration
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 * @param {String} options.otp - OTP code
 */
const sendOTPEmail = async ({ email, name, otp }) => {
  try {
    // If no email configuration (neither SES, Brevo, Resend, nor Gmail), log for development
    if (!process.env.AWS_SES_ACCESS_KEY && !process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      console.log('\n=== OTP VERIFICATION EMAIL (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`OTP: ${otp}`);
      console.log('==================================================\n');
      return { success: true, message: 'OTP logged to console (email not configured)' };
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">E-Complaint System</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
          
          <p>Hello ${name || 'User'},</p>
          
          <p>Thank you for registering with the E-Complaint System. Please use the OTP code below to verify your email address and complete your registration.</p>
          
          <div style="background: white; padding: 30px; border-radius: 5px; margin: 30px 0; text-align: center; border: 2px dashed #1976d2;">
            <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Your Verification Code:</p>
            <p style="margin: 0; font-size: 36px; font-weight: bold; color: #1976d2; letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </p>
          </div>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Enter this code on the verification page to complete your registration.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message. Please do not reply to this email.<br>
            © 2025 E-Complaint System. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Email Verification - E-Complaint System
      
      Hello ${name || 'User'},
      
      Thank you for registering with the E-Complaint System. Please use the OTP code below to verify your email address and complete your registration.
      
      Your Verification Code: ${otp}
      
      This OTP will expire in 10 minutes. If you didn't request this code, please ignore this email.
      
      Enter this code on the verification page to complete your registration.
      
      © 2025 E-Complaint System. All rights reserved.
    `;

    const result = await sendEmail({
      to: email,
      subject: 'Email Verification - OTP Code',
      html,
      text,
    });

    console.log('OTP email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

/**
 * Send OTP for password reset
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.name - Recipient name
 * @param {String} options.otp - OTP code
 */
const sendPasswordResetOTPEmail = async ({ email, name, otp }) => {
  try {
    // If no email configuration (neither SES, Brevo, Resend, nor Gmail), log for development
    if (!process.env.AWS_SES_ACCESS_KEY && !process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      console.log('\n=== PASSWORD RESET OTP EMAIL (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`OTP: ${otp}`);
      console.log('====================================================\n');
      return { success: true, message: 'OTP logged to console (email not configured)' };
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">E-Complaint System</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          
          <p>Hello ${name || 'User'},</p>
          
          <p>We received a request to reset your password for your E-Complaint System account. Please use the OTP code below to verify your identity and reset your password.</p>
          
          <div style="background: white; padding: 30px; border-radius: 5px; margin: 30px 0; text-align: center; border: 2px dashed #764ba2;">
            <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Your Password Reset Code:</p>
            <p style="margin: 0; font-size: 36px; font-weight: bold; color: #764ba2; letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </p>
          </div>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Enter this code on the password reset page to continue.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message. Please do not reply to this email.<br>
            © 2025 E-Complaint System. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request - E-Complaint System
      
      Hello ${name || 'User'},
      
      We received a request to reset your password for your E-Complaint System account. Please use the OTP code below to verify your identity and reset your password.
      
      Your Password Reset Code: ${otp}
      
      This OTP will expire in 10 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      
      Enter this code on the password reset page to continue.
      
      © 2025 E-Complaint System. All rights reserved.
    `;

    const result = await sendEmail({
      to: email,
      subject: 'Password Reset OTP - E-Complaint System',
      html,
      text,
    });

    console.log('Password reset OTP email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset OTP email:', error);
    throw error;
  }
}


module.exports = {
  sendPasswordResetEmail,
  sendComplaintCreatedEmail,
  sendComplaintStatusUpdateEmail,
  sendCommentAddedEmail,
  sendOTPEmail,
  sendPasswordResetOTPEmail,
};


