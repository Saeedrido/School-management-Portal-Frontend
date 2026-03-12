import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Assessment,
  PictureAsPdf,
  School,
  Event,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { termsAPI, studentsAPI, adminAPI, teacherAPI } from '../../services/api';
import { PageHeader, StatusBadge } from '../../components/ui';

const ReportCardList = () => {
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();

  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(user?.role === 'Student' ? user.id : '');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [terms, setTerms] = useState([]);
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass && (hasRole('Admin', 'Teacher'))) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [termsRes, classesRes] = await Promise.all([
        termsAPI.getAll(),
        hasRole('Admin', 'Teacher') ? (user.role === 'Admin' ? adminAPI.classes.getAll() : teacherAPI.classes.getAll()) : Promise.resolve({ data: { success: true, data: [] } })
      ]);

      if (termsRes.data?.success) setTerms(termsRes.data.data);
      if (classesRes.data?.success) setClasses(classesRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await studentsAPI.getByClass(classId);
      if (response.data?.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students for selected class');
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTerm) {
      setError('Please select a term');
      return;
    }
    if (hasRole('Admin', 'Teacher')) {
      if (!selectedClass) {
        setError('Please select a class');
        return;
      }
      if (!selectedStudent) {
        setError('Please select a student');
        return;
      }
    }
    setError('');
    setReportCards([
      {
        id: 1,
        studentName: 'John Doe',
        class: 'JSS 1',
        term: 'First Term',
        averageScore: 85.5,
        grade: 'A',
        status: 'Published',
      }
    ]);
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Report Cards" subtitle="Generate and view student report cards" />
        <Card sx={{ borderRadius: 3, p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Report Cards"
        subtitle="Generate and view student report cards"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={hasRole('Admin', 'Teacher') ? 4 : 6}>
              <FormControl fullWidth>
                <InputLabel>Select Term</InputLabel>
                <Select
                  value={selectedTerm}
                  label="Select Term"
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  sx={{ borderRadius: 2.5 }}
                >
                  {terms.map((term) => (
                    <MenuItem key={term.id} value={term.id}>{term.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {hasRole('Admin', 'Teacher') && (
              <>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Select Class</InputLabel>
                    <Select
                      value={selectedClass}
                      label="Select Class"
                      onChange={(e) => setSelectedClass(e.target.value)}
                      sx={{ borderRadius: 2.5 }}
                    >
                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>{cls.displayName || cls.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Select Student</InputLabel>
                    <Select
                      value={selectedStudent}
                      label="Select Student"
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      sx={{ borderRadius: 2.5 }}
                      disabled={!selectedClass}
                    >
                      {students.map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            <Grid item xs={12} md={hasRole('Admin', 'Teacher') ? 12 : 6}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Assessment />}
                onClick={handleGenerateReport}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                  borderRadius: 2.5,
                }}
              >
                Generate Report Card
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {reportCards.length > 0 && (
        <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)', overflow: 'hidden' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 3 }}>
              Generated Report Cards
            </Typography>
            {reportCards.map((card) => (
              <Box key={card.id} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(111, 175, 143, 0.1)', mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{card.studentName}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>{card.class} - {card.term}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#6FAF8F' }}>{card.averageScore}%</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>Average</Typography>
                    </Box>
                    <Chip label={`Grade: ${card.grade}`} sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600 }} />
                    <StatusBadge status={card.status} />
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdf />}
                  size="small"
                  sx={{ borderColor: '#6FAF8F', color: '#6FAF8F', borderRadius: 2 }}
                >
                  Download PDF
                </Button>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ReportCardList;
