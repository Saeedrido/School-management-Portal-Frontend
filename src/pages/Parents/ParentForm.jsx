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
  Alert,
  CircularProgress,
} from '@mui/material';
import { Save, PersonAdd, Person } from '@mui/icons-material';
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
        const studentsRes = await adminAPI.students.getAll();
        if (studentsRes.data) {
          const studentsData = studentsRes.data.data || studentsRes.data;
          setStudents(Array.isArray(studentsData) ? studentsData.map(s => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            class: s.class?.name || 'N/A',
          })) : []);
        }

        if (isEditing && id) {
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(false)} sx={{ mb: 3 }}>
            {isEditing ? 'Parent updated successfully!' : 'Parent added successfully!'}
          </Alert>
        )}

        <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 2 }}>
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 2, mt: 1 }}>
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 2, mt: 1 }}>
                    Link Students
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                    Select one or more students to link this parent/guardian to.
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {students.map((student) => {
                      const isSelected = formData.studentIds.includes(student.id);
                      return (
                        <Button
                          key={student.id}
                          variant={isSelected ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => toggleStudentSelection(student.id)}
                          sx={{
                            ...(isSelected && {
                              background: '#15803d',
                              '&:hover': { background: '#166534' },
                            }),
                          }}
                        >
                          <PersonAdd sx={{ fontSize: 16, mr: 0.5 }} />
                          {student.name} ({student.class})
                        </Button>
                      );
                    })}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/admin-dashboard/parents')}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                      sx={{ background: '#15803d', '&:hover': { background: '#166534' } }}
                    >
                      {submitting ? 'Saving...' : isEditing ? 'Update Parent' : 'Add Parent'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ParentForm;