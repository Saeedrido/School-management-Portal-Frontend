import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Person,
} from '@mui/icons-material';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = 10;
  const [totalCount, setTotalCount] = useState(0);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersAPI.delete(id);
      setUsers(users.filter((u) => u.id !== id));
      setTotalCount(totalCount - 1);
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  if (!hasRole('Admin', 'SuperAdmin')) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <Typography color="error">You don't have permission to access this page.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        Loading...
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 2, sm: 3 },
          background: theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.8)'
            : 'linear-gradient(135deg, #E3F2FD 0%, #F1F8E9 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: { xs: 2, sm: 3, md: 4 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Person sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              User Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/dashboard/users/new')}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 2, sm: 2.5 },
            }}
          >
            {window.innerWidth < 600 ? 'Add' : 'Add User'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>Role</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body1" sx={{ color: 'text.secondary', py: 2 }}>
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{user.name}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            bgcolor:
                            user.role === 'Admin'
                              ? '#EF5350'
                              : user.role === 'Teacher'
                              ? '#66BB6A'
                              : '#2196F3',
                            color: 'white',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/dashboard/users/${user.id}/edit`)}
                          size="small"
                        >
                          <Edit fontSize={{ xs: 'small', sm: 'medium' }} />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(user.id)}
                          size="small"
                        >
                          <Delete fontSize={{ xs: 'small', sm: 'medium' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Pagination */}
        {totalCount > pageSize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: { xs: 2, sm: 3 }, gap: { xs: 1, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              variant="outlined"
              size="small"
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Page {page} of {Math.ceil(totalCount / pageSize)}
            </Typography>
            <Button
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage(page + 1)}
              variant="outlined"
              size="small"
            >
              Next
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default UserList;
