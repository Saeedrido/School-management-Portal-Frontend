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
} from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';

const schoolLevels = [
  { value: 1, label: 'Primary' },
  { value: 2, label: 'Junior Secondary (JSS)' },
  { value: 3, label: 'Senior Secondary (SS)' },
];

const GradeManagement = () => {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchGrades(selectedLevel);
  }, [selectedLevel]);

  const fetchGrades = async (level) => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.grades.getBySchoolLevel(level);
      if (response.data?.success) {
        setGrades(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to load grades');
      }
    } catch (err) {
      setError('Error loading grades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updatedGrades = [...grades];
    updatedGrades[index] = {
      ...updatedGrades[index],
      [field]: value,
    };
    setGrades(updatedGrades);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const gradeItems = grades.map(g => ({
        id: g.id,
        gradeLetter: g.gradeLetter,
        lowerBound: parseInt(g.lowerBound),
        upperBound: parseInt(g.upperBound),
        remark: g.remark || '',
        isActive: g.isActive,
      }));

      const response = await adminAPI.grades.updateBySchoolLevel({
        schoolLevel: selectedLevel,
        grades: gradeItems,
      });

      if (response.data?.success) {
        setSuccess('Grades saved successfully');
        fetchGrades(selectedLevel);
      } else {
        setError(response.data?.message || 'Failed to save grades');
      }
    } catch (err) {
      setError('Error saving grades');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getLevelLabel = (value) => {
    const level = schoolLevels.find(l => l.value === value);
    return level ? level.label : 'Unknown';
  };

  return (
    <Box>
      <PageHeader
        title="Grade Management"
        subtitle="Configure grading scales for each school level"
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

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>School Level</InputLabel>
              <Select
                value={selectedLevel}
                label="School Level"
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                {schoolLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => fetchGrades(selectedLevel)}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: '#E8F5E9' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>
                        Grade Letter
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }} align="center">
                        Lower Bound (%)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }} align="center">
                        Upper Bound (%)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>
                        Remark
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }} align="center">
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grades.map((grade, index) => (
                      <TableRow key={grade.id} hover>
                        <TableCell>
                          <TextField
                            value={grade.gradeLetter}
                            onChange={(e) => handleFieldChange(index, 'gradeLetter', e.target.value)}
                            size="small"
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={grade.lowerBound}
                            onChange={(e) => handleFieldChange(index, 'lowerBound', e.target.value)}
                            size="small"
                            sx={{ width: 120 }}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            value={grade.upperBound}
                            onChange={(e) => handleFieldChange(index, 'upperBound', e.target.value)}
                            size="small"
                            sx={{ width: 120 }}
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={grade.remark || ''}
                            onChange={(e) => handleFieldChange(index, 'remark', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={grade.isActive ? 'Active' : 'Inactive'}
                            color={grade.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    bgcolor: '#2E7D32',
                    '&:hover': { bgcolor: '#1B5E20' },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default GradeManagement;
