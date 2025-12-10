const cron = require('node-cron');
const VerificationSettings = require('../models/VerificationSettings');
const { performAutoVerification } = require('../controllers/admin');

let scheduledTask = null;

function initVerificationScheduler() {
  console.log('[Verification Scheduler] Initializing...');
  
  cron.schedule('* * * * *', async () => {
    try {
      const settings = await VerificationSettings.getSettings();
      
      if (!settings.autoVerificationEnabled) {
        // Auto-verification is disabled
        if (scheduledTask) {
          scheduledTask.stop();
          scheduledTask = null;
          console.log('[Verification Scheduler] Stopped (auto-verification disabled)');
        }
        return;
      }

      const now = new Date();
      const lastRun = settings.lastAutoVerificationRun;
      
      // Determine if we should run based on schedule
      let shouldRun = false;
      
      if (!lastRun) {
        // Never run before - run now
        shouldRun = true;
      } else {
        const timeSinceLastRun = now - lastRun;
        const fiveMinutes = 5 * 60 * 1000;
        const oneHour = 60 * 60 * 1000;
        const oneDay = 24 * oneHour;
        
        if (settings.verificationSchedule === '5min' && timeSinceLastRun >= fiveMinutes) {
          shouldRun = true;
        } else if (settings.verificationSchedule === 'hourly' && timeSinceLastRun >= oneHour) {
          shouldRun = true;
        } else if (settings.verificationSchedule === 'daily' && timeSinceLastRun >= oneDay) {
          shouldRun = true;
        }
      }
      
      if (shouldRun) {
        console.log(`[Verification Scheduler] Running auto-verification (schedule: ${settings.verificationSchedule})`);
        await performAutoVerification();
      }
      
    } catch (error) {
      console.error('[Verification Scheduler] Error:', error.message);
    }
  });
  
  console.log('[Verification Scheduler] Started - checking every minute');
}

// Stop the scheduler (for graceful shutdown)
function stopVerificationScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log('[Verification Scheduler] Stopped');
  }
}

module.exports = {
  initVerificationScheduler,
  stopVerificationScheduler
};
