# Auto-Verification Complete Guide

## Overview
This guide covers all features of the enhanced auto-verification system including countdown timers, automatic scheduling, and filtered views for fake/real profiles.

---

## 🚀 New Features

### 1. **Countdown Timer System**
Start a countdown before auto-verification begins, giving you control over when verification runs.

#### How It Works:
1. **Select Schedule**: Choose from dropdown (5 Minutes, 1 Hour, or 24 Hours)
2. **Countdown Starts**: Timer begins counting down
3. **Auto-Start**: When countdown reaches 0, verification automatically starts
4. **Cancel Option**: Cancel anytime before completion

#### Benefits:
- ⏰ Schedule verification during off-peak hours
- 🔄 Prepare system before batch processing
- 👀 Monitor progress with live countdown
- ❌ Cancel if needed before it starts

---

### 2. **"Verify Now" Button with Countdown**

The "Verify Now" button now shows countdown status dynamically:

| State | Display | Icon |
|-------|---------|------|
| **Ready** | "Verify Now" | ✅ Verified Icon |
| **Countdown** | "Starting in 2m 45s" | ⏰ Schedule Icon |
| **Running** | "Verifying..." | 🔄 Loading Spinner |
| **Disabled** | Grayed out | - |

#### Button States:
- **Enabled**: Green gradient, clickable
- **Countdown Active**: Gray gradient, shows time remaining
- **Verifying**: Gray gradient with spinner
- **Cancel Available**: Red "Cancel" button appears during countdown

---

### 3. **Fake & Real Profile Tabs**

Three new tabs for filtering verified users:

#### **All Users Tab**
- Shows all users regardless of verification status
- Default view
- Counter: Total users

#### **🟢 Real Profiles Tab**
- Shows only users verified as "real"
- Green accent color
- Counter: Number of real profiles
- Features displayed:
  - Username & avatar
  - Verification badge
  - **Confidence percentage** (e.g., "94.5% Real Confidence")
  - **AI reasoning** (hover over confidence)

#### **🔴 Fake Profiles Tab**
- Shows only users flagged as "fake"
- Red accent color
- Counter: Number of fake profiles
- Features displayed:
  - Username & avatar
  - Warning flag
  - **Confidence percentage** (e.g., "87.3% Fake Confidence")
  - **AI reasoning** (hover over confidence)

---

## 📊 New Table Columns

### **Confidence Column**
Displays the AI model's confidence level for each verification.

**Display Format:**
```
92.5%
Real Confidence
```

**Hover Interaction:**
- Shows full AI reasoning in tooltip
- Explains why profile was classified as real/fake
- Includes detailed analysis from Gemini AI

**Example Reasoning:**
```
AI Reasoning:
"This profile appears genuine with consistent posting 
patterns, authentic follower engagement, and realistic 
profile information. The account history shows organic 
growth over time."
```

---

## 🎯 Usage Workflow

### Quick Start (Immediate Verification)
1. Click **"Verify Now"** button
2. Verification starts immediately
3. View results in notification
4. Check **Fake/Real tabs** for filtered results

### Scheduled Verification
1. Select schedule from dropdown:
   - **5 Minutes**: Quick testing
   - **1 Hour**: Moderate delay
   - **24 Hours**: Daily schedule
2. Countdown begins automatically
3. Button shows: "Starting in [time]"
4. System auto-starts when countdown reaches 0
5. **Cancel button** appears if you need to stop it

### Monitoring Results
1. Go to **Users** tab
2. Click **🟢 Real Profiles** to see verified users
3. Click **🔴 Fake Profiles** to see flagged accounts
4. Hover over **Confidence %** to read AI reasoning
5. Click **Details** for full ML feature analysis

---

## 🖥️ UI Components

### Schedule Selector Dropdown
```
┌─────────────────────┐
│ Select Schedule  ▼  │
├─────────────────────┤
│ 5 Minutes           │
│ 1 Hour              │
│ 24 Hours            │
└─────────────────────┘
```

- **Location**: Top right, next to "Auto-Verify Settings"
- **Visibility**: Hidden when countdown active or verification running
- **Styling**: Dark theme, rounded corners

### Verify Now Button (Dynamic)
```
State 1: Ready
┌────────────────────────┐
│ ✅ Verify Now          │  [Green]
└────────────────────────┘

State 2: Countdown
┌────────────────────────┐
│ ⏰ Starting in 3m 25s  │  [Gray]
└────────────────────────┘

State 3: Running
┌────────────────────────┐
│ 🔄 Verifying...        │  [Gray]
└────────────────────────┘
```

### Cancel Button
```
┌────────────────┐
│ Cancel         │  [Red gradient]
└────────────────┘
```
- **Appears**: Only during countdown
- **Action**: Stops countdown, resets to ready state
- **Color**: Red gradient

### Verification Tabs
```
┌──────────────┬────────────────┬────────────────┐
│ All Users    │ 🟢 Real (45)   │ 🔴 Fake (12)   │
│ (110)        │                │                │
└──────────────┴────────────────┴────────────────┘
```

**Active Tab Styling:**
- Colored border bottom (blue/green/red)
- Lighter background
- Brighter text color

**Hover Effect:**
- Text brightens
- Smooth transition

---

## 📋 Table Layout

### Enhanced User Table
```
┌──────────────┬──────────┬───────┬───────────┬────────┬──────────────┬─────────────┬─────────┐
│ User         │ Email    │ Posts │ Followers │ Status │ Verification │ Confidence  │ Actions │
├──────────────┼──────────┼───────┼───────────┼────────┼──────────────┼─────────────┼─────────┤
│ @johndoe     │ john@... │ 45    │ 1.2k      │ Active │ ✅ Verified  │ 94.5%       │ [Btns]  │
│ John Doe     │          │       │           │        │              │ Real Conf.  │         │
├──────────────┼──────────┼───────┼───────────┼────────┼──────────────┼─────────────┼─────────┤
│ @fakeuser    │ fake@... │ 2     │ 10        │ Active │ ⚠️ Flagged   │ 89.2%       │ [Btns]  │
│ Fake User    │          │       │           │        │              │ Fake Conf.  │         │
└──────────────┴──────────┴───────┴───────────┴────────┴──────────────┴─────────────┴─────────┘
```

### New Column: "Confidence"
- **Position**: Between "Verification" and "Actions"
- **Content**:
  - Top: Percentage value (bold)
  - Bottom: "Real Confidence" or "Fake Confidence" (small gray text)
- **Tooltip**: Shows full AI reasoning on hover
- **Not Verified**: Shows "-" for users without verification

---

## 🔧 Configuration

### Auto-Verification Settings Dialog

**Email Notifications Section:**
```
┌────────────────────────────────────────┐
│ 🔔 Email Notifications        [Toggle] │
│ Send email when verification completes │
│                                        │
│ Admin Email Address                    │
│ ┌────────────────────────────────────┐ │
│ │ admin@example.com                  │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Schedule Options:**
- Every 5 Minutes (testing)
- Hourly
- Daily (recommended)
- Manual Only

---

## 🎬 Complete Workflow Example

### Scenario: Schedule verification for 5 minutes, then review results

#### Step 1: Start Countdown
```
User clicks: [Select Schedule ▼] → [5 Minutes]
System shows: "Countdown started! Verification will run in 5m 0s"
Button changes to: [⏰ Starting in 5m 0s]
[Cancel] button appears
```

#### Step 2: Monitor Countdown
```
Button updates every second:
- Starting in 4m 59s
- Starting in 4m 58s
- ...
- Starting in 10s
- Starting in 9s
```

#### Step 3: Auto-Start (At 0:00)
```
Button changes to: [🔄 Verifying...]
System begins verification process
Progress shown in console logs
```

#### Step 4: Completion
```
Notification: "Verification completed! Verified 20 profiles (15 real, 5 fake)"
Button resets to: [✅ Verify Now]
Email sent to admin (if configured)
```

#### Step 5: Review Results
```
User clicks: [Users] tab
Tabs show:
- All Users (110)
- 🟢 Real Profiles (45)
- 🔴 Fake Profiles (12)

User clicks: [🔴 Fake Profiles]
Table filters to show only fake accounts

User hovers over confidence: "89.2%"
Tooltip shows AI reasoning:
"This profile shows suspicious patterns including..."
```

---

## 📈 Statistics & Insights

### What You Can Track:

1. **Verification Counts**
   - Total verified users
   - Real vs Fake breakdown
   - Success/failure rates

2. **Confidence Levels**
   - Individual confidence scores
   - Average confidence per category
   - Low-confidence cases for manual review

3. **AI Reasoning**
   - Why each profile was flagged
   - Common patterns in fake profiles
   - Characteristics of real profiles

4. **Performance Metrics**
   - Verification speed (users per minute)
   - Error rates
   - Model accuracy

---

## 🛠️ Advanced Features

### Countdown Cancellation
**When to Use:**
- Realized wrong schedule selected
- Need to adjust settings first
- System maintenance required

**How:**
1. Click red **[Cancel]** button during countdown
2. Countdown stops immediately
3. Button resets to "Verify Now"
4. Success notification: "Countdown cancelled"

### Manual Override
Even with countdown running, admins can:
- Change auto-verification settings
- Block/unblock users
- View user details
- Refresh data

---

## 🎨 Visual Indicators

### Color Coding System

| Element | Color | Meaning |
|---------|-------|---------|
| **Green** | #10b981 | Real profiles, success, ready state |
| **Red** | #ef4444 | Fake profiles, danger, cancel |
| **Blue** | #3b82f6 | All users, information |
| **Purple** | #8b5cf6 | Settings, configuration |
| **Gray** | #6b7280 | Disabled, countdown, processing |
| **Yellow** | #f59e0b | Warning, attention needed |

### Icon Guide

| Icon | Meaning |
|------|---------|
| ✅ | Verified as real |
| ⚠️ | Flagged as fake |
| ⏰ | Countdown in progress |
| 🔄 | Verification running |
| 🟢 | Real profile tab |
| 🔴 | Fake profile tab |
| 👥 | All users |
| ⚙️ | Settings |

---

## 🧪 Testing Checklist

### Countdown Timer
- [ ] Select 5-minute schedule
- [ ] Verify countdown displays correctly
- [ ] Check countdown updates every second
- [ ] Confirm auto-start at 0:00
- [ ] Test cancel button functionality

### Tabs & Filtering
- [ ] Click "All Users" - shows all users
- [ ] Click "Real Profiles" - shows only real
- [ ] Click "Fake Profiles" - shows only fake
- [ ] Verify counters are accurate
- [ ] Check tab styling (active/inactive)

### Confidence Column
- [ ] Verify percentage displays correctly
- [ ] Hover to see AI reasoning tooltip
- [ ] Check "Real Confidence" vs "Fake Confidence" labels
- [ ] Confirm "-" shows for unverified users

### Button States
- [ ] "Verify Now" clickable when ready
- [ ] Countdown state shows time remaining
- [ ] "Verifying..." appears when running
- [ ] Button disabled during countdown
- [ ] Cancel button appears/disappears correctly

---

## 🐛 Troubleshooting

### Countdown Not Starting
**Problem**: Selected schedule but countdown doesn't start
**Solution**: 
- Check browser console for errors
- Refresh page and try again
- Verify JavaScript enabled

### Tabs Not Filtering
**Problem**: Clicking tabs doesn't filter users
**Solution**:
- Refresh page to reload user data
- Check that users have verification status
- Verify API connection

### Confidence Not Showing
**Problem**: Confidence column shows "-" for verified users
**Solution**:
- User might have been verified before confidence tracking
- Re-verify user to update confidence data
- Check verificationConfidence field in database

### Countdown Doesn't Auto-Start
**Problem**: Countdown reaches 0 but verification doesn't start
**Solution**:
- Check browser console for errors
- Ensure no API rate limits
- Verify auto-verification is enabled in settings

---

**Status**: ✅ All Features Implemented and Ready to Use!

**Version**: 2.0
**Last Updated**: October 22, 2025

## Overview
The Auto-Verification System automatically verifies user profiles using the ML model based on configurable waiting periods and schedules. This prevents new accounts from being verified immediately and allows batch processing of profile verifications.

## Features

### 1. Configurable Waiting Period
Admins can set how long a new account must exist before it can be verified:
- **None** (0 days) - Verify immediately
- **1 Day** - Wait 24 hours after account creation
- **3 Days** - Wait 3 days after account creation  
- **1 Week** (default) - Wait 7 days after account creation
- **2 Weeks** - Wait 14 days after account creation
- **1 Month** - Wait 30 days after account creation

### 2. Verification Schedule
Control how frequently auto-verification runs:
- **Hourly** - Runs every hour
- **Daily** (default) - Runs once per day
- **Manual** - Only runs when admin triggers it

### 3. Additional Filters
- **Only Verify Active Users**: Skip blocked/suspended accounts
- **Minimum Posts Required**: Set minimum post count before verification (0 = no minimum)

## API Endpoints

### Get Verification Settings
```http
GET /api/admin/verification/settings
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "autoVerificationEnabled": false,
    "waitingPeriod": "1week",
    "waitingPeriodDays": 7,
    "verificationSchedule": "daily",
    "onlyVerifyActive": true,
    "minPostsRequired": 0,
    "lastAutoVerificationRun": null,
    "autoVerificationCount": 0
  }
}
```

### Update Verification Settings
```http
PUT /api/admin/verification/settings
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "autoVerificationEnabled": true,
  "waitingPeriod": "1week",
  "verificationSchedule": "daily",
  "onlyVerifyActive": true,
  "minPostsRequired": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification settings updated successfully",
  "settings": { ... }
}
```

### Run Auto-Verification Manually
```http
POST /api/admin/verification/run-auto
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-verification completed",
  "result": {
    "total": 25,
    "verified": 23,
    "failed": 2,
    "skipped": 0,
    "real": 20,
    "fake": 3,
    "errors": [
      {
        "username": "user123",
        "error": "ML API failed"
      }
    ]
  }
}
```

## How It Works

### 1. Eligibility Check
For each user, the system checks:
1. **Account Age**: `createdAt <= (today - waitingPeriodDays)`
2. **Not Already Verified**: No existing ProfileVerification record
3. **Account Status**: Active (if `onlyVerifyActive` is true)
4. **Minimum Posts**: Has at least `minPostsRequired` posts

### 2. Verification Process
For each eligible user:
1. Fetch or auto-generate ProfileFeature
2. Send features to Flask ML API
3. Receive prediction (real/fake) with confidence and AI reasoning
4. Store verification result in ProfileVerification collection
5. Add to verification history

### 3. Scheduling
The system runs a cron job that checks every minute:
- If auto-verification is **enabled** and schedule condition is met, runs verification
- If auto-verification is **disabled**, does nothing

## Configuration Examples

### Example 1: Conservative Approach
```json
{
  "autoVerificationEnabled": true,
  "waitingPeriod": "1month",
  "verificationSchedule": "daily",
  "onlyVerifyActive": true,
  "minPostsRequired": 10
}
```
**Effect**: Only verifies users who:
- Created their account 30+ days ago
- Are active (not blocked)
- Have at least 10 posts
- Runs once per day

### Example 2: Aggressive Approach
```json
{
  "autoVerificationEnabled": true,
  "waitingPeriod": "1day",
  "verificationSchedule": "hourly",
  "onlyVerifyActive": false,
  "minPostsRequired": 0
}
```
**Effect**: Verifies all users who:
- Created their account 24+ hours ago
- No minimum post requirement
- Includes blocked users
- Runs every hour

### Example 3: Balanced Approach (Recommended)
```json
{
  "autoVerificationEnabled": true,
  "waitingPeriod": "1week",
  "verificationSchedule": "daily",
  "onlyVerifyActive": true,
  "minPostsRequired": 3
}
```
**Effect**: Verifies users who:
- Created their account 7+ days ago
- Are active
- Have at least 3 posts
- Runs once per day

## Monitoring

### Check Last Run
```javascript
const settings = await VerificationSettings.getSettings();
console.log('Last run:', settings.lastAutoVerificationRun);
console.log('Total verified:', settings.autoVerificationCount);
```

### View Logs
Server console logs show detailed information:
```
[Auto-Verification] ========================================
[Auto-Verification] Starting automated profile verification
[Auto-Verification] Waiting Period: 1week (7 days)
[Auto-Verification] Only Active Users: true
[Auto-Verification] Min Posts Required: 3
[Auto-Verification] ========================================
[Auto-Verification] Found 45 users created before 2024-10-15T...
[Auto-Verification] 25 users eligible for verification
[Auto-Verification] Verifying user: john.doe (507f1f77bcf86cd799439011)
[Auto-Verification] ✅ john.doe verified as REAL
...
[Auto-Verification] ========================================
[Auto-Verification] Verification Complete!
[Auto-Verification] Results: {
  total: 25,
  verified: 23,
  failed: 2,
  real: 20,
  fake: 3
}
[Auto-Verification] ========================================
```

## Database Schema

### VerificationSettings Model
```javascript
{
  autoVerificationEnabled: Boolean,
  waitingPeriod: String, // 'none', '1day', '3days', '1week', '2weeks', '1month'
  waitingPeriodDays: Number, // Auto-calculated
  verificationSchedule: String, // 'hourly', 'daily', 'manual'
  onlyVerifyActive: Boolean,
  minPostsRequired: Number,
  lastAutoVerificationRun: Date,
  autoVerificationCount: Number,
  updatedAt: Date,
  updatedBy: String
}
```

## Security Considerations

1. **Admin Only**: All endpoints require admin authentication
2. **Rate Limiting**: Automatic verification runs maximum once per schedule period
3. **Error Handling**: Failed verifications are logged but don't stop the batch
4. **Audit Trail**: All settings changes are logged with timestamp and admin username

## Troubleshooting

### Auto-verification not running?
1. Check if `autoVerificationEnabled` is `true`
2. Verify Flask ML API is running at `http://127.0.0.1:5000`
3. Check server logs for scheduler errors
4. Ensure `node-cron` package is installed

### Users not being verified?
1. Check waiting period - are accounts old enough?
2. Verify users meet minimum posts requirement
3. Check if users already have ProfileVerification records
4. Ensure users are active (if `onlyVerifyActive` is true)

### High failure rate?
1. Check Flask API logs for errors
2. Verify all users have ProfileFeature documents
3. Check network connectivity to ML service
4. Review error messages in verification results

## Installation

1. Install dependencies:
```bash
cd backend
npm install node-cron
```

2. Restart server:
```bash
npm start
```

3. The scheduler will automatically start and check settings every minute.

## Testing

### Manual Test
```bash
# Enable auto-verification
curl -X PUT http://localhost:8000/api/admin/verification/settings \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"autoVerificationEnabled": true, "waitingPeriod": "none"}'

# Run manually
curl -X POST http://localhost:8000/api/admin/verification/run-auto \
  -H "Authorization: Bearer <admin_token>"
```

### Check Results
```bash
# Get settings and stats
curl http://localhost:8000/api/admin/verification/settings \
  -H "Authorization: Bearer <admin_token>"
```

## Future Enhancements

- [ ] Email notifications for admins when verification completes
- [ ] Dashboard widget showing auto-verification statistics
- [ ] Webhook support to notify external systems
- [ ] Machine learning model retraining based on verification results
- [ ] Bulk re-verification of existing users
- [ ] Verification confidence threshold settings
- [ ] Automatic actions (block/flag) based on verification results
