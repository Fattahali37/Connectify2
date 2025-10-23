const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send auto-verification start notification
const sendVerificationStartEmail = async (adminEmail, settings) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: '🤖 Auto-Verification Started - Connectify Admin',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤖 Auto-Verification Started</h1>
              <p>Connectify Profile Verification System</p>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p>The automated profile verification process has been initiated.</p>
              
              <div class="info-box">
                <h3>⚙️ Current Settings</h3>
                <ul>
                  <li><strong>Schedule:</strong> ${settings.verificationSchedule}</li>
                  <li><strong>Waiting Period:</strong> ${settings.waitingPeriod} (${settings.waitingPeriodDays} days)</li>
                  <li><strong>Only Active Users:</strong> ${settings.onlyVerifyActive ? 'Yes' : 'No'}</li>
                  <li><strong>Min Posts Required:</strong> ${settings.minPostsRequired}</li>
                </ul>
              </div>
              
              <div class="info-box">
                <h3>📊 Process Details</h3>
                <p>The system will verify eligible user profiles using our ML model and Gemini AI for detailed reasoning.</p>
                <ul>
                  <li>✅ Checking user eligibility based on waiting period</li>
                  <li>🔍 Generating profile features from user data</li>
                  <li>🤖 Running ML predictions for fake profile detection</li>
                  <li>💡 Generating AI reasoning with Gemini</li>
                  <li>💾 Storing verification results in database</li>
                </ul>
              </div>
              
              <p>You will receive another email with the results once the verification process is complete.</p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard" class="button">
                View Admin Dashboard
              </a>
            </div>
            <div class="footer">
              <p>Started at: ${new Date().toLocaleString()}</p>
              <p>This is an automated message from Connectify Auto-Verification System</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification start email sent to:', adminEmail);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification start email:', error.message);
    return false;
  }
};

// Send auto-verification completion notification
const sendVerificationCompleteEmail = async (adminEmail, results, settings) => {
  try {
    const transporter = createTransporter();
    
    const successRate = results.total > 0 
      ? ((results.verified / results.total) * 100).toFixed(1) 
      : 0;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `✅ Auto-Verification Complete - ${results.verified} profiles verified`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-box { background: white; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
            .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
            .success { color: #10b981; }
            .warning { color: #f59e0b; }
            .danger { color: #ef4444; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Auto-Verification Complete</h1>
              <p>Verification Results Summary</p>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              <p>The automated profile verification process has been completed successfully.</p>
              
              <div class="stats-grid">
                <div class="stat-box">
                  <div class="stat-number">${results.verified}</div>
                  <div class="stat-label">Profiles Verified</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">${results.total}</div>
                  <div class="stat-label">Total Eligible</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number success">${results.real}</div>
                  <div class="stat-label">Real Profiles</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number danger">${results.fake}</div>
                  <div class="stat-label">Fake Profiles</div>
                </div>
              </div>
              
              <div class="info-box">
                <h3>📊 Detailed Results</h3>
                <ul>
                  <li><strong>Success Rate:</strong> ${successRate}%</li>
                  <li><strong>Failed Verifications:</strong> ${results.failed}</li>
                  <li><strong>Skipped Users:</strong> ${results.skipped}</li>
                  <li><strong>Total Verifications to Date:</strong> ${settings.autoVerificationCount}</li>
                </ul>
              </div>
              
              ${results.errors && results.errors.length > 0 ? `
                <div class="info-box" style="border-left-color: #ef4444;">
                  <h3 class="danger">⚠️ Errors Encountered</h3>
                  <ul>
                    ${results.errors.slice(0, 5).map(err => `
                      <li><strong>${err.username}:</strong> ${err.error}</li>
                    `).join('')}
                    ${results.errors.length > 5 ? `<li>... and ${results.errors.length - 5} more</li>` : ''}
                  </ul>
                </div>
              ` : ''}
              
              <div class="info-box">
                <h3>⏰ Next Scheduled Run</h3>
                <p>Based on your current schedule (${settings.verificationSchedule}), the next auto-verification will run automatically.</p>
              </div>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/dashboard" class="button">
                View Admin Dashboard
              </a>
            </div>
            <div class="footer">
              <p>Completed at: ${new Date().toLocaleString()}</p>
              <p>This is an automated message from Connectify Auto-Verification System</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification complete email sent to:', adminEmail);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification complete email:', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationStartEmail,
  sendVerificationCompleteEmail
};
