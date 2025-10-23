# Quick Start: Testing Email Notifications

## Prerequisites
- Gmail account (or other email service)
- Admin access to Connectify dashboard
- Backend and frontend running

## Step 1: Generate Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled
3. Search for **App passwords** or go to: https://myaccount.google.com/apppasswords
4. Select:
   - **App:** Mail
   - **Device:** Other (custom name) → Enter "Connectify"
5. Click **Generate**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
7. Remove spaces: `abcdefghijklmnop`

## Step 2: Configure Backend Environment

Edit `/backend/.env` file:

```env
# Add these lines (or update if they exist)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
ADMIN_EMAIL=your-email@gmail.com
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail
- `abcdefghijklmnop` with your app password from Step 1

## Step 3: Restart Backend Server

```bash
cd backend
npm start
```

Look for startup message confirming server is running.

## Step 4: Configure Admin Dashboard

1. Open browser: http://localhost:3000/admin
2. Login with admin credentials
3. Click **"Auto-Verification Settings"** button
4. Configure:
   - ✅ Toggle ON: **Enable Auto-Verification**
   - 📧 Toggle ON: **Email Notifications**
   - 📧 Enter: **Admin Email Address** (your email)
   - ⏰ Select: **Every 5 Minutes** (for quick testing)
   - ⏳ Select: **None (Verify immediately)** (waiting period)
   - ✅ Toggle ON: **Only Verify Active Users**
   - 📊 Enter: **0** (minimum posts)
5. Click **"Save Settings"**

## Step 5: Test Immediate Run

1. In the settings dialog, click **"Run Now"** button
2. Wait for verification to complete (should see results on screen)
3. Check your email inbox for **TWO emails:**
   - 🚀 **Start Email**: "Auto-Verification Started - Connectify Admin"
   - ✅ **Completion Email**: "Auto-Verification Complete - Connectify Admin"

## Step 6: Verify Email Contents

### Start Email Should Show:
- Current settings (schedule, waiting period)
- Filters being applied
- Process explanation
- Link to admin dashboard

### Completion Email Should Show:
- Statistics grid:
  - ✅ Verified count
  - 👥 Total users scanned
  - 🟢 Real profiles
  - 🔴 Fake profiles
- Success rate percentage
- Any errors (if verifications failed)
- Link to admin dashboard

## Step 7: Test Automatic Schedule

1. Wait 5 minutes (based on schedule setting)
2. Check backend console for logs:
   ```
   [Auto-Verification] Starting automated profile verification
   [Auto-Verification] Sending start email to: your-email@gmail.com
   ...
   [Auto-Verification] Sending completion email to: your-email@gmail.com
   ```
3. Check email inbox for new notifications

## Troubleshooting

### ❌ No emails received?

**Check spam folder first!** Gmail might filter automated emails.

**Backend logs showing errors?**
```bash
# Look for these in console:
[Auto-Verification] ❌ Failed to send email: ...
```

**Common fixes:**
1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
2. Ensure app password has no spaces
3. Check that 2FA is enabled on Gmail
4. Try regenerating app password

### ❌ Invalid login error?

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Fix:** 
- Use app-specific password, NOT your regular Gmail password
- Regenerate app password if needed

### ❌ Connection refused?

```
Error: connect ECONNREFUSED
```

**Fix:**
- Check EMAIL_SERVICE is set to "gmail"
- Verify internet connection
- Try restarting backend

### ❌ Settings not saving?

**Fix:**
1. Check browser console for errors (F12)
2. Verify backend is running
3. Check MongoDB connection
4. Try logging out and back into admin dashboard

## Expected Behavior

✅ **After clicking "Run Now":**
- See progress indicator
- See results summary on screen
- Receive 2 emails within 10 seconds

✅ **Every 5 minutes (automatic):**
- Backend logs show verification running
- Receive 2 emails per run
- Admin dashboard updates with latest stats

✅ **Email formatting:**
- Professional HTML with gradient headers
- Color-coded statistics
- Clickable links to dashboard
- Mobile-responsive design

## Production Setup

Once testing is complete:

1. **Change schedule to "Daily"** (recommended for production)
2. **Keep waiting period at "1 Week"** (prevents immediate verification of new accounts)
3. **Monitor email delivery** for first few days
4. **Check spam folder** periodically

## Support

If issues persist:

1. Check `EMAIL_SETUP_GUIDE.md` for detailed troubleshooting
2. Review `EMAIL_NOTIFICATIONS_IMPLEMENTATION.md` for technical details
3. Check backend console logs for specific error messages
4. Verify all environment variables are set correctly

## Cleanup After Testing

To stop getting frequent emails:

1. Open admin dashboard
2. Click "Auto-Verification Settings"
3. Change schedule from "5min" to "daily" or "manual"
4. Or toggle OFF "Email Notifications"
5. Save settings

---

**You're all set!** 🎉

Enjoy automated email notifications for profile verification!
