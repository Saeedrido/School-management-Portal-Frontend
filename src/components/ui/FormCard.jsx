import React from 'react';
import { Box, Card, CardContent, Typography, Grid, useTheme } from '@mui/material';

const FormCard = ({ title, subtitle, icon, children, action }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(111, 175, 143, 0.1)',
        overflow: 'visible',
      }}
    >
      {(title || icon) && (
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(111, 175, 143, 0.03) 0%, rgba(111, 175, 143, 0.08) 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {icon && (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(111, 175, 143, 0.3)',
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      <CardContent sx={{ p: 3 }}>
        {children}
      </CardContent>
    </Card>
  );
};

const FormSection = ({ title, description, children, gridColumns = 2 }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {title && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {description}
            </Typography>
          )}
        </Box>
      )}
      <Grid container spacing={3}>
        {children}
      </Grid>
    </Box>
  );
};

const FormActions = ({ children, justify = 'flex-end' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: justify,
        gap: 2,
        mt: 4,
        pt: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {children}
    </Box>
  );
};

export { FormCard, FormSection, FormActions };
