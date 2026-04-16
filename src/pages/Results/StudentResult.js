import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  School,
  CalendarMonth,
  Print,
  EmojiEvents,
  Image,
  PictureAsPdf,
} from '@mui/icons-material';
import { adminAPI, teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ResultDownloadTemplate from '../../components/ui/ResultDownloadTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const StudentResult = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const location = useLocation();
  const { hasRole } = useAuth();

  const basePath = hasRole('Admin') ? '/admin-dashboard' : '/teacher-dashboard';
  
  const isTeacher = hasRole('Teacher');
  
  // Use teacherAPI for teachers, adminAPI for admins
  const resultsAPI = isTeacher ? teacherAPI : adminAPI;

  // Get termId from query params
  const searchParams = new URLSearchParams(location.search);
  const termIdFromQuery = searchParams.get('termId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultList, setResultList] = useState([]);
  const [student, setStudent] = useState(null);
  const [term, setTerm] = useState(null);
  const [academicYear, setAcademicYear] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const downloadTemplateRef = useRef(null);

  const handleDownloadImage = async () => {
    if (!downloadTemplateRef.current || downloading) {
      console.error('Download error: Ref is null or downloading');
      return;
    }
    
    setDownloading(true);
    try {
      const element = downloadTemplateRef.current;
      console.log('Capturing element:', element);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true,
      });
      console.log('Canvas created:', canvas);
      
      const link = document.createElement('a');
      link.download = `Result_${student?.firstName || 'Student'}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      console.log('Download triggered');
      link.click();
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!downloadTemplateRef.current || downloading) {
      console.error('Download error: Ref is null or downloading');
      return;
    }
    
    setDownloading(true);
    try {
      const element = downloadTemplateRef.current;
      console.log('Capturing element for PDF:', element);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true,
      });
      console.log('Canvas created for PDF:', canvas);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      console.log('Adding image to PDF, dimensions:', pdfWidth, pdfHeight);
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      console.log('PDF created, saving...');
      pdf.save(`Result_${student?.firstName || 'Student'}_${Date.now()}.pdf`);
      console.log('PDF download triggered');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (studentId && termIdFromQuery) {
      fetchStudentResult();
    } else if (studentId) {
      setError('Term ID is required');
      setLoading(false);
    }
  }, [studentId, termIdFromQuery]);

  const fetchStudentResult = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch student results using ResultController endpoint ONLY
      // This endpoint returns student info along with results
      const response = await resultsAPI.results.getByStudentAndTerm(studentId, termIdFromQuery);

      if (response.data?.success) {
        const results = response.data.data || [];
        setResultList(results);

        if (results.length > 0) {
          const firstResult = results[0];
          
          // Extract student info from the result (provided by ResultsController)
          if (firstResult.student) {
            setStudent(firstResult.student);
          } else if (firstResult.Student) {
            setStudent(firstResult.Student);
          }
          
          // Extract term info
          if (firstResult.term) {
            setTerm(firstResult.term);
          } else if (firstResult.Term) {
            setTerm(firstResult.Term);
          }
          
          // Extract academic year info
          if (firstResult.academicYear) {
            setAcademicYear(firstResult.academicYear);
          } else if (firstResult.AcademicYear) {
            setAcademicYear(firstResult.AcademicYear);
          }
        }
      } else {
        setError(response.data?.message || 'No results found for this student');
      }
    } catch (err) {
      console.error('Error fetching student result:', err);
      setError('Failed to fetch student result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get nested value with case-insensitive keys
  const getValue = (obj, ...keys) => {
    if (!obj) return null;
    for (const key of keys) {
      if (obj[key] !== undefined) return obj[key];
      // Try lowercase
      const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
      if (obj[lowerKey] !== undefined) return obj[lowerKey];
      // Try original case from backend (PascalCase)
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      if (obj[pascalKey] !== undefined) return obj[pascalKey];
    }
    return null;
  };

  const getGradeColor = (grade) => {
    if (!grade) return { bgcolor: '#F5F5F5', color: '#757575' };
    const firstChar = grade.toUpperCase().charAt(0);
    if (['A'].includes(firstChar)) return { bgcolor: '#E8F5E9', color: '#2E7D32' };
    if (['B'].includes(firstChar)) return { bgcolor: '#E3F2FD', color: '#1565C0' };
    if (['C'].includes(firstChar)) return { bgcolor: '#FFF3E0', color: '#F57C00' };
    if (['D'].includes(firstChar)) return { bgcolor: '#FFEBEE', color: '#C62828' };
    if (['F'].includes(firstChar)) return { bgcolor: '#FFEBEE', color: '#C62828' };
    return { bgcolor: '#F5F5F5', color: '#757575' };
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 70) return { color: '#2E7D32', bgcolor: '#E8F5E9', label: 'Excellent' };
    if (percentage >= 60) return { color: '#1976D2', bgcolor: '#E3F2FD', label: 'Good' };
    if (percentage >= 50) return { color: '#F57C00', bgcolor: '#FFF3E0', label: 'Fair' };
    if (percentage >= 40) return { color: '#F57C00', bgcolor: '#FFF3E0', label: 'Pass' };
    return { color: '#C62828', bgcolor: '#FFEBEE', label: 'Needs Improvement' };
  };

  const handlePrint = () => {
    window.print();
  };

  // Get the first result (should only be one per student per term)
  const result = resultList.length > 0 ? resultList[0] : null;

  // Get subject results - handle both camelCase and PascalCase
  const subjectResults = result 
    ? (result.subjectResults || result.SubjectResults || [])
    : [];

  // Calculate totals
  const calculateTotal = () => {
    if (!subjectResults || subjectResults.length === 0) return { totalObtained: 0, totalMaximum: 0, overallPercentage: 0 };
    
    const totalObtained = subjectResults.reduce((sum, sr) => sum + (getValue(sr, 'totalScore') || 0), 0);
    const totalMaximum = subjectResults.reduce((sum, sr) => sum + (getValue(sr, 'maximumScore') || 0), 0);
    const overallPercentage = totalMaximum > 0 ? (totalObtained / totalMaximum) * 100 : 0;
    
    return { totalObtained, totalMaximum, overallPercentage };
  };

  const { totalObtained, totalMaximum, overallPercentage } = calculateTotal();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  // Build student name from student object or result
  let studentName = 'Unknown Student';
  let studentNumber = 'N/A';
  
  if (student) {
    studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student';
    studentNumber = student.studentNumber || student.admissionNumber || 'N/A';
  } else if (result) {
    // Try to get from result.Student
    const studentData = result.student || result.Student;
    if (studentData) {
      studentName = `${getValue(studentData, 'firstName') || ''} ${getValue(studentData, 'lastName') || ''}`.trim() || 'Unknown Student';
      studentNumber = getValue(studentData, 'studentNumber') || getValue(studentData, 'admissionNumber') || 'N/A';
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F5F7FA 0%, #E8F5E9 100%)',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <IconButton 
            onClick={() => navigate(`${basePath}/results`)}
            sx={{ 
              bgcolor: '#2E7D32', 
              color: 'white',
              '&:hover': { bgcolor: '#1B5E20' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1B5E20' }}>
              Student Result
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={downloading ? <CircularProgress size={18} /> : <Image />}
            onClick={handleDownloadImage}
            disabled={downloading || !result}
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
            disabled={downloading || !result}
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
            onClick={handlePrint}
            sx={{
              bgcolor: '#2E7D32',
              '&:hover': { bgcolor: '#1B5E20' },
            }}
          >
            Print
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Report Card */}
        {!error && result && (
          <Paper
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            }}
          >
            {/* Report Card Header - Green Theme */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                p: { xs: 3, sm: 4 },
                color: 'white',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {studentName}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School sx={{ fontSize: 20, opacity: 0.8 }} />
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {studentNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonth sx={{ fontSize: 20, opacity: 0.8 }} />
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {term?.name || term?.Name || 'N/A'}
                      </Typography>
                    </Box>
                    {academicYear && (
                      <Chip 
                        label={academicYear.name || academicYear.Name || 'N/A'}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  {result.positionInClass || result.PositionInClass ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                      <EmojiEvents sx={{ fontSize: 32, color: '#FFD700' }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Position: {result.positionInClass || result.PositionInClass}
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}
                </Grid>
              </Grid>
            </Box>

            {/* Results Table */}
            <TableContainer sx={{ p: 0 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#E8F5E9' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>
                      Subject
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>
                      Objective Score
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>
                      Theory Score
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>
                      Test Score
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>
                      Total
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>
                      Percentage
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#1B5E20', borderBottom: '2px solid #2E7D32' }}>
                      Grade
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjectResults && subjectResults.length > 0 ? (
                    subjectResults.map((subjectResult, index) => {
                      const objectiveScore = getValue(subjectResult, 'objectiveScore') || getValue(subjectResult, 'ObjectiveScore') || 0;
                      const theoryScore = getValue(subjectResult, 'theoryScore') || getValue(subjectResult, 'TheoryScore') || 0;
                      const testScore = getValue(subjectResult, 'testScore') || getValue(subjectResult, 'TestScore') || 0;
                      const totalScore = getValue(subjectResult, 'totalScore') || getValue(subjectResult, 'TotalScore') || 0;
                      const maximumScore = getValue(subjectResult, 'maximumScore') || getValue(subjectResult, 'MaximumScore') || 0;
                      const percentage = getValue(subjectResult, 'percentage') || getValue(subjectResult, 'Percentage') || 0;
                      const gradeLetter = getValue(subjectResult, 'gradeLetter') || getValue(subjectResult, 'GradeLetter') || 'N/A';
                      const subjectName = getValue(subjectResult, 'subjectName') || getValue(subjectResult, 'SubjectName') || 'Unknown Subject';
                      
                      const percentageColor = getPercentageColor(percentage);
                      const gradeColor = getGradeColor(gradeLetter);
                      
                      return (
                        <TableRow 
                          key={getValue(subjectResult, 'subjectId') || getValue(subjectResult, 'SubjectId') || index}
                          sx={{ 
                            background: index % 2 === 0 ? 'white' : '#FAFAFA',
                            '&:hover': { background: '#F5F7FA' }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: '#333' }}>
                            {subjectName}
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#555' }}>
                            {objectiveScore}
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#555' }}>
                            {theoryScore}
                          </TableCell>
                          <TableCell align="center" sx={{ color: '#555' }}>
                            {testScore}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: '#1B5E20' }}>
                            {totalScore} / {maximumScore}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${percentage.toFixed(0)}%`}
                              size="small"
                              sx={{
                                bgcolor: percentageColor.bgcolor,
                                color: percentageColor.color,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={gradeLetter}
                              size="small"
                              sx={{
                                bgcolor: gradeColor.bgcolor,
                                color: gradeColor.color,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#78909C' }}>
                          No subject results found. The student may not have completed any exams yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary Section */}
            <Box sx={{ p: 3, background: '#F5F7FA' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 3, border: '2px solid #2E7D32' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#78909C', mb: 1 }}>
                        Total Score
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1B5E20' }}>
                        {totalObtained} / {totalMaximum}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 3, border: '2px solid #2E7D32' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#78909C', mb: 1 }}>
                        Overall Percentage
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1B5E20' }}>
                        {overallPercentage.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 3, border: '2px solid #2E7D32' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#78909C', mb: 1 }}>
                        Overall Grade
                      </Typography>
                      <Chip
                        label={result.overallGradeLetter || result.OverallGradeLetter || 'N/A'}
                        sx={{
                          bgcolor: getGradeColor(result.overallGradeLetter || result.OverallGradeLetter).bgcolor,
                          color: getGradeColor(result.overallGradeLetter || result.OverallGradeLetter).color,
                          fontWeight: 700,
                          fontSize: '1.25rem',
                          height: 40,
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Performance Summary */}
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1B5E20', mb: 1 }}>
                    {overallPercentage >= 70 
                      ? 'Excellent Performance - Keep up the great work!' 
                      : overallPercentage >= 60 
                        ? 'Good Performance - Room for improvement'
                        : overallPercentage >= 50 
                          ? 'Fair Performance - Needs more effort'
                          : overallPercentage > 0
                            ? 'Performance Needs Improvement - Additional support recommended'
                            : 'No results available'}
                  </Typography>
                </Box>
              </Box>

              {/* Teacher Remarks */}
              {(result.teacherRemarks || result.TeacherRemarks) && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#E3F2FD', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565C0', mb: 1 }}>
                    Teacher's Remarks:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {result.teacherRemarks || result.TeacherRemarks}
                  </Typography>
                </Box>
              )}

              {/* Headmaster Comment */}
              {(result.headmasterComment || result.HeadmasterComment) && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#FFF3E0', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#F57C00', mb: 1 }}>
                    Headmaster's Comment:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {result.headmasterComment || result.HeadmasterComment}
                  </Typography>
                </Box>
              )}

              {/* Published Status */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Chip
                  label={result.isPublished || result.IsPublished ? 'Result Published' : 'Result Not Published'}
                  size="small"
                  sx={{
                    bgcolor: (result.isPublished || result.IsPublished) ? '#E8F5E9' : '#FFF3E0',
                    color: (result.isPublished || result.IsPublished) ? '#2E7D32' : '#F57C00',
                    fontWeight: 600,
                  }}
                />
                {(result.publishedAt || result.PublishedAt) && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#78909C' }}>
                    Published on: {new Date(result.publishedAt || result.PublishedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        )}

        {/* No Result Found */}
        {!error && !result && !loading && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h6" sx={{ color: '#78909C', mb: 1 }}>
              No Result Found
            </Typography>
            <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 3 }}>
              No results found for this student in the selected term. The student may need to complete exams first.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`${basePath}/results`)}
              sx={{
                bgcolor: '#2E7D32',
                '&:hover': { bgcolor: '#1B5E20' },
              }}
            >
              Back to Results
            </Button>
          </Paper>
        )}
      </Container>

      {/* Hidden Result Download Template */}
      <Box sx={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ResultDownloadTemplate
          ref={downloadTemplateRef}
          result={result}
          student={student}
          term={term}
          academicYear={academicYear}
          subjectResults={subjectResults}
          totals={{ totalObtained, totalMaximum, overallPercentage }}
        />
      </Box>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default StudentResult;
