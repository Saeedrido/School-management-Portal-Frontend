import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Drawer,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Class,
  School,
  Book,
  Assignment,
  Assessment,
  TrendingUp,
  CalendarMonth,
  Note,
  Quiz,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Admin menu items
  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin-dashboard' },
    { text: 'Students', icon: <People />, path: '/admin-dashboard/students' },
    { text: 'Classes', icon: <Class />, path: '/admin-dashboard/classes' },
    { text: 'Subjects', icon: <Book />, path: '/admin-dashboard/subjects' },
    { text: 'Users', icon: <School />, path: '/admin-dashboard/users' },
    { text: 'Exams', icon: <Assignment />, path: '/admin-dashboard/exams' },
    { text: 'Results', icon: <TrendingUp />, path: '/admin-dashboard/results' },
    { text: 'Academic Years', icon: <CalendarMonth />, path: '/admin-dashboard/academic-years' },
    { text: 'Terms', icon: <Note />, path: '/admin-dashboard/terms' },
    { text: 'Promotions', icon: <Assessment />, path: '/admin-dashboard/promotions' },
    { text: 'Report Cards', icon: <Quiz />, path: '/admin-dashboard/report-cards' },
  ];

  // Teacher menu items
  const teacherMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/teacher-dashboard' },
    { text: 'My Classes', icon: <Class />, path: '/teacher-dashboard/classes' },
    { text: 'Subjects', icon: <Book />, path: '/teacher-dashboard/subjects' },
    { text: 'Exams', icon: <Assignment />, path: '/teacher-dashboard/exams' },
    { text: 'Students', icon: <People />, path: '/teacher-dashboard/students' },
    { text: 'My ID Card', icon: <School />, path: '/my-id-card' },
  ];

  // Select menu based on role
  const menuItems = user?.role === 'Admin' ? adminMenuItems : teacherMenuItems;

  // Drawer content (sidebar)
  const drawer = (
    <Box
      onClick={() => {
        if (window.innerWidth >= 960) {
          setMobileOpen(false);
        }
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#EAF3EE',
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1,
          }}
        >
          <School sx={{ fontSize: 28, color: 'white' }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 700 }}>
          EduFlow Pro
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      <List sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ px: 1.5, mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'rgba(111, 175, 143, 0.15)',
                  borderRight: '3px solid #6FAF8F',
                  '&:hover': {
                    background: 'rgba(111, 175, 143, 0.2)',
                  },
                },
                '&:hover': {
                  background: 'rgba(111, 175, 143, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#4E8C70', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: '#1F2937',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    fontSize: '0.95rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: '#E2E8F0' }} />
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        background: '#F5F7F6',
        overflow: 'hidden',
      }}
    >
      {/* Navbar - Fixed at top */}
      <Box
        sx={{
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #E2E8F0',
          flexShrink: 0,
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, sm: 3 },
            py: 2,
          }}
        >
          {/* Logo & Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { sm: 'none' },
                color: '#1F2937',
              }}
            >
              <MenuIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <School sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                color: '#1F2937',
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              {user?.role === 'Admin' ? 'Admin Dashboard' : 'Teacher Dashboard'}
            </Typography>
          </Box>

          {/* User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={user?.profilePicture}
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                border: '2px solid #6FAF8F',
                bgcolor: '#EAF3EE',
              }}
            >
              {!user?.profilePicture && (
                <Box sx={{ fontSize: { xs: 16, sm: 20 }, color: '#4E8C70' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Box>
              )}
            </Avatar>
            <Typography
              variant="body2"
              sx={{ color: '#1F2937', display: { xs: 'none', sm: 'block' } }}
            >
              {user?.name || 'User'}
            </Typography>
            <IconButton
              size="small"
              aria-label="logout"
              onClick={handleLogout}
              sx={{
                color: '#6B7280',
                '&:hover': {
                  color: '#6FAF8F',
                  background: 'rgba(111, 175, 143, 0.1)',
                },
              }}
            >
              <Logout sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: '#EAF3EE',
            borderRight: '1px solid #E2E8F0',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content Area */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Desktop Sidebar */}
        <Box
          component="nav"
          sx={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: drawerWidth,
            background: '#EAF3EE',
            borderRight: '1px solid #E2E8F0',
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          {drawer}
        </Box>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            background: '#F5F7F6',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#E2E8F0',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#6FAF8F',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#4E8C70',
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

export { DashboardLayout as DashboardLayoutComponent };
