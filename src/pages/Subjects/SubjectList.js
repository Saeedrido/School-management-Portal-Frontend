import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Book,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { PageHeader, StatusBadge } from '../../components/ui';

const SCHOOL_LEVELS = {
  0: 'Primary',
  1: 'Junior Secondary',
  2: 'Senior Secondary',
};

const SubjectList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const basePath = user?.role === 'Admin' ? '/admin-dashboard' : '/teacher-dashboard';

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.subjects.getAll();
        if (response.data?.success && response.data?.data) {
          setSubjects(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter((subject) =>
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      await adminAPI.subjects.delete(subjectId);
      setSubjects(subjects.filter((s) => s.id !== subjectId));
    } catch (err) {
      console.error('Error deleting subject:', err);
      setError('Failed to delete subject');
    }
  };

  const getSubjectColor = (name) => {
    const colors = ['#6FAF8F', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#10B981'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const primaryCount = subjects.filter(s => s.schoolLevel === 0).length;
  const juniorCount = subjects.filter(s => s.schoolLevel === 1).length;
  const seniorCount = subjects.filter(s => s.schoolLevel === 2).length;

  if (loading) {
    return (
      <Box>
        <PageHeader title="Subjects" subtitle="Manage subjects" />
        <Card sx={{ borderRadius: 3, p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Subjects"
        subtitle="Manage all subjects and curricula"
        actionText="Add Subject"
        onAction={() => navigate(`${basePath}/subjects/new`)}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Primary</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>{primaryCount}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #10B98115 0%, #10B98108 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <Book sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Junior Secondary</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6' }}>{juniorCount}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #3B82F615 0%, #3B82F608 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                  <Book sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Senior Secondary</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>{seniorCount}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #F59E0B15 0%, #F59E0B08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                  <Book sx={{ fontSize: 24 }} />
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
            placeholder="Search subjects..."
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Level</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Book sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                        No subjects found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((subject) => (
                  <TableRow
                    key={subject.id}
                    sx={{
                      borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                      '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getSubjectColor(subject.name), fontWeight: 600 }}>
                          {subject.name?.charAt(0).toUpperCase() || 'S'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                          {subject.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>
                      {subject.code || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={SCHOOL_LEVELS[subject.schoolLevel] || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor: subject.schoolLevel === 0 ? '#DCFCE7' : subject.schoolLevel === 1 ? '#DBEAFE' : '#FEF3C7',
                          color: subject.schoolLevel === 0 ? '#166534' : subject.schoolLevel === 1 ? '#1E40AF' : '#92400E',
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
                          onClick={() => navigate(`${basePath}/subjects/${subject.id}/edit`)}
                          sx={{ color: '#6FAF8F', '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.1)' } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(subject.id)}
                          sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default SubjectList;
