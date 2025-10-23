import React, { useState, useEffect, useContext } from "react";
import {
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { api } from "../../Interceptor/apiCall";
import { url } from "../../baseUrl";
import { AuthContext } from "../../context/Auth";

export default function AutoVerificationSettings({ open, onClose, onScheduleChange }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { throwErr, throwSuccess } = useContext(AuthContext);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${url}/api/admin/verification/settings`);
      setSettings(response.data.settings);
    } catch (error) {
      throwErr("Failed to fetch verification settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      // Auto-start verification when countdown reaches 0
      if (countdown === 1) {
        setTimeout(() => {
          handleStartNow(true); // Auto-triggered
        }, 1000);
      }

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Format time helper
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`${url}/api/admin/verification/settings`, settings);
      throwSuccess("Settings saved successfully");
      
      // Notify parent about schedule change
      if (onScheduleChange) {
        const hasSchedule = settings.autoVerificationEnabled && settings.verificationSchedule !== 'manual';
        onScheduleChange(hasSchedule);
      }
      
      onClose();
    } catch (error) {
      throwErr("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleStartNow = async (isAutoTriggered = false) => {
    // If schedule is selected and not auto-triggered, start countdown
    if (selectedSchedule && !isAutoTriggered) {
      const scheduleToSeconds = {
        "5min": 5 * 60,
        "hourly": 60 * 60,
        "daily": 24 * 60 * 60,
      };

      const seconds = scheduleToSeconds[selectedSchedule];
      if (seconds) {
        setCountdown(seconds);
        throwSuccess(`Countdown started! Verification will run in ${formatTime(seconds)}`);
        return;
      }
    }

    try {
      setRunning(true);
      setResult(null);
      const response = await api.post(`${url}/api/admin/verification/run-auto`);
      setResult(response.data.result);
      throwSuccess(
        `Verified ${response.data.result.verified} profiles (${response.data.result.real} real, ${response.data.result.fake} fake)`
      );
      await fetchSettings(); // Refresh to show updated lastRun
    } catch (error) {
      throwErr(error.response?.data?.message || "Failed to run auto-verification");
    } finally {
      setRunning(false);
      setCountdown(0); // Reset countdown
      setSelectedSchedule(null);
    }
  };

  if (loading || !settings) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <CircularProgress />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "#1e293b",
          borderRadius: "1rem",
          border: "1px solid #334155",
        },
      }}
    >
      <DialogTitle
        style={{
          color: "#fff",
          fontWeight: "bold",
          borderBottom: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <SettingsIcon />
        Auto-Verification Settings
      </DialogTitle>

      <DialogContent style={{ padding: "24px" }}>
        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoVerificationEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoVerificationEnabled: e.target.checked,
                    })
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#10b981",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#10b981",
                    },
                  }}
                />
              }
              label={
                <span className="text-white font-semibold">
                  Enable Auto-Verification
                </span>
              }
            />
            <p className="text-slate-400 text-sm mt-2 ml-12">
              Automatically verify user profiles based on the settings below
            </p>
          </div>

          {/* Waiting Period */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <label className="text-white font-semibold block mb-2">
              Waiting Period
            </label>
            <Select
              value={settings.waitingPeriod}
              onChange={(e) =>
                setSettings({ ...settings, waitingPeriod: e.target.value })
              }
              fullWidth
              sx={{
                backgroundColor: "#0f172a",
                color: "#fff",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334155",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#475569",
                },
                ".MuiSvgIcon-root": {
                  color: "#94a3b8",
                },
              }}
            >
              <MenuItem value="none">None (Verify immediately)</MenuItem>
              <MenuItem value="1day">1 Day</MenuItem>
              <MenuItem value="3days">3 Days</MenuItem>
              <MenuItem value="1week">1 Week (Recommended)</MenuItem>
              <MenuItem value="2weeks">2 Weeks</MenuItem>
              <MenuItem value="1month">1 Month</MenuItem>
            </Select>
            <p className="text-slate-400 text-sm mt-2">
              New accounts must wait this long before being verified
            </p>
          </div>

          {/* Verification Schedule */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <label className="text-white font-semibold block mb-2">
              <ScheduleIcon
                fontSize="small"
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Verification Schedule
            </label>
            <Select
              value={settings.verificationSchedule}
              onChange={(e) =>
                setSettings({ ...settings, verificationSchedule: e.target.value })
              }
              fullWidth
              sx={{
                backgroundColor: "#0f172a",
                color: "#fff",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334155",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#475569",
                },
                ".MuiSvgIcon-root": {
                  color: "#94a3b8",
                },
              }}
            >
              <MenuItem value="5min">Every 5 Minutes</MenuItem>
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="daily">Daily (Recommended)</MenuItem>
              <MenuItem value="manual">Manual Only</MenuItem>
            </Select>
            <p className="text-slate-400 text-sm mt-2">
              How frequently to run automatic verification
            </p>
          </div>

          {/* Email Notifications */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailNotifications: e.target.checked,
                    })
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#8b5cf6",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#8b5cf6",
                    },
                  }}
                />
              }
              label={
                <span className="text-white font-semibold">
                  Email Notifications
                </span>
              }
            />
            <p className="text-slate-400 text-sm mt-2 ml-12">
              Send email to admin when auto-verification starts and completes
            </p>

            {settings.emailNotifications && (
              <div className="mt-4">
                <label className="text-white font-semibold block mb-2">
                  Admin Email Address
                </label>
                <TextField
                  type="email"
                  value={settings.adminEmail || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      adminEmail: e.target.value,
                    })
                  }
                  placeholder="admin@example.com"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      backgroundColor: "#0f172a",
                      color: "#fff",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#334155",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#475569",
                    },
                  }}
                />
                <p className="text-slate-400 text-sm mt-2">
                  Email address to receive verification notifications
                </p>
              </div>
            )}
          </div>

          {/* Additional Filters */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <FormControlLabel
              control={
                <Switch
                  checked={settings.onlyVerifyActive}
                  onChange={(e) =>
                    setSettings({ ...settings, onlyVerifyActive: e.target.checked })
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#3b82f6",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#3b82f6",
                    },
                  }}
                />
              }
              label={<span className="text-white">Only Verify Active Users</span>}
            />
            <p className="text-slate-400 text-sm mt-2 ml-12">
              Skip blocked or suspended accounts
            </p>

            <div className="mt-4">
              <label className="text-white font-semibold block mb-2">
                Minimum Posts Required
              </label>
              <TextField
                type="number"
                value={settings.minPostsRequired}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minPostsRequired: parseInt(e.target.value) || 0,
                  })
                }
                inputProps={{ min: 0 }}
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#0f172a",
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#334155",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#475569",
                  },
                }}
              />
              <p className="text-slate-400 text-sm mt-2">
                Users must have at least this many posts (0 = no minimum)
              </p>
            </div>
          </div>

          {/* Statistics */}
          {settings.lastAutoVerificationRun && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <h4 className="text-white font-semibold mb-3">Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Last Run</p>
                  <p className="text-white font-semibold">
                    {new Date(settings.lastAutoVerificationRun).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Verified</p>
                  <p className="text-white font-semibold">
                    {settings.autoVerificationCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Run Result */}
          {result && (
            <Alert
              severity={result.failed > 0 ? "warning" : "success"}
              icon={result.failed > 0 ? <WarningIcon /> : <CheckIcon />}
              sx={{
                backgroundColor: result.failed > 0 ? "#78350f" : "#065f46",
                color: "#fff",
                "& .MuiAlert-icon": {
                  color: result.failed > 0 ? "#fbbf24" : "#10b981",
                },
              }}
            >
              <strong>Verification Results:</strong>
              <ul className="mt-2 space-y-1">
                <li>✅ Verified: {result.verified} profiles</li>
                <li>🟢 Real: {result.real} profiles</li>
                <li>🔴 Fake: {result.fake} profiles</li>
                {result.failed > 0 && <li>❌ Failed: {result.failed} profiles</li>}
              </ul>
            </Alert>
          )}

          {/* Schedule Selector for Start Now */}
          {!countdown && !running && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <label className="text-white font-semibold block mb-2">
                <ScheduleIcon fontSize="small" style={{ marginRight: "8px", verticalAlign: "middle" }} />
                Select Schedule for Start Now (Optional)
              </label>
              <Select
                value={selectedSchedule || ""}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                fullWidth
                displayEmpty
                sx={{
                  backgroundColor: "#0f172a",
                  color: "#fff",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "#334155",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#475569",
                  },
                  ".MuiSvgIcon-root": {
                    color: "#94a3b8",
                  },
                }}
              >
                <MenuItem value="">Start Immediately</MenuItem>
                <MenuItem value="5min">Start in 5 Minutes</MenuItem>
                <MenuItem value="hourly">Start in 1 Hour</MenuItem>
                <MenuItem value="daily">Start in 24 Hours</MenuItem>
              </Select>
              <p className="text-slate-400 text-sm mt-2">
                {selectedSchedule 
                  ? "Click 'Start Now' to begin countdown" 
                  : "Start verification immediately or select a delay"}
              </p>
            </div>
          )}

          {/* Countdown Display */}
          {countdown > 0 && (
            <Alert
              severity="info"
              icon={<ScheduleIcon />}
              sx={{
                backgroundColor: "#1e3a8a",
                color: "#fff",
                "& .MuiAlert-icon": {
                  color: "#60a5fa",
                },
              }}
            >
              <strong>Countdown Active:</strong>
              <p className="mt-2">
                Verification will start in <strong>{formatTime(countdown)}</strong>
              </p>
              <Button
                onClick={() => {
                  setCountdown(0);
                  setSelectedSchedule(null);
                  if (onScheduleChange) {
                    onScheduleChange(false); // Notify parent that schedule was cancelled
                  }
                  throwSuccess("Countdown cancelled");
                }}
                variant="outlined"
                size="small"
                sx={{
                  mt: 2,
                  color: "#fff",
                  borderColor: "#fff",
                  "&:hover": {
                    borderColor: "#fca5a5",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Cancel Countdown
              </Button>
            </Alert>
          )}
        </div>
      </DialogContent>

      <DialogActions
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #334155",
          gap: "12px",
        }}
      >
        <Button
          onClick={() => handleStartNow(false)}
          disabled={!settings.autoVerificationEnabled || running || countdown > 0}
          startIcon={running ? <CircularProgress size={16} /> : countdown > 0 ? <ScheduleIcon /> : <PlayIcon />}
          variant="outlined"
          sx={{
            color: "#10b981",
            borderColor: "#10b981",
            "&:hover": {
              borderColor: "#059669",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
            },
            "&:disabled": {
              color: "#6b7280",
              borderColor: "#6b7280",
            },
          }}
        >
          {running ? "Running..." : countdown > 0 ? `Starting in ${formatTime(countdown)}` : "Start Now"}
        </Button>
        <div style={{ flex: 1 }} />
        <Button onClick={onClose} style={{ color: "#94a3b8" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="contained"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white",
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
