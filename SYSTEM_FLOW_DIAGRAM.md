# Complete System Flow Diagram

## 🔄 Full Verification Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │         USER SELECTS SCHEDULE                     │
        │  [Select Schedule ▼] → [5 Minutes/1 Hour/24 Hrs] │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │           COUNTDOWN TIMER STARTS                  │
        │      [⏰ Starting in 5m 0s] ← Updates every 1s   │
        │      [Cancel] button appears                      │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │          OPTIONAL: USER CANCELS                   │
        │      Click [Cancel] → Reset to ready state        │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │         COUNTDOWN REACHES 0:00                    │
        │     Auto-triggers handleRunAutoVerification()     │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │         BATCH VERIFICATION STARTS                 │
        │      Button shows: [🔄 Verifying...]             │
        │      Loops through unverified users               │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │       FOR EACH USER: VERIFY PROFILE               │
        │   POST /api/admin/users/{userId}/verify-profile   │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │          BACKEND EXTRACTS ML FEATURES             │
        │   - Profile completeness                          │
        │   - Follower/following ratio                      │
        │   - Posts count                                   │
        │   - Username length                               │
        │   - Bio length                                    │
        │   - Has profile picture                           │
        │   + 5 more features                               │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │         SEND TO FLASK ML API                      │
        │   POST http://127.0.0.1:5000/predict              │
        │   Body: { features: [11 ML features] }            │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │       FLASK: RUN ELADFP ML MODEL                  │
        │   - Load best_eladfp_model.pkl                    │
        │   - Predict: 0 (fake) or 1 (real)                │
        │   - Calculate confidence probabilities            │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │       FLASK: GENERATE AI REASONING                │
        │   - Call Gemini AI (gemini-2.0-flash-exp)        │
        │   - Pass prediction + profile features            │
        │   - Get 150-token explanation                     │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │       FLASK: RETURN RESULT                        │
        │   {                                               │
        │     prediction: 0 or 1,                           │
        │     confidence: {                                 │
        │       realProfileProb: 0.945,                     │
        │       fakeProfileProb: 0.055                      │
        │     },                                            │
        │     reasoning: "AI explanation..."                │
        │   }                                               │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │       BACKEND: SAVE TO DATABASE                   │
        │   ProfileVerification.create({                    │
        │     userId,                                       │
        │     status: "real" or "fake",                     │
        │     confidence: {...},                            │
        │     reasoning: "...",                             │
        │     verifiedAt: new Date()                        │
        │   })                                              │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │      BACKEND: UPDATE USER DOCUMENT                │
        │   User.updateOne({                                │
        │     verificationStatus,                           │
        │     verificationConfidence,                       │
        │     verificationReasoning                         │
        │   })                                              │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │       REPEAT FOR ALL UNVERIFIED USERS             │
        │   Track: successCount, realCount, fakeCount       │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │       SEND EMAIL NOTIFICATIONS (if enabled)       │
        │   - Start email: Settings + Process details       │
        │   - Complete email: Stats + Results + Errors      │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │         SHOW RESULTS NOTIFICATION                 │
        │   "Verified 20 profiles (15 real, 5 fake)"       │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │         UPDATE FRONTEND STATE                     │
        │   - Refresh users array                           │
        │   - Update verification tab counters              │
        │   - Reset button to "Verify Now"                  │
        └───────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────┐
        │         USER VIEWS RESULTS                        │
        │   - Click "🔴 Fake Profiles" tab                 │
        │   - See filtered list of fake accounts            │
        │   - Hover over confidence for AI reasoning        │
        └───────────────────────────────────────────────────┘
```

---

## 🎯 Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD (AdminDashboard.jsx)            │
│                                                                          │
│  ┌────────────────────┐  ┌──────────────────┐  ┌─────────────────────┐│
│  │  Schedule Dropdown │  │  Verify Now Btn  │  │  Cancel Button      ││
│  │  [5min/1hr/24hr]  │  │  [Dynamic State] │  │  [When countdown]   ││
│  └────────────────────┘  └──────────────────┘  └─────────────────────┘│
│           │                       │                       │             │
│           ▼                       ▼                       ▼             │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │              STATE MANAGEMENT                                     │ │
│  │  - countdown: number (seconds remaining)                          │ │
│  │  - selectedSchedule: '5min' | 'hourly' | 'daily'                 │ │
│  │  - runningAutoVerify: boolean                                    │ │
│  │  - verificationTab: 'all' | 'real' | 'fake'                      │ │
│  │  - users: Array<User>                                            │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│           │                                                             │
│           ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │              VERIFICATION TABS                                    │ │
│  │  [All Users (110)] [🟢 Real (45)] [🔴 Fake (12)]                │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│           │                                                             │
│           ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │              USER TABLE (Filtered)                                │ │
│  │  ┌────┬────┬──────┬──────┬────────┬────────────┬────────────┐   │ │
│  │  │User│Mail│Posts │Follow│Status  │Verification│Confidence  │   │ │
│  │  ├────┼────┼──────┼──────┼────────┼────────────┼────────────┤   │ │
│  │  │... │... │...   │...   │...     │✅ Verified │94.5%       │   │ │
│  │  │    │    │      │      │        │            │Real Conf.  │   │ │
│  │  └────┴────┴──────┴──────┴────────┴────────────┴────────────┘   │ │
│  │                                        ▲                           │ │
│  │                                        │ Hover for AI reasoning    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Flow

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│  Frontend   │         │   Backend    │         │   Flask ML API │
│ AdminDash   │         │ Node.js/Exp  │         │   Python       │
└─────────────┘         └──────────────┘         └────────────────┘
       │                       │                         │
       │ POST /api/admin/      │                         │
       │ verification/run-auto │                         │
       ├──────────────────────>│                         │
       │                       │                         │
       │                       │ For each user:          │
       │                       │ POST /verify-profile    │
       │                       ├────────────────────────>│
       │                       │                         │
       │                       │                         │ Run ML Model
       │                       │                         │ (ELADFP)
       │                       │                         ├──────────┐
       │                       │                         │          │
       │                       │                         │<─────────┘
       │                       │                         │
       │                       │                         │ Call Gemini AI
       │                       │                         ├──────────┐
       │                       │                         │          │
       │                       │                         │<─────────┘
       │                       │                         │
       │                       │ { prediction,           │
       │                       │   confidence,           │
       │                       │   reasoning }           │
       │                       │<────────────────────────┤
       │                       │                         │
       │                       │ Save to MongoDB         │
       │                       ├──────────┐              │
       │                       │          │              │
       │                       │<─────────┘              │
       │                       │                         │
       │ { result: {...} }     │                         │
       │<──────────────────────┤                         │
       │                       │                         │
       │ Update UI             │                         │
       ├─────────┐             │                         │
       │         │             │                         │
       │<────────┘             │                         │
       │                       │                         │
```

---

## 📊 Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                     USER PROFILE DATA                                │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  EXTRACT 11 ML FEATURES                              │
│  [ProfileComp, NumLenUser, FollowFollowing, PostsCount, etc.]       │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     ELADFP ML MODEL                                  │
│  Ensemble Learning: Random Forest + Gradient Boosting + XGBoost     │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    PREDICTION RESULT                                 │
│  - Class: 0 (fake) or 1 (real)                                      │
│  - Confidence: [0.055, 0.945] (fake prob, real prob)                │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    GEMINI AI REASONING                               │
│  "This profile appears genuine with consistent posting patterns..."  │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    MONGODB STORAGE                                   │
│  ProfileVerification: { userId, status, confidence, reasoning }      │
│  User: { verificationStatus, verificationConfidence, ... }           │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY                                  │
│  - Tab: 🟢 Real or 🔴 Fake                                          │
│  - Confidence: "94.5% Real Confidence"                               │
│  - Tooltip: Full AI reasoning                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Real-Time Updates Flow

```
User Action                Frontend State            UI Update
───────────────────────────────────────────────────────────────────
Select "5min"          → countdown = 300          → [Starting in 5m 0s]
Wait 1 second          → countdown = 299          → [Starting in 4m 59s]
Wait 1 second          → countdown = 298          → [Starting in 4m 58s]
...                    → ...                      → ...
Countdown = 1          → Auto-trigger verify     → [Verifying...]
Verification starts    → runningAutoVerify=true  → Button disabled
User verified (loop)   → users array updated     → Real-time table update
All done               → runningAutoVerify=false → [Verify Now]
Click "Fake" tab       → verificationTab='fake'  → Table filters
Hover confidence       → Tooltip opens           → Shows AI reasoning
```

---

## 🎨 Component Tree

```
AdminDashboard
├── AdminNavbar
├── Header Section
│   ├── Title & Description
│   └── Action Buttons
│       ├── Auto-Verify Settings Button
│       ├── Schedule Selector Dropdown
│       │   ├── 5 Minutes
│       │   ├── 1 Hour
│       │   └── 24 Hours
│       ├── Verify Now Button (Dynamic)
│       │   ├── State: Ready → "Verify Now"
│       │   ├── State: Countdown → "Starting in X"
│       │   └── State: Verifying → "Verifying..."
│       ├── Cancel Button (Conditional)
│       └── Refresh Button
│
├── Tab Navigation
│   ├── Overview Tab
│   ├── Users Tab ← **Enhanced with tabs**
│   └── Blocked Users Tab
│
└── Users Tab Content
    ├── Verification Tabs ← **NEW**
    │   ├── All Users (counter)
    │   ├── 🟢 Real Profiles (counter)
    │   └── 🔴 Fake Profiles (counter)
    │
    └── User Table
        ├── Headers
        │   ├── User
        │   ├── Email
        │   ├── Posts
        │   ├── Followers
        │   ├── Status
        │   ├── Verification
        │   ├── Confidence ← **NEW**
        │   └── Actions
        │
        └── Rows (Filtered by active tab)
            ├── User Info
            ├── Email
            ├── Posts Count
            ├── Followers Count
            ├── Status Chip
            ├── Verification Badge (with AI tooltip)
            ├── Confidence Display ← **NEW**
            │   ├── Percentage
            │   ├── Label
            │   └── AI Reasoning Tooltip
            └── Action Buttons
```

---

## 🔄 State Transitions

```
┌──────────────┐
│   INITIAL    │  countdown = 0, selectedSchedule = null
└──────────────┘
       │
       │ User selects schedule
       ▼
┌──────────────┐
│  COUNTDOWN   │  countdown > 0, button shows time
└──────────────┘
       │
       │ Option A: User cancels
       ├─────────────────────┐
       │                     ▼
       │              ┌──────────────┐
       │              │  CANCELLED   │  countdown = 0
       │              └──────────────┘
       │                     │
       │◄────────────────────┘
       │
       │ Option B: Countdown reaches 0
       ▼
┌──────────────┐
│  VERIFYING   │  runningAutoVerify = true
└──────────────┘
       │
       │ Verification completes
       ▼
┌──────────────┐
│   COMPLETE   │  countdown = 0, runningAutoVerify = false
└──────────────┘
       │
       └──────────────> Back to INITIAL
```

---

**Quick Navigation:**
- Overview: See this diagram
- Details: Read AUTO_VERIFICATION_GUIDE.md
- Quick Ref: See QUICK_REFERENCE.md
- Technical: See COUNTDOWN_TABS_SUMMARY.md

**Version**: 2.0
**Last Updated**: October 22, 2025
