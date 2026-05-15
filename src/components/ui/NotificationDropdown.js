import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Chip,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  Event as EventIcon,
  AttachMoney as AttachMoneyIcon,
  Info as InfoIcon,
  DoneAll,
  DeleteOutline,
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDetailModal from './NotificationDetailModal';

const getMessageIcon = (messageType) => {
  switch (messageType) {
    case 'Excursion':
      return <EventIcon sx={{ fontSize: 18, color: '#3B82F6' }} />;
    case 'School Fees Reminder':
      return <AttachMoneyIcon sx={{ fontSize: 18, color: '#F59E0B' }} />;
    default:
      return <InfoIcon sx={{ fontSize: 18, color: '#6FAF8F' }} />;
  }
};

const getMessageTypeColor = (messageType) => {
  switch (messageType) {
    case 'Excursion': return { bg: '#EFF6FF', text: '#1D4ED8' };
    case 'School Fees Reminder': return { bg: '#FFFBEB', text: '#B45309' };
    default: return { bg: '#F0F7F4', text: '#4E8C70' };
  }
};

const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  const normalized = /[Zz]|[+-]\d{2}:\d{2}$/.test(dateString) ? dateString : dateString + 'Z';
  const now = Date.now();
  const date = new Date(normalized).getTime();
  const diffMs = now - date;

  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return new Date(normalized).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NotificationDropdown = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, fetchHistory } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchHistory();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.userNotificationId);
    }
    setSelectedNotification(notification);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (userNotificationId) => {
    await markAsRead(userNotificationId);
  };

  const handleDelete = async (e, userNotificationId) => {
    e.stopPropagation();
    await deleteNotification(userNotificationId);
  };

  const handleViewAll = () => {
    handleClose();
    fetchHistory();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          color: '#64748B',
          '&:hover': {
            color: '#6FAF8F',
            background: 'rgba(111, 175, 143, 0.1)',
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              minWidth: 18,
              height: 18,
              fontWeight: 700,
            },
          }}
        >
          <NotificationsIcon sx={{ fontSize: 22 }} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: 360,
              maxHeight: 480,
              borderRadius: 2.5,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid rgba(111, 175, 143, 0.1)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(111, 175, 143, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} new`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(111, 175, 143, 0.1)',
                    color: '#4E8C70',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22,
                  }}
                />
              )}
              {notifications.length > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  sx={{
                    color: '#94A3B8',
                    p: 0.5,
                    '&:hover': { color: '#6FAF8F', bgcolor: 'rgba(111, 175, 143, 0.1)' },
                  }}
                >
                  <DoneAll sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} sx={{ color: '#6FAF8F' }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0, maxHeight: 340, overflowY: 'auto' }}>
            {notifications.slice(0, 50).map((notification, index) => {
              const colors = getMessageTypeColor(notification.messageType);
              const showDelete = isMobile || hoveredId === notification.userNotificationId;
              return (
                <React.Fragment key={notification.userNotificationId || index}>
                  <ListItem
                    disablePadding
                    onMouseEnter={() => setHoveredId(notification.userNotificationId)}
                    onMouseLeave={() => setHoveredId(null)}
                    secondaryAction={
                      showDelete ? (
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => handleDelete(e, notification.userNotificationId)}
                          sx={{
                            color: '#CBD5E1',
                            p: 0.5,
                            mr: 0.5,
                            '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                          }}
                        >
                          <DeleteOutline sx={{ fontSize: 18 }} />
                        </IconButton>
                      ) : null
                    }
                  >
                    <ListItemButton
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        pr: showDelete ? 1 : 2,
                        bgcolor: notification.isRead ? 'transparent' : 'rgba(111, 175, 143, 0.04)',
                        '&:hover': {
                          bgcolor: 'rgba(111, 175, 143, 0.08)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.5, alignSelf: 'flex-start' }}>
                        {getMessageIcon(notification.messageType)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                            <Chip
                              label={notification.messageType || 'General'}
                              size="small"
                              sx={{
                                bgcolor: colors.bg,
                                color: colors.text,
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                height: 20,
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#94A3B8',
                                fontSize: '0.65rem',
                                ml: 'auto',
                                flexShrink: 0,
                              }}
                            >
                              {getTimeAgo(notification.createdAt)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: notification.isRead ? 400 : 600,
                                color: notification.isRead ? '#64748B' : '#1E293B',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              {!notification.isRead && (
                                <CircleIcon sx={{ fontSize: 8, color: '#3B82F6' }} />
                              )}
                            </Box>
                          </Box>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < Math.min(notifications.length, 50) - 1 && (
                    <Divider sx={{ borderColor: 'rgba(111, 175, 143, 0.06)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}

        <Box sx={{ p: 1.5, borderTop: '1px solid rgba(111, 175, 143, 0.1)' }}>
          <Button
            fullWidth
            size="small"
            onClick={handleViewAll}
            sx={{
              color: '#6FAF8F',
              fontWeight: 600,
              fontSize: '0.8rem',
              textTransform: 'none',
              '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.08)' },
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Popover>

      <NotificationDetailModal
        notification={selectedNotification}
        open={detailOpen}
        onClose={handleDetailClose}
      />
    </>
  );
};

export default NotificationDropdown;
