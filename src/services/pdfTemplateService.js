import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

let templateBytes = null;

/**
 * Load the PDF template
 */
const loadTemplate = async () => {
  if (templateBytes) return templateBytes;
  
  try {
    const response = await fetch('/templates/clear_result_for_jss-ss.pdf');
    if (!response.ok) {
      throw new Error('Failed to load template');
    }
    templateBytes = await response.arrayBuffer();
    return templateBytes;
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
};

/**
 * Create result PDF using the template
 */
export const createResultPdf = async (resultData) => {
  let pdfDoc;
  let templateBytes = null;
  
  // Try to load template
  try {
    const response = await fetch('/templates/clear_result_for_jss-ss.pdf');
    if (response.ok) {
      templateBytes = await response.arrayBuffer();
    }
  } catch (e) {
    console.log('Template not found, creating new PDF');
  }
  
  if (templateBytes) {
    const templatePdf = await PDFDocument.load(templateBytes);
    pdfDoc = await PDFDocument.create();
    
    // Copy the template page
    const [templatePage] = await pdfDoc.copyPages(templatePdf, [0]);
    const page = pdfDoc.addPage(templatePage);
    const { width, height } = page.getSize();
    
    // Embed fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Extract data from resultData
    const { student, term, academicYear, subjectResults, totals, teacherRemarks, principalComment, class: className } = resultData;
    
    // Helper to draw text at position
    const drawText = (text, x, y, options = {}) => {
      if (!text) return;
      page.drawText(String(text), {
        x,
        y,
        size: options.size || 10,
        font: options.bold ? fontBold : font,
        color: rgb(0, 0, 0),
        ...options,
      });
    };
    
    // Note: These coordinates are estimates and need to be adjusted based on the actual PDF template
    // The actual positions should be extracted from analyzing the PDF
    
    // Based on page size 1438 x 1076, typical positions:
    const config = {
      // Header section (around y=1050)
      schoolName: { x: width/2, y: height - 50 },
      
      // Student info (y around 950-1000)
      studentName: { x: 150, y: height - 150 },
      admissionNo: { x: 500, y: height - 150 },
      class_: { x: 150, y: height - 180 },
      session: { x: 400, y: height - 180 },
      term: { x: 600, y: height - 180 },
      sex: { x: 800, y: height - 180 },
      
      // Table starts around y=850
      tableStart: { x: 50, y: height - 250 },
      rowHeight: 18,
    };
    
    // Draw student info
    drawText(
      `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Student Name',
      config.studentName.x,
      config.studentName.y,
      { bold: true, size: 11 }
    );
    
    drawText(
      student?.studentNumber || student?.admissionNumber || 'ADM001',
      config.admissionNo.x,
      config.admissionNo.y,
      { bold: true, size: 11 }
    );
    
    drawText(
      className || 'Class',
      config.class_.x,
      config.class_.y,
      { bold: true, size: 11 }
    );
    
    drawText(
      academicYear?.name || academicYear || '2025/2026',
      config.session.x,
      config.session.y,
      { bold: true, size: 11 }
    );
    
    drawText(
      term?.name || term || 'First Term',
      config.term.x,
      config.term.y,
      { bold: true, size: 11 }
    );
    
    drawText(
      student?.gender || 'M',
      config.sex.x,
      config.sex.y,
      { bold: true, size: 11 }
    );
    
    // Draw subject results
    const subjects = subjectResults || [];
    let yPos = config.tableStart.y;
    
    subjects.forEach((subject, index) => {
      // S/N (column 1)
      drawText(String(index + 1), 50, yPos, { size: 9 });
      
      // Subject name (column 2)
      drawText(subject.subjectName || subject.SubjectName || '', 80, yPos, { size: 9 });
      
      // Term 1 CA (column 3)
      drawText(String(subject.term1ObjectiveScore ?? 0), 250, yPos, { size: 9 });
      
      // Term 1 Exam (column 4)
      drawText(String(subject.term1TheoryScore ?? 0), 320, yPos, { size: 9 });
      
      // Term 2 CA (column 5)
      drawText(String(subject.term2ObjectiveScore ?? 0), 450, yPos, { size: 9 });
      
      // Term 2 Exam (column 6)
      drawText(String(subject.term2TheoryScore ?? 0), 520, yPos, { size: 9 });
      
      // Term 3 CA (column 7)
      drawText(String(subject.term3ObjectiveScore ?? 0), 650, yPos, { size: 9 });
      
      // Term 3 Exam (column 8)
      drawText(String(subject.term3TheoryScore ?? 0), 720, yPos, { size: 9 });
      
      // Cumulative Total
      const cumTotal = (subject.term1ObjectiveScore ?? 0) + (subject.term1TheoryScore ?? 0) +
                    (subject.term2ObjectiveScore ?? 0) + (subject.term2TheoryScore ?? 0) +
                    (subject.term3ObjectiveScore ?? 0) + (subject.term3TheoryScore ?? 0);
      drawText(String(cumTotal), 900, yPos, { bold: true, size: 9 });
      
      // Average
      const avg = (cumTotal / 3).toFixed(1);
      drawText(avg, 980, yPos, { size: 9 });
      
      // Grade
      const grade = getGrade(parseFloat(avg));
      drawText(grade, 1060, yPos, { bold: true, size: 10 });
      
      yPos -= config.rowHeight;
    });
    
    // Summary section (around y=150)
    if (totals) {
      const summaryY = 150;
      
      drawText(String(totals.totalObtained || 0), 350, summaryY, { bold: true, size: 12 });
      drawText(String(totals.totalMaximum || 100), 480, summaryY, { bold: true, size: 12 });
      drawText(String((totals.average || 0).toFixed(1)) + '%', 350, summaryY - 25, { bold: true, size: 12 });
      drawText(totals.grade || 'N/A', 480, summaryY - 25, { bold: true, size: 12 });
    }
    
    // Remarks (y around 80-50)
    if (teacherRemarks) {
      drawText(teacherRemarks.substring(0, 80), 50, 80, { size: 10 });
    }
    
    if (principalComment) {
      drawText(principalComment.substring(0, 80), 50, 50, { size: 10 });
    }
    
    return pdfDoc;
  } else {
    // Create new PDF if template not found
    pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Header
    page.drawText('300 ARUNDEL LEARNING CENTRE', {
      x: 180, y: 800, size: 16, font: fontBold, color: rgb(0, 0.3, 0),
    });
    page.drawText('Omife-Umune, Owerri, Imo State', {
      x: 210, y: 780, size: 10, font: font, color: rgb(0.3, 0.3, 0.3),
    });
    
    // Student info
    const y = 750;
    page.drawText(`Name: ${resultData.student?.firstName || ''} ${resultData.student?.lastName || ''}`, {
      x: 50, y, size: 10, font: fontBold,
    });
    page.drawText(`Admission No: ${resultData.student?.studentNumber || 'N/A'}`, {
      x: 350, y, size: 10, font: fontBold,
    });
    
    // Subjects
    let subjectY = 700;
    (resultData.subjectResults || []).forEach((subject, i) => {
      page.drawText(`${i+1}. ${subject.subjectName || subject.SubjectName}`, { x: 50, y: subjectY, size: 9, font: font });
      subjectY -= 12;
    });
    
    return pdfDoc;
  }
};

/**
 * Get grade from percentage
 */
const getGrade = (percentage) => {
  if (percentage >= 90) return 'A1';
  if (percentage >= 80) return 'A2';
  if (percentage >= 70) return 'B1';
  if (percentage >= 60) return 'B2';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

/**
 * Download the generated PDF
 */
export const downloadPdf = async (resultData, filename) => {
  try {
    const pdfDoc = await createResultPdf(resultData);
    const pdfBytes = await pdfDoc.save();
    
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `Result_${resultData.student?.firstName || 'Student'}_${Date.now()}.pdf`;
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

/**
 * Generate PDF as blob URL
 */
export const generatePdfBlob = async (resultData) => {
  try {
    const pdfDoc = await createResultPdf(resultData);
    const pdfBytes = await pdfDoc.save();
    return URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export default {
  loadTemplate,
  createResultPdf,
  downloadPdf,
  generatePdfBlob,
};