import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CalendarToday,
  School,
  Event,
} from '@mui/icons-material';
import { academicYearsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatusBadge } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';

const AcademicYearList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Auto-enrollment state
  const [autoEnrollOpen, setAutoEnrollOpen] = useState(false);
  const [autoEnrollId, setAutoEnrollId] = useState(null);
  const [autoEnrolling, setAutoEnrolling] = useState(false);
  const [success, setSuccess] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  // Resume date dialog state
  const [resumeDateOpen, setResumeDateOpen] = useState(false);
  const [resumeDateId, setResumeDateId] = useState(null);
  const [resumeDate, setResumeDate] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);

  const basePath = '/admin-dashboard';

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await academicYearsAPI.getAll();
      setAcademicYears(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch academic years');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    if (!deleteId) return;
    try {
      await academicYearsAPI.delete(deleteId);
      setAcademicYears(academicYears.filter((y) => y.id !== deleteId));
    } catch (err) {
      setError('Failed to delete academic year');
      console.error(err);
    }
    setDeleteId(null);
  };

  const handleSetActive = async (id) => {
    try {
      await academicYearsAPI.setActive(id);
      setAcademicYears(
        academicYears.map((y) => ({
          ...y,
          isActive: y.id === id,
        }))
      );
      setSuccess('Academic year set to active. Students are being enrolled based on promotions.');
      setSuccessOpen(true);
    } catch (err) {
      setError('Failed to set active academic year');
      console.error(err);
    }
  };

  const handleAutoEnrollClick = (id) => {
    setAutoEnrollId(id);
    setAutoEnrollOpen(true);
  };

  const handleAutoEnrollConfirm = async () => {
    setAutoEnrolling(true);
    try {
      const response = await academicYearsAPI.triggerAutoEnrollment(autoEnrollId);
      if (response.data?.success) {
        setSuccess(response.data.message || 'Auto-enrollment triggered successfully!');
        setSuccessOpen(true);
      } else {
        setError(response.data?.message || 'Failed to trigger auto-enrollment');
      }
    } catch (err) {
      setError('Failed to trigger auto-enrollment');
      console.error(err);
    } finally {
      setAutoEnrolling(false);
      setAutoEnrollOpen(false);
      setAutoEnrollId(null);
    }
  };

  const handleResumeDateClick = (year) => {
    setResumeDateId(year.id);
    setResumeDate(year.nextTermResumeDate ? new Date(year.nextTermResumeDate).toISOString().split('T')[0] : '');
    setResumeDateOpen(true);
  };

  const handleResumeDateSave = async () => {
    setResumeLoading(true);
    try {
      const dateValue = resumeDate ? new Date(resumeDate) : null;
      const response = await academicYearsAPI.updateResumeDate(resumeDateId, { nextTermResumeDate: dateValue });
      if (response.data?.success) {
        setSuccess(response.data.message || 'Resume date updated!');
        setSuccessOpen(true);
        fetchAcademicYears();
      } else {
        setError(response.data?.message || 'Failed to update resume date');
      }
    } catch (err) {
      setError('Failed to update resume date');
      console.error(err);
    } finally {
      setResumeLoading(false);
      setResumeDateOpen(false);
      setResumeDateId(null);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Academic Years" subtitle="Manage academic years" />
        <Card sx={{ borderRadius: 3, p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Card>
      </Box>
    );
  }

  const activeYear = academicYears.find(y => y.isActive);

  return (
    <Box>
      <PageHeader
        title="Academic Years"
        subtitle="Manage academic years and sessions"
        actionText={hasRole('Admin') ? 'Add Academic Year' : undefined}
        onAction={hasRole('Admin') ? () => navigate(`${basePath}/academic-years/new`) : undefined}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Total Years</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>{academicYears.length}</Typography>
                </Box>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #6FAF8F15 0%, #6FAF8F08 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6FAF8F' }}>
                  <CalendarToday sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {activeYear && (
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mb: 0.5 }}>Active Year</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981' }}>{activeYear.name}</Typography>
                  </Box>
                  <Chip label="Active" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAF9' }}>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Academic Year</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Status</TableCell>
                {hasRole('Admin') && (
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2 }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {academicYears.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hasRole('Admin') ? 5 : 4} align="center" sx={{ py: 8 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CalendarToday sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                      <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 500 }}>
                        No academic years found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                academicYears.map((year) => (
                  <TableRow
                    key={year.id}
                    sx={{
                      borderBottom: '1px solid rgba(111, 175, 143, 0.08)',
                      '&:hover': { backgroundColor: 'rgba(111, 175, 143, 0.03)' },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#6FAF8F15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CalendarToday sx={{ color: '#6FAF8F', fontSize: 20 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1E293B' }}>
                          {year.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>
                      {year.startDate ? new Date(year.startDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>
                      {year.endDate ? new Date(year.endDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={year.isActive ? 'Active' : 'Inactive'} />
                    </TableCell>
                    {hasRole('Admin') && (
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {year.isActive && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<School />}
                              onClick={() => handleAutoEnrollClick(year.id)}
                              sx={{ borderColor: '#3B82F6', color: '#3B82F6', fontSize: '0.7rem', borderRadius: 2, px: 1 }}
                            >
                              Enroll
                            </Button>
                          )}
                          {!year.isActive && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleSetActive(year.id)}
                              sx={{ borderColor: '#6FAF8F', color: '#6FAF8F', fontSize: '0.75rem', borderRadius: 2 }}
                            >
                              Set Active
                            </Button>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => navigate(`${basePath}/academic-years/${year.id}/edit`)}
                            sx={{ color: '#6FAF8F', '&:hover': { bgcolor: 'rgba(111, 175, 143, 0.1)' } }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(year.id)}
                            sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Academic Year"
        message="Are you sure you want to delete this academic year? This action cannot be undone."
        confirmText="Delete"
      />

      <ConfirmDialog
        open={autoEnrollOpen}
        onClose={() => setAutoEnrollOpen(false)}
        onConfirm={handleAutoEnrollConfirm}
        title="Trigger Student Enrollment"
        message="This will enroll students based on their promotion status (promoted to next class, retained in same class). Students with published promotions will be automatically enrolled. Continue?"
        confirmText="Enroll Students"
        confirmLoading={autoEnrolling}
      />

      {/* Resume Date Dialog */}
      <Dialog open={resumeDateOpen} onClose={() => setResumeDateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set Next Term Resume Date</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Set the date when the next term/session is expected to resume. This is required before publishing results.
          </Typography>
          <TextField
            label="Resume Date"
            type="date"
            fullWidth
            value={resumeDate}
            onChange={(e) => setResumeDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResumeDateOpen(false)}>Cancel</Button>
          <Button onClick={handleResumeDateSave} variant="contained" disabled={resumeLoading}>
            {resumeLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {successOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            p: 2,
            bgcolor: '#10B981',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            maxWidth: 400,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography sx={{ fontSize: '0.9rem' }}>{success}</Typography>
            <IconButton size="small" onClick={() => setSuccessOpen(false)} sx={{ color: 'white' }}>
              ×
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AcademicYearList;
