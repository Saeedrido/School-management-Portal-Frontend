import React, { useRef, useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { Download, Save } from '@mui/icons-material';
import ResultSheet from '../../components/ui/ResultSheet';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { adminAPI } from '../../services/api';

const ResultSheetPage = () => {
  const resultSheetRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleDownloadPDF = async () => {
    if (!resultSheetRef.current) return;
    
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const element = resultSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: 1123, // A4 height in pixels at 96 DPI
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
      pdf.save(`Result_Sheet_${Date.now()}.pdf`);
      
      setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
    } catch (err) {
      console.error('Error generating PDF:', err);
      setMessage({ type: 'error', text: 'Failed to generate PDF' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (resultData) => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await adminAPI.results.create(resultData);
      setMessage({ type: 'success', text: 'Result saved successfully!' });
    } catch (err) {
      console.error('Error saving result:', err);
      setMessage({ type: 'error', text: 'Failed to save result' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Action Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleDownloadPDF}
          disabled={saving}
          sx={{
            bgcolor: '#15803d',
            '&:hover': { bgcolor: '#166534' },
          }}
        >
          Download PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={() => handleSave?.()}
          disabled={saving}
          sx={{
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' },
          }}
        >
          Save Result
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      {/* Result Sheet */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Box
          ref={resultSheetRef}
          sx={{
            bgcolor: '#fff',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          }}
        >
          <ResultSheet readOnly={false} />
        </Box>
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
        }
        @page {
          size: A4;
          margin: 0;
        }
      `}</style>
    </Box>
  );
};

export default ResultSheetPage;