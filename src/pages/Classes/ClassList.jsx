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
  Class as ClassIcon,
  People,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, teacherAPI } from '../../services/api';
import { PageHeader, StatusBadge } from '../../components/ui';

const ClassList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const basePath = user?.role === 'Admin' ? '/admin-dashboard' : '/teacher-dashboard';

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        if (user?.role === 'Teacher') {
          const response = await teacherAPI.myAssignments.getAll(1, 100);
          if (response.data?.success && response.data?.data?.items) {
            const assignments = response.data.data.items;
            const uniqueClasses = [];
            const seenClassIds = new Set();

            assignments.forEach(assignment => {
              if (assignment.class && !seenClassIds.has(assignment.classId)) {
                seenClassIds.add(assignment.classId);
                uniqueClasses.push({
                  id: assignment.classId,
                  name: assignment.class.name || 'Class',
                  displayName: assignment.class.displayName,
                  schoolLevel: assignment.class.schoolLevel,
                  classOrder: assignment.class.classOrder,
                  subjects: assignments
                    .filter(a => a.classId === assignment.classId)
                    .map(a => a.subject?.name)
                    .filter(Boolean)
                    .join(', '),
                });
              }
            });
            setClasses(uniqueClasses);
          }
        } else {
          const response = await adminAPI.classes.getAll();
          if (response.data?.success && response.data?.data) {
            setClasses(response.data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role) {
      fetchClasses();
    }
  }, [user?.role]);

  const filteredClasses = classes.filter((classItem) =>
    classItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClassColor = (name) => {
    const colors = ['#6FAF8F', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#10B981'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Classes" subtitle="Manage your classes" />
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
        title={user?.role === 'Teacher' ? 'My Classes' : 'Classes Management'}
        subtitle={user?.role === 'Teacher' ? 'View your assigned classes and students' : 'Manage all classes and sections'}
        actionText={user?.role !== 'Teacher' ? 'Add Class' : undefined}
        onAction={user?.role !== 'Teacher' ? () => navigate(`${basePath}/classes/new`) : undefined}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Total Classes</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>{classes.length}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6FAF8F' }}>
                  <ClassIcon sx={{ fontSize: 24 }} />
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
            placeholder="Search classes..."
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
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>{user?.role === 'Teacher' ? 'Subjects' : 'Section'}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Level</TableCell>
                {user?.role !== 'Teacher' && (
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Status</TableCell>
                )}
                <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === 'Teacher' ? 4 : 5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ClassIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                        No classes found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((classItem) => (
                  <TableRow
                    key={classItem.id}
                    sx={{
                      borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                      '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getClassColor(classItem.name), fontWeight: 600 }}>
                          {classItem.name?.charAt(0).toUpperCase() || 'C'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                            {classItem.displayName || classItem.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {classItem.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>
                      {user?.role === 'Teacher' ? classItem.subjects || 'N/A' : classItem.section || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>
                      <Chip
                        label={classItem.schoolLevel || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor: '#F1F5F9',
                          color: '#475569',
                          fontWeight: 500,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    {user?.role !== 'Teacher' && (
                      <TableCell>
                        <StatusBadge status="Active" />
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        {user?.role !== 'Teacher' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`${basePath}/classes/${classItem.id}/edit`)}
                              sx={{ color: '#6FAF8F', '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.1)' } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`${basePath}/classes/${classItem.id}/students`)}
                              sx={{ color: '#8B5CF6', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}
                            >
                              <People fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        {user?.role === 'Teacher' && (
                          <IconButton
                            size="small"
                            onClick={() => navigate(`${basePath}/classes/${classItem.id}/students`)}
                            sx={{ color: '#6FAF8F', '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.1)' } }}
                          >
                            <People fontSize="small" />
                          </IconButton>
                        )}
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

export default ClassList;
