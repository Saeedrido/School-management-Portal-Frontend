import React, { forwardRef } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import schoolLogo from '../../assets/school logo imj/school-logo bck.png';

const PrimaryResultSheet = forwardRef(({ data, readOnly = true }, ref) => {
  const student = data?.Student || data?.student || {};
  const term = data?.Term || data?.term || {};
  const academicYear = data?.AcademicYear || data?.academicYear || {};
  const classInfo = data?.Class || data?.class || {};

  const studentClass = student.className || student.class || classInfo.name || data?.className || '';

  // Detect term type - handle both number and string formats from API
  let termType = term?.termType || term?.TermType || 1;
  if (typeof termType === 'string') {
    const lowerTerm = termType.toLowerCase();
    if (lowerTerm.includes('first') || lowerTerm.includes('1st') || termType === '1') termType = 1;
    else if (lowerTerm.includes('second') || lowerTerm.includes('2nd') || termType === '2') termType = 2;
    else if (lowerTerm.includes('third') || lowerTerm.includes('3rd') || termType === '3') termType = 3;
  } else if (typeof termType === 'number') {
    // Enum value: 1=First, 2=Second, 3=Third
    termType = Math.max(1, Math.min(3, termType));
  }
  const termNames = ['', 'FIRST', 'SECOND', 'THIRD'];
  const termName = termNames[termType] || 'FIRST';

  // For cumulative results (3rd term), also check if term object is missing but cumulative fields exist
  const hasCumulativeFields = data?.cumulativeAveragePercentage !== undefined ||
                              data?.CumulativeAveragePercentage !== undefined ||
                              data?.ThirdTermOverallPercentage !== undefined ||
                              data?.FirstTermScore !== undefined ||
                              data?.firstTermScore !== undefined;
  const isThirdTerm = termType === 3 || hasCumulativeFields;

  const subjectResults = data?.SubjectResults || data?.subjectResults || [];

  const psychomotorData = data?.PsychomotorSkills || data?.psychomotorSkills || data?.Psychomotor || data?.psychomotor || {};
  const affectiveData = data?.AffectiveTraits || data?.affectiveTraits || data?.Affective || data?.affective || {};

  const termResumeDate = term?.nextTermResumeDate || term?.NextTermResumeDate || '';
  const termStartDate = term?.startDate || term?.StartDate || academicYear?.startDate || academicYear?.StartDate || '';
  const academicYearEnd = academicYear?.endDate || academicYear?.EndDate || '';

  // Fallback for next term date: if not set, estimate from academic year end
  let nextTermDisplay = '';
  if (termResumeDate) {
    nextTermDisplay = new Date(termResumeDate).toLocaleDateString();
  } else if (academicYearEnd) {
    // Add ~1 month to academic year end as fallback
    const d = new Date(academicYearEnd);
    d.setMonth(d.getMonth() + 1);
    nextTermDisplay = d.toLocaleDateString();
  } else {
    nextTermDisplay = '______________________';
  }

  const numberInClass = data?.numberOfStudents || data?.NumberOfStudents || data?.classSize || data?.ClassSize || '______';

  // Build subject map - handle both SubjectResultDto (1st/2nd term) and SubjectCumulativeResultDto (3rd term cumulative)
  const subjectDataMap = {};
  // For 3rd term cumulative, only include subjects that had exams created for 3rd term
  // (ThirdTermScore/ThirdTermTestScore/ThirdTermExamScore is not null = exam was created)
  subjectResults.forEach(s => {
    const name = s.SubjectName || s.subjectName || '';
    // For 3rd term cumulative results, use ThirdTerm scores
    const isCumulative = s.cumulativeAverageScore !== undefined || s.firstTermScore !== undefined || s.FirstTermScore !== undefined;
    let testScore, examScore;
    if (isCumulative) {
      // Only include this subject if it had an exam created for 3rd term
      const hasThirdTermExam = (s.ThirdTermScore !== null && s.ThirdTermScore !== undefined) ||
                               (s.thirdTermScore !== null && s.thirdTermScore !== undefined) ||
                               (s.ThirdTermTestScore !== null && s.ThirdTermTestScore !== undefined) ||
                               (s.thirdTermTestScore !== null && s.thirdTermTestScore !== undefined) ||
                               (s.ThirdTermExamScore !== null && s.ThirdTermExamScore !== undefined) ||
                               (s.thirdTermExamScore !== null && s.thirdTermExamScore !== undefined);
      if (!hasThirdTermExam) return; // Skip subjects without 3rd term exams
      testScore = s.ThirdTermTestScore ?? s.thirdTermTestScore ?? 0;
      examScore = s.ThirdTermExamScore ?? s.thirdTermExamScore ?? 0;
    } else {
      testScore = s.TestScore || s.testScore || 0;
      examScore = (s.ObjectiveScore || s.objectiveScore || 0) + (s.TheoryScore || s.theoryScore || 0);
    }
    subjectDataMap[name] = {
      testScore,
      examScore,
    };
  });

  // Get the actual subjects the student took (from API data) - for 3rd term only subjects with exams created
  const studentSubjects = Object.keys(subjectDataMap).filter(Boolean);

  // Group subjects into LITERACY/NUMERACY/OTHER based on what they actually took
  const literacySubjects = ['Reading', 'Recognition', 'Writing'];
  const numeracySubjects = ['Counting'];

  const activeLiteracy = studentSubjects.filter(s => literacySubjects.includes(s));
  const activeNumeracy = studentSubjects.filter(s => numeracySubjects.includes(s));
  const activeOther = studentSubjects.filter(s => !literacySubjects.includes(s) && !numeracySubjects.includes(s));

  // Build ordered list of subjects grouped by category
  const buildSubjectRows = () => {
    const rows = [];
    let subjectCount = 0;

    // LITERACY
    if (activeLiteracy.length > 0) {
      rows.push({ type: 'header', name: 'LITERACY' });
      activeLiteracy.forEach(sub => {
        rows.push({ type: 'subject', name: sub });
        subjectCount++;
      });
    }

    // NUMERACY
    if (activeNumeracy.length > 0) {
      rows.push({ type: 'header', name: 'NUMERACY' });
      activeNumeracy.forEach(sub => {
        rows.push({ type: 'subject', name: sub });
        subjectCount++;
      });
    }

    // OTHER
    if (activeOther.length > 0) {
      rows.push({ type: 'header', name: 'OTHER SUBJECTS' });
      activeOther.forEach(sub => {
        rows.push({ type: 'subject', name: sub });
        subjectCount++;
      });
    }

    // If no subjects found, show all from results
    if (subjectCount === 0 && studentSubjects.length > 0) {
      studentSubjects.forEach(sub => {
        rows.push({ type: 'subject', name: sub });
        subjectCount++;
      });
    }

    // Pad to 20 subject rows (excluding headers)
    const emptyNeeded = Math.max(0, 20 - subjectCount);
    for (let i = 0; i < emptyNeeded; i++) {
      rows.push({ type: 'empty' });
    }

    return rows;
  };

  const getScore = (subjectName) => {
    const s = subjectDataMap[subjectName];
    if (!s) return { test: '-', exam: '-', total: '-', remark: '' };
    const total = s.testScore + s.examScore;
    return {
      test: s.testScore > 0 ? s.testScore : '-',
      exam: s.examScore > 0 ? s.examScore : '-',
      total: total > 0 ? total : '-',
      remark: getSubjectRemark(total)
    };
  };

  const getSubjectRemark = (score) => {
    if (!score || score === 0 || score === '-') return '';
    const n = parseInt(score);
    if (n >= 90) return 'Excellent';
    if (n >= 80) return 'Very Good';
    if (n >= 70) return 'Good';
    if (n >= 60) return 'Fair';
    if (n >= 50) return 'Pass';
    return 'Poor';
  };

  // Direct mapping from display names to backend keys
  const psychomotorKeyMap = {
    'Drawing & Painting': 'drawingPainting',
    'Games and Sports': 'gamesSports',
    'Handwriting': 'handwriting',
    'Verbal Fluency': 'verbalFluency',
    'Musical Skills': 'musicalSkills',
    'Handling Tools': 'handlingTools',
  };

  const affectiveKeyMap = {
    'Punctuality': 'punctuality',
    'Politeness': 'politeness',
    'Perseverance': 'perseverance',
    'Honesty': 'honesty',
    'Neatness': 'health',
    'Helping Others': 'helpingOthers',
    'Attentiveness': 'attentiveness',
    'Emotional Stability': 'emotionalStability',
    'Attitude to School Work': 'attitudeToClassWork',
    'Speaking/Handwriting': 'speakingHandwriting',
    'Spirit of Cooperation': 'spiritOfCooperation',
  };

  // Helper to get psychomotor rating - backend already sends alphabet grades
  const getPsychomotorRating = (skill) => {
    const key = psychomotorKeyMap[skill];
    if (key && psychomotorData[key] !== undefined) return psychomotorData[key];
    return '';
  };

  // Helper to get affective rating - backend already sends alphabet grades
  const getAffectiveRating = (trait) => {
    const key = affectiveKeyMap[trait];
    if (key && affectiveData[key] !== undefined) return affectiveData[key];
    return '';
  };

  // Grade is already alphabet from backend, just validate
  const getAlphaGrade = (rating) => {
    if (!rating || rating === '-' || rating === '') return '-';
    const upper = String(rating).toUpperCase();
    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(upper)) return upper;
    return '-';
  };

  const psychomotorSkills = [
    'Drawing & Painting', 'Games and Sports', 'Handwriting',
    'Verbal Fluency', 'Musical Skills', 'Handling Tools'
  ];

  const affectiveTraits = [
    'Punctuality', 'Politeness', 'Perseverance', 'Honesty', 'Neatness',
    'Helping Others', 'Attentiveness', 'Emotional Stability',
    'Attitude to School Work', 'Speaking/Handwriting', 'Spirit of Cooperation'
  ];

  // Calculate totals - use backend data if available, otherwise sum from subjectDataMap (already filtered for 3rd term)
  const totalScore = data?.totalScore || data?.TotalScore || Object.values(subjectDataMap).reduce((sum, s) => sum + (s.testScore + s.examScore), 0) || 0;

  const totalObtainable = data?.maximumScore || data?.MaximumScore || data?.cumulativeMaximumScore || (Object.keys(subjectDataMap).length > 0 ? Object.keys(subjectDataMap).length * 100 : 100);
  
  // Percentage: only calculated for 3rd term
  let percentage = '0';
  if (isThirdTerm) {
    if (data?.overallPercentage !== undefined && data?.overallPercentage !== null) {
      percentage = data.overallPercentage.toFixed(1);
    } else if (data?.OverallPercentage !== undefined && data?.OverallPercentage !== null) {
      percentage = data.OverallPercentage.toFixed(1);
    } else if (data?.cumulativeAveragePercentage !== undefined && data?.cumulativeAveragePercentage !== null) {
      percentage = data.cumulativeAveragePercentage.toFixed(1);
    } else if (data?.CumulativeAveragePercentage !== undefined && data?.CumulativeAveragePercentage !== null) {
      percentage = data.CumulativeAveragePercentage.toFixed(1);
    } else if (data?.ThirdTermOverallPercentage !== undefined && data?.ThirdTermOverallPercentage !== null) {
      percentage = data.ThirdTermOverallPercentage.toFixed(1);
    } else if (totalScore > 0) {
      percentage = ((totalScore / totalObtainable) * 100).toFixed(1);
    }
  }

  // Calculate promotion status for 3rd term
  const pct = parseFloat(percentage) || 0;
  const gradeLetter = data?.overallGradeLetter || (pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'E');
  const promotedStatus = isThirdTerm ? (gradeLetter === 'E' || gradeLetter === 'F' || pct < 50 ? 'Retained' : 'Promoted') : '';

  const getPercentageGrade = (pct) => {
    const p = parseFloat(pct);
    if (p >= 90) return 'A';
    if (p >= 80) return 'B';
    if (p >= 70) return 'C';
    if (p >= 60) return 'D';
    return 'E';
  };

  // Filter subjects to only show ones the student actually has results for
  const getActiveSubjects = (subjectList) => {
    return subjectList.filter(sub => subjectDataMap[sub]);
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: '800px',
        padding: '15px',
        fontFamily: '"Times New Roman", Arial, sans-serif',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        mx: 'auto',
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1, borderBottom: '2px solid black' }}>
        <Box component="img" src={schoolLogo} sx={{ height: 140, mr: 2 }} alt="School Logo" />
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography sx={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>
            300 ARUNDEL LEARNING CENTRE
          </Typography>
          <Typography sx={{ fontSize: '12px', mt: 0.5 }}>
            12A, Olusegun Asokun Close, Nopa Bus Stop, Evita OjoKoro Road, Ikorodu
          </Typography>
          <Typography sx={{ fontSize: '12px' }}>
            Phone: 08023196047, 08033995565
          </Typography>
          <Typography sx={{ fontSize: '15px', fontWeight: 'bold', mt: 1, textDecoration: 'underline' }}>
            CONTINUOUS ASSESSMENT FOR {termName} TERM YEAR {academicYear?.name || academicYear?.Name || '2024/2025'}
          </Typography>
        </Box>
      </Box>

      {/* STUDENT NAME BAR */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>
          {student.firstName} {student.lastName} &nbsp;&nbsp;&nbsp; Admission No: {student.studentNumber} &nbsp;&nbsp;&nbsp; Class: {studentClass}
        </Typography>
      </Box>

      {/* TOP SECTION - Attendance (Left) + Info Fields (Right) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {/* LEFT - Attendance Table */}
        <Box sx={{ width: '48%' }}>
          <Typography sx={{ fontSize: '12px', fontWeight: 'bold', mb: 0.5 }}>1. ATTENDANCE</Typography>
          <Table size="small" sx={{ border: '1px solid black' }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px' }}>Frequency</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px', width: '40%' }}></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px' }}>No. Times School Opened</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px' }}></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px' }}>No. Present</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px' }}></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px' }}>No. Absent</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px' }}></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px' }}>% Attendance</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px' }}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        {/* RIGHT - Plain Fields */}
        <Box sx={{ width: '48%', display: 'flex', flexDirection: 'column', gap: 0.5, pt: 1 }}>
          <Typography sx={{ fontSize: '11px' }}><strong>Term Begins:</strong> {termStartDate ? new Date(termStartDate).toLocaleDateString() : '_______________'}</Typography>
          {isThirdTerm && (
            <Typography sx={{ fontSize: '11px' }}><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: promotedStatus === 'Promoted' ? 'green' : 'red' }}>{promotedStatus}</span></Typography>
          )}
        </Box>
      </Box>

      {/* COGNITIVE ABILITY TITLE */}
      <Typography sx={{ fontSize: '13px', fontWeight: 'bold', mb: 1 }}>2. COGNITIVE ABILITY</Typography>

      {/* MAIN SUBJECTS TABLE */}
      <TableContainer sx={{ border: '1px solid black', mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: '1px solid black', py: 0.5, px: 0.5, fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }} rowSpan={2}>SUBJECTS</TableCell>
              <TableCell sx={{ border: '1px solid black', py: 0.5, px: 0.5, fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }} colSpan={3}>CONTINUOUS ASSESSMENT</TableCell>
              <TableCell sx={{ border: '1px solid black', py: 0.5, px: 0.5, fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }} rowSpan={2}>Teacher's Remark</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center' }}>TEST (40)</TableCell>
              <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center' }}>EXAM (60)</TableCell>
              <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center' }}>TOTAL (100)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buildSubjectRows().map((row, idx) => {
              if (row.type === 'header') {
                return (
                  <TableRow key={`hdr-${row.name}`}>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px', fontWeight: 'bold', bgcolor: '#f0f0f0' }} colSpan={5}>{row.name}</TableCell>
                  </TableRow>
                );
              }
              if (row.type === 'subject') {
                const score = getScore(row.name);
                return (
                  <TableRow key={row.name}>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, px: 1, fontSize: '11px' }}>{row.name}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px', textAlign: 'center' }}>{score.test}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px', textAlign: 'center' }}>{score.exam}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px', textAlign: 'center' }}>{score.total}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px' }}>{score.remark}</TableCell>
                  </TableRow>
                );
              }
              // Empty row
              return (
                <TableRow key={`empty-${idx}`}>
                  <TableCell sx={{ border: '1px solid black', py: 0.3, px: 1, fontSize: '11px' }}>&nbsp;</TableCell>
                  <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px', textAlign: 'center' }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px', textAlign: 'center' }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '11px', textAlign: 'center' }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px' }}></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PSYCHOMOTOR AND AFFECTIVE - SIDE BY SIDE */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {/* LEFT - PSYCHOMOTOR SKILLS */}
        <Box sx={{ width: '48%' }}>
          <Typography sx={{ fontSize: '12px', fontWeight: 'bold', mb: 0.5 }}>3. PSYCHOMOTOR SKILLS</Typography>
          <Table size="small" sx={{ border: '1px solid black' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', fontWeight: 'bold' }}>Skill</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>A</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>B</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>C</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>D</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>E</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>F</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {psychomotorSkills.map(skill => {
                const rating = getPsychomotorRating(skill);
                const alphaGrade = getAlphaGrade(rating);
                return (
                  <TableRow key={skill}>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px' }}>{skill}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'A' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'A' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'B' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'B' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'C' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'C' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'D' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'D' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'E' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'E' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'F' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'F' ? '✓' : ''}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Typography sx={{ fontSize: '9px', mt: 0.5 }}>A = Excellent, B = Good, C = Average, D = Weak, E = Poor, F = Fail</Typography>
        </Box>

        {/* RIGHT - AFFECTIVE TRAITS */}
        <Box sx={{ width: '48%' }}>
          <Typography sx={{ fontSize: '12px', fontWeight: 'bold', mb: 0.5 }}>4. AFFECTIVE TRAITS</Typography>
          <Table size="small" sx={{ border: '1px solid black' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', fontWeight: 'bold' }}>Trait</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>A</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>B</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>C</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>D</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>E</TableCell>
                <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>F</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {affectiveTraits.map(trait => {
                const rating = getAffectiveRating(trait);
                const alphaGrade = getAlphaGrade(rating);
                return (
                  <TableRow key={trait}>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, px: 0.5, fontSize: '10px' }}>{trait}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'A' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'A' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'B' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'B' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'C' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'C' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'D' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'D' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'E' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'E' ? '✓' : ''}</TableCell>
                    <TableCell sx={{ border: '1px solid black', py: 0.3, textAlign: 'center', fontSize: '10px', fontWeight: 'bold', bgcolor: alphaGrade === 'F' ? '#e0e0e0' : 'transparent' }}>{alphaGrade === 'F' ? '✓' : ''}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* FINAL SECTION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontSize: '11px' }}>
        <Typography><strong>Number in Class:</strong> {numberInClass}</Typography>
        <Typography><strong>Grade:</strong> {data?.overallGradeLetter || data?.OverallGradeLetter || data?.cumulativeGradeLetter || getPercentageGrade(percentage)}</Typography>
        {isThirdTerm && <Typography><strong>Percentage:</strong> {percentage}%</Typography>}
      </Box>

      {/* COMMENTS */}
      <Box sx={{ mb: 2, fontSize: '11px' }}>
        <Typography sx={{ mb: 0.5 }}><strong>Class Teacher Comment:</strong> {data?.teacherRemarks || data?.TeacherRemarks || '______________________'}</Typography>
        <Typography><strong>Head Teacher Comment:</strong> {data?.headmasterComment || data?.HeadmasterComment || '______________________'}</Typography>
      </Box>

      {/* FOOTER */}
      <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid black', fontSize: '11px' }}>
        <Typography sx={{ mb: 0.5 }}><strong>Next Term Begins:</strong> {nextTermDisplay}</Typography>
        <Typography sx={{ fontSize: '9px', mt: 0.5 }}>(Please return this card to school at the beginning of next term)</Typography>
      </Box>
    </Box>
  );
});

export default PrimaryResultSheet;