import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  ArrowBack,
  Calculate,
  Restore,
} from '@mui/icons-material';
import { commentsAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';
import { SCHOOL_LEVEL_OPTIONS, getSchoolLevelLabel, getSchoolLevelKey } from '../../utils/constants';

const TeacherRemarks = () => {
  const navigate = useNavigate();
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    remark: '',
    schoolLevel: 1, // Backend enum: Primary = 1
    minScore: '',
    maxScore: '',
    category: '',
  });

  useEffect(() => {
    fetchRemarks();
  }, []);

  const fetchRemarks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await commentsAPI.getTeacherRemarks();
      if (response.data?.success) {
        setRemarks(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching remarks:', err);
      setError('Failed to load teacher remarks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (remark = null) => {
    if (remark) {
      setSelectedRemark(remark);
      setFormData({
        remark: remark.remark || '',
        schoolLevel: getSchoolLevelKey(remark.schoolLevel),
        minScore: remark.minScore?.toString() || '',
        maxScore: remark.maxScore?.toString() || '',
        category: remark.category || '',
      });
    } else {
      setSelectedRemark(null);
      setFormData({
        remark: '',
        schoolLevel: 1,
        minScore: '',
        maxScore: '',
        category: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRemark(null);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.remark || !formData.minScore || !formData.maxScore) {
      setError('Remark, Min Score, and Max Score are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const data = {
        remark: formData.remark,
        schoolLevel: parseInt(formData.schoolLevel),
        minScore: parseInt(formData.minScore),
        maxScore: parseInt(formData.maxScore),
        category: formData.category || null,
      };

      if (selectedRemark) {
        await commentsAPI.updateTeacherRemark(selectedRemark.id, data);
        setSuccess('Teacher remark updated successfully');
      } else {
        await commentsAPI.createTeacherRemark(data);
        setSuccess('Teacher remark created successfully');
      }

      handleCloseDialog();
      fetchRemarks();
    } catch (err) {
      console.error('Error saving remark:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save remark';
      setError(errorMessage);
      setSaving(false);
      return;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (remark) => {
    setSelectedRemark(remark);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setError('');
    try {
      const response = await commentsAPI.deleteTeacherRemark(selectedRemark.id);
      if (response.data?.success) {
        setSuccess(response.data.message);
      }
      setDeleteDialogOpen(false);
      setSelectedRemark(null);
      fetchRemarks();
    } catch (err) {
      console.error('Error deleting remark:', err);
      setError(err.response?.data?.message || 'Failed to delete remark');
    } finally {
      setDeleting(false);
    }
  };

  const handleReactivate = async (remark) => {
    try {
      const response = await commentsAPI.reactivateTeacherRemark(remark.id);
      if (response.data?.success) {
        setSuccess('Teacher remark reactivated successfully');
        fetchRemarks();
      } else {
        setError(response.data?.message || 'Failed to reactivate remark');
      }
    } catch (err) {
      console.error('Error reactivating remark:', err);
      setError(err.response?.data?.message || 'Failed to reactivate remark');
    }
  };

  const handleRecalculateComments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await commentsAPI.recalculateComments();
      setSuccess(response.data?.message || 'Comments recalculated successfully');
      fetchRemarks();
    } catch (err) {
      console.error('Error recalculating comments:', err);
      setError(err.response?.data?.message || 'Failed to recalculate comments.');
    } finally {
      setLoading(false);
    }
  };

  const getSchoolLevelColor = (level) => {
    const colors = {
      1: '#4CAF50', // Primary
      2: '#2196F3', // JuniorSecondary
      3: '#FF9800', // SeniorSecondary
    };
    return colors[parseInt(level)] || '#757575';
  };

  const getCategoryColor = (category) => {
    const colors = {
      Excellent: '#4CAF50',
      'Very Good': '#8BC34A',
      Good: '#CDDC39',
      Fair: '#FFC107',
      'Below Average': '#FF9800',
      Poor: '#FF5722',
      'Very Poor': '#F44336',
    };
    return colors[category] || '#757575';
  };

  const groupedRemarks = remarks.reduce((acc, remark) => {
    const levelKey = getSchoolLevelKey(remark.schoolLevel);
    if (!acc[levelKey]) {
      acc[levelKey] = [];
    }
    acc[levelKey].push(remark);
    return acc;
  }, {});

  return (
    <Box>
      <PageHeader
        title="Teacher Remarks Management"
        subtitle="Manage teacher remarks for student results"
        actionText="Back to Dashboard"
        onAction={() => navigate('/admin-dashboard')}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Teacher Remarks</Typography>
              <Typography variant="caption" color="text.secondary">
                Total: {remarks.length} remarks across {Object.keys(groupedRemarks).length} school levels
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchRemarks}
                disabled={loading}
                size="small"
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                size="small"
              >
                Add Remark
              </Button>
              <Button
                variant="outlined"
                color="info"
                startIcon={<Calculate />}
                onClick={handleRecalculateComments}
                disabled={loading}
                size="small"
              >
                Recalculate
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : remarks.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No teacher remarks found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click "Add Remark" to create teacher remarks
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Remark
          </Button>
        </Card>
      ) : (
        Object.entries(groupedRemarks).map(([schoolLevel, levelRemarks]) => (
          <Card key={schoolLevel} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: getSchoolLevelColor(schoolLevel) }}>
                {getSchoolLevelLabel(parseInt(schoolLevel))} School ({levelRemarks.length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Score Range</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Remark</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {levelRemarks
                      .sort((a, b) => b.minScore - a.minScore)
                      .map((remark) => (
                        <TableRow 
                          key={remark.id} 
                          hover
                          sx={{ 
                            opacity: remark.isActive === false ? 0.5 : 1,
                            background: remark.isActive === false ? '#fff5f5' : 'inherit',
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={`${remark.minScore}% - ${remark.maxScore}%`}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            {remark.isActive === false && (
                              <Chip
                                label="Deactivated"
                                size="small"
                                color="error"
                                sx={{ ml: 1, fontSize: '0.7rem' }}
                              />
                            )}
                          </TableCell>
                          <TableCell>{remark.remark}</TableCell>
                          <TableCell>
                            {remark.category && (
                              <Chip
                                label={remark.category}
                                size="small"
                                sx={{
                                  bgcolor: getCategoryColor(remark.category),
                                  color: 'white',
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {remark.isActive !== false ? (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(remark)}
                                  color="primary"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(remark)}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <Tooltip title="Reactivate this remark">
                                <IconButton
                                  size="small"
                                  onClick={() => handleReactivate(remark)}
                                  sx={{ color: '#4CAF50' }}
                                >
                                  <Restore fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRemark ? 'Edit Teacher Remark' : 'Add Teacher Remark'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>School Level</InputLabel>
              <Select
                value={formData.schoolLevel}
                onChange={(e) => setFormData({ ...formData, schoolLevel: e.target.value })}
                label="School Level"
              >
                {SCHOOL_LEVEL_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Score (%)"
                  type="number"
                  value={formData.minScore}
                  onChange={(e) => setFormData({ ...formData, minScore: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Score (%)"
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Remark"
              multiline
              rows={3}
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Category (Optional)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Excellent, Good, Fair"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Saving...' : selectedRemark ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Teacher Remark</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this remark? This action cannot be undone.
          </Typography>
          {selectedRemark && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Score Range:</strong> {selectedRemark.minScore}% - {selectedRemark.maxScore}%
              </Typography>
              <Typography variant="body2">
                <strong>Remark:</strong> {selectedRemark.remark}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherRemarks;
