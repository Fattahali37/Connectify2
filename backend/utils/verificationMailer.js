const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const useSendGridAPI = process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.');

if (useSendGridAPI) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[Email] SendGrid API initialized');
}

const sendVerificationStartEmail = async (adminEmail, settings) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .content { padding: 40px; }
          .info-box { background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 4px; }
          .info-box h3 { margin-top: 0; color: #667eea; }
          .info-box ul { margin: 10px 0; padding-left: 20px; }
          .info-box li { margin: 8px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Auto-Verification Started</h1>
            <p>Connectify Profile Verification System</p>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>The automated profile verification process has been initiated and is now running.</p>
            
            <div class="info-box">
              <h3>Current Settings</h3>
              <ul>
                <li><strong>Schedule:</strong> ${settings.verificationSchedule || 'Manual'}</li>
                <li><strong>Waiting Period:</strong> ${settings.waitingPeriod || 'N/A'} (${settings.waitingPeriodDays || 0} days)</li>
                <li><strong>Only Active Users:</strong> ${settings.onlyVerifyActive ? 'Yes' : 'No'}</li>
                <li><strong>Min Posts Required:</strong> ${settings.minPostsRequired || 0}</li>
              </ul>
            </div>
            
            <div class="info-box">
              <h3>What's Happening</h3>
              <p>Your system is now performing the following checks:</p>
              <ul>
                <li>Identifying eligible users based on waiting period</li>
                <li>Extracting profile features and statistics</li>
                <li>Running ML model predictions for fake profile detection</li>
                <li>Generating detailed AI reasoning with Gemini</li>
                <li>Storing verification results in database</li>
                <li>Sending you results when complete</li>
              </ul>
            </div>
            
            <p><strong>Status:</strong> Processing... You will receive another email with detailed results once the verification is complete.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard" class="button">View Admin Dashboard</a>
          </div>
          <div class="footer">
            <p>Started at: ${new Date().toLocaleString()}</p>
            <p>This is an automated message from Connectify Auto-Verification System</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    if (useSendGridAPI) {
      console.log('[Email] Sending via SendGrid API...');
      const msg = {
        to: adminEmail,
        from: process.env.EMAIL_USER || 'noreply@connectify.app',
        subject: 'Auto-Verification Started - Connectify Admin',
        html: htmlContent
      };
      await sgMail.send(msg);
      console.log('Verification start email sent via SendGrid to:', adminEmail);
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
        subject: 'Auto-Verification Started - Connectify Admin',
        html: htmlContent
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Verification start email sent via Gmail to:', adminEmail);
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
    const successRate = results.total > 0 
      ? ((results.verified / results.total) * 100).toFixed(1) 
      : 0;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .content { padding: 40px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: white; padding: 20px; text-align: center; border-radius: 8px; border: 2px solid #e0e0e0; }
          .stat-number { font-size: 36px; font-weight: bold; margin: 10px 0; }
          .stat-label { color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .success { color: #10b981; }
          .danger { color: #ef4444; }
          .warning { color: #f59e0b; }
          .info-box { background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; border-radius: 4px; }
          .info-box h3 { margin-top: 0; color: #10b981; }
          .info-box ul { margin: 10px 0; padding-left: 20px; }
          .info-box li { margin: 8px 0; }
          .error-box { background: #fff5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; border-radius: 4px; }
          .error-box h3 { margin-top: 0; color: #ef4444; }
          .error-list { margin: 10px 0; padding-left: 20px; }
          .error-item { margin: 8px 0; color: #333; font-size: 14px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Auto-Verification Complete</h1>
            <p>Verification Results Summary</p>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p>The automated profile verification process has been completed successfully. Here are the results:</p>
            
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Profiles Verified</div>
                <div class="stat-number success">${results.verified || 0}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Total Eligible</div>
                <div class="stat-number">${results.total || 0}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Real Profiles</div>
                <div class="stat-number success">${results.real || 0}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Fake Profiles</div>
                <div class="stat-number danger">${results.fake || 0}</div>
              </div>
            </div>
            
            <div class="info-box">
              <h3>Detailed Results</h3>
              <ul>
                <li><strong>Success Rate:</strong> <span class="${successRate >= 80 ? 'success' : 'warning'}">${successRate}%</span></li>
                <li><strong>Successfully Processed:</strong> ${results.verified || 0}/${results.total || 0}</li>
                <li><strong>Failed Verifications:</strong> ${results.failed || 0}</li>
                <li><strong>Skipped Users:</strong> ${results.skipped || 0}</li>
                <li><strong>Total Verifications to Date:</strong> ${settings.autoVerificationCount || 0}</li>
              </ul>
            </div>
            
            ${results.errors && results.errors.length > 0 ? `
              <div class="error-box">
                <h3>Errors Encountered (${results.errors.length})</h3>
                <div class="error-list">
                  ${results.errors.slice(0, 10).map(err => `
                    <div class="error-item">
                      <strong>${err.username || 'Unknown'}:</strong> ${err.error || 'Unknown error'}
                    </div>
                  `).join('')}
                  ${results.errors.length > 10 ? `<div class="error-item"><em>... and ${results.errors.length - 10} more errors</em></div>` : ''}
                </div>
              </div>
            ` : ''}
            
            <div class="info-box">
              <h3>Next Scheduled Run</h3>
              <p>Based on your current schedule (${settings.verificationSchedule || 'Manual'}), the next auto-verification will ${settings.verificationSchedule === 'Manual' ? 'run when you trigger it manually' : 'run automatically'}.</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard" class="button">View Detailed Report</a>
          </div>
          <div class="footer">
            <p>Completed at: ${new Date().toLocaleString()}</p>
            <p>This is an automated message from Connectify Auto-Verification System</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    if (useSendGridAPI) {
      console.log('[Email] Sending via SendGrid API...');
      const msg = {
        to: adminEmail,
        from: process.env.EMAIL_USER || 'noreply@connectify.app',
        subject: `Auto-Verification Complete - ${results.verified} profiles verified`,
        html: htmlContent
      };
      await sgMail.send(msg);
      console.log('Verification complete email sent via SendGrid to:', adminEmail);
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
        subject: `Auto-Verification Complete - ${results.verified} profiles verified`,
        html: htmlContent
      };
      
      await transporter.sendMail(mailOptions);
      console.log('Verification complete email sent via Gmail to:', adminEmail);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send verification complete email:', error.message);
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
