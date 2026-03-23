import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Print,
} from '@mui/icons-material';
import { resultsAPI, academicYearsAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useRef } from 'react';

const CumulativeResult = () => {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const academicYearId = searchParams.get('academicYearId');
  const navigate = useNavigate();
  const printRef = useRef();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cumulativeResults, setCumulativeResults] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (studentId && academicYearId) {
      fetchCumulativeResults();
      fetchAcademicYear();
    }
  }, [studentId, academicYearId]);

  const fetchAcademicYear = async () => {
    try {
      const response = await academicYearsAPI.getById(academicYearId);
      if (response.data?.success) {
        setAcademicYear(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching academic year:', err);
    }
  };

  const fetchCumulativeResults = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await resultsAPI.getCumulative(studentId, academicYearId);
      if (response.data?.success) {
        setCumulativeResults(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to load cumulative results');
      }
    } catch (err) {
      console.error('Error fetching cumulative results:', err);
      setError('Error loading cumulative results');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Cumulative_Result_${cumulativeResults?.student?.firstName || 'Student'}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Cumulative Result"
        subtitle={cumulativeResults?.student ? `${cumulativeResults.student.firstName} ${cumulativeResults.student.lastName}` : 'Student'}
        actionText="Back to Promotions"
        onAction={() => navigate('/admin-dashboard/promotions')}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {cumulativeResults && (
        <>
          {/* Download Button */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handleDownloadPDF}
              disabled={downloading}
              sx={{ bgcolor: '#6FAF8F', '&:hover': { bgcolor: '#5FA08A' } }}
            >
              {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </Box>

          {/* Printable Content */}
          <Box ref={printRef} sx={{ bgcolor: 'white', p: 3 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: '2px solid #6FAF8F' }}>
              <Typography variant="h4" fontWeight={700} color="#1B5E20">
                300 ARUNDEL LEARNING CENTRE
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Cumulative Result - {academicYear?.name || 'Academic Year'}
              </Typography>
            </Box>

            {/* Student Info */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Student Name:</strong> {cumulativeResults.student?.firstName} {cumulativeResults.student?.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Student No:</strong> {cumulativeResults.student?.studentNumber || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Class:</strong> {cumulativeResults.class?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Position in Class:</strong> {cumulativeResults.positionInClass || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Term Percentages */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: 2, bgcolor: '#E3F2FD', textAlign: 'center' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" color="#1565C0" fontWeight={600}>First Term</Typography>
                    <Typography variant="h4" fontWeight={700} color="#1565C0">
                      {cumulativeResults.firstTermOverallPercentage?.toFixed(1) ?? '-'}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: 2, bgcolor: '#FFF3E0', textAlign: 'center' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" color="#E65100" fontWeight={600}>Second Term</Typography>
                    <Typography variant="h4" fontWeight={700} color="#E65100">
                      {cumulativeResults.secondTermOverallPercentage?.toFixed(1) ?? '-'}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ borderRadius: 2, bgcolor: '#E8F5E9', textAlign: 'center' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" color="#2E7D32" fontWeight={600}>Third Term</Typography>
                    <Typography variant="h4" fontWeight={700} color="#2E7D32">
                      {cumulativeResults.thirdTermOverallPercentage?.toFixed(1) ?? '-'}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Cumulative Average - Main Display */}
            <Card sx={{ borderRadius: 2, mb: 4, border: '3px solid #6FAF8F', bgcolor: '#F5F9F6' }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="#6FAF8F" fontWeight={600}>
                  CUMULATIVE AVERAGE
                </Typography>
                <Typography variant="h2" fontWeight={800} color="#2E7D32">
                  {cumulativeResults.cumulativeAveragePercentage?.toFixed(1) ?? '-'}%
                </Typography>
              </CardContent>
            </Card>

            {/* Subject Results Table */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Subject Results</Typography>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', bgcolor: '#6FAF8F', color: 'white', p: 1.5, fontWeight: 600 }}>
                  <Box sx={{ flex: 2 }}>Subject</Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>1st Term</Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>2nd Term</Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>3rd Term</Box>
                  <Box sx={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>Cumulative</Box>
                  <Box sx={{ flex: 0.5, textAlign: 'center' }}>Grade</Box>
                </Box>
                {cumulativeResults.subjectResults?.map((subject, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      p: 1.5,
                      borderTop: idx > 0 ? '1px solid #e0e0e0' : 'none',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <Box sx={{ flex: 2, fontWeight: 600 }}>{subject.subjectName}</Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      {subject.firstTermPercentage !== null ? `${subject.firstTermPercentage?.toFixed(1)}%` : '-'}
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      {subject.secondTermPercentage !== null ? `${subject.secondTermPercentage?.toFixed(1)}%` : '-'}
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      {subject.thirdTermPercentage !== null ? `${subject.thirdTermPercentage?.toFixed(1)}%` : '-'}
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center', fontWeight: 700, color: '#6FAF8F' }}>
                      {subject.cumulativePercentage?.toFixed(1) ?? '-'}%
                    </Box>
                    <Box sx={{ flex: 0.5, textAlign: 'center' }}>
                      <Chip
                        label={subject.cumulativeGradeLetter || '-'}
                        size="small"
                        sx={{
                          bgcolor: subject.cumulativeGradeLetter === 'A' ? '#4CAF50' :
                            subject.cumulativeGradeLetter === 'B' ? '#2196F3' :
                              subject.cumulativeGradeLetter === 'F' ? '#F44336' : '#9E9E9E',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Comments */}
            {(cumulativeResults.teacherRemarks || cumulativeResults.headmasterComment) && (
              <Box sx={{ mb: 4 }}>
                {cumulativeResults.teacherRemarks && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: '#E3F2FD', borderRadius: 1, borderLeft: '4px solid #1565C0' }}>
                    <Typography variant="body2" fontWeight={600} color="#1565C0">Teacher's Remark:</Typography>
                    <Typography variant="body2" fontStyle="italic">"{cumulativeResults.teacherRemarks}"</Typography>
                  </Box>
                )}
                {cumulativeResults.headmasterComment && (
                  <Box sx={{ p: 2, bgcolor: '#E8F5E9', borderRadius: 1, borderLeft: '4px solid #2E7D32' }}>
                    <Typography variant="body2" fontWeight={600} color="#2E7D32">Headmaster's Comment:</Typography>
                    <Typography variant="body2" fontStyle="italic">"{cumulativeResults.headmasterComment}"</Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Footer */}
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="textSecondary">
                {cumulativeResults.isPublished ? 'Published' : 'Not Yet Published'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                300 Arundel Learning Centre | Generated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {!loading && !cumulativeResults && !error && (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="textSecondary">
            No cumulative results found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Make sure to calculate cumulative results first from the Promotions page.
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default CumulativeResult;
