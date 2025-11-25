const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const useSendGridAPI = process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.');

if (useSendGridAPI) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[Email] SendGrid API initialized');
}

const sendVerificationStartEmail = async (adminEmail, settings) => {
  try {
    const htmlContent = '<html><body>Auto-Verification Started</body></html>';
    
    if (useSendGridAPI) {
      console.log('[Email] Sending via SendGrid API...');
      const msg = {
        to: adminEmail,
        from: process.env.EMAIL_USER || 'noreply@connectify.app',
        subject: '🤖 Auto-Verification Started - Connectify Admin',
        html: htmlContent
      };
      await sgMail.send(msg);
      console.log('✅ Verification start email sent via SendGrid to:', adminEmail);
    } else {
      console.log('[Email] Sending via Nodemailer (Gmail)...');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000,
        socketTimeout: 30000
      });
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: '🤖 Auto-Verification Started - Connectify Admin',
        html: htmlContent
      };
      
      await transporter.sendMail(mailOptions);
      console.log('✅ Verification start email sent via Gmail to:', adminEmail);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification start email:', error.message);
    if (error.response) {
      console.error('SendGrid Error Response:', error.response.body);
    }
    return false;
  }
};

const sendVerificationCompleteEmail = async (adminEmail, results, settings) => {
  try {
    const htmlContent = '<html><body>Auto-Verification Complete</body></html>';
    
    if (useSendGridAPI) {
      console.log('[Email] Sending via SendGrid API...');
      const msg = {
        to: adminEmail,
        from: process.env.EMAIL_USER || 'noreply@connectify.app',
        subject: `✅ Auto-Verification Complete - ${results.verified} profiles verified`,
        html: htmlContent
      };
      await sgMail.send(msg);
      console.log('✅ Verification complete email sent via SendGrid to:', adminEmail);
    } else {
      console.log('[Email] Sending via Nodemailer (Gmail)...');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000,
        socketTimeout: 30000
      });
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `✅ Auto-Verification Complete - ${results.verified} profiles verified`,
        html: htmlContent
      };
      
      await transporter.sendMail(mailOptions);
      console.log('✅ Verification complete email sent via Gmail to:', adminEmail);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification complete email:', error.message);
    if (error.response) {
      console.error('SendGrid Error Response:', error.response.body);
    }
    return false;
  }
};

module.exports = {
  sendVerificationStartEmail,
  sendVerificationCompleteEmail
};
