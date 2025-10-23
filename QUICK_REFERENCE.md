# Quick Reference Card - Auto-Verification Features

## 🎯 Main Features at a Glance

### Countdown Timer
```
[Select Schedule ▼] → [5 Minutes] → [⏰ Starting in 5m 0s] → Auto-starts at 0:00
```

### Verification Tabs
```
[All Users (110)] [🟢 Real (45)] [🔴 Fake (12)]
```

### Confidence Display
```
94.5%          ← Hover for AI reasoning
Real Confidence
```

---

## ⚡ Quick Actions

| Action | How To |
|--------|--------|
| **Start Countdown** | Select Schedule dropdown → Choose time |
| **Verify Immediately** | Click "Verify Now" button |
| **Cancel Countdown** | Click red "Cancel" button |
| **Filter Real Profiles** | Click "🟢 Real Profiles" tab |
| **Filter Fake Profiles** | Click "🔴 Fake Profiles" tab |
| **View AI Reasoning** | Hover over confidence percentage |
| **Refresh Data** | Click "Refresh" button |
| **Open Settings** | Click "Auto-Verify Settings" button |

---

## 📍 Button Locations

```
┌────────────────────────────────────────────────────────────────┐
│ Dashboard                                        [Auto-Verify ] │
│ Welcome back, here's what's happening            [Settings   ] │
│                                                                 │
│                                      [Select Schedule ▼]        │
│                                      [⏰ Starting in 3m 25s]    │
│                                      [Cancel]                   │
│                                      [Refresh]                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Guide

| Color | Meaning |
|-------|---------|
| 🟢 Green | Real profiles, success, ready |
| 🔴 Red | Fake profiles, cancel, danger |
| 🔵 Blue | All users, information |
| 🟣 Purple | Settings |
| ⚪ Gray | Disabled, countdown, processing |

---

## ⏱️ Schedule Options

| Schedule | Duration | Use Case |
|----------|----------|----------|
| **5 Minutes** | 300 seconds | Quick testing |
| **1 Hour** | 3600 seconds | Moderate delay |
| **24 Hours** | 86400 seconds | Daily schedule |

---

## 📊 Tab Filters

| Tab | Shows | Counter |
|-----|-------|---------|
| **All Users** | Everyone | Total users |
| **🟢 Real** | Verified real | Real count |
| **🔴 Fake** | Flagged fake | Fake count |

---

## 🔍 Confidence Display

### Format:
```
[Percentage]
[Label]
```

### Example:
```
94.5%           ← Main value (bold)
Real Confidence ← Descriptive label (small, gray)
```

### Tooltip Content:
```
┌─────────────────────────────────────┐
│ AI Reasoning:                       │
│                                     │
│ This profile appears genuine with   │
│ consistent posting patterns,        │
│ authentic follower engagement, and  │
│ realistic profile information.      │
└─────────────────────────────────────┘
```

---

## 🎮 Keyboard Shortcuts (Future)

| Key | Action |
|-----|--------|
| `Ctrl + V` | Start verification |
| `Ctrl + R` | Refresh data |
| `Esc` | Cancel countdown |
| `1` | All Users tab |
| `2` | Real Profiles tab |
| `3` | Fake Profiles tab |

---

## 🔄 Workflow Examples

### Quick Verification:
```
1. Click "Verify Now"
2. Wait for completion
3. Check results
```

### Scheduled Verification:
```
1. Select "5 Minutes"
2. Countdown starts
3. Auto-verifies at 0:00
4. Check results
```

### Filter & Review:
```
1. Go to "Users" tab
2. Click "🔴 Fake Profiles"
3. Review flagged accounts
4. Hover over confidence for reasoning
5. Take action (block/delete)
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Countdown not starting** | Refresh page, try again |
| **Tabs not filtering** | Check users have verification status |
| **Confidence shows "-"** | User not verified yet |
| **Tooltip not showing** | Ensure JavaScript enabled |

---

## 📱 Mobile View

All features work on mobile:
- Schedule dropdown: Full-width
- Buttons: Stack vertically
- Tabs: Scrollable horizontally
- Confidence: Tap to see tooltip

---

## 🎯 Success Indicators

### Countdown Started:
✅ Notification: "Countdown started! Verification will run in 5m 0s"
✅ Button shows: "Starting in 5m 0s"
✅ Cancel button appears

### Verification Complete:
✅ Notification: "Verified X profiles (Y real, Z fake)"
✅ Button resets: "Verify Now"
✅ Tabs update with new counts
✅ Email sent (if configured)

### Tab Filtered:
✅ Active tab highlighted
✅ Table shows only filtered users
✅ Counter matches displayed users

---

## 📋 Pre-Launch Checklist

- [ ] Select schedule from dropdown
- [ ] Verify countdown starts and updates
- [ ] Test cancel button
- [ ] Let countdown reach 0:00
- [ ] Verify auto-start works
- [ ] Check "All Users" tab
- [ ] Check "Real Profiles" tab
- [ ] Check "Fake Profiles" tab
- [ ] Hover over confidence values
- [ ] Verify tooltips show reasoning
- [ ] Refresh and test again

---

## 🔗 Related Documentation

- `AUTO_VERIFICATION_GUIDE.md` - Complete feature guide
- `COUNTDOWN_TABS_SUMMARY.md` - Technical implementation
- `EMAIL_NOTIFICATIONS_IMPLEMENTATION.md` - Email setup
- `EMAIL_QUICK_START.md` - Quick email config

---

## 💡 Pro Tips

1. **Use 5-minute schedule** for testing, then switch to daily
2. **Check fake profiles tab** regularly for new threats
3. **Hover over low confidence** values for manual review
4. **Cancel countdown** if you need to adjust settings first
5. **Refresh data** before running verification for latest users

---

**Quick Help**: Press F12 → Console tab to see detailed logs

**Version**: 2.0
**Last Updated**: October 22, 2025
