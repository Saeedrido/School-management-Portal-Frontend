import React, { forwardRef } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

// Check if this is a Primary/Nursery result (use SchoolLevel from class)
const isPrimaryLevel = (data) => {
  const classInfo = data?.Class || data?.class || {};
  const schoolLevel = classInfo.schoolLevel || classInfo.SchoolLevel || '';
  // Primary Nursery, Primary, Nursery, Creche are primary/early childhood levels
  const primaryLevels = ['Primary', 'Nursery', 'Creche', 'Daycare'];
  return primaryLevels.some(level => 
    schoolLevel.toLowerCase().includes(level.toLowerCase())
  );
};

// If primary/nursery level, we could render a different template
// For now, we'll conditionally show a message that primary template is coming soon
// The main ResultSheet continues below for Secondary level

const ResultSheet = forwardRef(({ data, readOnly = true }, ref) => {
  // Check both subject-level and top-level for cumulative data
  const hasSubjectCumulativeData = data?.SubjectResults?.[0]?.cumulativeAverageScore !== undefined || data?.SubjectResults?.[0]?.firstTermScore !== undefined;
  const hasTopLevelCumulativeData = data?.cumulativeAverageScore !== undefined || data?.cumulativeAveragePercentage !== undefined;
  const isCumulative = hasSubjectCumulativeData || hasTopLevelCumulativeData;
  
  const student = data?.Student || data?.student || {};
  const term = data?.Term || data?.term || {};
  const academicYear = data?.AcademicYear || data?.academicYear || {};
  const classInfo = data?.Class || data?.class || {};
  
  const studentClass = student.className || student.class || classInfo.name || data?.className || '';
  
  // Determine term type from various possible fields
  let termType = term?.termType || term?.TermType || 3;
  // If termType is a string like "First", "Second", "Third", convert to number
  if (typeof termType === 'string') {
    const lowerTerm = termType.toLowerCase();
    if (lowerTerm.includes('first') || lowerTerm.includes('1st') || lowerTerm === '1') termType = 1;
    else if (lowerTerm.includes('second') || lowerTerm.includes('2nd') || lowerTerm === '2') termType = 2;
    else if (lowerTerm.includes('third') || lowerTerm.includes('3rd') || lowerTerm === '3') termType = 3;
  }
  // Also try to extract from term name
  if (!termType || termType === 3) {
    const termName = term?.name || term?.Name || '';
    if (termName.toLowerCase().includes('first') || termName.includes('1st')) termType = 1;
    else if (termName.toLowerCase().includes('second') || termName.includes('2nd')) termType = 2;
    else if (termName.toLowerCase().includes('third') || termName.includes('3rd')) termType = 3;
  }
  
  // Define isThirdTerm AFTER termType is determined
  const isThirdTerm = termType === 3;

  // Next term resume date fallback: if not set, estimate from academic year end
  const termResumeDate = term?.nextTermResumeDate || term?.NextTermResumeDate || '';
  const academicYearEnd = academicYear?.endDate || academicYear?.EndDate || '';
  let nextTermResumeDisplay = '';
  if (termResumeDate) {
    nextTermResumeDisplay = new Date(termResumeDate).toLocaleDateString();
  } else if (academicYearEnd) {
    const d = new Date(academicYearEnd);
    d.setMonth(d.getMonth() + 1);
    nextTermResumeDisplay = d.toLocaleDateString();
  } else {
    nextTermResumeDisplay = '-';
  }

  // DEBUG: Trace term data flow
  console.log('=== ResultSheet DEBUG ===');
  console.log('Full term object:', JSON.stringify(data?.Term || data?.term, null, 2));
  console.log('termType:', termType, 'isThirdTerm:', isThirdTerm);
  console.log('term?.nextTermResumeDate:', term?.nextTermResumeDate);
  console.log('term?.NextTermResumeDate:', term?.NextTermResumeDate);
  console.log('academicYear?.endDate:', academicYear?.endDate);
  console.log('academicYear?.EndDate:', academicYear?.EndDate);
  console.log('nextTermResumeDisplay:', nextTermResumeDisplay);
  
  const subjectResults = data?.SubjectResults || data?.subjectResults || [];
  
  const processedSubjects = subjectResults.map(subject => {
    // Handle both PascalCase and camelCase from backend
    const testScore = subject.TestScore || subject.testScore || 0;
    const objectiveScore = subject.ObjectiveScore || subject.objectiveScore || 0;
    const theoryScore = subject.TheoryScore || subject.theoryScore || 0;
    
// Term scores - use camelCase since backend returns that
    const firstTerm = subject.firstTermScore ?? subject.FirstTermScore ?? null;
    const secondTerm = subject.secondTermScore ?? subject.SecondTermScore ?? null;
    const thirdTerm = subject.thirdTermScore ?? subject.ThirdTermScore ?? null;
    
    // For 3rd term - get C.A and Exam separately if available
    const thirdTermTestScore = subject.thirdTermTestScore ?? subject.ThirdTermTestScore ?? null;
    const thirdTermExamScore = subject.thirdTermExamScore ?? subject.ThirdTermExamScore ?? null;
    const hasThirdTermScore = thirdTerm !== null && thirdTerm > 0;
    const hasThirdTermExam = thirdTermExamScore !== null && thirdTermExamScore > 0;
    
    // For 1st/2nd term - show regular TestScore (C.A) and Exam (Obj+Thy)
    // For 3rd term - show either separate test/exam or combined
    let ca, exam;
    if (isThirdTerm) {
      // 3rd term: show "-" if no exam, otherwise show test/exam separately
      ca = hasThirdTermScore ? (thirdTermTestScore !== null && thirdTermTestScore > 0 ? thirdTermTestScore : thirdTermExamScore) : '-';
      exam = hasThirdTermExam ? thirdTermExamScore : (hasThirdTermScore ? '-' : '-');
    } else {
      // 1st/2nd term - use regular testScore and exam scores
      ca = testScore > 0 ? testScore : '-';
      exam = (objectiveScore + theoryScore) > 0 ? (objectiveScore + theoryScore) : '-';
    }
    
    // Grade - for 1st/2nd term show term grade, for 3rd show cumulative grade only if exam was done
    const grade = isThirdTerm
      ? (hasThirdTermScore ? (subject.cumulativeGradeLetter || subject.CumulativeGradeLetter || '') : '')
      : (subject.thirdTermGradeLetter || subject.ThirdTermGradeLetter || subject.cumulativeGradeLetter || '');
    
    // Remark - for all terms show remark
    const directRemark = isThirdTerm 
      ? (subject.thirdTermRemark || subject.ThirdTermRemark || subject.Remark || subject.remark || '')
      : (subject.Remark || subject.remark || '');
    const gradeRemark = getRemarkFromGrade(grade);
    const finalRemark = directRemark || gradeRemark;
    
    // For 1st/2nd term - use totalScore from backend, for 3rd use thirdTerm
    // termTotal should be the sum of C.A + Exam for each subject
    const termTotal = isThirdTerm 
      ? (thirdTerm || 0) 
      : (subject.totalScore || subject.TotalScore || testScore + objectiveScore + theoryScore);
     
    return {
      ...subject,
      name: subject.subjectName || subject.SubjectName || subject.name || '',
      ca: ca,
      exam: exam,
      termTotal: termTotal,
      firstTerm: firstTerm,
      secondTerm: secondTerm,
      thirdTerm: thirdTerm,
      cumulativeAvg: hasThirdTermScore ? (thirdTerm || 0) : 0,
      grade: grade,
      remark: finalRemark,
    };
  });
  
  // Count remarks for Rating Scale
  const remarkCounts = { Excellent: 0, Good: 0, Fair: 0, Poor: 0, 'Very Poor': 0 };
  processedSubjects.forEach(subject => {
    const remark = subject.remark;
    const rating = getRatingCategory(remark);
    
    if (rating === 'Excellent') remarkCounts.Excellent++;
    else if (rating === 'Good' || rating === 'Very Good') remarkCounts.Good++;
    else if (rating === 'Fair') remarkCounts.Fair++;
    else if (rating === 'Poor') remarkCounts.Poor++;
    else if (rating === 'Very Poor') remarkCounts['Very Poor']++;
  });
  
const subjectCount = processedSubjects.length || 1;
  const totalScoreObtainable = subjectCount * 100;
  
  // Get term totals for cumulative view - use camelCase field names
  const firstTermTotal = data?.firstTermTotalScore || data?.FirstTermTotalScore || 
    subjectResults.reduce((sum, s) => sum + (s.firstTermScore || s.FirstTermScore || 0), 0);
  const secondTermTotal = data?.secondTermTotalScore || data?.SecondTermTotalScore || 
    subjectResults.reduce((sum, s) => sum + (s.secondTermScore || s.SecondTermScore || 0), 0);
  const thirdTermTotal = data?.thirdTermTotalScore || data?.ThirdTermTotalScore || 
    subjectResults.reduce((sum, s) => sum + (s.thirdTermScore || s.ThirdTermScore || 0), 0);
  
  // Calculate term total - for 3rd term only count subjects with actual thirdTermScore
  const subjectsWithThirdTerm = processedSubjects.filter(s => s.thirdTerm && s.thirdTerm > 0);
  const subjectsWithThirdTermCount = Math.max(subjectsWithThirdTerm.length, 1);
  
  // For 3rd term: only calculate percentage based on subjects that did the exam
  // For 1st/2nd term: calculate based on all subjects
  // For single term results, calculate totals from testScore + exam scores
  // For 1st term (termType 1): use sum of totalScore from all subjects  
  // For 2nd term (termType 2): use sum of totalScore from all subjects
  const termTotalScore = !isThirdTerm 
    ? processedSubjects.reduce((sum, s) => {
        const caNum = parseInt(s.ca) || 0;
        const examNum = parseInt(s.exam) || 0;
        return sum + caNum + examNum;
      }, 0)
: (thirdTermTotal > 0 ? thirdTermTotal : 0);
   
  // Percentage: for 1st/2nd term use totalScoreObtainable (all subjects), for 3rd use subjects that did exam
  const percentageDenominator = isThirdTerm 
    ? (subjectsWithThirdTermCount * 100) 
    : totalScoreObtainable;
  const termPercentage = termTotalScore > 0 ? ((termTotalScore / percentageDenominator) * 100).toFixed(1) : '0';
  
  const cumulativeTotal = firstTermTotal + secondTermTotal + thirdTermTotal;
  // Use cumulativeAveragePercentage from top level (this is already calculated as percentage)
  // Try multiple field names for fallback
  const topLevelCumulativePercentage = 
    data?.cumulativeAveragePercentage || 
    data?.CumulativeAveragePercentage ||
    data?.cumulativeAverageScore ||
    data?.CumulativeAverageScore || 
    0;
  // Show cumulative average when isCumulative OR when we have first/second/third term data for multiple subjects
  const showCumulative = isCumulative || (firstTermTotal > 0 && secondTermTotal > 0 && thirdTermTotal > 0);
  const cumulativeAverage = showCumulative ? (topLevelCumulativePercentage > 0 ? topLevelCumulativePercentage.toString() : termPercentage) : termPercentage;

  // For PERCENTAGE box: for 3rd term use only subjects with 3rd term exam
  // For 1st/2nd term use all subjects
  // For PERCENTAGE box: for 3rd term use termPercentage, for 1st/2nd use termPercentage directly
  const percentage = isThirdTerm 
    ? termPercentage
    : (termTotalScore > 0 ? ((termTotalScore / totalScoreObtainable) * 100).toFixed(1) : termPercentage);
  
  const classAverage = data?.ClassAverage || data?.classAverage || null;
  const teacherRemarks = data?.TeacherRemarks || data?.teacherRemarks || '';
  const headmasterComment = data?.HeadmasterComment || data?.headmasterComment || '';
  
  // For promotion: only show on 3rd term (cumulative results)
  // Check if this is actually a cumulative result (has cumulative data)
  const hasCumulativeData = data?.SubjectResults?.some(s => s.cumulativeAverageScore !== undefined) || 
    data?.SubjectResults?.some(s => s.firstTermScore !== undefined);
  const cumulativeAvgValue = parseFloat(cumulativeAverage) || 0;
  const promotedTo = isThirdTerm && hasCumulativeData ? (data?.cumulativeGradeLetter === 'F9' || cumulativeAvgValue < 40 ? 'Retained' : studentClass ? `Promoted to ${getNextClass(studentClass)}` : 'Next Class') : (isThirdTerm ? 'Next Class' : '');
  
  function getNextClass(currentClass) {
    const classMatch = currentClass.match(/^([A-Za-z]+)(\d+)$/);
    if (classMatch) {
      const prefix = classMatch[1];
      const num = parseInt(classMatch[2]);
      return `${prefix}${num + 1}`;
    }
    if (currentClass.toLowerCase().includes('ss3') || currentClass.toLowerCase().includes('year 13')) {
      return 'Graduated';
    }
    return 'Next Class';
  }

  const session = academicYear?.name || academicYear?.Name || data?.session || '2024/2025';
  const termName = term?.name || term?.Name || `${termType}${getOrdinal(termType)} Term`;
  
  function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  return (
    <Box ref={ref} sx={{ width: '1100px', padding: '20px', fontFamily: '"Times New Roman", Arial, sans-serif', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '2px solid black' }}>
        <Box sx={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid black' }}>
          <Typography sx={{ fontSize: '10px', textAlign: 'center' }}>SCHOOL<br/>LOGO</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>ROYAL SCHOLARS ACADEMY</Typography>
          <Typography sx={{ fontSize: '11px', fontWeight: 'bold', mt: 0.5 }}>NO 4, DAISI OKEOWO AVENUE, EYITA, IKORODU, LAGOS</Typography>
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold', mt: 0.5 }}>Tel: 08175975161, 08055302518</Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: 'bold', mt: 1, textDecoration: 'underline' }}>{session} ACADEMIC SESSION - {termName.toUpperCase()} RESULT</Typography>
        </Box>
        <Box sx={{ width: '100px', height: '100px', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '10px', textAlign: 'center' }}>PASSPORT<br/>PHOTO</Typography>
        </Box>
      </Box>

      {/* Student Details */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid black', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Student Name:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '180px', pb: 0.5 }}>
            <Typography sx={{ fontSize: '12px' }}>{student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : student.name || '________________'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Class:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '80px', pb: 0.5 }}><Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>{studentClass || '________'}</Typography></Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Session:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '100px', pb: 0.5 }}><Typography sx={{ fontSize: '12px' }}>{session}</Typography></Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Term:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '80px', pb: 0.5 }}><Typography sx={{ fontSize: '12px' }}>{termName}</Typography></Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Sex:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '50px', pb: 0.5 }}><Typography sx={{ fontSize: '12px' }}>{student.sex || student.gender || ''}</Typography></Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Adm No:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '90px', pb: 0.5 }}><Typography sx={{ fontSize: '12px' }}>{student.studentNumber || student.admissionNumber || '________'}</Typography></Box>
        </Box>
      </Box>

      {/* Main Table */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TableContainer sx={{ flex: 3, border: '1px solid black' }}>
          <Table size="small" padding="none">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5 }}>S/N</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5 }}>SUBJECT</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5 }}>MARK<br/>OBT-ABLE</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5, bgcolor: '#ffffcc' }}>C.A<br/>(Test)</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5, bgcolor: '#ffffcc' }}>EXAM<br/>(Obj+Thy)</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5 }}>1ST<br/>TERM</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5 }}>2ND<br/>TERM</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5 }}>3RD<br/>TERM</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5 }}>AVG<br/>MARK</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5 }}>GRADE</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 1, px: 0.5 }}>REMARK</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processedSubjects.map((subject, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>{index + 1}</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 1 }}>{subject.name}</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>100</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}>{subject.ca}</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}>{subject.exam}</TableCell>
                  
                  {/* 1ST TERM - show per subject's score when isCumulative, otherwise show their total */}
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, fontWeight: 'bold', bgcolor: termType === 1 ? '#c8e6c9' : 'white' }}>
                    {termType === 1 ? subject.termTotal : (isCumulative ? (subject.firstTerm !== null && subject.firstTerm !== undefined ? subject.firstTerm : '-') : (firstTermTotal > 0 ? firstTermTotal : '-'))}
                  </TableCell>
                  
                  {/* 2ND TERM */}
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, fontWeight: 'bold', bgcolor: termType === 2 ? '#c8e6c9' : 'white' }}>
                    {termType === 2 ? subject.termTotal : (isCumulative ? (subject.secondTerm !== null && subject.secondTerm !== undefined ? subject.secondTerm : '-') : (secondTermTotal > 0 ? secondTermTotal : '-'))}
                  </TableCell>
                  
                  {/* 3RD TERM */}
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, fontWeight: 'bold', bgcolor: termType === 3 ? '#c8e6c9' : 'white' }}>
                    {termType === 3 ? subject.termTotal : (isCumulative ? (subject.thirdTerm !== null && subject.thirdTerm !== undefined ? subject.thirdTerm : '-') : (thirdTermTotal > 0 ? thirdTermTotal : '-'))}
                  </TableCell>
                  
                  {/* AVG MARK - show each subject's total score for the current term */}
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>
                    {subject.termTotal > 0 ? subject.termTotal : '-'}
                  </TableCell>
                  
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>{subject.grade}</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 1 }}>{subject.remark || getRemarkFromGrade(subject.grade)}</TableCell>
                </TableRow>
              ))}
              {[...Array(Math.max(0, 12 - processedSubjects.length))].map((_, i) => (
                <TableRow key={`empty-${i}`}>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>{processedSubjects.length + i + 1}</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 1 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>100</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 1 }}></TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'right', py: 0.5, px: 1 }}>TOTAL</TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>{totalScoreObtainable}</TableCell>
                {/* C.A TOTAL - for 1st/2nd term show sum of CA, for 3rd show - */}
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}>
                  {isThirdTerm ? '-' : processedSubjects.reduce((sum, s) => sum + (parseInt(s.ca) || 0), 0)}
                </TableCell>
                {/* EXAM TOTAL - for 1st/2nd term show sum of Exam, for 3rd show - */}
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}>
                  {isThirdTerm ? (thirdTermTotal > 0 ? thirdTermTotal : '-') : processedSubjects.reduce((sum, s) => sum + (parseInt(s.exam) || 0), 0)}
                </TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, fontWeight: 'bold', bgcolor: termType === 1 ? '#c8e6c9' : 'white' }}>
                  {termType === 1 ? termTotalScore : (firstTermTotal > 0 ? firstTermTotal : '-')}
                </TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, fontWeight: 'bold', bgcolor: termType === 2 ? '#c8e6c9' : 'white' }}>
                  {termType === 2 ? termTotalScore : (secondTermTotal > 0 ? secondTermTotal : '-')}
                </TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5, fontWeight: 'bold', bgcolor: termType === 3 ? '#c8e6c9' : 'white' }}>
                  {termType === 3 ? termTotalScore : (thirdTermTotal > 0 ? thirdTermTotal : '-')}
                </TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>
                  {isCumulative ? (data?.CumulativeTotalScore || cumulativeTotal) : termTotalScore}
                </TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 1 }}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Side Tables */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TableContainer sx={{ border: '1px solid black' }}>
            <Table size="small">
              <TableHead><TableRow sx={{ backgroundColor: '#f5f5f5' }}><TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '8px', textAlign: 'center', py: 0.5 }} colSpan={2}>PSYCHOMOTOR SKILLS</TableCell></TableRow></TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Handwriting</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>
                    {data?.PsychomotorSkills?.Handwriting || data?.psychomotorSkills?.handwriting || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Drawing & Painting</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>
                    {data?.PsychomotorSkills?.DrawingPainting || data?.psychomotorSkills?.drawingPainting || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Handling Tools</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>
                    {data?.PsychomotorSkills?.HandlingTools || data?.psychomotorSkills?.handlingTools || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Sports & Games</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>
                    {data?.PsychomotorSkills?.GamesSports || data?.psychomotorSkills?.gamesSports || '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <TableContainer sx={{ border: '1px solid black' }}>
            <Table size="small">
              <TableHead><TableRow sx={{ backgroundColor: '#f5f5f5' }}><TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '8px', textAlign: 'center', py: 0.5 }} colSpan={2}>AFFECTIVE DISPOSITION</TableCell></TableRow></TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Punctuality</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>
                    {data?.AffectiveTraits?.Punctuality || data?.affectiveTraits?.punctuality || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Politeness</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>
                    {data?.AffectiveTraits?.Politeness || data?.affectiveTraits?.politeness || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Attentiveness</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>
                    {data?.AffectiveTraits?.Attentiveness || data?.affectiveTraits?.attentiveness || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Attitude to School Work</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>
                    {data?.AffectiveTraits?.AttitudeToClassWork || data?.affectiveTraits?.attitudeToClassWork || '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <TableContainer sx={{ border: '1px solid black' }}>
            <Table size="small">
              <TableHead><TableRow sx={{ backgroundColor: '#f5f5f5' }}><TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '8px', textAlign: 'center', py: 0.5 }} colSpan={2}>RATING SCALE</TableCell></TableRow></TableHead>
              <TableBody>
                <TableRow><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Excellent</TableCell><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>{remarkCounts.Excellent}</TableCell></TableRow>
                <TableRow><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Good</TableCell><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>{remarkCounts.Good}</TableCell></TableRow>
                <TableRow><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Fair</TableCell><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>{remarkCounts.Fair}</TableCell></TableRow>
                <TableRow><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Poor</TableCell><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>{remarkCounts.Poor}</TableCell></TableRow>
                <TableRow><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'left', py: 0.5, px: 0.5 }}>Very Poor</TableCell><TableCell sx={{ border: '1px solid black', fontSize: '8px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>{remarkCounts['Very Poor']}</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Summary Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ border: '1px solid black', px: 1, py: 0.5, minWidth: '85px' }}>
            <Typography sx={{ fontSize: '8px', textAlign: 'center', mb: 0.5 }}>TOTAL SCORE<br/>OBTAINABLE</Typography>
            <Typography sx={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>{totalScoreObtainable}</Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 1, py: 0.5, minWidth: '85px', bgcolor: termType === 1 ? '#c8e6c9' : 'white' }}>
            <Typography sx={{ fontSize: '8px', textAlign: 'center', mb: 0.5 }}>1ST TERM<br/>TOTAL</Typography>
            <Typography sx={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>{termType === 1 ? termTotalScore : (firstTermTotal > 0 ? firstTermTotal : '-')}</Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 1, py: 0.5, minWidth: '85px', bgcolor: termType === 2 ? '#c8e6c9' : 'white' }}>
            <Typography sx={{ fontSize: '8px', textAlign: 'center', mb: 0.5 }}>2ND TERM<br/>TOTAL</Typography>
            <Typography sx={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>{termType === 2 ? termTotalScore : (secondTermTotal > 0 ? secondTermTotal : '-')}</Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 1, py: 0.5, minWidth: '85px', bgcolor: termType === 3 ? '#c8e6c9' : 'white' }}>
            <Typography sx={{ fontSize: '8px', textAlign: 'center', mb: 0.5 }}>3RD TERM<br/>TOTAL</Typography>
            <Typography sx={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>{termType === 3 ? termTotalScore : (thirdTermTotal > 0 ? thirdTermTotal : '-')}</Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 1, py: 0.5, minWidth: '85px', bgcolor: isCumulative ? '#c8e6c9' : 'white' }}>
            <Typography sx={{ fontSize: '8px', textAlign: 'center', mb: 0.5, color: isCumulative ? 'green' : 'black' }}>CUMULATIVE<br/>AVERAGE</Typography>
            <Typography sx={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold', color: isCumulative ? 'green' : 'black' }}>{isCumulative ? cumulativeAverage + '%' : '-'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ border: '1px solid black', px: 1, py: 0.5, minWidth: '70px' }}>
            <Typography sx={{ fontSize: '8px', textAlign: 'center', mb: 0.5 }}>PERCENTAGE</Typography>
            <Typography sx={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>{percentage}%</Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 1, py: 0.5, minWidth: '70px' }}>
            <Typography sx={{ fontSize: '8px', textAlign: 'center', mb: 0.5 }}>CLASS AVG</Typography>
            <Typography sx={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>{classAverage !== null ? classAverage + '%' : '-'}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Comments */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, pb: 1, borderBottom: '1px solid black' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '10px', minWidth: '160px' }}>Class Teacher's Comment:</Typography>
          <Box sx={{ borderBottom: '1px solid black', flex: 1, mx: 1, pb: 0.5 }}><Typography sx={{ fontSize: '10px' }}>{teacherRemarks || 'Good performance, keep it up!'}</Typography></Box>
          <Typography sx={{ fontWeight: 'bold', fontSize: '10px', minWidth: '70px' }}>Signature:</Typography>
          <Box sx={{ borderBottom: '1px solid black', width: '100px', ml: 1 }}></Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '10px', minWidth: '160px' }}>Head Teacher's Comment:</Typography>
          <Box sx={{ borderBottom: '1px solid black', flex: 1, mx: 1, pb: 0.5 }}><Typography sx={{ fontSize: '10px' }}>{headmasterComment || 'Well done, continue striving for excellence.'}</Typography></Box>
          <Typography sx={{ fontWeight: 'bold', fontSize: '10px', minWidth: '70px' }}>Signature:</Typography>
          <Box sx={{ borderBottom: '1px solid black', width: '100px', ml: 1 }}></Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '10px' }}>Next Term/Session Resumes On:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '150px', ml: 1 }}>
            <Typography sx={{ fontSize: '10px' }}>
              {nextTermResumeDisplay}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '10px' }}>Promoted To:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '150px', ml: 1 }}><Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>{promotedTo || ''}</Typography></Box>
        </Box>
      </Box>

      {/* Grading Key */}
      <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid black' }}>
        <Typography sx={{ fontSize: '9px', fontWeight: 'bold', mb: 0.5 }}>GRADING SYSTEM KEY:</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '8px' }}>A1 (90-100) = EXCELLENT</Typography>
          <Typography sx={{ fontSize: '8px' }}>B2 (80-89) = VERY GOOD</Typography>
          <Typography sx={{ fontSize: '8px' }}>B3 (75-79) = GOOD</Typography>
          <Typography sx={{ fontSize: '8px' }}>C4 (70-74) = VERY GOOD</Typography>
          <Typography sx={{ fontSize: '8px' }}>C5 (65-69) = GOOD</Typography>
          <Typography sx={{ fontSize: '8px' }}>C6 (60-64) = GOOD</Typography>
          <Typography sx={{ fontSize: '8px' }}>D7 (55-59) = FAIR</Typography>
          <Typography sx={{ fontSize: '8px' }}>E8 (50-54) = PASS</Typography>
          <Typography sx={{ fontSize: '8px' }}>F9 (0-49) = FAIL</Typography>
        </Box>
      </Box>
    </Box>
  );
});

function getRemarkFromGrade(grade) {
  const remarks = { 
    A1: 'EXCELLENT', 
    B2: 'VERY GOOD', 
    B3: 'GOOD', 
    C4: 'VERY GOOD', 
    C5: 'GOOD', 
    C6: 'GOOD', 
    D7: 'FAIR', 
    E8: 'PASS', 
    F9: 'FAIL' 
  };
  return remarks[grade] || '';
}

// Simple categorization for Rating Scale counts
function getRatingCategory(remark) {
  const r = (remark || '').toString().toUpperCase().trim();
  if (r === 'EXCELLENT') return 'Excellent';
  if (r === 'VERY GOOD') return 'Very Good';
  if (r === 'GOOD') return 'Good';
  if (r === 'FAIR') return 'Fair';
  if (r === 'PASS' || r === 'CREDIT') return 'Fair';
  if (r === 'FAIL') return 'Poor';
  return null;
}

export default ResultSheet;