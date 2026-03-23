import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
  Chip,
  Grid,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  School,
  Person,
  CheckCircle,
  Cancel,
  Image,
  PictureAsPdf,
  Print,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import ResultDownloadTemplate from '../../components/ui/ResultDownloadTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ParentStudentResult = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { studentId } = useParams();
  
  const effectiveStudentId = studentId;
  
  const [loading, setLoading] = useState(true);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [result, setResult] = useState(null);
  const [cumulativeResult, setCumulativeResult] = useState(null);
  const [isThirdTerm, setIsThirdTerm] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const downloadTemplateRef = useRef(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetchAvailableTerms();
  }, [effectiveStudentId]);

  useEffect(() => {
    if (selectedTerm && availableTerms.length > 0) {
      fetchResult();
    }
  }, [selectedTerm, availableTerms]);

  const fetchAvailableTerms = async () => {
    if (!effectiveStudentId || effectiveStudentId === 'undefined') {
      console.error('Student ID is undefined or invalid:', effectiveStudentId);
      setError('Student not found. Please select a child from the children page.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching terms for student ID:', effectiveStudentId);
      const response = await adminAPI.results.getStudentAvailableTerms(effectiveStudentId);
      console.log('Available terms response:', response);
      if (response.data && response.data.success) {
        const terms = response.data.data.AvailableTerms || response.data.data.availableTerms || [];
        setAvailableTerms(terms);
        if (terms.length > 0) {
          setSelectedTerm(terms[0].termId);
        }
      }
    } catch (err) {
      console.error('Error fetching available terms:', err);
      setError('Failed to load available terms');
    } finally {
      setLoading(false);
    }
  };

const fetchResult = async () => {
    if (!effectiveStudentId || !selectedTerm) return;
    setResultLoading(true);
    setNoResult(false);
    setResult(null);
    setCumulativeResult(null);
    
    // Check if selected term is Third Term
    const termData = availableTerms.find(t => t.termId === selectedTerm);
    const isThird = termData?.termName?.toLowerCase().includes('third') || termData?.termType === 3;
    setIsThirdTerm(isThird);
    
    // Get academic year ID for cumulative results
    const academicYearId = termData?.academicYearId;
    
    try {
      if (isThird && academicYearId) {
        // Fetch cumulative result for Third Term
        const cumulativeResponse = await adminAPI.results.getCumulative(effectiveStudentId, academicYearId);
        console.log('Cumulative result response:', cumulativeResponse);
        if (cumulativeResponse.data && cumulativeResponse.data.success && cumulativeResponse.data.data) {
          setCumulativeResult(cumulativeResponse.data.data);
          // Extract student info from cumulative result
          if (cumulativeResponse.data.data.student) {
            setStudent({
              firstName: cumulativeResponse.data.data.student.firstName || '',
              lastName: cumulativeResponse.data.data.student.lastName || '',
              studentNumber: cumulativeResponse.data.data.student.studentNumber || '',
            });
          }
        } else {
          setNoResult(true);
        }
      } else {
        // Fetch regular term result
        const response = await adminAPI.results.getByStudentAndTerm(effectiveStudentId, selectedTerm);
        console.log('Result response:', response);
        if (response.data && response.data.success && response.data.data) {
          const resultData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
          setResult(resultData);
          
          // Extract student info
          if (resultData?.Student) {
            setStudent({
              firstName: resultData.Student.firstName || resultData.Student.FirstName || '',
              lastName: resultData.Student.lastname || resultData.Student.LastName || '',
              studentNumber: resultData.Student.studentNumber || resultData.Student.StudentNumber || '',
            });
          }
        } else {
          setNoResult(true);
        }
      }
    } catch (err) {
      console.error('Error fetching result:', err);
      setNoResult(true);
    } finally {
      setResultLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!downloadTemplateRef.current || downloading) return;
    
    setDownloading(true);
    try {
      const element = downloadTemplateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `Result_${student?.firstName || 'Student'}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!downloadTemplateRef.current || downloading) return;
    
    setDownloading(true);
    try {
      const element = downloadTemplateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
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
      pdf.save(`Result_${student?.firstName || 'Student'}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': '#4CAF50',
      'B': '#8BC34A',
      'C': '#FFC107',
      'D': '#FF9800',
      'F': '#F44336',
    };
    return colors[grade] || '#9E9E9E';
  };

  const getGradeBgColor = (grade) => {
    const colors = {
      'A': '#E8F5E9',
      'B': '#F1F8E9',
      'C': '#FFF8E1',
      'D': '#FFF3E0',
      'F': '#FFEBEE',
    };
    return colors[grade] || '#F5F5F5';
  };

  const selectedTermData = availableTerms.find(t => t.termId === selectedTerm);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#f5f5f5', p: 4 }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', mt: 8 }}>
          <Card sx={{ borderRadius: 3, p: 4 }}>
            <Cancel sx={{ fontSize: 60, color: '#F44336', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#333', mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/parent-dashboard/children')}
              sx={{ mt: 2, bgcolor: '#6FAF8F' }}
            >
              Go to Children Page
            </Button>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/parent-dashboard/children')}
            sx={{ color: '#2E7D32' }}
          >
            Back to Children
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {result && (
            <>
              <Button
                variant="outlined"
                startIcon={downloading ? <CircularProgress size={18} /> : <Image />}
                onClick={handleDownloadImage}
                disabled={downloading}
                sx={{
                  color: '#1976D2',
                  borderColor: '#1976D2',
                  mr: 1,
                  '&:hover': { borderColor: '#1565C0', bgcolor: '#E3F2FD' },
                }}
              >
                Image
              </Button>
              <Button
                variant="outlined"
                startIcon={downloading ? <CircularProgress size={18} /> : <PictureAsPdf />}
                onClick={handleDownloadPdf}
                disabled={downloading}
                sx={{
                  color: '#D32F2F',
                  borderColor: '#D32F2F',
                  mr: 1,
                  '&:hover': { borderColor: '#B71C1C', bgcolor: '#FFEBEE' },
                }}
              >
                PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<Print />}
                onClick={() => window.print()}
                sx={{
                  bgcolor: '#2E7D32',
                  '&:hover': { bgcolor: '#1B5E20' },
                }}
              >
                Print
              </Button>
            </>
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#2E7D32',
            mb: 3,
          }}
        >
          Student Result
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={selectedTermData?.academicYearId || ''}
                    label="Academic Year"
                    disabled
                  >
                    {[...new Set(availableTerms.map(t => t.academicYearId))].map(yearId => {
                      const term = availableTerms.find(t => t.academicYearId === yearId);
                      return (
                        <MenuItem key={yearId} value={yearId}>
                          {term?.academicYearName || ''}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Term</InputLabel>
                  <Select
                    value={selectedTerm}
                    label="Term"
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {availableTerms.map((term) => (
                      <MenuItem key={term.termId} value={term.termId}>
                        {term.termName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Result or No Result */}
        {resultLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : noResult ? (
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: '#FFF3E0' }}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Cancel sx={{ fontSize: 60, color: '#FF9800', mb: 2 }} />
              <Typography variant="h5" sx={{ color: '#E65100', mb: 2 }}>
                No result available for this child yet.
              </Typography>
              <Typography variant="body1" sx={{ color: '#795548' }}>
                The result for this term has not been published yet. Please check again later.
              </Typography>
            </CardContent>
          </Card>
) : result || cumulativeResult ? (
          <>
            {/* Student Info */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#2E7D32',
                        fontSize: '2rem',
                      }}
                    >
                      {(result?.Student?.firstName?.charAt(0) || result?.Student?.FirstName?.charAt(0) || cumulativeResult?.student?.firstName?.charAt(0) || 'S')}
                    </Avatar>
                  </Grid>
                  <Grid size={{ xs: true }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#1B5E20' }}>
                      {result?.Student ? `${result.Student.firstName || result.Student.FirstName || ''} ${result.Student.lastName || result.Student.LastName || ''}`.trim() : cumulativeResult?.student ? `${cumulativeResult.student.firstName || ''} ${cumulativeResult.student.lastName || ''}`.trim() : 'Student'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4CAF50' }}>
                      Class: {result?.Class?.name || result?.Class?.Name || cumulativeResult?.class?.name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Academic Year: {selectedTermData?.academicYearName || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {isThirdTerm ? 'Third Term (Cumulative)' : 'Term'}: {selectedTermData?.termName || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* CUMULATIVE RESULT VIEW - Third Term */}
            {isThirdTerm && cumulativeResult && (
              <>
                {/* Term Percentages */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: 2, bgcolor: '#E3F2FD', textAlign: 'center' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" color="#1565C0" fontWeight={600}>First Term</Typography>
                        <Typography variant="h4" fontWeight={700} color="#1565C0">
                          {cumulativeResult.firstTermOverallPercentage?.toFixed(1) ?? '-'}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: 2, bgcolor: '#FFF3E0', textAlign: 'center' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" color="#E65100" fontWeight={600}>Second Term</Typography>
                        <Typography variant="h4" fontWeight={700} color="#E65100">
                          {cumulativeResult.secondTermOverallPercentage?.toFixed(1) ?? '-'}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ borderRadius: 2, bgcolor: '#E8F5E9', textAlign: 'center' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" color="#2E7D32" fontWeight={600}>Third Term</Typography>
                        <Typography variant="h4" fontWeight={700} color="#2E7D32">
                          {cumulativeResult.thirdTermOverallPercentage?.toFixed(1) ?? '-'}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Cumulative Average - Main Display */}
                <Card sx={{ borderRadius: 2, mb: 3, border: '3px solid #6FAF8F', bgcolor: '#F5F9F6' }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="#6FAF8F" fontWeight={600}>
                      CUMULATIVE AVERAGE
                    </Typography>
                    <Typography variant="h2" fontWeight={800} color="#2E7D32">
                      {cumulativeResult.cumulativeAveragePercentage?.toFixed(1) ?? '-'}%
                    </Typography>
                  </CardContent>
                </Card>

                {/* Subject Results Table - Cumulative */}
                <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, bgcolor: '#4CAF50', color: 'black' }}>
                      <Typography variant="h6" fontWeight={600}>Subject Results</Typography>
                    </Box>
                    <TableContainer sx={{ maxHeight: '50vh' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#4CAF50' }}>
                            <TableCell sx={{ color: 'black', fontWeight: 700 }}>Subject</TableCell>
                            <TableCell align="center" sx={{ color: 'black', fontWeight: 700 }}>1st Term %</TableCell>
                            <TableCell align="center" sx={{ color: 'black', fontWeight: 700 }}>2nd Term %</TableCell>
                            <TableCell align="center" sx={{ color: 'black', fontWeight: 700 }}>3rd Term %</TableCell>
                            <TableCell align="center" sx={{ color: 'black', fontWeight: 700 }}>Cumulative %</TableCell>
                            <TableCell align="center" sx={{ color: 'black', fontWeight: 700 }}>Grade</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {cumulativeResult.subjectResults?.map((subject, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{subject.subjectName}</TableCell>
                              <TableCell align="center">
                                {subject.firstTermPercentage !== null ? `${subject.firstTermPercentage?.toFixed(1)}%` : '-'}
                              </TableCell>
                              <TableCell align="center">
                                {subject.secondTermPercentage !== null ? `${subject.secondTermPercentage?.toFixed(1)}%` : '-'}
                              </TableCell>
                              <TableCell align="center">
                                {subject.thirdTermPercentage !== null ? `${subject.thirdTermPercentage?.toFixed(1)}%` : '-'}
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight={700} color="#6FAF8F">
                                  {subject.cumulativePercentage?.toFixed(1) ?? '-'}%
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
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
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Cumulative Remarks */}
                {(cumulativeResult.teacherRemarks || cumulativeResult.headmasterComment) && (
                  <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                        {cumulativeResult.teacherRemarks && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                              Teacher's Remark:
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#333', fontStyle: 'italic' }}>
                              "{cumulativeResult.teacherRemarks}"
                            </Typography>
                          </Box>
                        )}
                        {cumulativeResult.headmasterComment && (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                              Headmaster's Comment:
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#333', fontStyle: 'italic' }}>
                              "{cumulativeResult.headmasterComment}"
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* REGULAR TERM RESULT VIEW - First & Second Term */}
            {!isThirdTerm && result && (
              <>
                {/* Results Table */}
                <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#2E7D32' }}>
                            <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Subject</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Theory</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Objective</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Total</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Grade</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(result.subjectResults || result.SubjectResults || []).map((subject, index) => (
                            <TableRow
                              key={subject.subjectId || subject.SubjectId}
                              sx={{
                                bgcolor: index % 2 === 0 ? '#fff' : '#F5F5F5',
                                '&:hover': { bgcolor: '#E8F5E9' },
                              }}
                            >
                              <TableCell>
                                <Typography sx={{ fontWeight: 500 }}>
                                  {subject.subjectName || subject.SubjectName}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ textAlign: 'center' }}>{subject.theoryScore ?? subject.TheoryScore ?? '-'}</TableCell>
                              <TableCell sx={{ textAlign: 'center' }}>{subject.objectiveScore ?? subject.ObjectiveScore ?? '-'}</TableCell>
                              <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                                {subject.totalScore ?? subject.TotalScore ?? '-'}/{subject.maximumScore ?? subject.MaximumScore ?? '-'}
                              </TableCell>
                              <TableCell sx={{ textAlign: 'center' }}>
                                <Chip
                                  label={subject.gradeLetter || subject.GradeLetter || '-'}
                                  sx={{
                                    bgcolor: getGradeBgColor(subject.gradeLetter || subject.GradeLetter),
                                    color: getGradeColor(subject.gradeLetter || subject.GradeLetter),
                                    fontWeight: 600,
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#E8F5E9', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Total Score</Typography>
                          <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                            {result.totalScore ?? result.TotalScore ?? '-'}/{result.maximumScore ?? result.MaximumScore ?? '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#E3F2FD', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Average</Typography>
                          <Typography variant="h4" sx={{ color: '#1565C0', fontWeight: 700 }}>
                            {(result.overallPercentage ?? result.OverallPercentage ?? 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#FFF3E0', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>Overall Grade</Typography>
                          <Chip
                            label={result.overallGradeLetter ?? result.overallGrade ?? result.OverallGradeLetter ?? '-'}
                            sx={{
                              bgcolor: getGradeBgColor(result.overallGradeLetter ?? result.overallGrade ?? result.OverallGradeLetter),
                              color: getGradeColor(result.overallGradeLetter ?? result.overallGrade ?? result.OverallGradeLetter),
                              fontWeight: 700,
                              fontSize: '1.5rem',
                              height: 40,
                            }}
                          />
                        </Box>
                      </Grid>

                      {/* Remarks */}
                      {(result.teacherRemarks || result.headmasterComment) && (
                        <Grid size={{ xs: 12 }}>
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                            {result.teacherRemarks && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                                  Teacher's Remark:
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#333' }}>
                                  {result.teacherRemarks}
                                </Typography>
                              </Box>
                            )}
                            {result.headmasterComment && (
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
                                  Headmaster's Comment:
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#333' }}>
                                  {result.headmasterComment}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        ) : null}
      </Box>

      {/* Hidden Result Download Template */}
      {result && (
        <Box sx={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <ResultDownloadTemplate
            ref={downloadTemplateRef}
            result={result}
            student={student}
            term={availableTerms.find(t => t.termId === selectedTerm)}
            academicYear={{
              id: selectedTermData?.academicYearId,
              name: selectedTermData?.academicYearName || 'N/A'
            }}
            subjectResults={result.subjectResults || result.SubjectResults || []}
            totals={{
              totalObtained: result.totalScore || result.TotalScore || 0,
              totalMaximum: result.maximumScore || result.MaximumScore || 0,
              overallPercentage: result.overallPercentage || result.OverallPercentage || 0,
            }}
          />
        </Box>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default ParentStudentResult;
