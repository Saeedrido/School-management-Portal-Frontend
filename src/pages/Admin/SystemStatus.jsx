import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tab,
  Tabs,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Memory,
  Storage,
  Speed,
  Schedule,
  CloudUpload,
  CloudDownload,
  People,
  Quiz,
  Assignment,
  TrendingUp,
  Timeline,
  Circle,
} from '@mui/icons-material';

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const SystemStatus = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock system health data
  const [systemHealth, setSystemHealth] = useState({
    overallStatus: 'Healthy',
    uptime: '45d 12h 30m',
    lastRestart: '2024-01-15 09:30:00',
    apiResponseTime: 45,
    databaseLatency: 12,
    memoryUsage: 68,
    cpuUsage: 42,
    diskUsage: 54,
    activeConnections: 234,
    cacheHitRate: 94.5,
  });

  // Mock background job status
  const [backgroundJobs, setBackgroundJobs] = useState([
    {
      id: 1,
      name: 'Email Notifications',
      status: 'Running',
      lastRun: '2 minutes ago',
      nextRun: 'In 5 minutes',
      successRate: 98.5,
      avgDuration: '2.3s',
    },
    {
      id: 2,
      name: 'Report Generation',
      status: 'Running',
      lastRun: '5 minutes ago',
      nextRun: 'In 10 minutes',
      successRate: 99.2,
      avgDuration: '8.7s',
    },
    {
      id: 3,
      name: 'Data Backup',
      status: 'Scheduled',
      lastRun: '6 hours ago',
      nextRun: 'In 18 hours',
      successRate: 100,
      avgDuration: '5m 23s',
    },
    {
      id: 4,
      name: 'Cache Cleanup',
      status: 'Running',
      lastRun: '1 hour ago',
      nextRun: 'In 2 hours',
      successRate: 100,
      avgDuration: '45s',
    },
    {
      id: 5,
      name: 'Result Processing',
      status: 'Paused',
      lastRun: '30 minutes ago',
      nextRun: 'Manual',
      successRate: 95.8,
      avgDuration: '12.1s',
    },
  ]);

  // Mock service status
  const [services, setServices] = useState([
    { name: 'API Server', status: 'Online', uptime: '45d 12h', responseTime: '45ms' },
    { name: 'Database Server', status: 'Online', uptime: '45d 12h', responseTime: '12ms' },
    { name: 'Redis Cache', status: 'Online', uptime: '42d 8h', responseTime: '2ms' },
    { name: 'File Storage', status: 'Online', uptime: '45d 12h', responseTime: 'N/A' },
    { name: 'Email Service', status: 'Online', uptime: '38d 5h', responseTime: '320ms' },
    { name: 'SMS Gateway', status: 'Degraded', uptime: '12d 3h', responseTime: '2.1s' },
  ]);

  // Mock recent activity
  const [recentActivity] = useState([
    { id: 1, type: 'Info', message: 'Scheduled backup completed successfully', time: '2 minutes ago', icon: <CheckCircle /> },
    { id: 2, type: 'Warning', message: 'High memory usage detected (75%)', time: '15 minutes ago', icon: <Warning /> },
    { id: 3, type: 'Success', message: 'Email queue processed: 1,234 emails', time: '1 hour ago', icon: <CheckCircle /> },
    { id: 4, type: 'Info', message: 'System health check completed', time: '2 hours ago', icon: <Timeline /> },
    { id: 5, type: 'Error', message: 'Failed login attempt detected from IP 192.168.1.100', time: '3 hours ago', icon: <Error /> },
  ]);

  // Mock statistics
  const [statistics] = useState({
    totalUsers: 1234,
    activeUsers: 456,
    totalStudents: 856,
    totalExams: 2345,
    todayLogins: 1234,
    todaySubmissions: 567,
    storageUsed: '245.6 GB',
    storageTotal: '500 GB',
    bandwidthToday: '12.3 GB',
  });

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Online':
      case 'Running':
      case 'Healthy':
        return { color: '#66BB6A', bgcolor: '#E8F5E9' };
      case 'Degraded':
      case 'Paused':
        return { color: '#FFA726', bgcolor: '#FFF3E0' };
      case 'Offline':
      case 'Stopped':
      case 'Error':
        return { color: '#EF5350', bgcolor: '#FFEBEE' };
      case 'Scheduled':
        return { color: '#2196F3', bgcolor: '#E3F2FD' };
      default:
        return { color: '#757575', bgcolor: '#F5F5F5' };
    }
  };

  const getHealthColor = (value, type) => {
    if (type === 'good') return value < 50 ? '#66BB6A' : value < 80 ? '#FFA726' : '#EF5350';
    if (type === 'usage') return value < 60 ? '#66BB6A' : value < 85 ? '#FFA726' : '#EF5350';
    return '#2196F3';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a192f 0%, #0d1b2a 40%, #000000 100%)',
      }}
    >
      <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard/admin-dashboard')} sx={{ color: '#ffffff' }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              System Status
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              Monitor system health, performance, and background jobs
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              icon={<Circle sx={{ fontSize: 12 }} />}
              label={systemHealth.overallStatus}
              sx={{
                ...getStatusColor(systemHealth.overallStatus),
                fontWeight: 600,
              }}
            />
            <Button
              variant="outlined"
              startIcon={refreshing ? <Refresh className="spin" /> : <Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: '#FF3E8A',
                  background: 'rgba(255, 62, 138, 0.1)',
                },
              }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              },
              '& .MuiTab-root.Mui-selected': {
                color: '#FF3E8A',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FF3E8A',
              },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Background Jobs" />
            <Tab label="Services" />
            <Tab label="Activity Log" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* System Health Stats */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'rgba(17, 17, 17, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#FF3E8A',
                      mb: 3,
                    }}
                  >
                    System Metrics
                  </Typography>

                  {/* Memory Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Memory sx={{ color: '#2196F3', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Memory Usage
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#2196F3', fontWeight: 600 }}>
                        {systemHealth.memoryUsage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={systemHealth.memoryUsage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getHealthColor(systemHealth.memoryUsage, 'usage'),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  {/* CPU Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Speed sx={{ color: '#66BB6A', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          CPU Usage
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#66BB6A', fontWeight: 600 }}>
                        {systemHealth.cpuUsage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={systemHealth.cpuUsage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getHealthColor(systemHealth.cpuUsage, 'usage'),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  {/* Disk Usage */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Storage sx={{ color: '#FFA726', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          Disk Usage
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#FFA726', fontWeight: 600 }}>
                        {systemHealth.diskUsage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={systemHealth.diskUsage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getHealthColor(systemHealth.diskUsage, 'usage'),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  {/* Cache Hit Rate */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp sx={{ color: '#AB47BC', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Cache Hit Rate
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#AB47BC', fontWeight: 600 }}>
                      {systemHealth.cacheHitRate}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Statistics */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'rgba(17, 17, 17, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#FF3E8A',
                      mb: 3,
                    }}
                  >
                    Platform Statistics
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(33, 150, 243, 0.2)', color: '#2196F3' }}>
                          <People />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Total Users
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                            {statistics.totalUsers.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(102, 187, 106, 0.2)', color: '#66BB6A' }}>
                          <CheckCircle />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Active Now
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                            {statistics.activeUsers.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255, 62, 138, 0.2)', color: '#FF3E8A' }}>
                          <Quiz />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Total Exams
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                            {statistics.totalExams.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255, 167, 38, 0.2)', color: '#FFA726' }}>
                          <Assignment />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Today Submissions
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                            {statistics.todaySubmissions.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(171, 71, 188, 0.2)', color: '#AB47BC' }}>
                          <CloudUpload />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Storage Used
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                            {statistics.storageUsed}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(0, 200, 83, 0.2)', color: '#00C853' }}>
                          <CloudDownload />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Bandwidth Today
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                            {statistics.bandwidthToday}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* System Information */}
            <Grid item xs={12}>
              <Card
                sx={{
                  background: 'rgba(17, 17, 17, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#FF3E8A',
                      mb: 3,
                    }}
                  >
                    System Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
                        System Uptime
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {systemHealth.uptime}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
                        Last Restart
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {systemHealth.lastRestart}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
                        API Response Time
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {systemHealth.apiResponseTime}ms
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
                        Database Latency
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {systemHealth.databaseLatency}ms
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
                        Active Connections
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {systemHealth.activeConnections}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5, display: 'block' }}>
                        Last Refresh
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                        {lastRefresh.toLocaleTimeString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Background Jobs Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card
            sx={{
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#FF3E8A',
                  mb: 3,
                }}
              >
                Background Jobs (Hangfire)
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Job Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Next Run</TableCell>
                      <TableCell>Success Rate</TableCell>
                      <TableCell>Avg Duration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {backgroundJobs.map((job) => (
                      <TableRow
                        key={job.id}
                        sx={{
                          '&:hover': {
                            background: 'rgba(255, 62, 138, 0.05)',
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule sx={{ color: '#FF3E8A', fontSize: 18 }} />
                            <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
                              {job.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={job.status}
                            size="small"
                            sx={{
                              ...getStatusColor(job.status),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {job.lastRun}
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {job.nextRun}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: job.successRate >= 98 ? '#66BB6A' : job.successRate >= 90 ? '#FFA726' : '#EF5350',
                                fontWeight: 600,
                              }}
                            >
                              {job.successRate}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {job.avgDuration}
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                            Trigger
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Services Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card
            sx={{
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#FF3E8A',
                  mb: 3,
                }}
              >
                Service Status
              </Typography>

              <Grid container spacing={2}>
                {services.map((service, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        p: 2,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${getStatusColor(service.status).bgcolor}`,
                        borderRadius: 2,
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderColor: '#FF3E8A',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Circle
                          sx={{
                            fontSize: 12,
                            color: getStatusColor(service.status).color,
                          }}
                        />
                        <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                          {service.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Status: <span style={{ color: getStatusColor(service.status).color, fontWeight: 600 }}>{service.status}</span>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {service.responseTime}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Uptime: {service.uptime}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Activity Log Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card
            sx={{
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#FF3E8A',
                  mb: 3,
                }}
              >
                Recent Activity
              </Typography>

              <Box>
                {recentActivity.map((activity, index) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      mb: index !== recentActivity.length - 1 ? 2 : 0,
                      borderRadius: 2,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.02)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background:
                          activity.type === 'Success'
                            ? 'rgba(102, 187, 106, 0.2)'
                            : activity.type === 'Error'
                            ? 'rgba(239, 83, 80, 0.2)'
                            : activity.type === 'Warning'
                            ? 'rgba(255, 167, 38, 0.2)'
                            : 'rgba(33, 150, 243, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {React.cloneElement(activity.icon, {
                        sx: {
                          fontSize: 18,
                          color:
                            activity.type === 'Success'
                              ? '#66BB6A'
                              : activity.type === 'Error'
                              ? '#EF5350'
                              : activity.type === 'Warning'
                              ? '#FFA726'
                              : '#2196F3',
                        },
                      })}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500, mb: 0.25 }}>
                        {activity.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Info Card */}
        <Card
          sx={{
            mt: 3,
            background: 'rgba(17, 17, 17, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Timeline sx={{ fontSize: 24, color: '#FF3E8A' }} />
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}
                >
                  <strong>System Monitoring</strong>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  This dashboard provides real-time monitoring of system health, background jobs, and service status.
                  Configure alerts to be notified of critical issues.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SystemStatus;
