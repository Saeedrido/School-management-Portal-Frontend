import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  FamilyRestroom,
  People,
  Email,
  Phone,
  Link as LinkIcon,
  MoreVert,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge } from '../../components/ui';

const ParentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, parent: null });
  const [linkDialog, setLinkDialog] = useState({ open: false, parent: null });
  const [linkData, setLinkData] = useState({ studentId: '', relationship: 'Father' });
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [parentsRes, studentsRes] = await Promise.all([
          adminAPI.parents.getAll(1, 100),
          adminAPI.students.getAll(),
        ]);
        
        if (parentsRes.data) {
          const parentsData = parentsRes.data.data?.items || parentsRes.data.data || parentsRes.data;
          const transformedParents = Array.isArray(parentsData) ? parentsData.map(p => ({
            id: p.id || p.Id,
            firstName: p.parent?.firstName || p.Parent?.firstName || '',
            lastName: p.parent?.lastName || p.Parent?.lastName || '',
            email: p.parent?.email || p.Parent?.email || '',
            phone: p.parent?.phoneNumber || p.Parent?.phoneNumber || '',
            occupation: p.occupation || '',
            address: p.address || '',
            students: (p.students || p.Students || []).map(s => ({
              id: s.studentProfileId || s.StudentProfileId || s.id,
              name: s.fullName || s.FullName || '',
              relationship: s.relationship || s.Relationship || '',
              class: s.className || s.ClassName || '',
            })),
          })) : [];
          setParents(transformedParents);
        }
        
        if (studentsRes.data) {
          const studentsData = studentsRes.data.data?.items || studentsRes.data.data || studentsRes.data;
          setStudents(Array.isArray(studentsData) ? studentsData : []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteClick = (parent) => {
    setDeleteDialog({ open: true, parent });
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminAPI.parents.delete(deleteDialog.parent.id);
      setParents(parents.filter((p) => p.id !== deleteDialog.parent.id));
      setDeleteDialog({ open: false, parent: null });
    } catch (err) {
      console.error('Error deleting parent:', err);
      setError('Failed to delete parent');
    }
  };

  const handleLinkClick = (parent) => {
    setLinkDialog({ open: true, parent });
    setLinkData({ studentId: '', relationship: 'Father' });
  };

  const handleLinkStudent = async () => {
    if (!linkData.studentId) {
      setError('Please select a student');
      return;
    }
    
    setLinking(true);
    setError('');
    
    try {
      await adminAPI.parents.linkStudent(
        linkDialog.parent.id, 
        linkData.studentId,
        {
          relationship: linkData.relationship,
          isPrimaryContact: true,
        }
      );
      
      const parentsRes = await adminAPI.parents.getAll(1, 100);
      if (parentsRes.data) {
        const parentsData = parentsRes.data.data?.items || parentsRes.data.data || parentsRes.data;
        const transformedParents = Array.isArray(parentsData) ? parentsData.map(p => ({
          id: p.id || p.Id,
          firstName: p.parent?.firstName || p.Parent?.firstName || '',
          lastName: p.parent?.lastName || p.Parent?.lastName || '',
          email: p.parent?.email || p.Parent?.email || '',
          phone: p.parent?.phoneNumber || p.Parent?.phoneNumber || '',
          occupation: p.occupation || '',
          address: p.address || '',
          students: (p.students || p.Students || []).map(s => ({
            id: s.studentProfileId || s.StudentProfileId || s.id,
            name: s.fullName || s.FullName || '',
            relationship: s.relationship || s.Relationship || '',
            class: s.className || s.ClassName || '',
          })),
        })) : [];
        setParents(transformedParents);
      }
      
      setLinkDialog({ open: false, parent: null });
    } catch (err) {
      console.error('Error linking student:', err);
      setError(err.response?.data?.message || 'Failed to link student');
    } finally {
      setLinking(false);
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#6FAF8F', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const getRelationshipColor = (relationship) => {
    switch (relationship) {
      case 'Father':
        return { bgcolor: '#DBEAFE', color: '#1E40AF' };
      case 'Mother':
        return { bgcolor: '#FCE7F3', color: '#9D174D' };
      case 'Guardian':
        return { bgcolor: '#E0E7FF', color: '#4338CA' };
      default:
        return { bgcolor: '#F1F5F9', color: '#475569' };
    }
  };

  const filteredParents = parents.filter((parent) =>
    parent.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="Parents & Guardians"
        subtitle="Manage student parents and guardians, link parents to students"
        actionText={isAdmin ? 'Add Parent' : undefined}
        onAction={isAdmin ? () => navigate('/admin-dashboard/parents/new') : undefined}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>
                    Total Parents
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    {parents.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #FF3E8A15 0%, #FF3E8A08 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF3E8A',
                  }}
                >
                  <FamilyRestroom sx={{ fontSize: 24 }} />
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
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>
                    Linked Students
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    {students.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6FAF8F',
                  }}
                >
                  <People sx={{ fontSize: 24 }} />
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
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>
                    Fathers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    {parents.filter(p => p.students?.some(s => s.relationship === 'Father')).length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #1E40AF15 0%, #1E40AF08 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1E40AF',
                  }}
                >
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
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>
                    Mothers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    {parents.filter(p => p.students?.some(s => s.relationship === 'Mother')).length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    background: 'linear-gradient(135deg, #9D174D15 0%, #9D174D08 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9D174D',
                  }}
                >
                  <Person sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search parents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 250,
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
            {isAdmin && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin-dashboard/parents/new')}
                  sx={{
                    background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                    borderRadius: 2.5,
                    boxShadow: '0 4px 14px rgba(111, 175, 143, 0.3)',
                  }}
                >
                  Add Parent
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon />}
                  onClick={() => navigate('/admin-dashboard/students/add-student-parent')}
                  sx={{
                    borderColor: '#FF3E8A',
                    color: '#FF3E8A',
                    borderRadius: 2.5,
                    '&:hover': {
                      borderColor: '#FF5DA3',
                      background: 'rgba(255, 62, 138, 0.08)',
                    },
                  }}
                >
                  Link Student
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Parents Table */}
      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredParents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Person sx={{ fontSize: 40, color: '#6FAF8F' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#1E293B', fontWeight: 600, mb: 1 }}>
              No Parents Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              {searchTerm ? `No parents match "${searchTerm}"` : 'Get started by adding parents'}
            </Typography>
            {isAdmin && (
              <Button
                variant="contained"
                onClick={() => navigate('/admin-dashboard/parents/new')}
                sx={{
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                  borderRadius: 2.5,
                }}
              >
                Add Parent
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Parent</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Occupation</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Students</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredParents.map((parent) => (
                  <TableRow
                    key={parent.id}
                    sx={{
                      borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                      '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getAvatarColor(parent.firstName) }}>
                          {parent.firstName?.charAt(0) || 'P'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                            {parent.firstName} {parent.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {parent.occupation || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 16, color: '#6FAF8F' }} />
                        {parent.email || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 16, color: '#6FAF8F' }} />
                        {parent.phone || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>
                      {parent.occupation || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {parent.students.length > 0 ? (
                          parent.students.map((student, idx) => (
                            <Chip
                              key={idx}
                              size="small"
                              label={student.name}
                              sx={{
                                bgcolor: getRelationshipColor(student.relationship).bgcolor,
                                color: getRelationshipColor(student.relationship).color,
                                fontWeight: 500,
                                fontSize: '0.7rem',
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            No linked students
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin-dashboard/parents/${parent.id}/edit`)}
                          sx={{ color: '#6FAF8F', '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.1)' } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        {isAdmin && (
                          <IconButton
                            size="small"
                            onClick={() => handleLinkClick(parent)}
                            sx={{ color: '#10B981', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin-dashboard/parents/${parent.id}/students`)}
                          sx={{ color: '#8B5CF6', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}
                        >
                          <People fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(parent)}
                          sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, parent: null })} maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Delete sx={{ color: '#EF4444' }} />
            Delete Parent
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{deleteDialog.parent?.firstName} {deleteDialog.parent?.lastName}</strong>?
            This action cannot be undone. All associated student links will be removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, parent: null })}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Link Student Dialog */}
      <Dialog open={linkDialog.open} onClose={() => setLinkDialog({ open: false, parent: null })} maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinkIcon sx={{ color: '#10B981' }} />
            Link Student to Parent
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Link a student to <strong>{linkDialog.parent?.firstName} {linkDialog.parent?.lastName}</strong>
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Student</InputLabel>
            <Select
              value={linkData.studentId}
              onChange={(e) => setLinkData({ ...linkData, studentId: e.target.value })}
              label="Select Student"
            >
              <MenuItem value="">Choose a student</MenuItem>
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} ({student.studentNumber})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Relationship</InputLabel>
            <Select
              value={linkData.relationship}
              onChange={(e) => setLinkData({ ...linkData, relationship: e.target.value })}
              label="Relationship"
            >
              <MenuItem value="Father">Father</MenuItem>
              <MenuItem value="Mother">Mother</MenuItem>
              <MenuItem value="Guardian">Guardian</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialog({ open: false, parent: null })}>Cancel</Button>
          <Button
            onClick={handleLinkStudent}
            variant="contained"
            disabled={linking || !linkData.studentId}
            startIcon={linking ? <CircularProgress size={20} /> : <LinkIcon />}
            sx={{ background: '#10B981' }}
          >
            {linking ? 'Linking...' : 'Link Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentList;
