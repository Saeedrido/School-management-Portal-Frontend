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
} from '@mui/material';
import {
  Save,
  Person,
  School,
  Link as LinkIcon,
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
    studentId: '',
    relationship: 'Father',
  });

  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYearId, setAcademicYearId] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [classesRes, parentsRes, studentsRes, academicYearRes] = await Promise.all([
        adminAPI.classes.getAll(),
        adminAPI.parents.getAll(1, 100),
        adminAPI.students.getAll(),
        adminAPI.academicYears.getActive(),
      ]);
      
      if (classesRes.data) {
        const classesData = classesRes.data.data?.items || classesRes.data.data || classesRes.data;
        setClasses(Array.isArray(classesData) ? classesData : []);
      }
      if (parentsRes.data) {
        const parentsData = parentsRes.data.data?.items || parentsRes.data.data || parentsRes.data;
        // Transform parents data
        const transformedParents = Array.isArray(parentsData) ? parentsData.map(p => ({
          id: p.id || p.Id,
          firstName: p.parent?.firstName || p.Parent?.firstName || '',
          lastName: p.parent?.lastName || p.Parent?.lastName || '',
        })) : [];
        setParents(transformedParents);
      }
      if (studentsRes.data) {
        const studentsData = studentsRes.data.data?.items || studentsRes.data.data || studentsRes.data;
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      }
      if (parentsRes.data) {
        const parentsData = parentsRes.data.data || parentsRes.data;
        // Transform parents data
        const transformedParents = Array.isArray(parentsData) ? parentsData.map(p => ({
          id: p.id || p.Id,
          firstName: p.parent?.firstName || p.Parent?.firstName || '',
          lastName: p.parent?.lastName || p.Parent?.lastName || '',
        })) : [];
        setParents(transformedParents);
      }
      if (studentsRes.data) {
        // Handle paged response structure
        const studentsData = studentsRes.data.data?.items || studentsRes.data.data || studentsRes.data;
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      }
      if (academicYearRes.data?.data) {
        setAcademicYearId(academicYearRes.data.data.id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
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

  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    setLinkData((prev) => ({ ...prev, [name]: value }));
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
    if (!linkData.studentId) return 'Please select a student';
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
      await adminAPI.parents.linkStudent(
        linkData.parentId,
        linkData.studentId,
        {
          relationship: linkData.relationship,
          isPrimaryContact: true,
        }
      );
      setSuccess('Student linked to parent successfully!');
      setTimeout(() => {
        navigate('/admin-dashboard/parents');
      }, 2000);
    } catch (err) {
      console.error('Error linking student:', err);
      setError(err.response?.data?.message || 'Failed to link student');
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
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1B5E20', mb: 2 }}>
                        Link Existing Student to Existing Parent
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                        Use this to link a student who doesn't have a parent linked yet, or to add additional parent links.
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
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
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Select Student *"
                        name="studentId"
                        value={linkData.studentId}
                        onChange={handleLinkChange}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      >
                        <MenuItem value="">Select Student</MenuItem>
                        {students.map((student) => (
                          <MenuItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} ({student.studentNumber})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
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

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
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
                          disabled={submitting}
                          startIcon={submitting ? <CircularProgress size={20} /> : <LinkIcon />}
                          sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                        >
                          {submitting ? 'Linking...' : 'Link Student to Parent'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
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
