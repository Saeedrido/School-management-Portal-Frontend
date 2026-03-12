import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = '#6FAF8F', 
  trend,
  trendUp,
  onClick,
  hoverEffect = true 
}) => {
  const theme = useTheme();

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faf9 100%)',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(111, 175, 143, 0.1)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...(hoverEffect && onClick && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(111, 175, 143, 0.2)',
            border: `1px solid ${color}40`,
          },
        }),
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="body2"
              sx={{ 
                color: 'text.secondary', 
                fontWeight: 500,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '2rem', md: '2.5rem' },
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 1 }}
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
                    fontSize: '0.875rem',
                  }}
                >
                  {trend}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
