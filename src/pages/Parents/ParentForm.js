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
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Person,
  Email,
  Phone,
  Business,
  LocationOn,
  PersonAdd,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';

const ParentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: '',
    address: '',
    studentIds: [],
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Load students for linking
        const studentsRes = await adminAPI.students.getAll();
        if (studentsRes.data) {
          const studentsData = studentsRes.data.data || studentsRes.data;
          setStudents(Array.isArray(studentsData) ? studentsData.map(s => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            class: s.class?.name || 'N/A',
            currentParent: null
          })) : []);
        }

        if (isEditing && id) {
          // Fetch parent data
          const parentRes = await adminAPI.parents.getById(parseInt(id));
          if (parentRes.data) {
            const parentData = parentRes.data;
            setFormData({
              firstName: parentData.firstName || '',
              lastName: parentData.lastName || '',
              email: parentData.email || '',
              phone: parentData.phoneNumber || '',
              occupation: parentData.occupation || '',
              address: parentData.address || '',
              studentIds: [],
            });
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        occupation: formData.occupation,
        address: formData.address,
      };

      if (isEditing) {
        await adminAPI.parents.update(parseInt(id), payload);
      } else {
        await adminAPI.parents.create(payload);
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin-dashboard/parents');
      }, 2000);
    } catch (err) {
      console.error('Error saving parent:', err);
      setError(err.response?.data?.message || 'Failed to save parent');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setFormData((prev) => {
      const currentSelection = prev.studentIds || [];
      return {
        ...prev,
        studentIds: currentSelection.includes(studentId)
          ? currentSelection.filter((id) => id !== studentId)
          : [...currentSelection, studentId],
      };
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAF9' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader
          title={isEditing ? 'Edit Parent' : 'Add New Parent'}
          subtitle={isEditing ? 'Update parent information' : 'Add a new parent or guardian'}
          breadcrumbs={[
            { label: 'Dashboard', href: '/admin-dashboard' },
            { label: 'Parents', href: '/admin-dashboard/parents' },
            { label: isEditing ? 'Edit Parent' : 'Add Parent' },
          ]}
        />

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess(false)}
            sx={{ mb: 3 }}
          >
            {isEditing
              ? 'Parent updated successfully!'
              : 'Parent added successfully!'}
          </Alert>
        )}

        {/* Form Card */}
        <Card
          sx={{
            background: 'rgba(17, 17, 17, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#6FAF8F',
                      mb: 2,
                    }}
                  >
                    Personal Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name *"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={submitting}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                      },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name *"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={submitting}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                      },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={submitting}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                      },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number *"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled={submitting}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                      },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#6FAF8F',
                      mb: 2,
                      mt: 1,
                    }}
                  >
                    Contact Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    fullWidth
                    disabled={submitting}
                    InputProps={{
                      startAdornment: (
                        <Business sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                      },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    disabled={submitting}
                    InputProps={{
                      startAdornment: (
                        <LocationOn sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                      },
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6FAF8F',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Student Links */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: '#6FAF8F',
                      mb: 2,
                      mt: 1,
                    }}
                  >
                    Link Students
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      mb: 2,
                    }}
                  >
                    Select one or more students to link this parent/guardian to.
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    {students.map((student) => {
                      const isSelected = formData.studentIds.includes(student.id);

                      return (
                        <Button
                          key={student.id}
                          variant={isSelected ? 'contained' : 'outlined'}
                          size="small"
                          startIcon={
                            isSelected ? (
                              <PersonAdd sx={{ fontSize: 16 }} />
                            ) : (
                              <Person sx={{ fontSize: 16 }} />
                            )
                          }
                          onClick={() => toggleStudentSelection(student.id)}
                          sx={{
                            ...(isSelected && {
                              background: '#6FAF8F',
                              color: '#ffffff',
                              '&:hover': {
                                background: '#FF5DA3',
                              },
                            }),
                            ...(!isSelected && {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': {
                                borderColor: '#6FAF8F',
                                color: '#6FAF8F',
                                background: 'rgba(255, 62, 138, 0.05)',
                              },
                            }),
                          }}
                        >
                          {student.name}
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 1,
                              ...(isSelected && { color: 'white' }),
                            }}
                          >
                            {student.class}
                          </Typography>
                        </Button>
                      );
                    })}
                  </Box>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'flex-end',
                      mt: 4,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/admin-dashboard/parents')}
                      disabled={submitting}
                      sx={{
                        color: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          borderColor: '#ffffff',
                          background: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                      onClick={handleSubmit}
                      sx={{
                        background: '#6FAF8F',
                        color: '#ffffff',
                        borderRadius: '50px',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          background: '#FF5DA3',
                        },
                        '&:disabled': {
                          background: 'rgba(255, 62, 138, 0.3)',
                          color: 'rgba(255, 255, 255, 0.3)',
                        },
                      }}
                    >
                      {submitting ? 'Saving...' : isEditing ? 'Update Parent' : 'Add Parent'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card
          sx={{
            mt: 3,
            background: 'rgba(17, 17, 17, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Person sx={{ fontSize: 32, color: '#6FAF8F' }} />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#ffffff',
                    mb: 1,
                  }}
                >
                  Parent Management
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                >
                  Important: After adding a parent, link them to their children using the "Students" button
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Email sx={{ fontSize: 20, color: '#6FAF8F' }} />
              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Contact support for help adding parents or managing student relationships.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <LocationOn sx={{ fontSize: 20, color: '#6FAF8F' }} />
              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Parents can view their children's academic performance and reports.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ParentForm;
