import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close,
  Event as EventIcon,
  AttachMoney as AttachMoneyIcon,
  Info as InfoIcon,
  CheckCircle,
  AccessTime,
  CalendarMonth,
} from '@mui/icons-material';

const getMessageTypeIcon = (messageType, sx) => {
  switch (messageType) {
    case 'Excursion':
      return <EventIcon sx={{ fontSize: 40, color: '#3B82F6', ...sx }} />;
    case 'School Fees Reminder':
      return <AttachMoneyIcon sx={{ fontSize: 40, color: '#F59E0B', ...sx }} />;
    default:
      return <InfoIcon sx={{ fontSize: 40, color: '#6FAF8F', ...sx }} />;
  }
};

const getMessageTypeColor = (messageType) => {
  switch (messageType) {
    case 'Excursion': return { bg: '#EFF6FF', text: '#1D4ED8', chip: '#3B82F6' };
    case 'School Fees Reminder': return { bg: '#FFFBEB', text: '#B45309', chip: '#F59E0B' };
    default: return { bg: '#F0F7F4', text: '#4E8C70', chip: '#6FAF8F' };
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const normalized = /[Zz]|[+-]\d{2}:\d{2}$/.test(dateString) ? dateString : dateString + 'Z';
  const date = new Date(normalized);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAmount = (amount) => {
  if (amount == null) return null;
  return `₦${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const NotificationDetailModal = ({ notification, open, onClose }) => {
  if (!notification) return null;

  const colors = getMessageTypeColor(notification.messageType);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {getMessageTypeIcon(notification.messageType)}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
              {notification.messageType || 'Notification'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {notification.title}
            </Typography>
          </Box>
        </Box>
        <Button onClick={onClose} size="small" sx={{ minWidth: 32, p: 0.5 }}>
          <Close />
        </Button>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, maxHeight: 440, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, display: 'block' }}>
              Message
            </Typography>
            <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {notification.message}
            </Typography>
          </Box>

          {notification.messageType === 'School Fees Reminder' && notification.amount != null && (
            <Box sx={{ bgcolor: '#FFFBEB', borderRadius: 2, p: 2, border: '1px solid #FDE68A' }}>
              <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, display: 'block' }}>
                Amount Due
              </Typography>
              <Typography variant="h5" sx={{ color: '#92400E', fontWeight: 700 }}>
                {formatAmount(notification.amount)}
              </Typography>
            </Box>
          )}

          {notification.messageType === 'Excursion' && notification.date && (
            <Box sx={{ bgcolor: '#EFF6FF', borderRadius: 2, p: 2, border: '1px solid #BFDBFE' }}>
              <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, display: 'block' }}>
                <CalendarMonth sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Excursion Date
              </Typography>
              <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 600 }}>
                {formatDateTime(notification.date)}
              </Typography>
            </Box>
          )}

          <Divider />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Chip
                icon={getMessageTypeIcon(notification.messageType, { fontSize: 14 })}
                label={notification.messageType || 'General'}
                size="small"
                sx={{
                  bgcolor: colors.bg,
                  color: colors.text,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14, color: '#9CA3AF' }} />
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                {formatDateTime(notification.createdAt)}
              </Typography>
            </Box>
          </Box>

          {notification.isRead && notification.readAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircle sx={{ fontSize: 14, color: '#6FAF8F' }} />
              <Typography variant="caption" sx={{ color: '#6FAF8F' }}>
                Read on {formatDateTime(notification.readAt)}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#6FAF8F', '&:hover': { bgcolor: '#4E8C70' } }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationDetailModal;
