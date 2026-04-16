import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { PageHeader } from '../../components/ui';
import {
  Person as PersonIcon,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { adminAPI, teacherAPI, academicYearsAPI, studentsAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  mapStudentFormToRegisterDto,
  mapStudentFormToRegisterStudentDto,
  mapStudentFormToProfileDto,
  mapStudentFormToEnrollDto,
  validateStudentForm,
  generateStudentNumber,
  generateAdmissionNumber,
  GENDER_ENUM,
} from '../../utils/dataMapping';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);

  const [formData, setFormData] = useState({
    // User Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',

    // Student Profile Information
    dateOfBirth: '',
    // store numeric enum value (1 or 2); empty string means unselected
    gender: '',
    admissionDate: new Date().toISOString().split('T')[0],

    // Address Information
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',

    // Medical Information
    bloodGroup: '',
    genotype: '',
    allergies: '',
    medicalConditions: '',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: 'Parent',

    // Other Information
    previousSchool: '',

    // Class Enrollment
    classId: '',
    academicYearId: '',
    termId: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [emailExists, setEmailExists] = useState(false);

  useEffect(() => {
    // if a non-admin tries to access the "new" form, redirect back
    if (!isEdit && user?.role === 'Teacher') {
      // teachers are not allowed to create students
      navigate('/teacher-dashboard/students');
      return;
    }

    fetchClasses();
    fetchAcademicYears();
    fetchTerms();
    if (isEdit && id) {
      fetchStudentData(id);
    }
  }, [id, isEdit, user?.role, navigate]);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);

      // If teacher, fetch only their assigned classes
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
              });
            }
          });
          setClasses(uniqueClasses);
        }
      } else {
        // Admin fetches all classes
        const response = await adminAPI.classes.getAll();
        if (response.data?.success && response.data?.data) {
          setClasses(response.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Failed to load classes. Please refresh the page.');
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await academicYearsAPI.getAll();
      if (response.data?.success && response.data?.data) {
        setAcademicYears(response.data.data);
        // Set current/active academic year
        const current = response.data.data.find(ay => ay.isActive) || response.data.data[0];
        if (current) {
          setCurrentAcademicYear(current.id);
          setFormData(prev => ({ ...prev, academicYearId: current.id.toString() }));
          // Fetch terms for the active academic year
          fetchTermsForAcademicYear(current.id);
        }
      }
    } catch (err) {
      console.error('Error fetching academic years:', err);
    }
  };

  const fetchTermsForAcademicYear = async (academicYearId) => {
    try {
      const response = await adminAPI.terms.getByAcademicYear(academicYearId);
      if (response.data?.success && response.data?.data) {
        const termsList = response.data.data;
        setTerms(termsList);
        // Set current/active term
        const activeTerm = termsList.find(t => t.isActive) || termsList[0];
        if (activeTerm) {
          setCurrentTerm(activeTerm.id);
          setFormData(prev => ({ ...prev, termId: activeTerm.id.toString() }));
        }
      }
    } catch (err) {
      console.error('Error fetching terms for academic year:', err);
    }
  };

  const handleAcademicYearChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      termId: '', // Reset term when academic year changes
    });
    // Fetch terms for the newly selected academic year
    if (value) {
      fetchTermsForAcademicYear(value);
    }
    setTerms([]);
    setError('');
    setSuccess('');
  };

  const fetchTerms = async () => {
    try {
      console.log('Fetching terms...');
      const response = await adminAPI.terms.getAll();
      console.log('Terms response:', response.data);

      if (response.data?.success && response.data?.data) {
        const termsList = response.data.data;
        console.log('Loaded terms:', termsList);
        setTerms(termsList);

        // Set current/active term
        const activeTerm = termsList.find(t => t.isActive) || termsList[0];
        if (activeTerm) {
          console.log('Setting current term to:', activeTerm.id, activeTerm.name);
          setCurrentTerm(activeTerm.id);
          setFormData(prev => {
            const updated = { ...prev, termId: activeTerm.id.toString() };
            console.log('Updated formData with termId:', updated.termId);
            return updated;
          });
        } else {
          console.warn('No active term found and no terms available');
        }
      } else {
        console.warn('Terms API returned no data:', response.data);
      }
    } catch (err) {
      console.error('Error fetching terms:', err.message || err);
      console.warn('Will continue without terms - enrollment may fail');
    }
  };

  const fetchStudentData = async (studentId) => {
    try {
      setLoading(true);
      const response = await studentsAPI.getById(studentId);

      if (response.data?.success && response.data?.data) {
        const student = response.data.data;
        const user = student.user || {};

        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          dateOfBirth: student.dateOfBirth || '',
          // store the numeric enum directly for the select component
          gender: student.gender || '',
          admissionDate: student.admissionDate ? student.admissionDate.split('T')[0] : new Date().toISOString().split('T')[0],
          address: student.address || '',
          city: student.city || '',
          state: student.state || '',
          country: student.country || 'Nigeria',
          bloodGroup: student.bloodGroup || '',
          genotype: student.genotype || '',
          allergies: student.allergies || '',
          medicalConditions: student.medicalConditions || '',
          emergencyContactName: student.emergencyContactName || '',
          emergencyContactPhone: student.emergencyContactPhone || '',
          emergencyContactRelationship: student.emergencyContactRelationship || 'Parent',
          previousSchool: student.previousSchool || '',
          classId: student.currentClasses?.[0]?.id?.toString() || '',
          academicYearId: currentAcademicYear?.toString() || '',
        });
      } else {
        setError('Failed to load student data');
      }
    } catch (err) {
      console.error('Error fetching student:', err);
      setError('Failed to load student data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    // convert gender to number so we never send a string to backend
    if (name === 'gender') {
      const parsed = parseInt(value, 10);
      newValue = isNaN(parsed) ? '' : parsed;
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: '',
      });
    }
    setError('');
    setSuccess('');
  };

  const handleEmailBlur = async () => {
    const email = formData.email?.trim();
    if (!email) return;

    try {
      const resp = await authAPI.checkEmail(email);
      // Expected backend shape: { success: true, data: { exists: true/false } }
      const exists = resp.data?.data?.exists ?? resp.data?.exists ?? false;
      setEmailExists(Boolean(exists));
      if (exists) {
        setFieldErrors(prev => ({ ...prev, email: 'Email is already registered' }));
      }
    } catch (err) {
      // If endpoint doesn't exist or errors, don't block registration — fallback to normal flow
      console.warn('Email check failed or endpoint missing, will fallback to registration attempt', err.response?.status);
      setEmailExists(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    setLoading(true);

    // Validate form
    const validation = validateStudentForm(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('Please fix the errors in the form');
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        // Update existing student profile
        const studentProfileData = mapStudentFormToProfileDto(
          formData,
          id, // Using existing userId would be needed here
          formData.admissionNumber
        );

        const response = await studentsAPI.update(id, studentProfileData);

        if (response.data?.success) {
          setSuccess('Student updated successfully!');
          const basePath = user?.role === 'Admin' ? '/admin-dashboard' : '/teacher-dashboard';
          setTimeout(() => {
            navigate(`${basePath}/students`);
          }, 1500);
        } else {
          setError(response.data?.message || 'Failed to update student');
        }
      } else {
        // Create new student using registerStudent endpoint (single API call)
        // This calls POST /api/students/register which handles everything in one transaction
        
        const registerStudentDto = mapStudentFormToRegisterStudentDto(formData);
        console.log('=== REGISTER STUDENT DTO ===');
        console.log('classId:', registerStudentDto.classId);
        console.log('academicYearId:', registerStudentDto.academicYearId);
        console.log('termId:', registerStudentDto.termId);
        console.log('Full DTO:', registerStudentDto);

        let registerResponse;
        try {
          registerResponse = await studentsAPI.registerStudent(registerStudentDto);
          console.log('=== REGISTER RESPONSE ===');
          console.log('Success:', registerResponse.data?.success);
          console.log('Data:', registerResponse.data?.data);
          console.log('IsEnrolled:', registerResponse.data?.data?.isEnrolled);
        } catch (regErr) {
          console.error('Register Student API error:', regErr.response?.data || regErr.message || regErr);
          const errorsArray = regErr.response?.data?.errors || [];
          const allErrors = Array.isArray(errorsArray) ? errorsArray.map((e, i) => {
            if (typeof e === 'object') return JSON.stringify(e);
            return String(e);
          }).join(' | ') : String(errorsArray);
          const detail = allErrors || regErr.response?.data?.message || regErr.message || 'Failed to register student';
          setError(`Registration failed: ${detail}`);
          setLoading(false);
          return;
        }

        if (!registerResponse.data?.success) {
          setError(registerResponse.data?.message || 'Failed to register student');
          setLoading(false);
          return;
        }

        console.log('Student registered successfully:', registerResponse.data.data);
        setSuccess('Student registered successfully!');
        const basePath = user?.role === 'Admin' ? '/admin-dashboard' : '/teacher-dashboard';
        setTimeout(() => {
          navigate(`${basePath}/students`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving student:', err);
      setError(err.response?.data?.message || 'Failed to save student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingClasses) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#FF3E8A' }} />
      </Box>
    );
  }

return (
    <Box>
      <PageHeader
        title={isEdit ? 'Edit Student' : 'Register New Student'}
        subtitle={isEdit ? 'Update student information' : 'Add a new student to the system'}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(false)}>
          {success}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Account Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 2,
                    pb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Account Information
                </Typography>
              </Grid>

              {!isEdit && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748B',
                          mb: 1,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                      >
                        First Name *
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter first name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        error={!!fieldErrors.firstName}
                        helperText={fieldErrors.firstName}
                        sx={textFieldStyles}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748B',
                          mb: 1,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                      >
                        Last Name *
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter last name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        error={!!fieldErrors.lastName}
                        helperText={fieldErrors.lastName}
                        sx={textFieldStyles}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748B',
                          mb: 1,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                      >
                        Email *
                      </Typography>
                      <TextField
                        fullWidth
                        type="email"
                        placeholder="student@school.com"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        sx={textFieldStyles}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748B',
                          mb: 1,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                      >
                        Password *
                      </Typography>
                      <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={textFieldStyles}
                      />
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748B',
                          mb: 1,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                        }}
                      >
                        Phone Number *
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter phone number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        error={!!fieldErrors.phoneNumber}
                        helperText={fieldErrors.phoneNumber}
                        sx={textFieldStyles}
                      />
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 2,
                    mt: 2,
                    pb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Personal Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Date of Birth *
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    InputLabelProps={{ shrink: true }}
                    error={!!fieldErrors.dateOfBirth}
                    helperText={fieldErrors.dateOfBirth}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Gender *
                  </Typography>
                  <Select
                    fullWidth
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    error={!!fieldErrors.gender}
                    sx={selectStyles}
                  >
                    <MenuItem value={GENDER_ENUM.Male}>Male</MenuItem>
                    <MenuItem value={GENDER_ENUM.Female}>Female</MenuItem>
                  </Select>
                  {fieldErrors.gender && (
                    <Typography variant="caption" color="#ff6b6b" sx={{ mt: 0.5 }}>
                      {fieldErrors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Admission Date
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleChange}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              {/* Address Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 2,
                    mt: 2,
                    pb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Address Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Street Address *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Enter street address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    error={!!fieldErrors.address}
                    helperText={fieldErrors.address}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    City *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    error={!!fieldErrors.city}
                    helperText={fieldErrors.city}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth required>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    State *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    error={!!fieldErrors.state}
                    helperText={fieldErrors.state}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Country
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={loading}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              {/* Medical Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 2,
                    mt: 2,
                    pb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Medical Information (Optional)
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Blood Group
                  </Typography>
                  <Select
                    fullWidth
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    disabled={loading}
                    sx={selectStyles}
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="A+">A+</MenuItem>
                    <MenuItem value="A-">A-</MenuItem>
                    <MenuItem value="B+">B+</MenuItem>
                    <MenuItem value="B-">B-</MenuItem>
                    <MenuItem value="AB+">AB+</MenuItem>
                    <MenuItem value="AB-">AB-</MenuItem>
                    <MenuItem value="O+">O+</MenuItem>
                    <MenuItem value="O-">O-</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Genotype
                  </Typography>
                  <Select
                    fullWidth
                    name="genotype"
                    value={formData.genotype}
                    onChange={handleChange}
                    disabled={loading}
                    sx={selectStyles}
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="AA">AA</MenuItem>
                    <MenuItem value="AS">AS</MenuItem>
                    <MenuItem value="SS">SS</MenuItem>
                    <MenuItem value="AC">AC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Allergies
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Any known allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    disabled={loading}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Medical Conditions
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Any medical conditions"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                    disabled={loading}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 2,
                    mt: 2,
                    pb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Emergency Contact
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Contact Name *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Emergency contact name"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    error={!!fieldErrors.emergencyContactName}
                    helperText={fieldErrors.emergencyContactName}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Contact Phone *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Emergency contact phone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    error={!!fieldErrors.emergencyContactPhone}
                    helperText={fieldErrors.emergencyContactPhone}
                    sx={textFieldStyles}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Relationship
                  </Typography>
                  <Select
                    fullWidth
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    disabled={loading}
                    sx={selectStyles}
                  >
                    <MenuItem value="Parent">Parent</MenuItem>
                    <MenuItem value="Guardian">Guardian</MenuItem>
                    <MenuItem value="Sibling">Sibling</MenuItem>
                    <MenuItem value="Spouse">Spouse</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Class Enrollment */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 2,
                    mt: 2,
                    pb: 1,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Class Enrollment
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!fieldErrors.classId}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Class *
                  </Typography>
                  <Select
                    fullWidth
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    displayEmpty
                    sx={selectStyles}
                  >
                    <MenuItem value="">Select a class</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={String(cls.id)}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.classId && (
                    <Typography variant="caption" color="#ff6b6b" sx={{ mt: 0.5 }}>
                      {fieldErrors.classId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!fieldErrors.academicYearId}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Academic Year *
                  </Typography>
                  <Select
                    fullWidth
                    name="academicYearId"
                    value={formData.academicYearId}
                    onChange={handleAcademicYearChange}
                    disabled={loading}
                    required
                    displayEmpty
                    sx={selectStyles}
                  >
                    <MenuItem value="">Select academic year</MenuItem>
                    {academicYears.map((ay) => (
                      <MenuItem key={ay.id} value={String(ay.id)}>
                        {ay.name} {ay.isActive && '(Active)'}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.academicYearId && (
                    <Typography variant="caption" color="#ff6b6b" sx={{ mt: 0.5 }}>
                      {fieldErrors.academicYearId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!fieldErrors.termId}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      mb: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    Term *
                  </Typography>
                  <Select
                    fullWidth
                    name="termId"
                    value={formData.termId}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    displayEmpty
                    sx={selectStyles}
                  >
                    <MenuItem value="">Select term</MenuItem>
                    {terms.map((term) => (
                      <MenuItem key={term.id} value={String(term.id)}>
                        {term.name} {term.isActive && '(Active)'}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.termId && (
                    <Typography variant="caption" color="#ff6b6b" sx={{ mt: 0.5 }}>
                      {fieldErrors.termId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <Save />}
                    sx={submitStyles}
                  >
                    {loading ? 'Saving...' : isEdit ? 'Update Student' : 'Register Student'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const basePath = user?.role === 'Admin' ? '/admin-dashboard' : '/teacher-dashboard';
                      navigate(`${basePath}/students`);
                    }}
                    disabled={loading}
                    startIcon={<Cancel />}
                    sx={cancelStyles}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

// Common styles
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid rgba(111, 175, 143, 0.2)',
    transition: 'all 0.3s ease',
    '& fieldset': { border: 'none' },
    '&:hover': {
      border: '1px solid rgba(111, 175, 143, 0.4)',
    },
    '&.Mui-focused': {
      border: '1px solid #6FAF8F',
      boxShadow: '0 0 20px rgba(111, 175, 143, 0.2)',
    },
    '&.Mui-error': {
      border: '1px solid #ff6b6b',
    },
  },
  '& .MuiInputBase-input': {
    color: '#1E293B',
    padding: '12px 14px',
    fontSize: '0.95rem',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.35)',
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#ff6b6b',
  },
};

const selectStyles = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid rgba(111, 175, 143, 0.2)',
  color: '#1E293B',
  '&:hover': {
    border: '1px solid rgba(111, 175, 143, 0.4)',
  },
  '&.Mui-focused': {
    border: '1px solid #6FAF8F',
    boxShadow: '0 0 20px rgba(111, 175, 143, 0.2)',
  },
  '& .MuiSelect-select': {
    color: '#1E293B',
    padding: '12px 14px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

const submitStyles = {
  py: 1.5,
  px: 4,
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  background: 'linear-gradient(135deg, #6FAF8F 0%, #4A9079 100%)',
  color: '#ffffff',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #5A9E7F 0%, #3A8069 100%)',
    boxShadow: '0 4px 20px rgba(111, 175, 143, 0.3)',
  },
  '&:disabled': {
    background: '#94a3b8',
  },
};

const cancelStyles = {
  py: 1.5,
  px: 4,
  borderRadius: '50px',
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  color: '#ffffff',
  borderColor: 'rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#ffffff',
    background: 'rgba(255, 255, 255, 0.1)',
  },
};

export default StudentForm;
