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
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  School,
  CheckCircle,
  TrendingUp,
  Refresh,
  Publish,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, academicYearsAPI, resultsAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';

const PromotionsList = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [promotions, setPromotions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Override dialog
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);

  useEffect(() => {
    fetchAcademicYears();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchPromotions();
    }
  }, [selectedAcademicYear, selectedClass]);

  const fetchAcademicYears = async () => {
    try {
      const response = await academicYearsAPI.getAll();
      if (response.data?.success) {
        setAcademicYears(response.data.data);
        const activeYear = response.data.data.find(y => y.isActive);
        if (activeYear) {
          setSelectedAcademicYear(activeYear.id);
        }
      }
    } catch (err) {
      console.error('Error fetching academic years:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.classes.getAll();
      if (response.data?.success) {
        setClasses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchPromotions = async () => {
    if (!selectedAcademicYear) return;
    
    // Require a class to be selected
    if (!selectedClass) {
      setPromotions({
        totalStudents: 0,
        promotedCount: 0,
        retainedCount: 0,
        graduatedCount: 0,
        pendingCount: 0,
        students: []
      });
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      // First try to get calculated promotions from the promotions endpoint
      const promotionsResponse = await adminAPI.promotions.getCalculated(
        selectedAcademicYear,
        selectedClass,
        undefined,
        1,
        100
      );
      
      if (promotionsResponse.data?.success && promotionsResponse.data.data?.students?.length > 0) {
        // Use data from promotions endpoint (after calculation)
        setPromotions(promotionsResponse.data.data);
      } else {
        // Fall back to students endpoint if no promotions calculated yet
        const studentsResponse = await adminAPI.students.getByClass(selectedClass);
        
        if (studentsResponse.data?.success) {
          // Transform students data to match our display format
          const students = studentsResponse.data.data.map(student => ({
            studentProfileId: student.id,
            studentName: student.fullName || `${student.firstName} ${student.lastName}`,
            studentNumber: student.studentNumber,
            currentClass: student.className || student.currentClassName,
            averagePercentage: 0,
            numberOfFGrades: 0,
            nextClass: '-',
            status: 'Pending',
            reason: 'Click "Calculate Promotions" to calculate',
            isPublished: false
          }));
          
          setPromotions({
            totalStudents: students.length,
            promotedCount: 0,
            retainedCount: 0,
            graduatedCount: 0,
            pendingCount: students.length,
            students: students
          });
        } else {
          setError(studentsResponse.data?.message || 'Failed to load students');
        }
      }
    } catch (err) {
      setError('Error loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideClick = (student) => {
    setSelectedStudent(student);
    setOverrideStatus(student.status);
    setOverrideReason(student.reason || '');
    setOverrideOpen(true);
  };

  const handleOverrideSave = async () => {
    if (!selectedStudent || !overrideStatus) return;
    
    setSavingOverride(true);
    setError('');
    try {
      const response = await adminAPI.promotions.override(
        selectedStudent.studentProfileId,
        selectedAcademicYear,
        {
          studentId: selectedStudent.studentProfileId,
          newStatus: overrideStatus,
          reason: overrideReason
        }
      );
      
      if (response.data?.success) {
        setSuccess('Promotion status updated successfully');
        setOverrideOpen(false);
        fetchPromotions();
      } else {
        setError(response.data?.message || 'Failed to update promotion');
      }
    } catch (err) {
      setError('Error updating promotion');
      console.error(err);
    } finally {
      setSavingOverride(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedAcademicYear || !selectedClass) {
      setError('Please select both Academic Year and Class');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await adminAPI.promotions.calculate(
        selectedAcademicYear,
        selectedClass
      );
      
      if (response.data?.success) {
        setSuccess(response.data.message || 'Promotions calculated successfully!');
        fetchPromotions();
      } else {
        setError(response.data?.message || 'Failed to calculate promotions');
      }
    } catch (err) {
      setError('Error calculating promotions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateCumulative = async () => {
    if (!selectedAcademicYear || !selectedClass) {
      setError('Please select both Academic Year and Class');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await resultsAPI.calculateCumulative(
        selectedAcademicYear,
        selectedClass
      );
      
      if (response.data?.success) {
        setSuccess('Cumulative results calculated! Now click "Calculate Promotions"');
      } else {
        setError(response.data?.message || 'Failed to calculate cumulative results');
      }
    } catch (err) {
      setError('Error calculating cumulative results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedAcademicYear) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await adminAPI.promotions.publishWithResults({
        academicYearId: selectedAcademicYear,
        classId: selectedClass || undefined
      });
      
      if (response.data?.success) {
        setSuccess('Results and promotions published successfully');
        fetchPromotions();
      } else {
        setError(response.data?.message || 'Failed to publish');
      }
    } catch (err) {
      setError('Error publishing results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = (student) => {
    navigate(`/admin-dashboard/cumulative-result/${student.studentProfileId}?academicYearId=${selectedAcademicYear}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Promoted': return 'success';
      case 'Retained': return 'error';
      case 'Graduated': return 'info';
      default: return 'warning';
    }
  };

  if (!hasRole(['Admin'])) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">You don't have permission to access this page.</Typography>
      </Box>
    );
  }

  const stats = promotions ? {
    promoted: promotions.promotedCount || 0,
    retained: promotions.retainedCount || 0,
    graduated: promotions.graduatedCount || 0,
    pending: promotions.pendingCount || 0,
    total: promotions.totalStudents || 0
  } : { promoted: 0, retained: 0, graduated: 0, pending: 0, total: 0 };

  return (
    <Box>
      <PageHeader
        title="Promotions"
        subtitle="Manage student promotions and progression"
        action={
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleCalculateCumulative}
              disabled={loading || !selectedAcademicYear || !selectedClass}
              sx={{ bgcolor: '#FF9800', '&:hover': { bgcolor: '#F57C00' } }}
            >
              1. Calculate Cumulative
            </Button>
            <Button
              variant="contained"
              onClick={handleCalculate}
              disabled={loading || !selectedAcademicYear || !selectedClass}
              sx={{ bgcolor: '#6FAF8F', '&:hover': { bgcolor: '#5FA08A' } }}
            >
              2. Calculate Promotions
            </Button>
            <Button
              variant="contained"
              onClick={handlePublish}
              disabled={loading || !selectedAcademicYear || !selectedClass}
              sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
            >
              3. Publish Results
            </Button>
          </Box>
        }
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
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Academic Year</InputLabel>
            <Select
              value={selectedAcademicYear}
              label="Academic Year"
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
            >
              {academicYears.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name} {year.isActive ? '(Active)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Class (Optional)</InputLabel>
            <Select
              value={selectedClass}
              label="Class (Optional)"
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.displayName || cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchPromotions}
            disabled={loading || !selectedAcademicYear}
            fullWidth
            sx={{ height: 56 }}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #4CAF50', bgcolor: '#E8F5E9' }}>
            <CardContent sx={{ p: 2, '&:last': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#2E7D32">{stats.promoted}</Typography>
                  <Typography variant="body2" color="#2E7D32">Promoted</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#4CAF50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #F44336', bgcolor: '#FFEBEE' }}>
            <CardContent sx={{ p: 2, '&:last': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#C62828">{stats.retained}</Typography>
                  <Typography variant="body2" color="#C62828">Retained</Typography>
                </Box>
                <School sx={{ fontSize: 40, color: '#F44336' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #2196F3', bgcolor: '#E3F2FD' }}>
            <CardContent sx={{ p: 2, '&:last': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#1565C0">{stats.graduated}</Typography>
                  <Typography variant="body2" color="#1565C0">Graduated</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#2196F3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid #FF9800', bgcolor: '#FFF3E0' }}>
            <CardContent sx={{ p: 2, '&:last': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="#E65100">{stats.pending}</Typography>
                  <Typography variant="body2" color="#E65100">Pending</Typography>
                </Box>
                <School sx={{ fontSize: 40, color: '#FF9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Student Promotion Status ({stats.total} students)
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : !promotions?.students?.length ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No student promotion data available. Make sure results have been computed.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#E8F5E9' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Student No.</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Current Class</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Average %</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>F Grades</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Next Class</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {promotions.students.map((student) => (
                    <TableRow key={student.studentProfileId} hover>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.studentNumber}</TableCell>
                      <TableCell>{student.currentClass}</TableCell>
                      <TableCell>{student.averagePercentage?.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Chip 
                          label={student.numberOfFGrades} 
                          size="small" 
                          color={student.numberOfFGrades > 0 ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{student.nextClass || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={student.status} 
                          size="small" 
                          color={getStatusColor(student.status)}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 150 }}>
                        <Typography variant="body2" noWrap title={student.reason}>
                          {student.reason || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Visibility />}
                            onClick={() => handleViewResults(student)}
                            sx={{ bgcolor: '#6FAF8F', '&:hover': { bgcolor: '#5FA08A' } }}
                          >
                            View Result
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOverrideClick(student)}
                          >
                            Override
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <Dialog open={overrideOpen} onClose={() => setOverrideOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Override Promotion Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Student: <strong>{selectedStudent?.studentName}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Current Status: <Chip label={selectedStudent?.status} size="small" color={getStatusColor(selectedStudent?.status)} />
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={overrideStatus}
              label="New Status"
              onChange={(e) => setOverrideStatus(e.target.value)}
            >
              <MenuItem value="Promoted">Promoted</MenuItem>
              <MenuItem value="Retained">Retained</MenuItem>
              <MenuItem value="Graduated">Graduated</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Reason"
            multiline
            rows={3}
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="Enter reason for override..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverrideOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleOverrideSave} 
            variant="contained"
            disabled={savingOverride || !overrideStatus}
            sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
          >
            {savingOverride ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromotionsList;
