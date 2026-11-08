import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Person,
  School,
  Link as LinkIcon,
  Close,
  People,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';

const AddStudentParent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [studentData, setStudentData] = useState({
    studentNumber: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    classId: '',
  });
  
  const [parentData, setParentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    alternativePhone: '',
    gender: '',
    address: '',
    occupation: '',
    relationship: 'Father',
  });

  const [linkData, setLinkData] = useState({
    parentId: '',
    selectedClassId: '',
    selectedStudentIds: [],
    relationship: 'Father',
  });

  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [academicYearId, setAcademicYearId] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [classesRes, parentsRes, academicYearRes] = await Promise.all([
        adminAPI.classes.getAll(),
        adminAPI.parents.getAll(1, 200),
        adminAPI.academicYears.getActive(),
      ]);

      if (classesRes.data) {
        const classesData = classesRes.data.data?.items || classesRes.data.data || classesRes.data;
        setClasses(Array.isArray(classesData) ? classesData : []);
      }
      if (parentsRes.data) {
        const parentsData = parentsRes.data.data?.items || parentsRes.data.data || parentsRes.data;
        const transformedParents = Array.isArray(parentsData) ? parentsData.map(p => ({
          id: p.id || p.Id,
          firstName: p.parent?.firstName || p.Parent?.firstName || '',
          lastName: p.parent?.lastName || p.Parent?.lastName || '',
          email: p.parent?.email || p.Parent?.email || '',
          phoneNumber: p.parent?.phoneNumber || p.Parent?.phoneNumber || '',
        })) : [];
        setParents(transformedParents);
      }
      if (academicYearRes.data?.data) {
        setAcademicYearId(academicYearRes.data.data.id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load classes or parents');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setParentData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchStudentsByClass = async (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }
    setStudentsLoading(true);
    try {
      const response = await adminAPI.students.getByClassPaged(classId, 1, 200, academicYearId || null);
      const studentsData = response.data?.data?.items || response.data?.data || [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (err) {
      console.error('Error fetching students by class:', err);
      setStudents([]);
      setError('Failed to load students for the selected class');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleLinkClassChange = (e) => {
    const classId = e.target.value;
    setLinkData((prev) => ({ ...prev, selectedClassId: classId }));
    fetchStudentsByClass(classId);
  };

  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    setLinkData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleLinkStudent = (student) => {
    const studentId = student.id;
    const isSelected = linkData.selectedStudentIds.includes(studentId);
    const className =
      student.className ||
      student.class?.name ||
      classes.find((c) => c.id === linkData.selectedClassId)?.name ||
      '';

    setLinkData((prev) => ({
      ...prev,
      selectedStudentIds: isSelected
        ? prev.selectedStudentIds.filter((id) => id !== studentId)
        : [...prev.selectedStudentIds, studentId],
    }));

    setSelectedStudentDetails((prev) => {
      if (isSelected) {
        return prev.filter((s) => s.id !== studentId);
      }
      if (prev.some((s) => s.id === studentId)) {
        return prev;
      }
      return [
        ...prev,
        {
          id: studentId,
          name:
            `${student.firstName || student.user?.firstName || ''} ${student.lastName || student.user?.lastName || ''}`.trim() ||
            student.fullName ||
            'Student',
          studentNumber: student.studentNumber || '',
          className,
        },
      ];
    });
  };

  const removeLinkStudent = (studentId) => {
    setLinkData((prev) => ({
      ...prev,
      selectedStudentIds: prev.selectedStudentIds.filter((id) => id !== studentId),
    }));
    setSelectedStudentDetails((prev) => prev.filter((s) => s.id !== studentId));
  };

  const validateStudentParent = () => {
    if (!studentData.firstName.trim()) return 'Student first name is required';
    if (!studentData.lastName.trim()) return 'Student last name is required';
    if (!studentData.dateOfBirth) return 'Student date of birth is required';
    if (!parentData.firstName.trim()) return 'Parent first name is required';
    if (!parentData.lastName.trim()) return 'Parent last name is required';
    if (studentData.email && parentData.email && studentData.email === parentData.email) {
      return 'Cannot use the same email for both student and parent. Each user must have a unique email address.';
    }
    return null;
  };

  const validateLink = () => {
    if (!linkData.parentId) return 'Please select a parent';
    if (linkData.selectedStudentIds.length === 0) return 'Please select at least one student';
    return null;
  };

  const handleSubmitStudentParent = async () => {
    const error = validateStudentParent();
    if (error) {
      setError(error);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        student: {
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.email || null,  // For sending login credentials
          gender: studentData.gender,
          phoneNumber: studentData.phoneNumber,
          dateOfBirth: studentData.dateOfBirth,
          address: studentData.address || '',
          classId: studentData.classId ? studentData.classId : null,
          academicYearId: academicYearId || undefined,
        },
        parents: [
          {
            firstName: parentData.firstName,
            lastName: parentData.lastName,
            email: parentData.email,
            phoneNumber: parentData.phoneNumber,
            address: parentData.address,
            occupation: parentData.occupation,
            relationship: parentData.relationship,
            isPrimaryContact: true,
            canAccessResults: true,
          }
        ],
      };

      await adminAPI.students.registerWithParents(payload);
      setSuccess('Student and Parent created and linked successfully!');
      setTimeout(() => {
        navigate('/admin-dashboard/parents');
      }, 2000);
    } catch (err) {
      console.error('Error creating student and parent:', err);
      setError(err.response?.data?.message || 'Failed to create student and parent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitLink = async () => {
    const error = validateLink();
    if (error) {
      setError(error);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const results = await Promise.allSettled(
        linkData.selectedStudentIds.map((studentId) =>
          adminAPI.parents.linkStudent(
            linkData.parentId,
            studentId,
            {
              relationship: linkData.relationship,
              isPrimaryContact: true,
            }
          )
        )
      );

      const failed = results.filter((r) => r.status === 'rejected');
      const succeeded = results.length - failed.length;

      if (failed.length === 0) {
        setSuccess(`${succeeded} student${succeeded === 1 ? '' : 's'} linked to parent successfully!`);
        setLinkData((prev) => ({ ...prev, selectedStudentIds: [] }));
        setSelectedStudentDetails([]);
        setTimeout(() => {
          navigate('/admin-dashboard/parents');
        }, 2000);
      } else {
        setLinkData((prev) => ({ ...prev, selectedStudentIds: [] }));
        setSelectedStudentDetails([]);
        setError(
          `${failed.length} student${failed.length === 1 ? '' : 's'} failed to link${succeeded > 0 ? `, ${succeeded} linked successfully` : ''}.`
        );
      }
    } catch (err) {
      console.error('Error linking students:', err);
      setError(err.response?.data?.message || 'Failed to link students');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F5F7FA 0%, #E8F5E9 100%)', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <PageHeader
          title="Add Student & Parent"
          subtitle="Enroll a new student and create or link a parent account"
          breadcrumbs={[
            { label: 'Dashboard', href: '/admin-dashboard' },
            { label: 'Students', href: '/admin-dashboard/students' },
            { label: 'Add Student + Parent' },
          ]}
        />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)} 
          sx={{ 
            mb: 3,
            '& .MuiTab-root': { 
              fontWeight: 600,
              color: '#64748B',
              '&.Mui-selected': { color: '#2E7D32' }
            },
            '& .MuiTabs-indicator': { bgcolor: '#2E7D32' }
          }}
        >
          <Tab label="Add New Student & Parent" />
          <Tab label="Link Existing Student to Parent" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 0: Add Student + Parent */}
            {activeTab === 0 && (
              <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Student Information Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#1B5E20',
                        fontWeight: 600,
                        mb: 2,
                        pb: 1,
                        borderBottom: '1px solid rgba(111, 175, 143, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <School /> Student Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name *"
                          name="firstName"
                          value={studentData.firstName}
                          onChange={handleStudentChange}
                          fullWidth
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Name *"
                          name="lastName"
                          value={studentData.lastName}
                          onChange={handleStudentChange}
                          fullWidth
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Student Number"
                          name="studentNumber"
                          value={studentData.studentNumber}
                          onChange={handleStudentChange}
                          fullWidth
                          placeholder="Auto-generated if empty"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Gender *"
                          name="gender"
                          value={studentData.gender}
                          onChange={handleStudentChange}
                          fullWidth
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Date of Birth *"
                          name="dateOfBirth"
                          type="date"
                          value={studentData.dateOfBirth}
                          onChange={handleStudentChange}
                          fullWidth
                          required
                          InputLabelProps={{ shrink: true }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email"
                          name="email"
                          type="email"
                          value={studentData.email}
                          onChange={handleStudentChange}
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <Typography variant="caption" sx={{ color: '#DC2626', mt: 0.5, display: 'block', lineHeight: 1.4 }}>
                          This email must be a working email that you can access — system notifications and login credentials will be sent here.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number"
                          name="phoneNumber"
                          value={studentData.phoneNumber}
                          onChange={handleStudentChange}
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Class"
                          name="classId"
                          value={studentData.classId}
                          onChange={handleStudentChange}
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        >
                          <MenuItem value="">Select Class</MenuItem>
                          {classes.map((cls) => (
                            <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Parent/Guardian Information Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#1B5E20',
                        fontWeight: 600,
                        mb: 2,
                        pb: 1,
                        borderBottom: '1px solid rgba(111, 175, 143, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Person /> Parent/Guardian Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name *"
                          name="firstName"
                          value={parentData.firstName}
                          onChange={handleParentChange}
                          fullWidth
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Name *"
                          name="lastName"
                          value={parentData.lastName}
                          onChange={handleParentChange}
                          fullWidth
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email"
                          name="email"
                          type="email"
                          value={parentData.email}
                          onChange={handleParentChange}
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <Typography variant="caption" sx={{ color: '#DC2626', mt: 0.5, display: 'block', lineHeight: 1.4 }}>
                          This email must be a working email that you can access — system notifications and login credentials will be sent here.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number *"
                          name="phoneNumber"
                          value={parentData.phoneNumber}
                          onChange={handleParentChange}
                          fullWidth
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Alternative Phone"
                          name="alternativePhone"
                          value={parentData.alternativePhone}
                          onChange={handleParentChange}
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Relationship"
                          name="relationship"
                          value={parentData.relationship}
                          onChange={handleParentChange}
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        >
                          <MenuItem value="Father">Father</MenuItem>
                          <MenuItem value="Mother">Mother</MenuItem>
                          <MenuItem value="Guardian">Guardian</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Occupation"
                          name="occupation"
                          value={parentData.occupation}
                          onChange={handleParentChange}
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Address"
                          name="address"
                          value={parentData.address}
                          onChange={handleParentChange}
                          fullWidth
                          multiline
                          rows={2}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/admin-dashboard')}
                      disabled={submitting}
                      sx={{ borderColor: '#64748B', color: '#64748B', borderRadius: 2, px: 4, py: 1.5 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitStudentParent}
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <Save />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #6FAF8F 0%, #4A9079 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #5A9E7F 0%, #3A8069 100%)' },
                        '&:disabled': { background: '#94a3b8' },
                      }}
                    >
                      {submitting ? 'Saving...' : 'Create Student & Parent'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Tab 1: Link Student to Parent */}
            {activeTab === 1 && (
              <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1B5E20', mb: 2 }}>
                    Link Existing Student(s) to Existing Parent
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                    Select a parent, then choose one or more children. Switch classes to add children from
                    other classes — every selected child is linked to the parent when you submit.
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        label="Select Parent *"
                        name="parentId"
                        value={linkData.parentId}
                        onChange={handleLinkChange}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      >
                        <MenuItem value="">Select Parent</MenuItem>
                        {parents.map((parent) => (
                          <MenuItem key={parent.id} value={parent.id}>
                            {parent.firstName} {parent.lastName}
                            {parent.email ? ` (${parent.email})` : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        label="Relationship"
                        name="relationship"
                        value={linkData.relationship}
                        onChange={handleLinkChange}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      >
                        <MenuItem value="Father">Father</MenuItem>
                        <MenuItem value="Mother">Mother</MenuItem>
                        <MenuItem value="Guardian">Guardian</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        label="Select Class *"
                        value={linkData.selectedClassId}
                        onChange={handleLinkClassChange}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      >
                        <MenuItem value="">Select a class</MenuItem>
                        {classes.map((cls) => (
                          <MenuItem key={cls.id} value={cls.id}>
                            {cls.displayName || cls.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        {/* Class students */}
                        <Grid item xs={12} md={7}>
                          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 2,
                                py: 1.25,
                                bgcolor: '#F8FAF9',
                                borderBottom: '1px solid #E2E8F0',
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                Students in selected class
                              </Typography>
                              {linkData.selectedClassId && (
                                <Chip
                                  size="small"
                                  label={`${students.length} found`}
                                  sx={{
                                    height: 22,
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    bgcolor: '#E8F5E9',
                                    color: '#2E7D32',
                                  }}
                                />
                              )}
                            </Box>
                            <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
                              {!linkData.selectedClassId ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                  <School sx={{ fontSize: 28, color: '#CBD5E1', mb: 1 }} />
                                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                                    Select a class to see its students
                                  </Typography>
                                </Box>
                              ) : studentsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                  <CircularProgress size={24} />
                                </Box>
                              ) : students.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                                    No students found in this class
                                  </Typography>
                                </Box>
                              ) : (
                                <List disablePadding>
                                  {students.map((student) => {
                                    const isSelected = linkData.selectedStudentIds.includes(student.id);
                                    const studentName =
                                      `${student.firstName || student.user?.firstName || ''} ${student.lastName || student.user?.lastName || ''}`.trim() ||
                                      student.fullName ||
                                      'Student';
                                    const studentNumber = student.studentNumber || '';

                                    return (
                                      <ListItem
                                        key={student.id}
                                        button
                                        onClick={() => toggleLinkStudent(student)}
                                        sx={{
                                          py: 0.75,
                                          borderBottom: '1px solid #F1F5F9',
                                          bgcolor: isSelected ? 'rgba(46, 125, 50, 0.07)' : 'transparent',
                                          '&:hover': {
                                            bgcolor: isSelected
                                              ? 'rgba(46, 125, 50, 0.11)'
                                              : 'rgba(0, 0, 0, 0.03)',
                                          },
                                        }}
                                      >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                          <Checkbox checked={isSelected} color="success" size="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                          primary={studentName}
                                          secondary={studentNumber}
                                          primaryTypographyProps={{ fontWeight: 500, color: '#1E293B', fontSize: '0.875rem' }}
                                          secondaryTypographyProps={{ fontSize: '0.72rem' }}
                                        />
                                      </ListItem>
                                    );
                                  })}
                                </List>
                              )}
                            </Box>
                          </Paper>
                        </Grid>

                        {/* Selected children */}
                        <Grid item xs={12} md={5}>
                          <Paper
                            variant="outlined"
                            sx={{
                              borderRadius: 2,
                              overflow: 'hidden',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 2,
                                py: 1.25,
                                bgcolor: selectedStudentDetails.length > 0 ? 'rgba(46, 125, 50, 0.06)' : '#F8FAF9',
                                borderBottom: '1px solid #E2E8F0',
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                Selected children
                              </Typography>
                              <Chip
                                size="small"
                                label={selectedStudentDetails.length}
                                color={selectedStudentDetails.length > 0 ? 'success' : 'default'}
                                sx={{ height: 22, minWidth: 30, fontWeight: 600 }}
                              />
                            </Box>
                            <Box sx={{ p: 1.25, maxHeight: 260, overflowY: 'auto', flexGrow: 1 }}>
                              {selectedStudentDetails.length === 0 ? (
                                <Box
                                  sx={{
                                    minHeight: 150,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    px: 2,
                                  }}
                                >
                                  <People sx={{ fontSize: 30, color: '#CBD5E1', mb: 1 }} />
                                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                                    No children selected yet
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#CBD5E1' }}>
                                    Select students from any class — they'll appear here.
                                  </Typography>
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {selectedStudentDetails.map((student) => (
                                    <Box
                                      key={student.id}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        px: 1.25,
                                        py: 1,
                                        borderRadius: 1.5,
                                        bgcolor: 'rgba(46, 125, 50, 0.05)',
                                        border: '1px solid rgba(46, 125, 50, 0.12)',
                                      }}
                                    >
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#1E293B' }}>
                                          {student.name}
                                        </Typography>
                                        <Typography variant="caption" noWrap sx={{ color: '#64748B', display: 'block' }}>
                                          {[student.className, student.studentNumber].filter(Boolean).join(' • ') || 'No class'}
                                        </Typography>
                                      </Box>
                                      <Tooltip title="Remove">
                                        <IconButton
                                          size="small"
                                          onClick={() => removeLinkStudent(student.id)}
                                          sx={{
                                            color: '#94A3B8',
                                            '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.08)' },
                                          }}
                                        >
                                          <Close fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/admin-dashboard')}
                      sx={{ borderColor: '#64748B', color: '#64748B' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitLink}
                      disabled={submitting || linkData.selectedStudentIds.length === 0}
                      startIcon={submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <LinkIcon />}
                      sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                    >
                      {submitting
                        ? 'Linking...'
                        : `Link${linkData.selectedStudentIds.length > 0 ? ` (${linkData.selectedStudentIds.length})` : ''} Student(s) to Parent`}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AddStudentParent;
