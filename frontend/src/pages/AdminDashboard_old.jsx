import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  CheckCircle,
  Person as PersonIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  VerifiedUser as VerifiedUserIcon,
  Warning as WarningIcon,
  HelpOutline as HelpOutlineIcon,
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
} from "recharts";
import { api } from "../Interceptor/apiCall";
import { url } from "../baseUrl";
import { AuthContext } from "../context/Auth";
import AdminNavbar from "../components/admin/AdminNavbar";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [verifyingUsers, setVerifyingUsers] = useState({}); // Track verification loading state per user
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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch users. Please ensure the backend server is running.";
      throwErr(errorMessage);
    }
  }, [throwErr]);

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const response = await api.get(`${url}/api/admin/blocked-users`);
      setBlockedUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch blocked users";
      throwErr(errorMessage);
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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch statistics";
      throwErr(errorMessage);
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
      // Refresh all data to update charts
      await Promise.all([fetchBlockedUsers(), fetchStats()]);
      throwSuccess("User blocked successfully");
    } catch (error) {
      throwErr("Failed to block user");
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
      // Refresh stats to update charts
      await fetchStats();
      throwSuccess("User unblocked successfully");
    } catch (error) {
      throwErr("Failed to unblock user");
    }
  };

  const handleVerifyProfile = async (userId) => {
    try {
      // Set loading state for this specific user
      setVerifyingUsers((prev) => ({ ...prev, [userId]: true }));

      const response = await api.post(
        `${url}/api/admin/users/${userId}/verify-profile`
      );

      if (response.data.success) {
        const verificationStatus = response.data.verification.status;
        const confidence = response.data.verification.confidence;

        // Update the user in the users array
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  verificationStatus,
                  verificationConfidence: confidence,
                }
              : user
          )
        );

        // Also update blocked users if applicable
        setBlockedUsers((prevBlockedUsers) =>
          prevBlockedUsers.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  verificationStatus,
                  verificationConfidence: confidence,
                }
              : user
          )
        );

        const statusText =
          verificationStatus === "fake" ? "Flagged as Fake" : "Verified Real";
        const confidencePercent = (
          verificationStatus === "fake"
            ? confidence.fakeProfileProb * 100
            : confidence.realProfileProb * 100
        ).toFixed(1);

        throwSuccess(
          `Profile ${statusText} (${confidencePercent}% confidence)`
        );
      }
    } catch (error) {
      console.error("Error verifying profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify profile";
      throwErr(errorMessage);
    } finally {
      // Clear loading state
      setVerifyingUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getVerificationBadge = (user) => {
    if (!user.verificationStatus) {
      return (
        <Chip
          icon={<HelpOutlineIcon />}
          label="Unverified"
          size="small"
          sx={{
            backgroundColor: "#9e9e9e",
            color: "white",
            fontWeight: "bold",
            fontSize: "11px",
          }}
        />
      );
    }

    if (user.verificationStatus === "real") {
      return (
        <Chip
          icon={<VerifiedUserIcon />}
          label="Verified Real"
          size="small"
          color="success"
          sx={{
            fontWeight: "bold",
            fontSize: "11px",
          }}
        />
      );
    }

    if (user.verificationStatus === "fake") {
      return (
        <Chip
          icon={<WarningIcon />}
          label="Flagged Fake"
          size="small"
          color="error"
          sx={{
            fontWeight: "bold",
            fontSize: "11px",
          }}
        />
      );
    }

    return null;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    return status === "active" ? "success" : "error";
  };

  const renderUserTable = (userList) => (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#1976d2" }}>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
            >
              User
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
            >
              Email
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
            >
              Join Date
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
            >
              Posts
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
            >
              Followers
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
            >
              Following
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
            >
              Status
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
            >
              Verification
            </TableCell>
            <TableCell
              sx={{ color: "white", fontWeight: "bold", fontSize: "14px" }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userList.map((user) => (
            <TableRow
              key={user._id}
              sx={{
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  "& .action-buttons": {
                    opacity: 1,
                  },
                },
                "&:nth-of-type(odd)": {
                  backgroundColor: "#fafafa",
                },
              }}
            >
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={user.avatar}
                    alt={user.username}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.name}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <strong>{user.postsCount}</strong>
              </TableCell>
              <TableCell>
                <strong>{user.followersCount}</strong>
              </TableCell>
              <TableCell>
                <strong>{user.followingCount}</strong>
              </TableCell>
              <TableCell>
                <Chip
                  label={user.status.toUpperCase()}
                  color={getStatusColor(user.status)}
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {getVerificationBadge(user)}
                  <Tooltip title="Verify profile using ML model" arrow>
                    <Button
                      variant="outlined"
                      size="small"
                      color="info"
                      onClick={() => handleVerifyProfile(user._id)}
                      disabled={verifyingUsers[user._id]}
                      startIcon={
                        verifyingUsers[user._id] ? (
                          <CircularProgress size={16} />
                        ) : (
                          <VerifiedUserIcon />
                        )
                      }
                      sx={{
                        minWidth: "120px",
                        px: 1,
                        fontSize: "11px",
                        fontWeight: "bold",
                        borderWidth: 1.5,
                        "&:hover": {
                          borderWidth: 1.5,
                        },
                      }}
                    >
                      {verifyingUsers[user._id] ? "Verifying..." : "Verify"}
                    </Button>
                  </Tooltip>
                  {user.verificationConfidence && (
                    <Typography variant="caption" color="text.secondary">
                      Confidence:{" "}
                      {(
                        (user.verificationStatus === "fake"
                          ? user.verificationConfidence.fakeProfileProb
                          : user.verificationConfidence.realProfileProb) * 100
                      ).toFixed(1)}
                      %
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Box
                  className="action-buttons"
                  sx={{
                    display: "flex",
                    gap: 1,
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                  }}
                >
                  {user.status === "active" ? (
                    <Tooltip title="Block User" arrow>
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        onClick={() => handleBlockUser(user._id)}
                        startIcon={<BlockIcon />}
                        sx={{
                          minWidth: "auto",
                          px: 1.5,
                          fontWeight: "bold",
                          borderWidth: 2,
                          "&:hover": {
                            borderWidth: 2,
                            backgroundColor: "rgba(237, 108, 2, 0.08)",
                          },
                        }}
                      >
                        Block
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Unblock User" arrow>
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        onClick={() => handleUnblockUser(user._id)}
                        startIcon={<UnblockIcon />}
                        sx={{
                          minWidth: "auto",
                          px: 1.5,
                          fontWeight: "bold",
                          borderWidth: 2,
                          "&:hover": {
                            borderWidth: 2,
                            backgroundColor: "rgba(46, 125, 50, 0.08)",
                          },
                        }}
                      >
                        Unblock
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete User" arrow>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, user })}
                      startIcon={<DeleteIcon />}
                      sx={{
                        minWidth: "auto",
                        px: 1.5,
                        fontWeight: "bold",
                        borderWidth: 2,
                        "&:hover": {
                          borderWidth: 2,
                          backgroundColor: "rgba(211, 47, 47, 0.08)",
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCharts = () => {
    if (!stats.activityStats) return null;

    const statusData = stats.activityStats.statusDistribution.map((item) => ({
      name: item._id === "active" ? "Active Users" : "Blocked Users",
      value: item.count,
      fill: item._id === "active" ? "#4caf50" : "#f44336", // Green for active, Red for blocked
    }));

    const activityData = [
      {
        name: "Low Activity (0-4 posts)",
        value: stats.activityStats.activityLevels[0]?.count || 0,
      },
      {
        name: "Medium Activity (5-19 posts)",
        value: stats.activityStats.activityLevels[1]?.count || 0,
      },
      {
        name: "High Activity (20+ posts)",
        value: stats.activityStats.activityLevels[2]?.count || 0,
      },
    ];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">User Growth Over Time</Typography>
                <Tooltip title="Refresh data">
                  <IconButton size="small" onClick={fetchStats}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Active vs Blocked Users</Typography>
                <Tooltip title="Refresh data">
                  <IconButton size="small" onClick={fetchStats}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip
                    formatter={(value, name) => [value, "Count"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                    }}
                  />
                  <Bar dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: "#4caf50",
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption">Active</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: "#f44336",
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption">Blocked</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                    }
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [value, "Users"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Activity Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={activityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dashboard Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4">{users.length}</Typography>
                    <Typography variant="body2">Total Users</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <PeopleIcon color="error" sx={{ fontSize: 40 }} />
                    <Typography variant="h4">{blockedUsers.length}</Typography>
                    <Typography variant="body2">Blocked Users</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                    <Typography variant="h4">
                      {users.filter((u) => u.status === "active").length}
                    </Typography>
                    <Typography variant="body2">Active Users</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <AssessmentIcon color="info" sx={{ fontSize: 40 }} />
                    <Typography variant="h4">
                      {users.reduce((sum, user) => sum + user.postsCount, 0)}
                    </Typography>
                    <Typography variant="body2">Total Posts</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", width: "100%" }}>
      <AdminNavbar />
      <Box sx={{ p: 3, maxWidth: "100%", width: "100%", margin: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            backgroundColor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Admin Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            Refresh
          </Button>
        </Box>

        <Box
          sx={{
            borderBottom: 2,
            borderColor: "#1976d2",
            mb: 2,
            backgroundColor: "white",
            borderRadius: "8px 8px 0 0",
            boxShadow: 1,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              "& .MuiTab-root": {
                fontSize: "16px",
                fontWeight: 600,
                textTransform: "none",
                minHeight: 60,
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
              },
              "& .Mui-selected": {
                color: "#1976d2",
              },
            }}
          >
            <Tab label="All Users" />
            <Tab label="Blocked Users" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              backgroundColor: "white",
              p: 3,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}
            >
              All Users ({users.length})
            </Typography>
            {renderUserTable(users)}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              backgroundColor: "white",
              p: 3,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#d32f2f", mb: 3 }}
            >
              Blocked Users ({blockedUsers.length})
            </Typography>
            {blockedUsers.length === 0 ? (
              <Alert severity="info" sx={{ fontSize: "16px" }}>
                No blocked users found.
              </Alert>
            ) : (
              renderUserTable(blockedUsers)
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              backgroundColor: "white",
              p: 3,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#1976d2", mb: 3 }}
            >
              Analytics & Statistics
            </Typography>

            {/* Summary Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: "#e3f2fd" }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="h4" color="primary">
                          {users.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Users
                        </Typography>
                      </Box>
                      <PersonIcon
                        sx={{
                          fontSize: 48,
                          color: "primary.main",
                          opacity: 0.5,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: "#e8f5e9" }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="h4" sx={{ color: "#4caf50" }}>
                          {users.filter((u) => u.status === "active").length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Users
                        </Typography>
                      </Box>
                      <CheckCircle
                        sx={{ fontSize: 48, color: "#4caf50", opacity: 0.5 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: "#ffebee" }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="h4" sx={{ color: "#f44336" }}>
                          {blockedUsers.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Blocked Users
                        </Typography>
                      </Box>
                      <BlockIcon
                        sx={{ fontSize: 48, color: "#f44336", opacity: 0.5 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: "#fff3e0" }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="h4" color="warning.main">
                          {users.reduce(
                            (sum, user) => sum + (user.postsCount || 0),
                            0
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Posts
                        </Typography>
                      </Box>
                      <AssessmentIcon
                        sx={{
                          fontSize: 48,
                          color: "warning.main",
                          opacity: 0.5,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {renderCharts()}
          </Box>
        </TabPanel>

        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, user: null })}
          PaperProps={{
            sx: {
              borderRadius: 2,
              padding: 1,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: "bold",
              fontSize: "20px",
              color: "#d32f2f",
              borderBottom: "2px solid #f5f5f5",
            }}
          >
            ⚠️ Delete User
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: "16px", lineHeight: 1.6 }}>
              Are you sure you want to permanently delete user{" "}
              <strong>"{deleteDialog.user?.username}"</strong>?
              <br />
              <br />
              This action cannot be undone and will remove all associated data
              including:
            </Typography>
            <ul style={{ marginTop: "10px", color: "#666" }}>
              <li>Posts and stories</li>
              <li>Comments and likes</li>
              <li>Follower relationships</li>
              <li>All user data</li>
            </ul>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, user: null })}
              variant="outlined"
              sx={{
                minWidth: 100,
                fontWeight: "bold",
                borderWidth: 2,
                "&:hover": { borderWidth: 2 },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              color="error"
              variant="contained"
              sx={{
                minWidth: 100,
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#c62828",
                },
              }}
            >
              Delete Permanently
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
