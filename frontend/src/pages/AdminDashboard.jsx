import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Block as BlockIcon,
  VerifiedUser as VerifiedUserIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ArrowUpward,
  ArrowDownward,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Area,
  AreaChart,
} from "recharts";
import { api } from "../Interceptor/apiCall";
import { url } from "../baseUrl";
import { AuthContext } from "../context/Auth";
import AdminNavbar from "../components/admin/AdminNavbar";
import AutoVerificationSettings from "../components/admin/AutoVerificationSettings";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";

const CHART_COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [verificationTab, setVerificationTab] = useState("all"); // all, real, fake
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    user: null,
    features: null,
    loading: false,
  });
  const [stats, setStats] = useState({
    userGrowth: [],
    activityStats: null,
  });
  const [autoVerifyOpen, setAutoVerifyOpen] = useState(false);
  const [runningAutoVerify, setRunningAutoVerify] = useState(false);
  const [autoVerificationScheduled, setAutoVerificationScheduled] = useState(false);
  const { throwErr, throwSuccess } = useContext(AuthContext);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get(`${url}/api/admin/users`);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      throwErr(error.response?.data?.message || "Failed to fetch users");
    }
  }, [throwErr]);

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const response = await api.get(`${url}/api/admin/blocked-users`);
      setBlockedUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      throwErr(
        error.response?.data?.message || "Failed to fetch blocked users"
      );
    }
  }, [throwErr]);

  const fetchStats = useCallback(async () => {
    try {
      const [growthResponse, activityResponse] = await Promise.all([
        api.get(`${url}/api/admin/stats/user-growth?period=month`),
        api.get(`${url}/api/admin/stats/user-activity`),
      ]);

      setStats({
        userGrowth: growthResponse.data.data,
        activityStats: activityResponse.data.data,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throwErr(error.response?.data?.message || "Failed to fetch statistics");
    }
  }, [throwErr]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchBlockedUsers(), fetchStats()]);
    } catch (error) {
      throwErr("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchBlockedUsers, fetchStats, throwErr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteUser = async () => {
    try {
      await api.delete(`${url}/api/admin/users/${deleteDialog.user._id}`);
      setUsers(users.filter((user) => user._id !== deleteDialog.user._id));
      setBlockedUsers(
        blockedUsers.filter((user) => user._id !== deleteDialog.user._id)
      );
      setDeleteDialog({ open: false, user: null });
      throwSuccess("User deleted successfully");
    } catch (error) {
      throwErr("Failed to delete user");
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await api.put(`${url}/api/admin/users/${userId}/block`);
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: "blocked" } : user
        )
      );
      await Promise.all([fetchBlockedUsers(), fetchStats()]);
      throwSuccess("User blocked successfully");
    } catch (error) {
      throwErr(error.response?.data?.message || "Failed to block user");
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await api.put(`${url}/api/admin/users/${userId}/unblock`);
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: "active" } : user
        )
      );
      setBlockedUsers(blockedUsers.filter((user) => user._id !== userId));
      await fetchStats();
      throwSuccess("User unblocked successfully");
    } catch (error) {
      throwErr(error.response?.data?.message || "Failed to unblock user");
    }
  };

  const handleShowDetails = async (user) => {
    setDetailsDialog({ open: true, user, features: null, loading: true });
    try {
      const response = await api.get(
        `${url}/api/admin/users/${user._id}/profile-features`
      );
      setDetailsDialog((prev) => ({
        ...prev,
        features: response.data.features,
        loading: false,
      }));
    } catch (error) {
      throwErr(
        error.response?.data?.message || "Failed to fetch profile features"
      );
      setDetailsDialog({
        open: false,
        user: null,
        features: null,
        loading: false,
      });
    }
  };

  const handleRunAutoVerification = async () => {
    try {
      setRunningAutoVerify(true);
      
      // Clear all verification data in UI immediately
      console.log('Clearing existing verification data in UI...');
      setUsers((prevUsers) =>
        prevUsers.map((u) => ({
          ...u,
          verificationStatus: undefined,
          verificationConfidence: undefined,
          verificationReasoning: undefined,
        }))
      );
      
      console.log('Starting auto-verification...');
      
      // Call the batch verification endpoint with forceAll to re-verify all users
      const response = await api.post(`${url}/api/admin/verification/run-auto`, {
        forceAll: true
      });

      if (response.data.success) {
        const results = response.data.result || response.data.results;
        
        // Show results
        throwSuccess(
          `Verification completed! Verified ${results.verified} profiles (${results.real} real, ${results.fake} fake)${results.failed > 0 ? `, ${results.failed} failed` : ''}`
        );

        // Refresh the user list to get updated verification data
        console.log('Refreshing user list to show updated verification statuses...');
        await fetchData();
      } else {
        throwErr(response.data.message || "Failed to run verification");
      }

    } catch (error) {
      console.error("Auto-verification error:", error);
      throwErr(error.response?.data?.message || "Failed to run batch verification");
    } finally {
      setRunningAutoVerify(false);
    }
  };

  const handleVerifySingleUser = async (userId, username) => {
    try {
      console.log(`Verifying single user: ${username}`);
      
      // Clear this user's verification data in UI
      setUsers((prevUsers) =>
        prevUsers.map((u) => 
          u._id === userId 
            ? {
                ...u,
                verificationStatus: undefined,
                verificationConfidence: undefined,
                verificationReasoning: undefined,
              }
            : u
        )
      );

      const response = await api.post(`${url}/api/admin/users/${userId}/verify-profile`);

      if (response.data.success) {
        const verification = response.data.verification;
        
        // Update this user's data in state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === userId
              ? {
                  ...u,
                  verificationStatus: verification.status,
                  verificationConfidence: verification.confidence,
                  verificationReasoning: verification.reasoning,
                }
              : u
          )
        );

        throwSuccess(`${username} verified as ${verification.status.toUpperCase()}`);
      } else {
        throwErr(response.data.message || "Failed to verify user");
      }
    } catch (error) {
      console.error("Verification error:", error);
      throwErr(error.response?.data?.message || "Failed to verify user");
      
      // Refresh data on error to get current state
      await fetchData();
    }
  };

  // Stats Cards
  const StatCard = ({ title, value, change, icon: Icon, gradient, trend }) => (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
          <Icon className="text-white" sx={{ fontSize: 32 }} />
        </div>
        {change && (
          <div
            className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
              trend === "up"
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpward sx={{ fontSize: 16 }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 16 }} />
            )}
            <span className="text-sm font-bold">{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-white/70 text-sm font-medium mb-2">{title}</h3>
      <p className="text-white text-3xl font-bold">{value}</p>
    </div>
  );

  // Chart Card Wrapper
  const ChartCard = ({ title, children, action }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(180deg, rgb(2, 6, 23) 0%, rgb(15, 23, 42) 50%, rgb(2, 6, 23) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-center">
          <CircularProgress size={60} sx={{ color: "var(--text-primary)" }} />
          <p
            style={{
              color: "var(--text-primary)",
              marginTop: 16,
              fontSize: 18,
            }}
          >
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.status === "active").length;
  const totalPosts = users.reduce(
    (sum, user) => sum + (user.postsCount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminNavbar />

      <div className="pt-20 px-6 pb-8">
        {/* Header with Tabs */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-slate-400">
                Welcome back, here's what's happening
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => setAutoVerifyOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  color: "white",
                  borderRadius: 12,
                  boxShadow: "0 12px 40px rgba(139,92,246,0.12)",
                  transition: "all 0.2s",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <SettingsIcon />
                <span style={{ fontWeight: 600 }}>Auto-Verify Settings</span>
              </button>

              <button
                onClick={handleRunAutoVerification}
                disabled={runningAutoVerify || autoVerificationScheduled}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: (runningAutoVerify || autoVerificationScheduled)
                    ? "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  borderRadius: 12,
                  boxShadow: "0 12px 40px rgba(16,185,129,0.12)",
                  transition: "all 0.2s",
                  border: "none",
                  cursor: (runningAutoVerify || autoVerificationScheduled) ? "not-allowed" : "pointer",
                  opacity: (runningAutoVerify || autoVerificationScheduled) ? 0.7 : 1,
                }}
              >
                {runningAutoVerify ? (
                  <CircularProgress size={20} style={{ color: "white" }} />
                ) : (
                  <VerifiedUserIcon />
                )}
                <span style={{ fontWeight: 600 }}>
                  {runningAutoVerify 
                    ? "Verifying..." 
                    : autoVerificationScheduled 
                    ? "Scheduled in Settings"
                    : "Verify Now"}
                </span>
              </button>

              <button
                onClick={fetchData}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  background: "var(--gradient-primary)",
                  color: "white",
                  borderRadius: 12,
                  boxShadow: "0 12px 40px rgba(59,130,246,0.12)",
                  transition: "all 0.2s",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <RefreshIcon />
                <span style={{ fontWeight: 600 }}>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 bg-slate-800/50 backdrop-blur-xl p-2 rounded-xl border border-slate-700/50">
            {[
              { id: "overview", label: "Overview" },
              { id: "users", label: "All Users" },
              { id: "blocked", label: "Blocked Users" },
              { id: "analytics", label: "Analytics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  fontWeight: 600,
                  transition: "all 0.15s",
                  background:
                    activeTab === tab.id
                      ? "var(--gradient-primary)"
                      : "transparent",
                  color:
                    activeTab === tab.id ? "white" : "var(--text-secondary)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={users.length.toLocaleString()}
                  change="12.5%"
                  trend="up"
                  icon={PersonIcon}
                  gradient="from-blue-600 to-blue-700"
                />
                <StatCard
                  title="Active Users"
                  value={activeUsers.toLocaleString()}
                  change="8.2%"
                  trend="up"
                  icon={TrendingUpIcon}
                  gradient="from-green-600 to-green-700"
                />
                <StatCard
                  title="Blocked Users"
                  value={blockedUsers.length.toLocaleString()}
                  change="3.1%"
                  trend="down"
                  icon={BlockIcon}
                  gradient="from-red-600 to-red-700"
                />
                <StatCard
                  title="Total Posts"
                  value={totalPosts.toLocaleString()}
                  change="23.7%"
                  trend="up"
                  icon={AssessmentIcon}
                  gradient="from-purple-600 to-purple-700"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="User Growth">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.userGrowth}>
                      <defs>
                        <linearGradient
                          id="colorGrowth"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={CHART_COLORS.primary}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_COLORS.primary}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--border)",
                          borderRadius: "0.5rem",
                          color: "var(--text-primary)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke={CHART_COLORS.primary}
                        fillOpacity={1}
                        fill="url(#colorGrowth)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="User Status Distribution">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Active",
                            value: activeUsers,
                            fill: CHART_COLORS.success,
                          },
                          {
                            name: "Blocked",
                            value: blockedUsers.length,
                            fill: CHART_COLORS.danger,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "0.5rem",
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              {/* Verification Tabs */}
              <div className="flex border-b border-slate-700/50 bg-slate-900/50">
                <button
                  onClick={() => setVerificationTab("all")}
                  className={`px-6 py-4 font-semibold transition-all ${
                    verificationTab === "all"
                      ? "text-blue-400 border-b-2 border-blue-400 bg-slate-800/30"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  All Users ({users.length})
                </button>
                <button
                  onClick={() => setVerificationTab("real")}
                  className={`px-6 py-4 font-semibold transition-all ${
                    verificationTab === "real"
                      ? "text-green-400 border-b-2 border-green-400 bg-slate-800/30"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  🟢 Real Profiles ({users.filter(u => u.verificationStatus === "real").length})
                </button>
                <button
                  onClick={() => setVerificationTab("fake")}
                  className={`px-6 py-4 font-semibold transition-all ${
                    verificationTab === "fake"
                      ? "text-red-400 border-b-2 border-red-400 bg-slate-800/30"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  🔴 Fake Profiles ({users.filter(u => u.verificationStatus === "fake").length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      {[
                        "User",
                        "Status",
                        "Verification",
                        "Confidence",
                        "Actions",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 text-left text-sm font-semibold text-slate-300"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {users
                      .filter((user) => {
                        if (verificationTab === "all") return true;
                        if (verificationTab === "real") return user.verificationStatus === "real";
                        if (verificationTab === "fake") return user.verificationStatus === "fake";
                        return true;
                      })
                      .map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar
                              src={user.avatar}
                              alt={user.username}
                              sx={{ width: 40, height: 40 }}
                            />
                            <div>
                              <p className="font-medium text-white">
                                {user.username}
                              </p>
                              <p className="text-sm text-slate-400">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Chip
                            label={user.status}
                            size="small"
                            sx={{
                              backgroundColor:
                                user.status === "active"
                                  ? CHART_COLORS.success
                                  : CHART_COLORS.danger,
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          {user.verificationStatus ? (
                            <Tooltip
                              title={
                                <div
                                  style={{ fontSize: "14px", padding: "8px" }}
                                >
                                  <strong>AI Analysis:</strong>
                                  <p
                                    style={{
                                      marginTop: "8px",
                                      lineHeight: "1.5",
                                    }}
                                  >
                                    {user.verificationReasoning ||
                                      "No reasoning available"}
                                  </p>
                                  <p
                                    style={{
                                      marginTop: "8px",
                                      fontSize: "12px",
                                      color: "#94a3b8",
                                    }}
                                  >
                                    Confidence:{" "}
                                    {user.verificationStatus === "real"
                                      ? `${(
                                          user.verificationConfidence
                                            ?.realProfileProb * 100
                                        ).toFixed(1)}% real`
                                      : `${(
                                          user.verificationConfidence
                                            ?.fakeProfileProb * 100
                                        ).toFixed(1)}% fake`}
                                  </p>
                                </div>
                              }
                              placement="top"
                              arrow
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    bgcolor: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    maxWidth: "400px",
                                    "& .MuiTooltip-arrow": {
                                      color: "#1e293b",
                                      "&::before": {
                                        border: "1px solid #334155",
                                      },
                                    },
                                  },
                                },
                              }}
                            >
                              <Chip
                                label={
                                  user.verificationStatus === "real"
                                    ? "Verified"
                                    : "Flagged"
                                }
                                size="small"
                                icon={
                                  user.verificationStatus === "real" ? (
                                    <VerifiedUserIcon />
                                  ) : (
                                    <WarningIcon />
                                  )
                                }
                                sx={{
                                  backgroundColor:
                                    user.verificationStatus === "real"
                                      ? CHART_COLORS.success
                                      : CHART_COLORS.danger,
                                  color: "white",
                                  cursor: "help",
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Chip
                              label="Not Verified"
                              size="small"
                              sx={{
                                backgroundColor: "#64748b",
                                color: "white",
                                fontWeight: "bold",
                              }}
                            />
                          )}
                        </td>
                        
                        {/* Confidence Column */}
                        <td className="px-6 py-4">
                          {user.verificationStatus && user.verificationConfidence ? (
                            <Tooltip
                              title={
                                <div style={{ fontSize: "14px", padding: "8px" }}>
                                  <strong>AI Reasoning:</strong>
                                  <p style={{ marginTop: "8px", lineHeight: "1.5" }}>
                                    {user.verificationReasoning || "No reasoning available"}
                                  </p>
                                </div>
                              }
                              placement="top"
                              arrow
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    bgcolor: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    maxWidth: "400px",
                                    "& .MuiTooltip-arrow": {
                                      color: "#1e293b",
                                      "&::before": {
                                        border: "1px solid #334155",
                                      },
                                    },
                                  },
                                },
                              }}
                            >
                              <div className="cursor-help">
                                <div className="text-slate-300 font-semibold">
                                  {user.verificationStatus === "real"
                                    ? `${(user.verificationConfidence.realProfileProb * 100).toFixed(1)}%`
                                    : `${(user.verificationConfidence.fakeProfileProb * 100).toFixed(1)}%`
                                  }
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                  {user.verificationStatus === "real" ? "Real Confidence" : "Fake Confidence"}
                                </div>
                              </div>
                            </Tooltip>
                          ) : (
                            <span className="text-slate-500 text-sm">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVerifySingleUser(user._id, user.username)}
                              style={{
                                padding: "6px 10px",
                                fontSize: 12,
                                borderRadius: 8,
                                background:
                                  "linear-gradient(135deg, rgb(59,130,246) 0%, rgb(37,99,235) 100%)",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                              }}
                              title="Verify this user"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleShowDetails(user)}
                              style={{
                                padding: "6px 10px",
                                fontSize: 12,
                                borderRadius: 8,
                                background:
                                  "linear-gradient(135deg, rgb(139,92,246) 0%, rgb(124,58,237) 100%)",
                                color: "white",
                                border: "none",
                              }}
                            >
                              Details
                            </button>
                            <button
                              onClick={() =>
                                user.status === "active"
                                  ? handleBlockUser(user._id)
                                  : handleUnblockUser(user._id)
                              }
                              style={{
                                padding: "6px 10px",
                                fontSize: 12,
                                borderRadius: 8,
                                background:
                                  user.status === "active"
                                    ? "linear-gradient(135deg, rgb(234,179,8) 0%, rgb(202,138,4) 100%)"
                                    : "linear-gradient(135deg, rgb(16,185,129) 0%, rgb(5,150,105) 100%)",
                                color: "white",
                                border: "none",
                              }}
                            >
                              {user.status === "active" ? "Block" : "Unblock"}
                            </button>
                            <button
                              onClick={() =>
                                setDeleteDialog({ open: true, user })
                              }
                              style={{
                                padding: "6px 10px",
                                fontSize: 12,
                                borderRadius: 8,
                                background: "var(--gradient-danger)",
                                color: "white",
                                border: "none",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Blocked Users Tab */}
          {activeTab === "blocked" && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-6">
                Blocked Users ({blockedUsers.length})
              </h2>
              {blockedUsers.length === 0 ? (
                <p className="text-slate-400 text-center py-12">
                  No blocked users found
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blockedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar
                          src={user.avatar}
                          alt={user.username}
                          sx={{ width: 50, height: 50 }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {user.username}
                          </p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUnblockUser(user._id)}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Unblock
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, user })}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Monthly Activity">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "0.5rem",
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill={CHART_COLORS.purple}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="User Engagement">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "0.5rem",
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={CHART_COLORS.pink}
                        strokeWidth={3}
                        dot={{ fill: CHART_COLORS.pink, r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        PaperProps={{
          style: {
            backgroundColor: "var(--bg-primary)",
            borderRadius: "1rem",
            border: "1px solid var(--border)",
          },
        }}
      >
        <DialogTitle style={{ color: "#fff", fontWeight: "bold" }}>
          Delete User
        </DialogTitle>
        <DialogContent>
          <p style={{ color: "var(--text-secondary)" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {deleteDialog.user?.username}
            </strong>
            ? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions style={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, user: null })}
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            style={{
              background: "var(--gradient-danger)",
              color: "white",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Features Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={() =>
          setDetailsDialog({
            open: false,
            user: null,
            features: null,
            loading: false,
          })
        }
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "var(--bg-primary)",
            borderRadius: "1rem",
            border: "1px solid var(--border)",
          },
        }}
      >
        <DialogTitle
          style={{
            color: "#fff",
            fontWeight: "bold",
            borderBottom: "1px solid var(--border)",
          }}
        >
          Profile Features - {detailsDialog.user?.username}
        </DialogTitle>
        <DialogContent style={{ padding: "24px" }}>
          {detailsDialog.loading ? (
            <div className="flex items-center justify-center py-12">
              <CircularProgress
                size={40}
                sx={{ color: "var(--text-primary)" }}
              />
            </div>
          ) : detailsDialog.features ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">Profile Picture</p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["profile pic"] === 1 ? "Yes" : "No"}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">Private Account</p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["private"] === 1 ? "Yes" : "No"}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">Posts Count</p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["#posts"]}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">Followers</p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["#followers"]}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">Following</p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["#following"]}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">
                    Username/Length Ratio
                  </p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["nums/length username"]?.toFixed(
                      2
                    ) || "0.00"}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">Fullname Words</p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["fullname words"]}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">
                    Fullname/Length Ratio
                  </p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["nums/length fullname"]?.toFixed(
                      2
                    ) || "0.00"}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">
                    Name Equals Username
                  </p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["name==username"] === 1
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">
                    Description Length
                  </p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["description length"]}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">External URL</p>
                  <p className="text-white text-lg font-semibold">
                    {detailsDialog.features["external URL"] === 1
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-1">
                    Fake Profile Flag
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      detailsDialog.features["fake"] === 1
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {detailsDialog.features["fake"] === 1
                      ? "Flagged"
                      : "Not Flagged"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">
              No profile features found for this user.
            </p>
          )}
        </DialogContent>
        <DialogActions
          style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}
        >
          <Button
            onClick={() =>
              setDetailsDialog({
                open: false,
                user: null,
                features: null,
                loading: false,
              })
            }
            variant="contained"
            style={{
              background: "var(--gradient-primary)",
              color: "white",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto Verification Settings Dialog */}
      <AutoVerificationSettings
        open={autoVerifyOpen}
        onClose={() => setAutoVerifyOpen(false)}
        onScheduleChange={(hasSchedule) => setAutoVerificationScheduled(hasSchedule)}
      />
    </div>
  );
}
