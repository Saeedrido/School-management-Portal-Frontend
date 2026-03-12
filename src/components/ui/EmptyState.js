import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, sm: 8 },
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          color: '#6FAF8F',
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{
          color: '#1E293B',
          fontWeight: 600,
          mb: 1,
          fontSize: { xs: '1rem', sm: '1.25rem' },
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            maxWidth: 400,
            mb: 3,
            lineHeight: 1.7,
          }}
        >
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
};

export const LoadingState = ({ rows = 5 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {[...Array(rows)].map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton 
            variant="rectangular" 
            height={60} 
            sx={{ 
              borderRadius: 2,
              bgcolor: 'rgba(111, 175, 143, 0.05)',
            }} 
          />
        </Box>
      ))}
    </Box>
  );
};

export const CardSkeleton = () => {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid rgba(111, 175, 143, 0.1)',
        bgcolor: '#FFFFFF',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
        </Box>
      </Box>
      <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
    </Box>
  );
};

export default EmptyState;
