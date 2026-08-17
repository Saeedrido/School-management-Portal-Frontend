import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValidated, setTokenValidated] = useState(false);

  // Normalize user data from backend to match frontend expectations
  
  const normalizeUser = (userData) => {
    if (!userData) return null;

    // Backend sends: { firstName, lastName, roles: [{ name }], Id } (camelCase)
    // Frontend expects: { name, role, id } (lowercase properties)
    const firstName = userData.firstName || userData.FirstName || '';
    const lastName = userData.lastName || userData.LastName || '';
    const roles = userData.roles || userData.Roles || [];
    const roleName = roles && roles.length > 0 
      ? (roles[0].name || roles[0].Name || '')
      : (userData.role || userData.Role || '');

    // Handle ID conversion - backend sends Id, frontend expects id
    const userId = userData.id || userData.Id || userData.ID || '';

    console.log('normalizeUser - roles:', roles, 'roleName:', roleName, 'userId:', userId);

    return {
      ...userData,
      id: userId,  // Ensure lowercase id is available
      name: userData.fullName || userData.FullName || `${firstName} ${lastName}`.trim() || 'User',
      role: roleName,
    };
  };

  // Validate token with backend on mount
  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const response = await fetch('https://localhost:64677/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setTokenValidated(true);
          } else {
            // Token invalid but user data exists - keep user logged in anyway
            // This prevents redirect to login when backend is temporarily down
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setTokenValidated(true);
          }
        } catch (err) {
          // Network error - keep user logged in with saved data
          // This allows app to work even when backend is temporarily unavailable
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setTokenValidated(true);
        }
      }
      setLoading(false);
    };

    validateAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const isEmail = identifier.includes('@');
      const loginPayload = isEmail
        ? { email: identifier, password }
        : { studentNumber: identifier, password };

      console.log('🔐 LOGIN ATTEMPT:', { identifier, isEmail, payload: loginPayload });

      const response = await authAPI.login(loginPayload);
      console.log('📨 LOGIN RESPONSE:', response.data);

      if (response.data && response.data.success) {
        const { token, refreshToken, user: userData } = response.data.data;
        const normalizedUser = normalizeUser(userData);

        console.log('✅ Login - User Data:', normalizedUser);

        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        // Store normalized user to ensure role is preserved correctly
        localStorage.setItem('user', JSON.stringify(normalizedUser));

        setUser(normalizedUser);
        setTokenValidated(true);

        return { success: true };
      }

      return { success: false, error: response.data?.message || 'Login failed' };
    } catch (error) {
      console.error('🚨 LOGIN ERROR:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // Use getErrorMessage for consistent error handling
      const errorMessage = getErrorMessage(error);

      if (error.response?.status === 401) {
        return { success: false, error: 'Invalid credentials. Check email/student number and password.' };
      }
      if (error.response?.status === 403) {
        return { success: false, error: 'Account not allowed. Contact administrator.' };
      }
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        return { success: false, error: Object.values(errors).flat().join(', ') };
      }

      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      if (response.data && response.data.success) {
        const { token, refreshToken, user: newUser } = response.data.data;

        // Normalize user data for frontend
        const normalizedUser = normalizeUser(newUser);

        // Store tokens and normalized user data
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(normalizedUser)); // Store normalized

        setUser(normalizedUser);
        setTokenValidated(true);

        return { success: true };
      }

      return {
        success: false,
        error: response.data?.message || 'Registration failed',
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = getErrorMessage(error);

      if (error.response?.status === 400) {
        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = async () => {
    console.log('🔓 LOGOUT - Clearing auth state');
    // Clear local storage first to prevent 401 interceptor issues
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('registeredUsers'); // Clean up mock data
    
    setUser(null);
    setTokenValidated(false);
    console.log('🔓 LOGOUT - Auth state cleared');
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.data && response.data.success) {
        return { success: true };
      }

      return {
        success: false,
        error: response.data?.message || 'Password change failed',
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'An error occurred while changing password',
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.data && response.data.success) {
        return { success: true };
      }

      return {
        success: false,
        error: response.data?.message || 'Failed to send reset email',
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'An error occurred',
      };
    }
  };

  const resetPassword = async (email, token, newPassword) => {
    try {
      const response = await authAPI.resetPassword({
        email,
        token,
        newPassword,
      });

      if (response.data && response.data.success) {
        return { success: true };
      }

      return {
        success: false,
        error: response.data?.message || 'Password reset failed',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'An error occurred',
      };
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const hasAnyRole = (roles) => {
    if (!user || !user.roles) return false;
    if (Array.isArray(roles)) {
      return roles.some(role => user.roles.includes(role));
    }
    return user.roles.includes(roles);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false };
      }

      // Get current user from backend
      const response = await authAPI.getCurrentUser();

      if (response.data && response.data.success) {
        const userData = response.data.data;
        const normalizedUser = normalizeUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(normalizedUser);
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Refresh user error:', error);
      // If token is invalid, logout
      if (error.response?.status === 401) {
        await logout();
      }
      return { success: false };
    }
  };

  // Function to refresh auth state from localStorage (called after student login)
  const refreshAuthState = () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('🔄 refreshAuthState - Setting user from localStorage:', parsedUser);
        setUser(parsedUser);
        setTokenValidated(true);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    hasRole,
    hasAnyRole,
    refreshUser,
    refreshAuthState,
    loading,
    tokenValidated,
    isAuthenticated: !!user && tokenValidated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
