import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api } from '../Interceptor/apiCall';
import { url } from '../baseUrl';
import { AuthContext } from '../context/Auth';
import AdminNavbar from '../components/admin/AdminNavbar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [stats, setStats] = useState({
    userGrowth: [],
    activityStats: null
  });
  const { throwErr, throwSuccess } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`${url}/api/admin/users`);
      setUsers(response.data.users);
    } catch (error) {
      throwErr('Failed to fetch users');
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const response = await api.get(`${url}/api/admin/blocked-users`);
      setBlockedUsers(response.data.users);
    } catch (error) {
      throwErr('Failed to fetch blocked users');
    }
  };

  const fetchStats = async () => {
    try {
      const [growthResponse, activityResponse] = await Promise.all([
        api.get(`${url}/api/admin/stats/user-growth?period=month`),
        api.get(`${url}/api/admin/stats/user-activity`)
      ]);
      
      setStats({
        userGrowth: growthResponse.data.data,
        activityStats: activityResponse.data.data
      });
    } catch (error) {
      throwErr('Failed to fetch statistics');
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchBlockedUsers(),
        fetchStats()
      ]);
    } catch (error) {
      throwErr('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [throwErr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteUser = async () => {
    try {
      await api.delete(`${url}/api/admin/users/${deleteDialog.user._id}`);
      setUsers(users.filter(user => user._id !== deleteDialog.user._id));
      setBlockedUsers(blockedUsers.filter(user => user._id !== deleteDialog.user._id));
      setDeleteDialog({ open: false, user: null });
      throwSuccess('User deleted successfully');
    } catch (error) {
      throwErr('Failed to delete user');
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await api.put(`${url}/api/admin/users/${userId}/block`);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: 'blocked' } : user
      ));
      fetchBlockedUsers(); // Refresh blocked users list
      throwSuccess('User blocked successfully');
    } catch (error) {
      throwErr('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await api.put(`${url}/api/admin/users/${userId}/unblock`);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: 'active' } : user
      ));
      setBlockedUsers(blockedUsers.filter(user => user._id !== userId));
      throwSuccess('User unblocked successfully');
    } catch (error) {
      throwErr('Failed to unblock user');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  const renderUserTable = (userList) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Join Date</TableCell>
            <TableCell>Posts</TableCell>
            <TableCell>Followers</TableCell>
            <TableCell>Following</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userList.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    src={user.avatar} 
                    alt={user.username}
                    sx={{ width: 32, height: 32 }}
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
              <TableCell>{user.postsCount}</TableCell>
              <TableCell>{user.followersCount}</TableCell>
              <TableCell>{user.followingCount}</TableCell>
              <TableCell>
                <Chip 
                  label={user.status} 
                  color={getStatusColor(user.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {user.status === 'active' ? (
                    <Tooltip title="Block User">
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => handleBlockUser(user._id)}
                      >
                        <BlockIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Unblock User">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleUnblockUser(user._id)}
                      >
                        <UnblockIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete User">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, user })}
                    >
                      <DeleteIcon />
                    </IconButton>
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

    const statusData = stats.activityStats.statusDistribution.map(item => ({
      name: item._id === 'active' ? 'Active Users' : 'Blocked Users',
      value: item.count
    }));

    const activityData = [
      { name: 'Low Activity (0-4 posts)', value: stats.activityStats.activityLevels[0]?.count || 0 },
      { name: 'Medium Activity (5-19 posts)', value: stats.activityStats.activityLevels[1]?.count || 0 },
      { name: 'High Activity (20+ posts)', value: stats.activityStats.activityLevels[2]?.count || 0 }
    ];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active vs Blocked Users
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                      {users.filter(u => u.status === 'active').length}
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <AdminNavbar />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Refresh
          </Button>
        </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Users" />
          <Tab label="Blocked Users" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          All Users ({users.length})
        </Typography>
        {renderUserTable(users)}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Blocked Users ({blockedUsers.length})
        </Typography>
        {blockedUsers.length === 0 ? (
          <Alert severity="info">No blocked users found.</Alert>
        ) : (
          renderUserTable(blockedUsers)
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Analytics & Statistics
        </Typography>
        {renderCharts()}
      </TabPanel>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete user "{deleteDialog.user?.username}"? 
            This action cannot be undone and will remove all associated data including posts, comments, and relationships.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
}
