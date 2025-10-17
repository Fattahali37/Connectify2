import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Person as PersonIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Delete as DeleteIcon,
  VerifiedUser as VerifiedUserIcon,
  Warning as WarningIcon,
  HelpOutlineIcon,
  Refresh as RefreshIcon,
  ArrowUpward,
  ArrowDownward,
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
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { api } from "../Interceptor/apiCall";
import { url } from "../baseUrl";
import { AuthContext } from "../context/Auth";
import AdminNavbar from "../components/admin/AdminNavbar";
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

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];
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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [verifyingUsers, setVerifyingUsers] = useState({});
  const [stats, setStats] = useState({
    userGrowth: [],
    activityStats: null,
  });
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
      throwErr(error.response?.data?.message || "Failed to fetch blocked users");
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
      setBlockedUsers(blockedUsers.filter((user) => user._id !== deleteDialog.user._id));
      setDeleteDialog({ open: false, user: null });
      throwSuccess("User deleted successfully");
    } catch (error) {
      throwErr("Failed to delete user");
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await api.put(`${url}/api/admin/users/${userId}/block`);
      setUsers(users.map((user) => (user._id === userId ? { ...user, status: "blocked" } : user)));
      await Promise.all([fetchBlockedUsers(), fetchStats()]);
      throwSuccess("User blocked successfully");
    } catch (error) {
      throwErr("Failed to block user");
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await api.put(`${url}/api/admin/users/${userId}/unblock`);
      setUsers(users.map((user) => (user._id === userId ? { ...user, status: "active" } : user)));
      setBlockedUsers(blockedUsers.filter((user) => user._id !== userId));
      await fetchStats();
      throwSuccess("User unblocked successfully");
    } catch (error) {
      throwErr("Failed to unblock user");
    }
  };

  const handleVerifyProfile = async (userId) => {
    try {
      setVerifyingUsers((prev) => ({ ...prev, [userId]: true }));
      const response = await api.post(`${url}/api/admin/users/${userId}/verify-profile`);

      if (response.data.success) {
        const verificationStatus = response.data.verification.status;
        const confidence = response.data.verification.confidence;

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId
              ? { ...user, verificationStatus, verificationConfidence: confidence }
              : user
          )
        );

        const statusText = verificationStatus === "fake" ? "Flagged as Fake" : "Verified Real";
        const confidencePercent = (
          (verificationStatus === "fake" ? confidence.fakeProfileProb : confidence.realProfileProb) * 100
        ).toFixed(1);

        throwSuccess(`Profile ${statusText} (${confidencePercent}% confidence)`);
      }
    } catch (error) {
      throwErr(error.response?.data?.message || "Failed to verify profile");
    } finally {
      setVerifyingUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Stats Cards
  const StatCard = ({ title, value, change, icon: Icon, gradient, trend }) => (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
          <Icon className="text-white" sx={{ fontSize: 32 }} />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {trend === 'up' ? <ArrowUpward sx={{ fontSize: 16 }} /> : <ArrowDownward sx={{ fontSize: 16 }} />}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
          <p className="text-white mt-4 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const activeUsers = users.filter((u) => u.status === "active").length;
  const totalPosts = users.reduce((sum, user) => sum + (user.postsCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AdminNavbar />
      
      <div className="pt-20 px-6 pb-8">
        {/* Header with Tabs */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-slate-400">Welcome back, here's what's happening</p>
            </div>
            <button
              onClick={fetchData}
              className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200"
            >
              <RefreshIcon />
              <span className="font-medium">Refresh</span>
            </button>
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
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
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
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
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
                          { name: "Active", value: activeUsers, fill: CHART_COLORS.success },
                          { name: "Blocked", value: blockedUsers.length, fill: CHART_COLORS.danger },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900/50">
                    <tr>
                      {["User", "Email", "Posts", "Followers", "Status", "Verification", "Actions"].map((header) => (
                        <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar src={user.avatar} alt={user.username} sx={{ width: 40, height: 40 }} />
                            <div>
                              <p className="font-medium text-white">{user.username}</p>
                              <p className="text-sm text-slate-400">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{user.email}</td>
                        <td className="px-6 py-4 text-slate-300">{user.postsCount || 0}</td>
                        <td className="px-6 py-4 text-slate-300">{user.followersCount || 0}</td>
                        <td className="px-6 py-4">
                          <Chip
                            label={user.status}
                            size="small"
                            sx={{
                              backgroundColor: user.status === "active" ? "#10b981" : "#ef4444",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          {user.verificationStatus ? (
                            <Chip
                              label={user.verificationStatus === "real" ? "Verified" : "Flagged"}
                              size="small"
                              icon={user.verificationStatus === "real" ? <VerifiedUserIcon /> : <WarningIcon />}
                              sx={{
                                backgroundColor: user.verificationStatus === "real" ? "#10b981" : "#ef4444",
                                color: "white",
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => handleVerifyProfile(user._id)}
                              disabled={verifyingUsers[user._id]}
                              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              {verifyingUsers[user._id] ? "Verifying..." : "Verify"}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                user.status === "active"
                                  ? handleBlockUser(user._id)
                                  : handleUnblockUser(user._id)
                              }
                              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                user.status === "active"
                                  ? "bg-yellow-600 hover:bg-yellow-700"
                                  : "bg-green-600 hover:bg-green-700"
                              } text-white`}
                            >
                              {user.status === "active" ? "Block" : "Unblock"}
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ open: true, user })}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
                <p className="text-slate-400 text-center py-12">No blocked users found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blockedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar src={user.avatar} alt={user.username} sx={{ width: 50, height: 50 }} />
                        <div className="flex-1">
                          <p className="font-medium text-white">{user.username}</p>
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
                      <Bar dataKey="count" fill={CHART_COLORS.purple} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="User Engagement">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={stats.userGrowth}
                    >
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
            backgroundColor: "#1e293b",
            borderRadius: "1rem",
            border: "1px solid #334155",
          },
        }}
      >
        <DialogTitle style={{ color: "#fff", fontWeight: "bold" }}>
          Delete User
        </DialogTitle>
        <DialogContent>
          <p className="text-slate-300">
            Are you sure you want to delete <strong>{deleteDialog.user?.username}</strong>?
            This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions style={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, user: null })}
            style={{ color: "#94a3b8" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
