import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Save,
  Refresh,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { adminAPI, academicYearsAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';

const PromotionCriteria = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [saving, setSaving] = useState(false);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    academicYearId: '',
    fromClassId: '',
    maxFGradesAllowed: 3,
    minAveragePercentage: 40,
    minAttendancePercentage: 75,
    requiresManualApproval: false,
    notes: '',
  });

  useEffect(() => {
    fetchAcademicYears();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchCriteria();
    }
  }, [selectedAcademicYear]);

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

  const fetchCriteria = async () => {
    if (!selectedAcademicYear) return;
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.promotions.getCriteria(selectedAcademicYear);
      if (response.data?.success) {
        setCriteria(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to load criteria');
      }
    } catch (err) {
      setError('Error loading criteria');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingCriteria(item);
      setFormData({
        academicYearId: item.academicYearId,
        fromClassId: item.fromClassId || '',
        maxFGradesAllowed: item.maxFGradesAllowed,
        minAveragePercentage: item.minAveragePercentage,
        minAttendancePercentage: item.minAttendancePercentage || 75,
        requiresManualApproval: item.requiresManualApproval || false,
        notes: item.notes || '',
      });
    } else {
      setEditingCriteria(null);
      setFormData({
        academicYearId: selectedAcademicYear,
        fromClassId: '',
        maxFGradesAllowed: 3,
        minAveragePercentage: 40,
        minAttendancePercentage: 75,
        requiresManualApproval: false,
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCriteria(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const data = {
        academicYearId: formData.academicYearId || selectedAcademicYear,
        fromClassId: formData.fromClassId || null,
        maxFGradesAllowed: parseInt(formData.maxFGradesAllowed),
        minAveragePercentage: parseFloat(formData.minAveragePercentage),
        minAttendancePercentage: parseFloat(formData.minAttendancePercentage),
        requiresManualApproval: formData.requiresManualApproval,
        notes: formData.notes || null,
      };

      let response;
      if (editingCriteria) {
        response = await adminAPI.promotions.updateCriteria(editingCriteria.id, data);
      } else {
        response = await adminAPI.promotions.createCriteria(data);
      }

      if (response.data?.success) {
        setSuccess(editingCriteria ? 'Criteria updated successfully' : 'Criteria created successfully');
        handleCloseDialog();
        fetchCriteria();
      } else {
        setError(response.data?.message || 'Failed to save criteria');
      }
    } catch (err) {
      setError('Error saving criteria');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    if (!deleteId) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.promotions.deleteCriteria(deleteId);
      if (response.data?.success) {
        setSuccess('Criteria deleted successfully');
        fetchCriteria();
      } else {
        setError(response.data?.message || 'Failed to delete criteria');
      }
    } catch (err) {
      setError('Error deleting criteria');
      console.error(err);
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const getClassName = (classId) => {
    if (!classId) return 'All Classes';
    const cls = classes.find(c => c.id === classId);
    return cls ? (cls.displayName || cls.name) : 'Unknown';
  };

  return (
    <Box>
      <PageHeader
        title="Promotion Criteria"
        subtitle="Configure promotion rules for each class or academic year"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
          >
            Add Criteria
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
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
        <Grid item xs={12} sm={6} md={4}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchCriteria}
            disabled={loading || !selectedAcademicYear}
            fullWidth
            sx={{ height: 56 }}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : criteria.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No promotion criteria found. Click "Add Criteria" to create one.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#E8F5E9' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }} align="center">Max F Grades</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }} align="center">Min Average %</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }} align="center">Min Attendance %</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }} align="center">Manual Approval</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Notes</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {criteria.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{getClassName(item.fromClassId)}</TableCell>
                      <TableCell align="center">{item.maxFGradesAllowed}</TableCell>
                      <TableCell align="center">{item.minAveragePercentage}%</TableCell>
                      <TableCell align="center">{item.minAttendancePercentage || 75}%</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={item.requiresManualApproval ? 'Yes' : 'No'} 
                          size="small" 
                          color={item.requiresManualApproval ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{item.notes || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.isActive ? 'Active' : 'Inactive'} 
                          size="small" 
                          color={item.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(item.id)} color="error">
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCriteria ? 'Edit Promotion Criteria' : 'Add Promotion Criteria'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={formData.academicYearId || selectedAcademicYear}
                    label="Academic Year"
                    onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                  >
                    {academicYears.map((year) => (
                      <MenuItem key={year.id} value={year.id}>
                        {year.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Class (Optional)</InputLabel>
                  <Select
                    value={formData.fromClassId}
                    label="Class (Optional)"
                    onChange={(e) => setFormData({ ...formData, fromClassId: e.target.value })}
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max F Grades Allowed"
                  type="number"
                  value={formData.maxFGradesAllowed}
                  onChange={(e) => setFormData({ ...formData, maxFGradesAllowed: e.target.value })}
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Average %"
                  type="number"
                  value={formData.minAveragePercentage}
                  onChange={(e) => setFormData({ ...formData, minAveragePercentage: e.target.value })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Attendance %"
                  type="number"
                  value={formData.minAttendancePercentage}
                  onChange={(e) => setFormData({ ...formData, minAttendancePercentage: e.target.value })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Promotion Criteria"
        message="Are you sure you want to delete this promotion criteria? This action cannot be undone."
        confirmText="Delete"
      />
    </Box>
  );
};

export default PromotionCriteria;
