import React from 'react';
import { Box, Card, Typography, Avatar, useTheme, CardContent } from '@mui/material';

const InfoCard = ({
  title,
  value,
  subtitle,
  icon,
  color = '#6FAF8F',
  trend,
  trendUp,
  avatar,
  avatarBg,
  onClick,
}) => {
  const theme = useTheme();

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faf9 100%)',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(111, 175, 143, 0.08)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(111, 175, 143, 0.15)',
          border: `1px solid ${color}30`,
        } : {},
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `${color}08`,
        }}
      />
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: '#64748B',
                fontWeight: 500,
                mb: 0.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1E293B',
                fontSize: { xs: '1.75rem', md: '2rem' },
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{ color: '#64748B', mt: 0.5, fontSize: '0.8rem' }}
              >
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: trendUp ? '#10B981' : '#EF4444',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {trend}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
          {avatar ? (
            <Avatar
              src={avatar}
              sx={{
                width: 52,
                height: 52,
                bgcolor: avatarBg || `${color}15`,
                border: `2px solid ${color}20`,
              }}
            >
              {icon}
            </Avatar>
          ) : (
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
