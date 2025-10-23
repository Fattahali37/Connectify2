# Email Notification Setup Guide

This guide explains how to configure email notifications for the auto-verification system.

## Features

- **Start Notifications**: Admin receives an email when auto-verification begins
- **Completion Notifications**: Admin receives a detailed results summary with statistics
- **HTML Emails**: Professional-looking emails with stats grids and color-coded information

## Email Configuration

### 1. Environment Variables

Add these variables to your `.env` file in the `backend` directory:

```env
# Email Configuration for Auto-Verification Notifications
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@example.com
```

### 2. Gmail Setup (Recommended)

If using Gmail, you need to create an **App Password**:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select app: **Mail**
5. Select device: **Other** (Custom name: "Connectify Auto-Verification")
6. Click **Generate**
7. Copy the 16-character password (no spaces)
8. Use this as your `EMAIL_PASSWORD` in `.env`

### 3. Other Email Providers

You can use other email services by changing `EMAIL_SERVICE`:

```env
# For Outlook/Hotmail
EMAIL_SERVICE=outlook

# For Yahoo
EMAIL_SERVICE=yahoo

# For custom SMTP
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
```

## Configuration in Admin Dashboard

1. Log in to the admin dashboard
2. Click **Auto-Verification Settings**
3. Enable **Email Notifications** toggle
4. Enter **Admin Email Address** (where notifications should be sent)
5. Click **Save Settings**

## Email Templates

### Start Email
Sent when auto-verification begins, includes:
- Current settings (schedule, waiting period, filters)
- Process details (how long users wait, what gets verified)
- Link to admin dashboard

### Completion Email
Sent when auto-verification completes, includes:
- Statistics grid (verified, total users, real, fake)
- Success rate percentage
- Error list (if any failures occurred)
- Link to admin dashboard

## Testing Email Notifications

1. Configure the settings as described above
2. Enable auto-verification in the admin dashboard
3. Set schedule to **"Every 5 Minutes"** for quick testing
4. Wait for the next scheduled run (or click **"Run Now"**)
5. Check your admin email inbox for notifications

## Troubleshooting

### Email Not Sending

1. **Check environment variables**: Ensure all EMAIL_* variables are set correctly
2. **Verify app password**: Make sure you're using an app-specific password, not your regular Gmail password
3. **Check spam folder**: Emails might be filtered as spam initially
4. **Enable less secure apps**: For some providers, you may need to enable this setting
5. **Check server logs**: Look for errors in the backend console output

### Common Errors

- **"Invalid login"**: Wrong email or password, or app password not enabled
- **"Connection refused"**: Email service or port is incorrect
- **"ENOTFOUND"**: EMAIL_SERVICE or EMAIL_HOST is incorrect

### Verify Configuration

Check the backend logs when auto-verification runs:

```
[Auto-Verification] Sending start email to: admin@example.com
[Auto-Verification] ✅ Start email sent successfully
[Auto-Verification] Sending completion email to: admin@example.com
[Auto-Verification] ✅ Completion email sent successfully
```

## Schedule Options

- **Every 5 Minutes**: Quick testing and high-frequency verification
- **Hourly**: Moderate frequency for active communities
- **Daily**: Recommended for most use cases (once per day at midnight)
- **Manual Only**: Disable automatic runs, only verify when clicking "Run Now"

## Email Content Preview

### Start Email Subject
```
🚀 Auto-Verification Started - Connectify Admin
```

### Completion Email Subject
```
✅ Auto-Verification Complete - Connectify Admin
```

Both emails include professional HTML formatting with:
- Gradient headers
- Stats grids with color-coded badges
- Responsive design
- Direct links to admin dashboard

## Security Notes

- Never commit your `.env` file to version control
- Use app-specific passwords, not main account passwords
- Regularly rotate email credentials
- Monitor email delivery logs for suspicious activity

## Support

For issues with email configuration, check:
- Backend console logs for error messages
- NodeMailer documentation: https://nodemailer.com/
- Gmail app password guide: https://support.google.com/accounts/answer/185833
