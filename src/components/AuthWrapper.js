import React from 'react';
import { useLocation, Outlet, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/**
 * AuthWrapper Component
 *
 * A unified wrapper that handles:
 * - Authentication checks
 * - Role-based routing with DashboardLayout
 * - Loading states
 * - Proper navigation redirects
 *
 * This component combines the logic from ProtectedRoute, PublicRoute, and HomeRoute
 * into a single reusable wrapper that uses DashboardLayout for authenticated users.
 */
const AuthWrapper = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, loading, hasRole } = useAuth();
  const location = useLocation();

  // Handle loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0a192f 0%, #000000 100%)',
          color: '#ffffff',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src="/school-icon.svg"
            alt="Loading..."
            sx={{
              width: 80,
              height: 80,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(0.8)', opacity: 1 },
                '50%': { transform: 'scale(1)', opacity: 0.5 },
                '100%': { transform: 'scale(0.8)', opacity: 1 },
              },
            }}
          />
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Loading...</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles ? hasRole(allowedRoles) : true;

  // For role-based dashboards, wrap with DashboardLayout
  // For other protected routes, just check auth
  const shouldUseDashboardLayout = location.pathname === '/teacher-dashboard' ||
                                location.pathname === '/admin-dashboard' ||
                                location.pathname.startsWith('/dashboard/');

  // Student redirect to exams
  if (location.pathname === '/' && isAuthenticated && user?.role === 'Student') {
    return <Navigate to="/exams" replace />;
  }

  // If user is authenticated and doesn't have required role, redirect to appropriate dashboard
  if (isAuthenticated && !hasRequiredRole && !shouldUseDashboardLayout) {
    if (user?.role === 'Teacher') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else if (user?.role === 'Admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // If not authorized, show nothing or children
  if (!hasRequiredRole) {
    return null;
  }

  // Render with appropriate layout
  if (shouldUseDashboardLayout) {
    return (
      <>
        {/* DashboardLayout will handle sidebar, navbar, and Outlet */}
        <Box sx={{ display: 'flex' }}>
          <Outlet />
        </Box>
      </>
    );
  }

  return children;
};

export default AuthWrapper;
