import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Add,
  Delete,
  Schedule,
  Quiz,
  Timer,
} from '@mui/icons-material';
import {
  adminAPI,
  teacherAPI,
  academicYearsAPI,
  termsAPI,
  examsAPI,
} from '../../services/api';
import { PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import {
  mapExamFormToCreateDto,
  examTypeToEnum,
  enumToExamType,
  validateExamForm,
} from '../../utils/dataMapping';

const EXAM_TYPES = [
  { value: 'ObjectiveOnly', label: 'Objective Only (100 marks)' },
  { value: 'ObjectiveAndTheory', label: 'Objective + Theory' },
  { value: 'ObjectiveAndTest', label: 'Objective + Test' },
  { value: 'ObjectiveTheoryAndTest', label: 'Objective + Theory + Test' },
];

const ExamForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  // Get base path based on user role
  const basePath = user?.role === 'Admin' ? '/admin-dashboard' : '/teacher-dashboard';

  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [classes, setClasses] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]); // Class-subject assignments for selected class
  const [terms, setTerms] = useState([]); // All available terms for manual selection
  const [currentTerm, setCurrentTerm] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    classSubjectId: '',
    termId: '', // Manual term selection
    type: 'Theory',
    startDate: '',
    startTime: '',
    duration: '60',
    durationUnit: 'minutes',
    totalMarks: 100,
    objectiveMark: 100,
    theoryMark: 0,
    testMark: 0,
    passingMarks: 40,
    instructions: '',
    allowRetake: false,
    maxAttempts: 1,
  });

  useEffect(() => {
    fetchClasses();
    fetchAcademicYears();
    if (isEditing && id) {
      fetchExamData(id);
    }
  }, [id, isEditing]);

  // Dynamic scoring configuration based on exam type
  useEffect(() => {
    const examTypeConfig = {
      ObjectiveOnly: { objectiveMark: 100, theoryMark: 0, testMark: 0, totalMarks: 100 },
      ObjectiveAndTheory: { objectiveMark: 50, theoryMark: 50, testMark: 0, totalMarks: 100 },
      ObjectiveAndTest: { objectiveMark: 50, theoryMark: 0, testMark: 50, totalMarks: 100 },
      ObjectiveTheoryAndTest: { objectiveMark: 30, theoryMark: 30, testMark: 40, totalMarks: 100 },
    };
    
    const config = examTypeConfig[formData.type] || examTypeConfig.ObjectiveOnly;
    
    // Auto-update marks based on exam type (only if not editing)
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        objectiveMark: config.objectiveMark,
        theoryMark: config.theoryMark,
        testMark: config.testMark,
        totalMarks: config.totalMarks,
      }));
    }
  }, [formData.type, isEditing]);

  useEffect(() => {
    if (formData.classId) {
      if (user?.role === 'Teacher') {
        // Teacher: Fetch their assigned class-subject combinations
        fetchTeacherClassSubjects(formData.classId);
      } else {
        // Admin: Fetch class-subject assignments for the selected class (same as TeacherAssignments)
        fetchClassSubjectsForClass(formData.classId);
      }
    }
  }, [formData.classId]);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      console.log('📚 Fetching classes for role:', user?.role);
      console.log('🔍 Current user:', user);

      // If teacher, fetch only their assigned classes
      if (user?.role === 'Teacher') {
        console.log('👨‍🏫 Fetching teacher assignments...');
        const response = await teacherAPI.myAssignments.getAll(1, 100);
        console.log('📦 Full response:', response);
        console.log('👨‍🏫 Teacher assignments response:', response.data);

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
                schoolLevel: assignment.class?.schoolLevel,
              });
            }
          });
          setClasses(uniqueClasses);
          console.log('✅ Teacher classes loaded:', uniqueClasses.length);
        } else {
          console.error('❌ Failed to load teacher assignments');
        }
      } else {
        // Admin: Get all classes
        console.log('🔑 Admin: fetching all classes...');
        const classesResponse = await adminAPI.classes.getAll();
        console.log('📦 Full classes response:', classesResponse);
        console.log('🏫 All classes response:', classesResponse.data);

        if (classesResponse.data?.success) {
          console.log('✅ Success! Data:', classesResponse.data.data);
          const allClasses = classesResponse.data.data || [];
          console.log('✅ All classes loaded:', allClasses.length);
          setClasses(allClasses);
        } else {
          console.error('❌ Failed to load classes:', classesResponse.data);
          setError(`Failed to load classes: ${classesResponse.data?.message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching classes:', err);
      console.error('❌ Error details:', err.response?.data);
      setError(`Failed to load classes: ${err.message}`);
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchTeacherClassSubjects = async (classId) => {
    // Only for teachers - fetch their assigned class-subject combinations
    if (user?.role !== 'Teacher') return;

    try {
      setLoadingSubjects(true);
      const response = await teacherAPI.myAssignments.getAll(1, 100);
      console.log('Teacher assignments response:', response.data);

      if (response.data?.success && response.data?.data?.items) {
        // Filter assignments by classId
        const classAssignments = response.data.data.items.filter(
          a => a.classId === classId
        );
        console.log('Filtered class assignments:', classAssignments);
        setClassSubjects(classAssignments);

        // Show warning if no subjects assigned
        if (classAssignments.length === 0) {
          setError('No subjects are assigned to you for this class. Please contact the administrator.');
        }
      }

      // Reset subject selection when class changes
      setFormData(prev => ({
        ...prev,
        classSubjectId: '',
      }));
    } catch (err) {
      console.error('Error fetching teacher class subjects:', err);
      setError('Failed to load your assigned subjects for this class');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchClassSubjectsForClass = async (classId) => {
    try {
      setLoadingSubjects(true);

      if (user?.role === 'Admin') {
        // Admin: Fetch all class-subject assignments for this class
        console.log('🔍 Admin fetching class subjects for classId:', classId);
        const response = await adminAPI.classSubjects.getByClass(classId, 1, 100);
        console.log('📦 Admin class subjects response:', response.data);

        if (response.data?.success && response.data?.data?.items) {
          const items = response.data.data.items;
          console.log('✅ Class subjects items:', items);
          console.log('✅ Number of items:', items.length);
          console.log('✅ First item:', items[0]);
          setClassSubjects(items);

          if (items.length === 0) {
            setError(`⚠️ No subjects are assigned to this class (ID: ${classId}). Class-subject assignments may not be seeded yet.`);
          }
        } else if (response.data?.success && response.data?.data) {
          setClassSubjects(response.data.data);
        } else {
          console.error('❌ API Error:', response.data);
          setError(`Failed to load subjects: ${response.data?.message || 'Unknown error'}`);
        }
      } else {
        // Teacher: Fetch their specific assignments for this class
        const response = await teacherAPI.myAssignments.getAll(1, 100);
        console.log('Teacher assignments response:', response.data);

        if (response.data?.success && response.data?.data?.items) {
          const classAssignments = response.data.data.items.filter(
            a => a.classId === classId
          );
          console.log('Filtered class assignments:', classAssignments);
          setClassSubjects(classAssignments);

          if (classAssignments.length === 0) {
            setError('No subjects are assigned to you for this class. Please contact the administrator.');
          }
        }
      }

      // Reset subject selection when class changes
      setFormData(prev => ({
        ...prev,
        classSubjectId: '',
      }));
    } catch (err) {
      console.error('Error fetching class subjects:', err);
      setError(`Failed to load subjects: ${err.message}`);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      console.log('Fetching academic years...');
      setLoadingData(true);
      const response = await academicYearsAPI.getAll();
      console.log('Academic years response:', response.data);

      if (response.data?.success && response.data?.data) {
        const yearsList = response.data.data;
        setAcademicYears(yearsList);
        
        // Set current/active academic year
        const current = yearsList.find(ay => ay.isActive) || yearsList[0];
        if (current) {
          console.log('Setting current academic year to:', current.id, current.name);
          setCurrentAcademicYear(current.id);
          // Fetch terms for the active academic year
          fetchTermsForAcademicYear(current.id);
        } else {
          setLoadingData(false);
        }
      } else {
        setLoadingData(false);
      }
    } catch (err) {
      console.error('Error fetching academic years:', err);
      setLoadingData(false);
      // Fallback: try to get all terms
      fetchTerms();
    }
  };

  const fetchTermsForAcademicYear = async (academicYearId) => {
    try {
      console.log('Fetching terms for academic year:', academicYearId);
      const response = await adminAPI.terms.getByAcademicYear(academicYearId);
      console.log('Terms response:', response.data);

      if (response.data?.success && response.data?.data) {
        const termsList = response.data.data;
        console.log('Loaded terms:', termsList);
        setTerms(termsList);

        // Set current/active term
        const activeTerm = termsList.find(t => t.isActive) || termsList[0];
        if (activeTerm) {
          console.log('Setting current term to:', activeTerm.id, activeTerm.name);
          setCurrentTerm(activeTerm);
          setFormData(prev => ({ ...prev, termId: activeTerm.id.toString() }));
        } else {
          console.warn('No active term found and no terms available');
        }
      }
      setLoadingData(false);
    } catch (err) {
      console.error('Error fetching terms for academic year:', err);
      setLoadingData(false);
      // Fallback: try to get all terms
      fetchTerms();
    }
  };

  // Fallback: fetch all terms (original approach)
  const fetchTerms = async () => {
    try {
      console.log('Fetching all terms (fallback)...');
      const response = await termsAPI.getAll();
      console.log('Terms response:', response.data);

      if (response.data?.success && response.data?.data) {
        const termsList = response.data.data;
        console.log('Loaded terms:', termsList);
        setTerms(termsList);

        // Set current/active term
        const activeTerm = termsList.find(t => t.isActive) || termsList[0];
        if (activeTerm) {
          console.log('Setting current term to:', activeTerm.id, activeTerm.name);
          setCurrentTerm(activeTerm);
          setFormData(prev => ({ ...prev, termId: activeTerm.id.toString() }));
        }
      }
      setLoadingData(false);
    } catch (err) {
      console.error('Error fetching terms:', err);
      setLoadingData(false);
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
  };

  const fetchExamData = async (examId) => {
    try {
      setLoading(true);
      const response = await examsAPI.getById(examId);

      if (response.data?.success && response.data?.data) {
        const exam = response.data.data;
        const startTime = new Date(exam.examDate);
        const startDate = startTime.toISOString().split('T')[0];
        const startTimeStr = startTime.toTimeString().slice(0, 5);

        setFormData({
          title: exam.title || '',
          description: exam.description || '',
          classId: exam.classId?.toString() || '',
          classSubjectId: exam.classSubjectId?.toString() || '',
          type: enumToExamType(exam.examType),
          startDate: startDate,
          startTime: startTimeStr,
          duration: exam.durationMinutes?.toString() || '60',
          durationUnit: 'minutes',
          totalMarks: exam.totalMarks || 100,
          objectiveMark: exam.objectiveMark || 100,
          theoryMark: exam.theoryMark || 0,
          testMark: exam.testMark || 0,
          passingMarks: exam.passingMark || 40,
          instructions: exam.instructions || '',
          allowRetake: exam.allowRetake || false,
          maxAttempts: exam.maxAttempts || 1,
        });

        // Load class subjects for this class
        if (exam.classId) {
          fetchClassSubjectsForClass(exam.classId);
        }
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // If term is changed manually, update currentTerm
    if (name === 'termId' && value) {
      const selectedTerm = terms.find(t => t.id === value);
      if (selectedTerm) {
        setCurrentTerm(selectedTerm);
      }
    }

    // Clear field error
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: '',
      });
    }

    setError('');
    setSuccess(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title = 'Exam title is required';
    }
    if (!formData.classId) {
      errors.classId = 'Please select a class';
    }
    if (!formData.classSubjectId) {
      errors.classSubjectId = 'Please select a subject';
    }
    if (!formData.termId) {
      errors.termId = 'Please select a term';
    }
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }
    if (!formData.duration || parseFloat(formData.duration) <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }
    if (!formData.totalMarks || formData.totalMarks <= 0) {
      errors.totalMarks = 'Total marks must be greater than 0';
    }
    if (formData.passingMarks < 0 || formData.passingMarks > formData.totalMarks) {
      errors.passingMarks = 'Passing marks must be between 0 and total marks';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    if (!formData.termId) {
      setError('Please select a term.');
      return;
    }

    setLoading(true);

    try {
      const examDto = mapExamFormToCreateDto(
        formData,
        formData.classSubjectId,
        formData.termId
      );

      console.log('📤 Creating exam with DTO:', examDto);
      console.log('👤 User role:', user?.role);
      console.log('🆔 classSubjectId:', formData.classSubjectId);
      console.log('🆔 termId:', formData.termId);

      let response;
      if (isEditing) {
        response = await examsAPI.update(id, examDto);
      } else {
        response = await examsAPI.create(examDto);
      }

      if (response.data?.success) {
        setSuccess(isEditing ? 'Exam updated successfully!' : 'Exam created successfully!');
        setTimeout(() => {
          if (isEditing) {
            navigate(`${basePath}/exams/${id}/questions`);
          } else {
            const newExamId = response.data.data.id;
            navigate(`${basePath}/exams/${newExamId}/questions`);
          }
        }, 1500);
      } else {
        // Show validation errors if present
        const errorMessage = response.data?.message || 'Failed to save exam';
        const validationErrors = response.data?.errors;
        
        if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
          setError(validationErrors.join(', '));
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Error saving exam:', err);
      // Handle both message and errors array from backend
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.errors.join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to save exam. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndAddQuestions = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    if (!formData.termId) {
      setError('Please select a term.');
      return;
    }

    setLoading(true);

    try {
      const examDto = mapExamFormToCreateDto(
        formData,
        formData.classSubjectId,
        formData.termId
      );

      console.log('📤 Creating exam with DTO:', examDto);
      console.log('👤 User role:', user?.role);
      console.log('🆔 classSubjectId:', formData.classSubjectId);
      console.log('🆔 termId:', formData.termId);

      let response;
      if (isEditing) {
        response = await examsAPI.update(id, examDto);
      } else {
        response = await examsAPI.create(examDto);
      }

      if (response.data?.success) {
        setSuccess('Exam saved! Redirecting to question builder...');
        setTimeout(() => {
          const examId = isEditing ? id : response.data.data.id;
          navigate(`${basePath}/exams/${examId}/questions`);
        }, 1000);
      } else {
        // Show validation errors if present
        const errorMessage = response.data?.message || 'Failed to save exam';
        const validationErrors = response.data?.errors;
        
        if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
          setError(validationErrors.join(', '));
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Error saving exam:', err);
      // Handle both message and errors array from backend
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.errors.join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to save exam. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingClasses || loadingData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F8FAF9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: '#6FAF8F' }} />
        <Typography sx={{ color: 'text.secondary' }}>
          Loading exam data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAF9' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader
          title={isEditing ? 'Edit Exam' : 'Create New Exam'}
          subtitle={isEditing ? 'Update exam details' : 'Set up a new exam for your class'}
          breadcrumbs={[
            { label: 'Dashboard', href: basePath },
            { label: 'Exams', href: `${basePath}/exams` },
            { label: isEditing ? 'Edit Exam' : 'Create Exam' },
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
          <Alert severity="success" onClose={() => setSuccess(false)} sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Form */}
        <Card
          sx={{
            background: '#ffffff',
            border: '1px solid rgba(111, 175, 143, 0.2)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 0 }}>
          <form onSubmit={handleSubmit}>
            {/* Section 1: Basic Information */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                background: 'rgba(111, 175, 143, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(111, 175, 143, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Quiz sx={{ color: '#6FAF8F', fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}
                >
                  Basic Information
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {/* Exam Title */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Exam Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics Mid-Term Examination"
                    required
                    error={!!fieldErrors.title}
                    helperText={fieldErrors.title}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the exam"
                    multiline
                    rows={2}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Class Selection */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel sx={{ color: 'text.secondary' }}>Class</InputLabel>
                    <Select
                      name="classId"
                      value={formData.classId}
                      onChange={handleChange}
                      label="Class"
                      error={!!fieldErrors.classId}
                      
                      sx={{
                        color: 'text.primary',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                        '& .MuiSelect-select': {
                          color: 'text.primary',
                        },
                      }}
                    >
                      {loadingClasses ? (
                        <MenuItem value="">
                          <em>Loading classes...</em>
                        </MenuItem>
                      ) : classes.length === 0 ? (
                        <MenuItem value="">
                          <em>No classes available</em>
                        </MenuItem>
                      ) : (
                        classes.map((cls) => (
                          <MenuItem key={cls.id} value={cls.id} sx={{ color: 'text.primary' }}>
                            {cls.displayName || cls.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {fieldErrors.classId && (
                      <Typography variant="caption" color="#ff6b6b" sx={{ mt: 0.5, ml: 2 }}>
                        {fieldErrors.classId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Subject Selection */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={!formData.classId || loadingSubjects}>
                    <InputLabel sx={{ color: 'text.secondary' }}>Subject</InputLabel>
                    <Select
                      name="classSubjectId"
                      value={formData.classSubjectId}
                      onChange={handleChange}
                      label="Subject"
                      error={!!fieldErrors.classSubjectId}
                      
                      sx={{
                        color: 'text.primary',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                        '& .MuiSelect-select': {
                          color: 'text.primary',
                        },
                      }}
                    >
                      {!formData.classId ? (
                        <MenuItem value="" sx={{ color: 'text.primary' }}>
                          <em>Select a class first</em>
                        </MenuItem>
                      ) : loadingSubjects ? (
                        <MenuItem value="" sx={{ color: 'text.primary' }}>
                          <em>Loading subjects...</em>
                        </MenuItem>
                      ) : classSubjects.length > 0 ? (
                        // Both Admin and Teacher: Show subjects from ClassSubject assignments
                        classSubjects.map((cs) => (
                          <MenuItem key={cs.id} value={cs.id} sx={{ color: 'text.primary' }}>
                            {cs.subject?.name || 'Unknown Subject'} ({cs.subject?.code || 'N/A'})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" sx={{ color: 'text.primary' }}>
                          <em>No subjects available for this class</em>
                        </MenuItem>
                      )}
                    </Select>
                    {fieldErrors.classSubjectId && (
                      <Typography variant="caption" color="#ff6b6b" sx={{ mt: 0.5, ml: 2 }}>
                        {fieldErrors.classSubjectId}
                      </Typography>
                    )}
                    {formData.classId && classSubjects.length > 0 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, ml: 2 }}>
                        {user?.role === 'Admin'
                          ? 'Showing subjects assigned to this class'
                          : 'Showing your assigned subjects for this class'}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Academic Year Selection */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel sx={{ color: 'text.secondary' }}>Academic Year</InputLabel>
                    <Select
                      name="academicYearId"
                      value={currentAcademicYear || ''}
                      onChange={handleAcademicYearChange}
                      label="Academic Year"
                      
                      sx={{
                        color: 'text.primary',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                        '& .MuiSelect-select': {
                          color: 'text.primary',
                        },
                      }}
                    >
                      {academicYears.length === 0 ? (
                        <MenuItem value="" sx={{ color: 'text.primary' }}>
                          <em>No academic years available</em>
                        </MenuItem>
                      ) : (
                        academicYears.map((ay) => (
                          <MenuItem key={ay.id} value={ay.id} sx={{ color: 'text.primary' }}>
                            {ay.name} {ay.isActive ? '(Active)' : ''}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Term Selection - Shows terms for the selected academic year */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!fieldErrors.termId}>
                    <InputLabel sx={{ color: 'text.secondary' }}>Term</InputLabel>
                    <Select
                      name="termId"
                      value={formData.termId}
                      onChange={handleChange}
                      label="Term"
                      
                      sx={{
                        color: 'text.primary',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                        '& .MuiSelect-select': {
                          color: 'text.primary',
                        },
                      }}
                    >
                      {!currentAcademicYear ? (
                        <MenuItem value="" sx={{ color: 'text.primary' }}>
                          <em>Select an academic year first</em>
                        </MenuItem>
                      ) : terms.length === 0 ? (
                        <MenuItem value="" sx={{ color: 'text.primary' }}>
                          <em>No terms available</em>
                        </MenuItem>
                      ) : (
                        terms.map((term) => (
                          <MenuItem key={term.id} value={term.id} sx={{ color: 'text.primary' }}>
                            {term.name} {term.isActive ? '(Active)' : ''}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {fieldErrors.termId && (
                      <Typography variant="caption" color="#ff6b6b" sx={{ mt: 0.5, ml: 2 }}>
                        {fieldErrors.termId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Section 2: Exam Configuration */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                background: 'rgba(111, 175, 143, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(111, 175, 143, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Timer sx={{ color: '#2196F3', fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}
                >
                  Exam Configuration
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {/* Exam Type */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth required>
                    <InputLabel sx={{ color: 'text.secondary' }}>Exam Type</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      label="Exam Type"
                      sx={{
                        color: 'text.primary',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                        '& .MuiSelect-select': {
                          color: 'text.primary',
                        },
                      }}
                    >
                      {EXAM_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value} sx={{ color: 'text.primary' }}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Duration */}
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      label="Duration"
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      error={!!fieldErrors.duration}
                      helperText={fieldErrors.duration}
                      inputProps={{ min: 1, step: 1 }}
                      sx={textFieldStyles}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel sx={{ color: 'text.secondary' }}>Unit</InputLabel>
                      <Select
                        name="durationUnit"
                        value={formData.durationUnit}
                        onChange={handleChange}
                        label="Unit"
                        sx={{
                          color: 'text.primary',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider',
                          },
                          '& .MuiSelect-select': {
                            color: 'text.primary',
                          },
                        }}
                      >
                        <MenuItem value="minutes" sx={{ color: 'text.primary' }}>Minutes</MenuItem>
                        <MenuItem value="hours" sx={{ color: 'text.primary' }}>Hours</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Section 3: Schedule */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                background: 'rgba(111, 175, 143, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(111, 175, 143, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Schedule sx={{ color: '#6FAF8F', fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}
                >
                  Schedule
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {/* Start Date */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.startDate}
                    helperText={fieldErrors.startDate}
                    InputLabelProps={{
                      shrink: true,
                      sx: { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Start Time */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.startTime}
                    helperText={fieldErrors.startTime}
                    InputLabelProps={{
                      shrink: true,
                      sx: { color: 'rgba(255, 255, 255, 0.7)' },
                    }}
                    inputProps={{
                      step: 300,
                    }}
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section 4: Grading */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                background: 'rgba(111, 175, 143, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(111, 175, 143, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Quiz sx={{ color: '#6FAF8F', fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}
                >
                  Grading
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {/* Total Marks */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Total Marks"
                    name="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.totalMarks}
                    helperText={fieldErrors.totalMarks}
                    inputProps={{ min: 1 }}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Objective Marks - Always show */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Objective Marks"
                    name="objectiveMark"
                    type="number"
                    value={formData.objectiveMark}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0 }}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Theory Marks - Show for ObjectiveAndTheory and ObjectiveTheoryAndTest */}
                {(formData.type === 'ObjectiveAndTheory' || formData.type === 'ObjectiveTheoryAndTest') && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Theory Marks"
                      name="theoryMark"
                      type="number"
                      value={formData.theoryMark}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                      sx={textFieldStyles}
                    />
                  </Grid>
                )}

                {/* Test Marks - Show for ObjectiveAndTest and ObjectiveTheoryAndTest */}
                {(formData.type === 'ObjectiveAndTest' || formData.type === 'ObjectiveTheoryAndTest') && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Test Marks"
                      name="testMark"
                      type="number"
                      value={formData.testMark}
                      onChange={handleChange}
                      inputProps={{ min: 0 }}
                      sx={textFieldStyles}
                    />
                  </Grid>
                )}

                {/* Passing Marks */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Passing Marks"
                    name="passingMarks"
                    type="number"
                    value={formData.passingMarks}
                    onChange={handleChange}
                    required
                    error={!!fieldErrors.passingMarks}
                    helperText={fieldErrors.passingMarks}
                    inputProps={{ min: 0 }}
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section 5: Instructions */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                background: 'rgba(111, 175, 143, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(111, 175, 143, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Quiz sx={{ color: '#6FAF8F', fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}
                >
                  Instructions (Optional)
                </Typography>
              </Box>

              <TextField
                fullWidth
                name="instructions"
                multiline
                rows={4}
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Enter exam instructions for students..."
                sx={textFieldStyles}
              />
            </Box>

            {/* Section 6: Retake Settings */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                background: 'rgba(111, 175, 143, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(111, 175, 143, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Quiz sx={{ color: '#6FAF8F', fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}
                >
                  Retake Settings
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'text.secondary' }}>Allow Retake</InputLabel>
                    <Select
                      name="allowRetake"
                      value={formData.allowRetake}
                      onChange={handleChange}
                      label="Allow Retake"
                      sx={{
                        color: 'text.primary',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider',
                        },
                        '& .MuiSelect-select': {
                          color: 'text.primary',
                        },
                      }}
                    >
                      <MenuItem value={false} sx={{ color: 'text.primary' }}>No</MenuItem>
                      <MenuItem value={true} sx={{ color: 'text.primary' }}>Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {formData.allowRetake && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Max Attempts"
                      name="maxAttempts"
                      type="number"
                      value={formData.maxAttempts}
                      onChange={handleChange}
                      inputProps={{ min: 1 }}
                      sx={textFieldStyles}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
                mt: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate(`${basePath}/exams`)}
                disabled={loading}
                sx={{
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  px: 3,
                  py: 1.5,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Save />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  background: '#6FAF8F',
                  '&:hover': {
                    background: '#5FA08A',
                  },
                  px: 3,
                  py: 1.5,
                }}
              >
                {loading ? 'Saving...' : 'Save Exam'}
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Add />}
                onClick={handleSaveAndAddQuestions}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #5FA08A 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5FA08A 0%, #4E8C70 100%)',
                  },
                  px: 3,
                  py: 1.5,
                }}
              >
                {loading ? 'Saving...' : 'Save & Add Questions'}
              </Button>
            </Box>
          </form>
        </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// Common styles
const textFieldStyles = {
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#6FAF8F',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#6FAF8F',
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ff6b6b',
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#ff6b6b',
  },
};

const selectStyles = {
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#6FAF8F',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#6FAF8F',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiSelect-select': {
    color: '#ffffff',
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

export default ExamForm;
