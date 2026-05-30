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
  useMediaQuery,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Class,
  Book,
  Assignment,
  Assessment,
  TrendingUp,
  CalendarMonth,
  Note,
  Quiz,
  Logout,
  ChevronLeft,
  Settings,
  Person,
  KeyboardArrowDown,
  School,
  Badge,
  EmojiEvents,
  Edit,
  Bookmark,
  Campaign,
  Comment,
} from '@mui/icons-material';
import schoolLogo from '../assets/school logo imj/school-logo bck.png';
import { useAuth } from '../context/AuthContext';
import InformationModal from './ui/InformationModal';
import NotificationDropdown from './ui/NotificationDropdown';

const drawerWidth = 260;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin-dashboard' },
    { text: 'Students', icon: <People />, path: '/admin-dashboard/students' },
    { text: 'Parents', icon: <People />, path: '/admin-dashboard/parents' },
    { text: 'Classes', icon: <Class />, path: '/admin-dashboard/classes' },
    { text: 'Subjects', icon: <Book />, path: '/admin-dashboard/subjects' },
    { text: 'Users', icon: <People />, path: '/admin-dashboard/users' },
    { text: 'Exams', icon: <Assignment />, path: '/admin-dashboard/exams' },
    { text: 'Results', icon: <TrendingUp />, path: '/admin-dashboard/results' },
    { text: 'Manual Score', icon: <Edit />, path: '/admin-dashboard/manual-score' },
    { text: 'Teacher Assignments', icon: <Bookmark />, path: '/admin-dashboard/teacher-assignments' },
    { text: 'Academic Years', icon: <CalendarMonth />, path: '/admin-dashboard/academic-years' },
    { text: 'Terms', icon: <Note />, path: '/admin-dashboard/terms' },
    { text: 'Promotions', icon: <Assessment />, path: '/admin-dashboard/promotions' },
    { text: 'Promotion Criteria', icon: <EmojiEvents />, path: '/admin-dashboard/promotion-criteria' },
    { text: 'Report Cards', icon: <Quiz />, path: '/admin-dashboard/report-cards' },
    { text: 'Grade Management', icon: <TrendingUp />, path: '/admin-dashboard/grade-management' },
    { text: 'Student Profiles', icon: <Person />, path: '/admin-dashboard/student-profiles' },
    { text: 'Information', icon: <Campaign />, action: 'info' },
    { separator: true },
    { text: 'Entrance Exams', icon: <School />, path: '/admin-dashboard/entrance-exams' },
    { text: 'Candidates', icon: <People />, path: '/admin-dashboard/entrance-candidates' },
  ];

  const teacherMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/teacher-dashboard' },
    { text: 'My Classes', icon: <Class />, path: '/teacher-dashboard/classes' },
    { text: 'Subjects', icon: <Book />, path: '/teacher-dashboard/subjects' },
    { text: 'Exams', icon: <Assignment />, path: '/teacher-dashboard/exams' },
    { text: 'Students', icon: <People />, path: '/teacher-dashboard/students' },
    { text: 'Results', icon: <TrendingUp />, path: '/teacher-dashboard/results' },
    { text: 'Manual Score', icon: <Edit />, path: '/teacher-dashboard/manual-score' },
    { text: 'Student Comments', icon: <Comment />, path: '/teacher-dashboard/student-comments' },
    { text: 'My ID Card', icon: <Badge />, path: '/my-id-card' },
  ];

  const parentMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/parent-dashboard' },
    { text: 'My Children', icon: <People />, path: '/parent-dashboard/children' },
    { text: 'Settings', icon: <Settings />, path: '/parent-dashboard/settings' },
  ];

  const menuItems = user?.role === 'Admin' ? adminMenuItems : user?.role === 'Teacher' ? teacherMenuItems : parentMenuItems;

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'Admin': return 'Admin Dashboard';
      case 'Teacher': return 'Teacher Dashboard';
      case 'Parent': return 'Parent Portal';
      default: return 'Dashboard';
    }
  };

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(180deg, #F0F7F4 0%, #E8F2ED 100%)',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed && (
          <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
            <Box
              component="img"
              src={schoolLogo}
              alt="School Logo"
              sx={{
                width: 50,
                height: 50,
                borderRadius: 1.5,
                objectFit: 'contain',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
                300 Arundel
              </Typography>
              <Typography variant="caption" sx={{ color: '#6FAF8F', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.3px' }}>
                 Learning Limited
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && (
          <Box
            component="img"
            src={schoolLogo}
            alt="School Logo"
            onClick={() => navigate('/')}
            sx={{
              width: 45,
              height: 45,
              borderRadius: 1.5,
              objectFit: 'contain',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
            }}
          />
        )}
        {!isMobile && !collapsed && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              color: '#64748B',
              '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.1)' },
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(111, 175, 143, 0.15)', mx: 2 }} />

      <Box sx={{ px: 2, py: 1.5 }}>
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              color: '#94A3B8',
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              px: 1,
            }}
          >
            {user?.role === 'Admin' ? 'Administration' : user?.role === 'Teacher' ? 'Teacher Portal' : 'Parent Portal'}
          </Typography>
        )}
      </Box>

      <List sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 0 }}>
        {menuItems.map((item, idx) => {
          if (item.separator) return <Divider key={`sep-${idx}`} sx={{ borderColor: 'rgba(111, 175, 143, 0.15)', my: 1.5, mx: 2 }} />;
          const itemKey = item.path || item.action;
          const isActive = item.path ? location.pathname === item.path : false;
          return (
            <ListItem key={itemKey} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.text : ''} placement="right">
                <ListItemButton
                  onClick={() => {
                    if (item.action === 'info') {
                      setInfoModalOpen(true);
                    } else if (item.path) {
                      navigate(item.path);
                    }
                    if (isMobile) setMobileOpen(false);
                  }}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: collapsed ? 1.5 : 1.5,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, rgba(111, 175, 143, 0.15) 0%, rgba(111, 175, 143, 0.08) 100%)',
                      borderLeft: '3px solid #6FAF8F',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(111, 175, 143, 0.2) 0%, rgba(111, 175, 143, 0.12) 100%)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#4E8C70',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#1F2937',
                        fontWeight: 600,
                      },
                    },
                    '&:hover': {
                      background: 'rgba(111, 175, 143, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: '#64748B',
                      minWidth: collapsed ? 0 : 36,
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        sx: {
                          color: '#475569',
                          fontWeight: 500,
                          fontSize: '0.9rem',
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(111, 175, 143, 0.15)', mx: 2 }} />

      <Box sx={{ p: 2 }}>
        {!collapsed ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              background: 'rgba(111, 175, 143, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar
              src={user?.profilePicture}
              sx={{
                width: 36,
                height: 36,
                border: '2px solid #6FAF8F',
                bgcolor: '#EAF3EE',
              }}
            >
              {!user?.profilePicture && (
                <Box sx={{ fontSize: 16, color: '#4E8C70', fontWeight: 600 }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Box>
              )}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ color: '#1F2937', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {user?.name || 'User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#64748B', fontSize: '0.75rem' }}
              >
                {user?.role || 'User'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{
                color: '#64748B',
                '&:hover': {
                  color: '#EF4444',
                  background: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              <Logout sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        ) : (
          <Tooltip title="Logout" placement="right">
            <IconButton
              onClick={handleLogout}
              sx={{
                width: '100%',
                color: '#64748B',
                borderRadius: 2,
                '&:hover': {
                  color: '#EF4444',
                  background: 'rgba(239, 68, 68, 0.1)',
                },
              }}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  const currentDrawerWidth = collapsed ? 80 : drawerWidth;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        background: '#F8FAF9',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          borderBottom: '1px solid rgba(111, 175, 143, 0.1)',
          flexShrink: 0,
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 1.5, sm: 2 },
            py: 1,
            minHeight: { xs: 56 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 1,
                display: { md: 'none' },
                color: '#1F2937',
              }}
            >
              <MenuIcon sx={{ fontSize: 26 }} />
            </IconButton>
            {!isMobile && collapsed && (
              <IconButton
                onClick={() => setCollapsed(false)}
                sx={{
                  color: '#64748B',
                  background: 'rgba(111, 175, 143, 0.1)',
                  '&:hover': { background: 'rgba(111, 175, 143, 0.2)' },
                }}
              >
                <MenuIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
            <Typography
              variant="h6"
              noWrap
              sx={{
                color: '#1F2937',
                fontWeight: 700,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {getRoleTitle()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user?.role !== 'Admin' && <NotificationDropdown />}
            <IconButton
              size="small"
              sx={{
                color: '#64748B',
                '&:hover': {
                  color: '#6FAF8F',
                  background: 'rgba(111, 175, 143, 0.1)',
                },
              }}
            >
              <Settings sx={{ fontSize: 22 }} />
            </IconButton>
            <Avatar
              src={user?.profilePicture}
              onClick={handleMenuOpen}
              sx={{
                width: 32,
                height: 32,
                border: '2px solid #6FAF8F',
                bgcolor: '#EAF3EE',
                ml: 0.75,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#4E8C70',
                  transform: 'scale(1.05)',
                },
              }}
            >
              {!user?.profilePicture && (
                <Box sx={{ fontSize: 14, color: '#4E8C70', fontWeight: 600 }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Box>
              )}
            </Avatar>
            <KeyboardArrowDown
              onClick={handleMenuOpen}
              sx={{
                color: '#64748B',
                cursor: 'pointer',
                ml: 0.5,
                '&:hover': { color: '#6FAF8F' },
              }}
            />
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 180,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(111, 175, 143, 0.1)',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(111, 175, 143, 0.1)' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {user?.role || 'User'}
                </Typography>
              </Box>
              <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', py: 1.5 }}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: '#EF4444' }} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(180deg, #F0F7F4 0%, #E8F2ED 100%)',
            borderRight: '1px solid rgba(111, 175, 143, 0.15)',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {!isMobile && (
          <Box
            component="nav"
            sx={{
              position: 'sticky',
              top: 0,
              height: '100vh',
              width: currentDrawerWidth,
              flexShrink: 0,
              transition: 'width 0.2s ease',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {drawer}
          </Box>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            background: '#F8FAF9',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: '#F1F5F4' },
            '&::-webkit-scrollbar-thumb': { background: '#CBD5E1', borderRadius: '4px' },
            '&::-webkit-scrollbar-thumb:hover': { background: '#94A3B8' },
          }}
        >
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Outlet />
          </Box>
        </Box>
      </Box>

      <InformationModal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} />
    </Box>
  );
};

export default DashboardLayout;

export { DashboardLayout as DashboardLayoutComponent };
