import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Add,
  Delete,
  Person,
  School,
  Book,
} from '@mui/icons-material';
import { adminAPI, academicYearsAPI } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const TeacherAssignments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { tokenValidated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Data states
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [activeTerm, setActiveTerm] = useState(null);
  const [existingAssignments, setExistingAssignments] = useState([]);

  // Form states
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Filter available subjects based on selected class's school level
  const availableSubjects = selectedClass
    ? subjects.filter(s => s.schoolLevel === classes.find(c => c.id === selectedClass)?.schoolLevel)
    : [];

  useEffect(() => {
    // Fetch data regardless of token validation status
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch teachers (users with Teacher role)
        const usersResponse = await adminAPI.users.getAll(1, 100);
        if (usersResponse.data?.success && usersResponse.data?.data?.items) {
          const teacherUsers = usersResponse.data.data.items.filter(user =>
            user.roles?.some(role => role.name === 'Teacher')
          );
          setTeachers(teacherUsers);
        }

        // Fetch classes (seeded classes)
        const classesResponse = await adminAPI.classes.getAll();
        if (classesResponse.data?.success && classesResponse.data?.data) {
          setClasses(classesResponse.data.data);
        }

        // Fetch subjects (seeded subjects)
        const subjectsResponse = await adminAPI.subjects.getAll();
        if (subjectsResponse.data?.success && subjectsResponse.data?.data) {
          setSubjects(subjectsResponse.data.data);
        }

        // Fetch active term (may not exist - that's ok)
        try {
          const termResponse = await adminAPI.terms.getActive();
          if (termResponse.data?.success && termResponse.data?.data) {
            const active = termResponse.data.data;
            setActiveTerm(active);
            setSelectedTerm(active.id);
          }
        } catch (termErr) {
          // 404 is ok - just means no active term is set
          console.log('No active term found:', termErr.response?.status);
        }

        // Fetch terms for active academic year
        try {
          const activeYearRes = await academicYearsAPI.getActive();
          const activeYearId = activeYearRes.data?.success && activeYearRes.data?.data?.id 
            ? activeYearRes.data.data.id 
            : null;
          
          if (activeYearId) {
            const termsRes = await adminAPI.terms.getByAcademicYear(activeYearId);
            if (termsRes.data?.success && termsRes.data?.data) {
              setTerms(termsRes.data.data);
              // Auto-select active term
              const activeTerm = termsRes.data.data.find(t => t.isActive);
              if (activeTerm) setSelectedTerm(activeTerm.id);
            }
          } else {
            // Fallback to all terms
            const allTermsResponse = await adminAPI.terms.getAll();
            if (allTermsResponse.data?.success && allTermsResponse.data?.data) {
              setTerms(allTermsResponse.data.data);
            }
          }
        } catch (termErr) {
          // Fallback to all terms
          const allTermsResponse = await adminAPI.terms.getAll();
          if (allTermsResponse.data?.success && allTermsResponse.data?.data) {
            setTerms(allTermsResponse.data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch existing assignments when class is selected
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedClass) {
        setExistingAssignments([]);
        return;
      }

      try {
        const response = await adminAPI.classSubjects.getByClass(selectedClass);
        
        // Handle PagedResponse or List response formats
        let assignments = [];
        if (response.data?.success) {
          if (response.data.data?.items) {
            assignments = response.data.data.items;
          } else if (Array.isArray(response.data.data)) {
            assignments = response.data.data;
          }
        }
        
        setExistingAssignments(assignments);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setExistingAssignments([]);
      }
    };

    fetchAssignments();
  }, [selectedClass]);

  const handleSubmit = async () => {
    if (!selectedTeacher || !selectedClass || !selectedTerm || selectedSubjects.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const teacherId = selectedTeacher === 'none' ? null : selectedTeacher;

      // Create assignments for each selected subject
      const assignments = selectedSubjects.map(subjectId => ({
        classId: selectedClass,
        subjectId: subjectId,
        termId: selectedTerm,
        teacherId: teacherId,
      }));

      // Submit each assignment
      for (const assignment of assignments) {
        await adminAPI.classSubjects.assign(assignment);
      }

      setSuccess(true);

      // Refresh assignments
      const response = await adminAPI.classSubjects.getByClass(selectedClass);
      if (response.data?.success && response.data?.data?.items) {
        setExistingAssignments(response.data.data.items);
      }

      // Clear form
      setSelectedTeacher('');
      setSelectedSubjects([]);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (assignmentId) => {
    setDeleteId(assignmentId);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    if (!deleteId) return;

    try {
      await adminAPI.classSubjects.delete(deleteId);

      // Refresh assignments
      const response = await adminAPI.classSubjects.getByClass(selectedClass);
      if (response.data?.success && response.data?.data?.items) {
        setExistingAssignments(response.data.data.items);
      }
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError('Failed to delete assignment');
    }
    setDeleteId(null);
  };

  const getTeacherName = (teacher) => {
    if (!teacher) return 'Not Assigned';
    return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Unknown';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
        <IconButton onClick={() => navigate('/admin-dashboard')} sx={{ color: 'text.primary' }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Assign Teachers to Classes & Subjects
        </Typography>
      </Box>

      {/* Error/Success Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
          Assignment created successfully!
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Assignment Form */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: { xs: 2, sm: 3 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, sm: 3 } }}>
                <Add sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  New Assignment
                </Typography>
              </Box>

              {/* Select Class */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'text.secondary' }}>Select Class *</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Select Class *"
                  sx={{
                    color: 'text.primary',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                  }}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id} sx={{ color: 'text.primary' }}>
                      {cls.displayName || cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Select Term */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'text.secondary' }}>
                  {selectedTerm ? 'Select Term *' : 'Select Term *'}
                </InputLabel>
                <Select
                  value={selectedTerm || ''}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  label="Select Term *"
                  sx={{
                    color: 'text.primary',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                  }}
                >
                  {terms.map((term) => (
                    <MenuItem key={term.id} value={term.id} sx={{ color: 'text.primary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <span>{term.name}</span>
                        {term.isActive && (
                          <Chip 
                            label="Active" 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ ml: 'auto' }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {activeTerm && (
                  <Typography variant="caption" sx={{ color: 'success.main', mt: 0.5, fontWeight: 500 }}>
                    Active term: {activeTerm.name}
                  </Typography>
                )}
              </FormControl>

              {/* Select Teacher (Optional) */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'text.secondary' }}>Select Teacher (Optional)</InputLabel>
                <Select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  label="Select Teacher (Optional)"
                  sx={{
                    color: 'text.primary',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                  }}
                >
                  <MenuItem value="" sx={{ color: 'text.primary' }}>
                    <em>No teacher selected</em>
                  </MenuItem>
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id} sx={{ color: 'text.primary' }}>
                      {`${teacher.firstName} ${teacher.lastName}`.trim()}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Leave empty to assign subject to class without a teacher
                </Typography>
              </FormControl>

              {/* Select Subjects (Multiple) */}
              <FormControl fullWidth sx={{ mb: 3 }} disabled={!selectedClass}>
                <InputLabel sx={{ color: 'text.secondary' }}>
                  {selectedClass ? 'Select Subject(s) *' : 'Select class first'}
                </InputLabel>
                <Select
                  multiple
                  value={selectedSubjects}
                  onChange={(e) => setSelectedSubjects(e.target.value)}
                  label={selectedClass ? 'Select Subject(s) *' : 'Select class first'}
                  MenuProps={MenuProps}
                  renderValue={(selected) => selected.map(id => subjects.find(s => s.id === id)?.name).join(', ')}
                  sx={{
                    color: 'text.primary',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                  }}
                >
                  {availableSubjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id} sx={{ color: 'text.primary' }}>
                      <Checkbox checked={selectedSubjects.indexOf(subject.id) > -1} />
                      <ListItemText primary={`${subject.name} (${subject.code})`} />
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Only subjects matching the class's school level are shown
                </Typography>
              </FormControl>

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={submitting || !selectedClass || !selectedTerm || selectedSubjects.length === 0}
                sx={{
                  background: 'primary.main',
                  '&:hover': { background: 'primary.dark' },
                  '&:disabled': {
                    background: 'action.disabledBackground',
                    color: 'text.disabled',
                  },
                  py: { xs: 1, sm: 1.5 },
                  fontWeight: 600,
                  borderRadius: { xs: 1.5, sm: 2 },
                }}
              >
                {submitting ? 'Creating...' : 'Create Assignment(s)'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Existing Assignments */}
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'rgba(30, 30, 30, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: { xs: 2, sm: 3 },
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, sm: 3 } }}>
                <Book sx={{ color: 'warning.main' }} />
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  {selectedClass
                    ? `Assignments for ${classes.find(c => c.id === selectedClass)?.displayName || 'Selected Class'}`
                    : 'Select a class to view assignments'}
                </Typography>
              </Box>

              {!selectedClass ? (
                <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
                  <School sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Select a class from the form to view existing assignments
                  </Typography>
                </Box>
              ) : existingAssignments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
                  <Book sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    No assignments found for this class
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Subject</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Teacher</TableCell>
                        <TableCell sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Term</TableCell>
                        <TableCell align="right" sx={{ color: 'text.primary', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {existingAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                              <Chip
                                label={assignment.subject?.code || 'N/A'}
                                size="small"
                                sx={{
                                  background: 'primary.main',
                                  color: 'white',
                                  fontWeight: 600,
                                  opacity: 0.2,
                                }}
                              />
                              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                {assignment.subject?.name || 'Unknown Subject'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                            {assignment.teacher ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" sx={{ color: 'text.primary', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                  {getTeacherName(assignment.teacher)}
                                </Typography>
                              </Box>
                            ) : (
                              <Chip
                                label="Not Assigned"
                                size="small"
                                sx={{
                                  background: 'action.disabledBackground',
                                  color: 'text.disabled',
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Chip
                              label={assignment.term?.name || 'N/A'}
                              size="small"
                              sx={{
                                background: assignment.term?.isActive ? 'success.main' : 'action.disabledBackground',
                                color: assignment.term?.isActive ? 'white' : 'text.disabled',
                                opacity: assignment.term?.isActive ? 0.8 : 1,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(assignment.id)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        confirmText="Delete"
      />
    </Box>
  );
};

export default TeacherAssignments;
