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
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Person,
  School,
  PersonAdd,
  Link as LinkIcon,
  Add,
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAF9' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 0: Add Student + Parent */}
            {activeTab === 0 && (
              <Card sx={{ background: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {/* Student Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#FF3E8A', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School /> Student Information
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name *"
                        name="firstName"
                        value={studentData.firstName}
                        onChange={handleStudentChange}
                        fullWidth
                        required
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
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone Number"
                        name="phoneNumber"
                        value={studentData.phoneNumber}
                        onChange={handleStudentChange}
                        fullWidth
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
                      >
                        <MenuItem value="">Select Class</MenuItem>
                        {classes.map((cls) => (
                          <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Parent Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#FF3E8A', mb: 2, mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person /> Parent/Guardian Information
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name *"
                        name="firstName"
                        value={parentData.firstName}
                        onChange={handleParentChange}
                        fullWidth
                        required
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
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone Number *"
                        name="phoneNumber"
                        value={parentData.phoneNumber}
                        onChange={handleParentChange}
                        fullWidth
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Alternative Phone"
                        name="alternativePhone"
                        value={parentData.alternativePhone}
                        onChange={handleParentChange}
                        fullWidth
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
                      />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate('/admin-dashboard')}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSubmitStudentParent}
                          disabled={submitting}
                          startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                          sx={{
                            background: '#FF3E8A',
                            '&:hover': { background: '#FF5DA3' },
                          }}
                        >
                          {submitting ? 'Saving...' : 'Create Student & Parent'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Tab 1: Link Student to Parent */}
            {activeTab === 1 && (
              <Card sx={{ background: 'rgba(17, 17, 17, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#FF3E8A', mb: 2 }}>
                        Link Existing Student to Existing Parent
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
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
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSubmitLink}
                          disabled={submitting}
                          startIcon={submitting ? <CircularProgress size={20} /> : <LinkIcon />}
                          sx={{
                            background: '#FF3E8A',
                            '&:hover': { background: '#FF5DA3' },
                          }}
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
