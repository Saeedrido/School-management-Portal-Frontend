import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, useTheme } from '@mui/material';
import { NavigateNext, Add } from '@mui/icons-material';

const PageHeader = ({ title, subtitle, breadcrumbs = [], action, actionText, onAction }) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        mb: 4,
        pb: 3,
        borderBottom: '1px solid',
        borderColor: 'rgba(111, 175, 143, 0.1)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: breadcrumbs.length > 0 ? 2 : 0 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1E293B',
              fontSize: { xs: '1.5rem', md: '2rem' },
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: '#64748B', fontSize: '0.95rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {(action || actionText) && (
          <Box>
            {action || (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAction}
                sx={{
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                  px: 3,
                  boxShadow: '0 4px 14px rgba(111, 175, 143, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(111, 175, 143, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {actionText}
              </Button>
            )}
          </Box>
        )}
      </Box>
      
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" sx={{ color: '#94A3B8' }} />}
          sx={{ 
            '& .MuiBreadcrumbs-separator': { color: '#94A3B8' },
            '& .MuiTypography-root': { color: '#64748B', fontSize: '0.85rem' }
          }}
        >
          <Link 
            underline="hover" 
            color="inherit" 
            href="/"
            sx={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', '&:hover': { color: '#6FAF8F' } }}
          >
            Home
          </Link>
          {breadcrumbs.map((crumb, index) => (
            crumb.href ? (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                href={crumb.href}
                sx={{ fontSize: '0.85rem', '&:hover': { color: '#6FAF8F' } }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={index} sx={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 500 }}>
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
      )}
    </Box>
  );
};

export default PageHeader;
