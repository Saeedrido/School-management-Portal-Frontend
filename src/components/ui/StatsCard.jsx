import React from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  trendValue,
  color = '#6FAF8F',
  gradient = true,
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp sx={{ fontSize: 16 }} />;
    if (trend === 'down') return <TrendingDown sx={{ fontSize: 16 }} />;
    return <Remove sx={{ fontSize: 16 }} />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text.secondary';
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
    return '#6B7280';
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        background: gradient 
          ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
          : '#fff',
        border: '1px solid',
        borderColor: `${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${color}20`,
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: `0 4px 12px ${color}40`,
            }}
          >
            {Icon && <Icon sx={{ fontSize: 24 }} />}
          </Box>
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: getTrendColor(),
                backgroundColor: `${getTrendColor()}15`,
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {getTrendIcon()}
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              display: 'block',
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default StatsCard;
