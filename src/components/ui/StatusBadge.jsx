import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const StatusBadge = ({ status, size = 'medium' }) => {
  const getStatusConfig = (status) => {
    const statusLower = String(status).toLowerCase();
    
    if (statusLower === 'active' || statusLower === 'published' || statusLower === 'completed' || statusLower === 'approved') {
      return { bg: '#DCFCE7', color: '#166534', label: status };
    }
    if (statusLower === 'inactive' || statusLower === 'draft' || statusLower === 'pending') {
      return { bg: '#FEF3C7', color: '#92400E', label: status };
    }
    if (statusLower === 'cancelled' || statusLower === 'failed' || statusLower === 'rejected') {
      return { bg: '#FEE2E2', color: '#991B1B', label: status };
    }
    if (statusLower === 'scheduled' || statusLower === 'upcoming') {
      return { bg: '#DBEAFE', color: '#1E40AF', label: status };
    }
    return { bg: '#F1F5F9', color: '#475569', label: status };
  };

  const config = getStatusConfig(status);
  const sizes = {
    small: { px: 1.5, py: 0.25, fontSize: '0.7rem' },
    medium: { px: 2, py: 0.5, fontSize: '0.75rem' },
    large: { px: 2.5, py: 0.75, fontSize: '0.8rem' },
  };

  return (
    <Chip
      label={config.label}
      size={size === 'small' ? 'small' : 'medium'}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: '8px',
        height: sizes[size].py * 2 + 20,
        px: sizes[size].px,
        fontSize: sizes[size].fontSize,
        '& .MuiChip-label': {
          px: 0,
        },
      }}
    />
  );
};

export default StatusBadge;

export const Badge = StatusBadge;
