
import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { Download, Save, ArrowBack } from '@mui/icons-material';
import ResultSheet from '../../components/ui/ResultSheet';
import PrimaryResultSheet from '../../components/ui/PrimaryResultSheet';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { adminAPI } from '../../services/api';

const isPrimaryLevel = (data) => {
  const classInfo = data?.Class || data?.class || {};
  const className = (data?.Student?.className || data?.student?.className || classInfo?.name || '').toLowerCase();
  const schoolLevel = (classInfo.schoolLevel || classInfo.SchoolLevel || '').toLowerCase();
  const primaryLevels = ['primary', 'nursery', 'creche', 'daycare', 'kg', 'kindergarten'];
  if (primaryLevels.some(l => schoolLevel.includes(l))) return true;
  if (/\b(jss|sss?|secondary)\b/i.test(className)) return false;
  if (/\b(primary|nursery|kg|creche)\b/i.test(className)) return true;
  return false;
};

const ResultSheetPage = () => {
  const { studentId, termId } = useParams();
  const navigate = useNavigate();
  const resultSheetRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resultData, setResultData] = useState(null);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const includeUnpublished = true;
      const response = await adminAPI.results.getByStudentAndTerm(studentId, termId, includeUnpublished);
      if (response.data?.success) {
        const results = response.data.data || [];
        if (results.length > 0) {
          setResultData(results[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching result:', err);
      setMessage({ type: 'error', text: 'Failed to load result data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && termId) {
      fetchResult();
    } else {
      setLoading(false);
    }
  }, [studentId, termId]);

  const usePrimaryTemplate = resultData ? isPrimaryLevel(resultData) : false;

  const handleDownloadPDF = async () => {
    if (!resultSheetRef.current) {
      setMessage({ type: 'error', text: 'No result sheet to download' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
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
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Result_Sheet_${Date.now()}.pdf`);
      setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
    } catch (err) {
      console.error('Error generating PDF:', err);
      setMessage({ type: 'error', text: 'Failed to generate PDF' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (data) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await adminAPI.results.create(data);
      setMessage({ type: 'success', text: 'Result saved successfully!' });
    } catch (err) {
      console.error('Error saving result:', err);
      setMessage({ type: 'error', text: 'Failed to save result' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mr: 'auto', bgcolor: '#757575', '&:hover': { bgcolor: '#616161' } }}>
          Back
        </Button>
        <Button variant="contained" startIcon={<Download />} onClick={handleDownloadPDF} disabled={saving || !resultData} sx={{ bgcolor: '#15803d', '&:hover': { bgcolor: '#166534' } }}>
          Download PDF
        </Button>
        <Button variant="contained" startIcon={<Save />} onClick={() => handleSave(resultData)} disabled={saving || !resultData} sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}>
          Save Result
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {resultData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          {usePrimaryTemplate ? (
            <PrimaryResultSheet ref={resultSheetRef} data={resultData} readOnly={false} />
          ) : (
            <ResultSheet ref={resultSheetRef} data={resultData} readOnly={false} />
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ color: '#757575' }}>
            No result data found. Please select a student and term.
          </Typography>
        </Box>
      )}

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
        }
        @page { size: A4; margin: 0; }
      `}</style>
    </Box>
  );
};

export default ResultSheetPage;
