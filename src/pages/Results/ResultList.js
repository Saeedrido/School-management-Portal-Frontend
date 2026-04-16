import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Assessment,
  School,
  Search,
  Visibility,
  TrendingUp,
  Publish,
  Info,
} from '@mui/icons-material';
import { adminAPI, teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge } from '../../components/ui';

const ResultList = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const basePath = hasRole('Admin') ? '/admin-dashboard' : '/teacher-dashboard';
  
  const isAdmin = hasRole('Admin');
  const isTeacher = hasRole('Teacher');
  const canManageResults = isAdmin || isTeacher;

  const resultsAPI = isTeacher ? teacherAPI : adminAPI;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      const termsResponse = await resultsAPI.terms.getAll();
      if (termsResponse.data?.success) {
        setTerms(termsResponse.data.data || []);
        const activeTerm = termsResponse.data.data?.find(t => t.isActive);
        if (activeTerm) {
          setSelectedTerm(activeTerm.id);
        }
      }

      if (isAdmin) {
        const classesResponse = await resultsAPI.classes.getAll();
        if (classesResponse.data?.success) {
          setClasses(classesResponse.data.data || []);
        }
      } else if (isTeacher) {
        const assignmentsResponse = await resultsAPI.classSubjects.getMyAssignments();
        if (assignmentsResponse.data?.success) {
          const assignments = assignmentsResponse.data.data?.items || [];
          const uniqueClasses = [];
          const seenClassIds = new Set();
          assignments.forEach(a => {
            if (a.class && !seenClassIds.has(a.classId)) {
              seenClassIds.add(a.classId);
              uniqueClasses.push(a.class);
            }
          });
          setClasses(uniqueClasses);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      fetchStudents();
    }
  }, [selectedClass, selectedTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const selectedTermData = terms.find(t => t.id === selectedTerm);
      const academicYearId = selectedTermData?.academicYearId;
      const response = await resultsAPI.students.getByClassPaged(selectedClass, 1, 100, academicYearId);
      if (response.data?.success) {
        setStudents(response.data.data?.items || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    searchQuery === '' ||
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTermData = terms.find(t => t.id === selectedTerm);
  const termType = selectedTermData?.termType?.toString() || selectedTermData?.termType || '';
  const isThirdTerm = termType === 'Third';
  const canPublish = selectedClass && selectedTerm && !isThirdTerm && canManageResults;

  const handlePublishResults = async () => {
    if (!selectedClass || !selectedTerm) return;
    
    setPublishing(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await resultsAPI.results.publish({
        termId: selectedTerm,
        classId: selectedClass,
      });
      
      if (response.data?.success) {
        setSuccess(response.data.message || 'Results published successfully');
        setPublishDialogOpen(false);
      } else {
        setError(response.data?.message || 'Failed to publish results');
      }
    } catch (err) {
      console.error('Error publishing results:', err);
      setError('Failed to publish results. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const handleOpenPublishDialog = () => {
    setError('');
    setSuccess('');
    setPublishDialogOpen(true);
  };

  return (
    <Box>
      <PageHeader
        title="Results"
        subtitle="View and manage student results"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Total Students</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>{students.length}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6FAF8F' }}>
                  <School sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Select Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value=""><em>Select a class</em></MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.displayName || cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Term</InputLabel>
                <Select
                  value={selectedTerm}
                  label="Select Term"
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value=""><em>Select a term</em></MenuItem>
                  {terms.map((term) => (
                    <MenuItem key={term.id} value={term.id}>
                      {term.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, backgroundColor: '#F8FAF9' } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search sx={{ color: '#6FAF8F' }} /></InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
          
          {canPublish && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Publish />}
                onClick={handleOpenPublishDialog}
                sx={{
                  bgcolor: '#2E7D32',
                  '&:hover': { bgcolor: '#1B5E20' },
                  borderRadius: 2,
                }}
              >
                Publish Results
              </Button>
            </Box>
          )}
          
          {isThirdTerm && selectedClass && selectedTerm && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Alert 
                icon={<Info />} 
                severity="info"
                sx={{ borderRadius: 2, bgcolor: '#E3F2FD' }}
              >
                To publish Third Term results, go to the Promotions page
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !selectedClass || !selectedTerm ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Assessment sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
              Select a class and term to view results
            </Typography>
          </Box>
        ) : filteredStudents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <School sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
              No students found in this class
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Student ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    sx={{
                      borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                      '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#6FAF8F' }}>
                          {student.firstName?.charAt(0) || 'S'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                          {student.firstName} {student.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>{student.studentNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <StatusBadge status="Active" />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`${basePath}/results/student/${student.id}?termId=${selectedTerm}`)}
                        sx={{ borderRadius: 2 }}
                      >
                        View Results
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Publish Confirmation Dialog */}
      <Dialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1B5E20' }}>
          Publish Results
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to publish results for this class and term?
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            This will make the results visible to parents and students. Once published, you cannot unpublish.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setPublishDialogOpen(false)} sx={{ color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            onClick={handlePublishResults}
            variant="contained"
            disabled={publishing}
            startIcon={publishing ? <CircularProgress size={18} /> : <Publish />}
            sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResultList;
