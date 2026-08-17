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
  Restore,
} from '@mui/icons-material';
import { commentsAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';
import { SCHOOL_LEVEL_OPTIONS, getSchoolLevelLabel, getSchoolLevelKey } from '../../utils/constants';

const HeadmasterComments = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    comment: '',
    schoolLevel: 1, // Backend enum: Primary = 1
    minScore: '',
    maxScore: '',
    category: '',
  });

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await commentsAPI.getHeadmasterComments();
      if (response.data?.success) {
        setComments(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load headmaster comments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (comment = null) => {
    if (comment) {
      setSelectedComment(comment);
      setFormData({
        comment: comment.comment || comment.remark || '',
        schoolLevel: getSchoolLevelKey(comment.schoolLevel),
        minScore: comment.minScore?.toString() || '',
        maxScore: comment.maxScore?.toString() || '',
        category: comment.category || '',
      });
    } else {
      setSelectedComment(null);
      setFormData({
        comment: '',
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
    setSelectedComment(null);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.comment || !formData.minScore || !formData.maxScore) {
      setError('Comment, Min Score, and Max Score are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const data = {
        comment: formData.comment,
        schoolLevel: parseInt(formData.schoolLevel),
        minScore: parseInt(formData.minScore),
        maxScore: parseInt(formData.maxScore),
        category: formData.category || null,
      };

      if (selectedComment) {
        await commentsAPI.updateHeadmasterComment(selectedComment.id, data);
        setSuccess('Headmaster comment updated successfully');
      } else {
        await commentsAPI.createHeadmasterComment(data);
        setSuccess('Headmaster comment created successfully');
      }

      handleCloseDialog();
      fetchComments();
    } catch (err) {
      console.error('Error saving comment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save comment';
      setError(errorMessage);
      setSaving(false);
      return;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (comment) => {
    setSelectedComment(comment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setError('');
    try {
      const response = await commentsAPI.deleteHeadmasterComment(selectedComment.id);
      if (response.data?.success) {
        setSuccess(response.data.message);
      }
      setDeleteDialogOpen(false);
      setSelectedComment(null);
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  const handleReactivate = async (comment) => {
    try {
      const response = await commentsAPI.reactivateHeadmasterComment(comment.id);
      if (response.data?.success) {
        setSuccess('Headmaster comment reactivated successfully');
        fetchComments();
      } else {
        setError(response.data?.message || 'Failed to reactivate comment');
      }
    } catch (err) {
      console.error('Error reactivating comment:', err);
      setError(err.response?.data?.message || 'Failed to reactivate comment');
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

  const groupedComments = comments.reduce((acc, comment) => {
    const levelKey = getSchoolLevelKey(comment.schoolLevel);
    if (!acc[levelKey]) {
      acc[levelKey] = [];
    }
    acc[levelKey].push(comment);
    return acc;
  }, {});

  return (
    <Box>
      <PageHeader
        title="Headmaster Comments Management"
        subtitle="Manage headmaster comments for student results"
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
              <Typography variant="h6">Headmaster Comments</Typography>
              <Typography variant="caption" color="text.secondary">
                Total: {comments.length} comments across {Object.keys(groupedComments).length} school levels
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchComments}
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
                Add Comment
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No headmaster comments found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click "Add Comment" to create headmaster comments
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Comment
          </Button>
        </Card>
      ) : (
        Object.entries(groupedComments).map(([schoolLevel, levelComments]) => (
          <Card key={schoolLevel} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: getSchoolLevelColor(schoolLevel) }}>
                {getSchoolLevelLabel(parseInt(schoolLevel))} School ({levelComments.length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Score Range</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Comment</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {levelComments
                      .sort((a, b) => b.minScore - a.minScore)
                      .map((comment) => (
                        <TableRow 
                          key={comment.id} 
                          hover
                          sx={{ 
                            opacity: comment.isActive === false ? 0.5 : 1,
                            background: comment.isActive === false ? '#fff5f5' : 'inherit',
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={`${comment.minScore}% - ${comment.maxScore}%`}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            {comment.isActive === false && (
                              <Chip
                                label="Deactivated"
                                size="small"
                                color="error"
                                sx={{ ml: 1, fontSize: '0.7rem' }}
                              />
                            )}
                          </TableCell>
                          <TableCell>{comment.comment || comment.remark}</TableCell>
                          <TableCell>
                            {comment.category && (
                              <Chip
                                label={comment.category}
                                size="small"
                                sx={{
                                  bgcolor: getCategoryColor(comment.category),
                                  color: 'white',
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {comment.isActive !== false ? (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(comment)}
                                  color="primary"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(comment)}
                                  color="error"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <Tooltip title="Reactivate this comment">
                                <IconButton
                                  size="small"
                                  onClick={() => handleReactivate(comment)}
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedComment ? 'Edit Headmaster Comment' : 'Add Headmaster Comment'}
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

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Comment"
              multiline
              rows={3}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Category (Optional)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Excellent, Good, Fair"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Saving...' : selectedComment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Headmaster Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
          {selectedComment && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Score Range:</strong> {selectedComment.minScore}% - {selectedComment.maxScore}%
              </Typography>
              <Typography variant="body2">
                <strong>Comment:</strong> {selectedComment.comment || selectedComment.remark}
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

export default HeadmasterComments;
