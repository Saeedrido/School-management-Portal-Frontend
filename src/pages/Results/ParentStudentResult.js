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
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Cancel,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import ResultSheet from '../../components/ui/ResultSheet';
import PrimaryResultSheet from '../../components/ui/PrimaryResultSheet';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Check if result is for Primary/Nursery level
const isPrimaryLevel = (resultData) => {
  const classInfo = resultData?.Class || resultData?.class || {};
  const schoolLevel = classInfo.schoolLevel || classInfo.SchoolLevel || '';
  const primaryLevels = ['Primary', 'Nursery', 'Creche', 'Daycare'];
  return primaryLevels.some(level => 
    schoolLevel.toLowerCase().includes(level.toLowerCase())
  );
};

const ParentStudentResult = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const effectiveStudentId = studentId;
  
  const [loading, setLoading] = useState(true);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  
  const [result, setResult] = useState(null);
  const [cumulativeResult, setCumulativeResult] = useState(null);
  const [isThirdTerm, setIsThirdTerm] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [student, setStudent] = useState(null);
  const [selectedAcademicYearData, setSelectedAcademicYearData] = useState(null);

  useEffect(() => {
    fetchAvailableTerms();
  }, [effectiveStudentId]);

  // Fetch result when term or academic year changes
  useEffect(() => {
    if (selectedTerm && selectedAcademicYear && !resultLoading) {
      fetchResult();
    }
  }, [selectedTerm, selectedAcademicYear]);

  const fetchAvailableTerms = async () => {
    // Validate student ID
    if (!effectiveStudentId || effectiveStudentId === 'undefined' || effectiveStudentId === 'null') {
      setError('Invalid student ID. Please select a child from the children page.');
      setLoading(false);
      return;
    }
    
    // Try to parse as GUID to validate format
    const studentIdGuid = effectiveStudentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    if (!studentIdGuid) {
      console.log('Invalid student ID format:', effectiveStudentId);
      setError('Invalid student ID format. Please select a child from the children page.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      console.log('Fetching available terms for student ID:', effectiveStudentId);
      const response = await adminAPI.results.getStudentAvailableTerms(effectiveStudentId);
      console.log('Full Response:', response);
      
      // Check if response indicates error
      if (response.status === 401 || response.status === 403) {
        setError('You are not authorized to view this student\'s results');
        setLoading(false);
        return;
      }
      
      if (response.status >= 400) {
        setError('Server error: ' + response.status);
        setLoading(false);
        return;
      }
      
      const responseData = response.data;
      console.log('Response data:', responseData);
      
      // Check if it's an error response
      if (responseData && responseData.success === false) {
        setError(responseData.message || 'Failed to load results');
        setLoading(false);
        return;
      }
      
      // Extract terms from different response structures
      let terms = [];
      if (responseData?.data?.AvailableTerms) {
        terms = responseData.data.AvailableTerms;
      } else if (responseData?.AvailableTerms) {
        terms = responseData.AvailableTerms;
      } else if (responseData?.data?.availableTerms) {
        terms = responseData.data.availableTerms;
      } else if (responseData?.availableTerms) {
        terms = responseData.availableTerms;
      }
      
      console.log('Extracted terms:', terms);
      
      // If still empty, show appropriate message
      if (terms.length === 0) {
        setError('No results available for this student. Please check with the school.');
        setLoading(false);
        return;
      }
      
      setAvailableTerms(terms);
      
      // Group terms by academic year
      const yearsMap = new Map();
      terms.forEach(term => {
        const yearId = term.academicYearId || term.AcademicYearId;
        const yearName = term.academicYearName || term.AcademicYearName || 'Unknown Year';
        if (yearId && !yearsMap.has(yearId)) {
          yearsMap.set(yearId, { id: yearId, name: yearName });
        }
      });
      const years = Array.from(yearsMap.values());
      console.log('Academic years:', years);
      setAcademicYears(years);
      
      // Set initial selections
      if (terms.length > 0) {
        const firstTerm = terms[0];
        const yearId = firstTerm.academicYearId || firstTerm.AcademicYearId;
        const yearName = firstTerm.academicYearName || firstTerm.AcademicYearName || 'Unknown Year';
        setSelectedAcademicYear(yearId);
        setSelectedAcademicYearData({ id: yearId, name: yearName });
        setSelectedTerm(firstTerm.termId || firstTerm.TermId);
      }
    } catch (err) {
      console.error('Error fetching available terms:', err);
      setError('Failed to load available terms: ' + (err.message || 'Unknown error'));
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
    
    const academicYearId = termData?.academicYearId;
    
    try {
      if (isThird && academicYearId) {
        // Fetch cumulative result for Third Term
        const cumulativeResponse = await adminAPI.results.getCumulative(effectiveStudentId, academicYearId);
        if (cumulativeResponse.data && cumulativeResponse.data.success && cumulativeResponse.data.data) {
          const cumData = cumulativeResponse.data.data;
          // Add class info from cumulative data
          if (cumData.className) {
            setStudent(prev => ({ ...prev, className: cumData.className }));
          }
          setCumulativeResult({
            ...cumData,
            className: cumData.class?.name || cumData.className || '',
            classAverage: cumData.classAverage || null,
          });
          if (cumData.student) {
            setStudent(prev => ({ 
              ...prev, 
              firstName: cumData.student.firstName || '',
              lastName: cumData.student.lastName || '',
              studentNumber: cumData.student.studentNumber || '',
              className: cumData.class?.name || cumData.className || '',
            }));
          }
        } else {
          setNoResult(true);
        }
      } else {
        // Fetch regular term result
        const response = await adminAPI.results.getByStudentAndTerm(effectiveStudentId, selectedTerm);
        console.log('Result API response:', response);
        console.log('Result data:', response.data);
        if (response.data && response.data.success && response.data.data) {
          const resultData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
          console.log('ResultData:', resultData);
          console.log('Term data in resultData:', resultData.Term);
          // Calculate CA + Exam for each subject row
          if (resultData.SubjectResults) {
            resultData.SubjectResults = resultData.SubjectResults.map(sr => ({
              ...sr,
              // Add calculated total (CA + Exam)
              CalculatedTotal: (sr.TestScore || 0) + (sr.ObjectiveScore || 0) + (sr.TheoryScore || 0)
            }));
          }
          // Add result totals for summary section
          resultData.resultTotalScore = resultData.SubjectResults?.reduce((sum, sr) => 
            sum + ((sr.TestScore || 0) + (sr.ObjectiveScore || 0) + (sr.TheoryScore || 0)), 0) || 0;
          resultData.resultClassAverage = resultData.classAverage || null;
          setResult(resultData);
          if (resultData?.Student) {
            setStudent({
              firstName: resultData.Student.firstName || resultData.Student.FirstName || '',
              lastName: resultData.Student.lastname || resultData.Student.LastName || '',
              studentNumber: resultData.Student.studentNumber || resultData.Student.StudentNumber || '',
              className: resultData.Class?.name || resultData.Student.className || '',
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

  const resultSheetRef = useRef(null);
  
  const handleDownloadPdf = async () => {
    if (!resultSheetRef.current || downloading) return;
    setDownloading(true);
    try {
      const element = resultSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
        windowHeight: 1123,
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Result_${student?.firstName || student?.lastName || 'Student'}_${selectedTermData?.termName || 'Result'}.pdf`);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
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
    <Box sx={{ minHeight: '100vh', background: '#f5f5f5', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/parent-dashboard/children')}
          sx={{ color: '#2E7D32', mb: 2 }}
        >
          Back to Children
        </Button>

        {/* Title */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32', mb: 4, textAlign: 'center' }}>
          Student Result
        </Typography>

        {/* Academic Year and Term Selection */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={selectedAcademicYear}
                    label="Academic Year"
                    onChange={(e) => {
                      setSelectedAcademicYear(e.target.value);
                      // Reset term when year changes
                      const yearTerms = availableTerms.filter(t => t.academicYearId === e.target.value);
                      if (yearTerms.length > 0) {
                        setSelectedTerm(yearTerms[0].termId);
                      }
                    }}
                  >
                    {academicYears.map(year => (
                      <MenuItem key={year.id} value={year.id}>
                        {year.name}
                      </MenuItem>
                    ))}
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
                    {availableTerms
                      .filter(t => t.academicYearId === selectedAcademicYear)
                      .map(term => (
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

        {/* Result Display Area */}
        {resultLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            {/* If result exists - show ResultSheet */}
            {(result || cumulativeResult) && !noResult ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    sx={{
                      bgcolor: '#15803d',
                      '&:hover': { bgcolor: '#166534' },
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    Download Result Sheet
                  </Button>
                </Box>
                
                {/* Result Sheet Preview */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box ref={resultSheetRef}>
                    {isPrimaryLevel(result || cumulativeResult) ? (
                      <PrimaryResultSheet 
                        data={result || cumulativeResult} 
                        readOnly={true}
                      />
                    ) : (
                      <ResultSheet 
                        data={result || cumulativeResult} 
                        readOnly={true}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            ) : (
              // No result
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: '#FFF3E0', py: 6 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Cancel sx={{ fontSize: 60, color: '#FF9800', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: '#E65100', mb: 2 }}>
                    No Result Available
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#795548' }}>
                    No result available for {selectedTermData?.termName || 'this term'}.
                    <br />
                    Please check again later.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        
      </Box>
    </Box>
  );
};

export default ParentStudentResult;