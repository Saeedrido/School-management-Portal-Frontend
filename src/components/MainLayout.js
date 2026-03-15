import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Class,
  Quiz,
  Assessment,
  Logout,
  CalendarMonth,
  Note,
  TrendingUp,
  Celebration,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import schoolLogo from '../assets/school logo imj/school-logo bck.png';

const drawerWidth = 260;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['Admin', 'Teacher', 'Student'], color: '#2196F3' },
    { text: 'Students', icon: <People />, path: '/dashboard/students', roles: ['Admin', 'Teacher'], color: '#66BB6A' },
    { text: 'Classes', icon: <Class />, path: '/dashboard/classes', roles: ['Admin', 'Teacher'], color: '#EF5350' },
    { text: 'Subjects', icon: <Quiz />, path: '/dashboard/subjects', roles: ['Admin', 'Teacher'], color: '#FFA726' },
    { text: 'Users', icon: <School />, path: '/dashboard/users', roles: ['Admin'], color: '#9C27B0' },
    { text: 'Exams', icon: <Assessment />, path: '/dashboard/exams', roles: ['Admin', 'Teacher', 'Student'], color: '#AB47BC' },
    { text: 'Results', icon: <TrendingUp />, path: '/dashboard/results', roles: ['Admin', 'Teacher', 'Student'], color: '#66BB6A' },
    { text: 'Academic Years', icon: <CalendarMonth />, path: '/dashboard/academic-years', roles: ['Admin', 'Teacher', 'Student', 'Parent'], color: '#2196F3' },
    { text: 'Terms', icon: <Note />, path: '/dashboard/terms', roles: ['Admin', 'Teacher', 'Student', 'Parent'], color: '#FF9800' },
    { text: 'Promotions', icon: <Celebration />, path: '/dashboard/promotions', roles: ['Admin', 'Teacher'], color: '#795548' },
    { text: 'Report Cards', icon: <Assessment />, path: '/dashboard/report-cards', roles: ['Admin', 'Teacher', 'Student', 'Parent'], color: '#F44336' },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          component="img"
          src={schoolLogo}
          alt="School Logo"
          sx={{
            width: 50,
            height: 50,
            borderRadius: 1.5,
            objectFit: 'contain',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        />
        <Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}
          >
            300 Arundel
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}
          >
            Learning Centre
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

      {/* User Info */}
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'rgba(255,255,255,0.2)',
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ color: 'white', fontWeight: 600, truncate: true }}
              noWrap
            >
              {user?.name || 'User'}
            </Typography>
            <Chip
              label={user?.role || 'Student'}
              size="small"
              sx={{
                bgcolor: 'rgba(102, 187, 106, 0.3)',
                color: 'white',
                fontSize: '0.65rem',
                height: 20,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
            sx={{ mb: 1 }}
          >
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                transition: 'all 0.3s',
                ...(location.pathname === item.path
                  ? {
                      background: 'rgba(255,255,255,0.2)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.25)',
                      },
                    }
                  : {
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                      },
                    }),
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'white',
                  minWidth: 40,
                  '& .MuiSvgIcon-root': {
                    fontSize: 22,
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: 'white',
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 700 : 500,
                    fontSize: '0.9rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 2,
            background: 'rgba(239, 83, 80, 0.2)',
            transition: 'all 0.3s',
            '&:hover': {
              background: 'rgba(239, 83, 80, 0.3)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>
            <Logout sx={{ fontSize: 22 }} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              color: 'white',
              '& .MuiTypography-root': {
                fontWeight: 600,
                fontSize: '0.9rem',
              },
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(90deg, #2196F3 0%, #66BB6A 100%)',
          boxShadow: '0 2px 12px rgba(33, 150, 243, 0.2)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              {menuItems.find((item) => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{ p: 0.5 }}
            >
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontWeight: 700,
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email || 'user@school.com'}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem disabled>
                <Chip
                  label={user?.role || 'Student'}
                  size="small"
                  sx={{
                    bgcolor: '#2196F3',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{ color: '#EF5350', fontWeight: 600 }}
              >
                <ListItemIcon sx={{ color: '#EF5350', minWidth: 32 }}>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: '#F5F7FA',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
