import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
  Search,
  School,
  Email,
} from '@mui/icons-material';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';

const UserList = () => {
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const basePath = '/admin-dashboard';

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll(page, pageSize);
      setUsers(response.data.data?.items || []);
      setTotalCount(response.data.data?.totalCount || 0);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    if (!deleteId) return;
    try {
      await usersAPI.delete(deleteId);
      setUsers(users.filter((u) => u.id !== deleteId));
      setTotalCount(totalCount - 1);
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
    setDeleteId(null);
  };

  const filteredUsers = users.filter((user) =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return { bg: '#FEE2E2', color: '#991B1B' };
      case 'teacher': return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'student': return { bg: '#DCFCE7', color: '#166534' };
      case 'parent': return { bg: '#FCE7F3', color: '#9D174D' };
      default: return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  if (!hasRole('Admin', 'SuperAdmin')) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">You don't have permission to access this page.</Typography>
      </Box>
    );
  }

  const adminCount = users.filter(u => u.roles?.some(r => r.name === 'Admin')).length;
  const teacherCount = users.filter(u => u.roles?.some(r => r.name === 'Teacher')).length;

  return (
    <Box>
      <PageHeader
        title="Users Management"
        subtitle="Manage all system users and their roles"
        actionText="Add User"
        onAction={() => navigate(`${basePath}/users/new`)}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Total Users</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>{totalCount}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6FAF8F' }}>
                  <Person sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Admins</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444' }}>{adminCount}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #EF444415 0%, #EF444408 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                  <School sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Teachers</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>{teacherCount}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #3B82F615 0%, #3B82F608 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                  <School sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAF9',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#6FAF8F' }} />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Person sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                        <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                          No users found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userItem) => {
                    const roleName = userItem.roles?.[0]?.name || 'User';
                    const roleColors = getRoleColor(roleName);
                    
                    return (
                      <TableRow
                        key={userItem.id}
                        sx={{
                          borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                          '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#6FAF8F', fontWeight: 600 }}>
                              {userItem.firstName?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                              {userItem.firstName} {userItem.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#64748B' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email sx={{ fontSize: 16, color: '#6FAF8F' }} />
                            {userItem.email || '-'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={roleName}
                            size="small"
                            sx={{
                              bgcolor: roleColors.bg,
                              color: roleColors.color,
                              fontWeight: 500,
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status="Active" />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`${basePath}/users/${userItem.id}/edit`)}
                              sx={{ color: '#6FAF8F', '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.1)' } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(userItem.id)}
                              sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
      />
    </Box>
  );
};

export default UserList;
