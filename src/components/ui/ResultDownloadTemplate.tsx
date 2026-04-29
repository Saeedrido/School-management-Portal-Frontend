import React, { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { ExamResult, ChildStudent } from '../../types';

interface ResultDownloadTemplateProps {
  student: ChildStudent | null;
  results: ExamResult[];
  averageScore: number;
}

const getGrade = (score: number): string => {
  if (score >= 90) return 'A1';
  if (score >= 80) return 'B2';
  if (score >= 75) return 'B3';
  if (score >= 70) return 'C4';
  if (score >= 65) return 'C5';
  if (score >= 60) return 'C6';
  if (score >= 55) return 'D7';
  if (score >= 50) return 'E8';
  return 'F9';
};

const getRemark = (grade: string): string => {
  const remarks: { [key: string]: string } = {
    A1: 'EXCELLENT',
    B2: 'VERY GOOD',
    B3: 'GOOD',
    C4: 'VERY GOOD',
    C5: 'GOOD',
    C6: 'GOOD',
    D7: 'FAIR',
    E8: 'PASS',
    F9: 'FAIL',
  };
  return remarks[grade] || '';
};

const getTeacherRemarks = (average: number): string => {
  if (average >= 90) return 'Outstanding performance! Keep up the excellent work.';
  if (average >= 80) return 'Excellent performance. Continue to strive for excellence.';
  if (average >= 70) return 'Very good performance. Well done!';
  if (average >= 60) return 'Good performance. Keep working hard.';
  if (average >= 50) return 'Satisfactory performance. Room for improvement.';
  if (average >= 40) return 'Acceptable performance. More effort needed.';
  return 'Performance needs significant improvement.';
};

const getHeadmasterRemarks = (average: number): string => {
  if (average >= 90) return 'Exceptional achievement. We are proud of this student.';
  if (average >= 80) return 'Outstanding results. Congratulations to the student and parents.';
  if (average >= 70) return 'Very good results. Keep up the momentum.';
  if (average >= 60) return 'Good results. Encourage the student to do better.';
  if (average >= 50) return 'Moderate results. Additional support recommended.';
  if (average >= 40) return 'Results indicate need for improvement.';
  return 'Poor results. Urgent intervention needed.';
};

const ResultDownloadTemplate = forwardRef<HTMLDivElement, ResultDownloadTemplateProps>(({
  student,
  results,
  averageScore,
}, ref) => {
  const currentDate = new Date();
  const academicYear = `${currentDate.getFullYear() - 1}/${currentDate.getFullYear()}`;
  const term = '3RD';
  const maxScore = results.length * 100;
  const totalExamScore = results.reduce((sum, r) => sum + r.score, 0);

  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '1100px',
        padding: '20px',
        fontFamily: '"Times New Roman", Arial, sans-serif',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '2px solid black' }}>
        {/* Logo */}
        <Box sx={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid black' }}>
          <Typography sx={{ fontSize: '10px', textAlign: 'center' }}>SCHOOL<br/>LOGO</Typography>
        </Box>

        {/* School Info */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography sx={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>
            ROYAL SCHOLARS ACADEMY
          </Typography>
          <Typography sx={{ fontSize: '11px', fontWeight: 'bold', mt: 0.5 }}>
            NO 4, DAISI OKEOWO AVENUE, EYITA, IKORODU, LAGOS
          </Typography>
          <Typography sx={{ fontSize: '10px', fontWeight: 'bold', mt: 0.5 }}>
            Tel: 08175975161, 08055302518
          </Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: 'bold', mt: 1, textDecoration: 'underline' }}>
            {academicYear} ACADEMIC SESSION - {term} TERM RESULT
          </Typography>
        </Box>

        {/* Passport Photo */}
        <Box sx={{ width: '100px', height: '100px', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '10px', textAlign: 'center' }}>PASSPORT<br/>PHOTO</Typography>
        </Box>
      </Box>

      {/* Student Details Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid black' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Student Name:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '200px', pb: 0.5 }}>
            <Typography sx={{ fontSize: '12px' }}>{student?.fullName || '________________'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Class:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '80px', pb: 0.5 }}>
            <Typography sx={{ fontSize: '12px' }}>{student?.className || '________'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Session:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '100px', pb: 0.5 }}>
            <Typography sx={{ fontSize: '12px' }}>{academicYear}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Term:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '60px', pb: 0.5 }}>
            <Typography sx={{ fontSize: '12px' }}>{term}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Sex:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '50px', pb: 0.5 }}>
            <Typography sx={{ fontSize: '12px' }}></Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '12px', mr: 1 }}>Adm No:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '80px', pb: 0.5 }}>
            <Typography sx={{ fontSize: '12px' }}>{student?.studentNumber || '________'}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content - Table + Side Tables */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {/* Main Grades Table */}
        <TableContainer sx={{ flex: 3, border: '1px solid black' }}>
          <Table size="small" padding="none">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5 }}>S/N</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5 }}>SUBJECT</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5 }}>MARK<br/>OBTAINABLE</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5, bgcolor: '#ffffcc' }}>C.A</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5, bgcolor: '#ffffcc' }}>EXAM<br/>SCORE</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5 }}>1ST<br/>TERM</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5 }}>2ND<br/>TERM</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5 }}>3RD<br/>TERM</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5 }}>AVERAGE<br/>MARK</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5 }}>GRADE</TableCell>
                <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', py: 1, px: 0.5 }}>REMARK</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result, index) => {
                const grade = getGrade(result.score);
                const ca = Math.round(result.score * 0.4);
                const exam = Math.round(result.score * 0.6);
                return (
                  <TableRow key={result.id}>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}>{index + 1}</TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'left', py: 0.5, px: 1 }}>{result.examTitle}</TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}>100</TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}>{ca}</TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}>{exam}</TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>{result.score}</TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5, fontWeight: 'bold' }}>{grade}</TableCell>
                    <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'left', py: 0.5, px: 1 }}>{getRemark(grade)}</TableCell>
                  </TableRow>
                );
              })}
              {/* Empty rows to make up to 12 subjects */}
              {[...Array(Math.max(0, 12 - results.length))].map((_, i) => (
                <TableRow key={`empty-${i}`}>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}>{results.length + i + 1}</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'left', py: 0.5, px: 1 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}>100</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'left', py: 0.5, px: 1 }}></TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow sx={{ fontWeight: 'bold' }}>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'right', py: 0.5, px: 1 }}>TOTAL</TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}>{maxScore}</TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}>{Math.round(totalExamScore * 0.4)}</TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5, bgcolor: '#ffffcc' }}>{Math.round(totalExamScore * 0.6)}</TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}>{totalExamScore}</TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'center', py: 0.5 }}></TableCell>
                <TableCell sx={{ border: '1px solid black', fontSize: '10px', textAlign: 'left', py: 0.5, px: 1 }}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Right Side Tables */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Psychomotor Skills */}
          <TableContainer sx={{ border: '1px solid black' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 0.5 }} colSpan={2}>
                    PSYCHOMOTOR SKILLS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Handwriting</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Drawing & Painting</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Handling Tools</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Sports & Games</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Affective Disposition */}
          <TableContainer sx={{ border: '1px solid black' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 0.5 }} colSpan={2}>
                    AFFECTIVE DISPOSITION
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Punctuality</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Politeness</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Attentiveness</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Attitude to School Work</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Scale */}
          <TableContainer sx={{ border: '1px solid black' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ border: '1px solid black', fontWeight: 'bold', fontSize: '9px', textAlign: 'center', py: 0.5 }} colSpan={2}>
                    RATING SCALE
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Excellent</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>5</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Good</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>4</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Fair</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>3</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Poor</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>2</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'left', py: 0.5, px: 0.5 }}>Very Poor</TableCell>
                  <TableCell sx={{ border: '1px solid black', fontSize: '9px', textAlign: 'center', py: 0.5 }}>1</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Summary Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ border: '1px solid black', px: 2, py: 1, minWidth: '100px' }}>
            <Typography sx={{ fontSize: '9px', textAlign: 'center', mb: 0.5 }}>TOTAL SCORE<br/>OBTAINABLE</Typography>
            <Typography sx={{ fontSize: '11px', textAlign: 'center', fontWeight: 'bold' }}>{maxScore}</Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 2, py: 1, minWidth: '100px' }}>
            <Typography sx={{ fontSize: '9px', textAlign: 'center', mb: 0.5 }}>1ST TERM<br/>TOTAL SCORE</Typography>
            <Typography sx={{ fontSize: '11px', textAlign: 'center', fontWeight: 'bold' }}></Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 2, py: 1, minWidth: '100px' }}>
            <Typography sx={{ fontSize: '9px', textAlign: 'center', mb: 0.5 }}>2ND TERM<br/>TOTAL SCORE</Typography>
            <Typography sx={{ fontSize: '11px', textAlign: 'center', fontWeight: 'bold' }}></Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 2, py: 1, minWidth: '100px' }}>
            <Typography sx={{ fontSize: '9px', textAlign: 'center', mb: 0.5 }}>3RD TERM<br/>TOTAL SCORE</Typography>
            <Typography sx={{ fontSize: '11px', textAlign: 'center', fontWeight: 'bold' }}>{totalExamScore}</Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 2, py: 1, minWidth: '100px' }}>
            <Typography sx={{ fontSize: '9px', textAlign: 'center', mb: 0.5 }}>CUMULATIVE<br/>AVERAGE</Typography>
            <Typography sx={{ fontSize: '11px', textAlign: 'center', fontWeight: 'bold' }}>{averageScore}%</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ border: '1px solid black', px: 2, py: 1, minWidth: '80px' }}>
            <Typography sx={{ fontSize: '9px', textAlign: 'center', mb: 0.5 }}>PERCENTAGE</Typography>
            <Typography sx={{ fontSize: '11px', textAlign: 'center', fontWeight: 'bold' }}>{averageScore}%</Typography>
          </Box>
          <Box sx={{ border: '1px solid black', px: 2, py: 1, minWidth: '80px' }}>
            <Typography sx={{ fontSize: '9px', textAlign: 'center', mb: 0.5 }}>CLASS<br/>AVERAGE</Typography>
            <Typography sx={{ fontSize: '11px', textAlign: 'center', fontWeight: 'bold' }}></Typography>
          </Box>
        </Box>
      </Box>

      {/* Remarks Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, pb: 1, borderBottom: '1px solid black' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '11px', minWidth: '180px' }}>Class Teacher's Comment:</Typography>
          <Box sx={{ borderBottom: '1px solid black', flex: 1, mx: 2, pb: 0.5 }}>
            <Typography sx={{ fontSize: '11px' }}>{getTeacherRemarks(averageScore)}</Typography>
          </Box>
          <Typography sx={{ fontWeight: 'bold', fontSize: '11px', minWidth: '80px' }}>Signature:</Typography>
          <Box sx={{ borderBottom: '1px solid black', width: '120px', ml: 1 }}></Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '11px', minWidth: '180px' }}>Head Teacher's Comment:</Typography>
          <Box sx={{ borderBottom: '1px solid black', flex: 1, mx: 2, pb: 0.5 }}>
            <Typography sx={{ fontSize: '11px' }}>{getHeadmasterRemarks(averageScore)}</Typography>
          </Box>
          <Typography sx={{ fontWeight: 'bold', fontSize: '11px', minWidth: '80px' }}>Signature:</Typography>
          <Box sx={{ borderBottom: '1px solid black', width: '120px', ml: 1 }}></Box>
        </Box>
      </Box>

      {/* Footer Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '11px' }}>Next Term/Session Resumes On:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '150px', ml: 1 }}>
            <Typography sx={{ fontSize: '11px' }}>
              {term?.NextTermResumeDate || term?.nextTermResumeDate 
                ? new Date(term.NextTermResumeDate || term.nextTermResumeDate).toLocaleDateString() 
                : '-'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '11px' }}>Promoted To:</Typography>
          <Box sx={{ borderBottom: '1px solid black', minWidth: '150px', ml: 1 }}></Box>
        </Box>
      </Box>

      {/* Grading Key */}
      <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid black' }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 'bold', mb: 0.5 }}>GRADING SYSTEM KEY:</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography sx={{ fontSize: '9px' }}>A1 (90-100) = EXCELLENT</Typography>
          <Typography sx={{ fontSize: '9px' }}>B2 (80-89) = VERY GOOD</Typography>
          <Typography sx={{ fontSize: '9px' }}>B3 (75-79) = GOOD</Typography>
          <Typography sx={{ fontSize: '9px' }}>C4 (70-74) = VERY GOOD</Typography>
          <Typography sx={{ fontSize: '9px' }}>C5 (65-69) = GOOD</Typography>
          <Typography sx={{ fontSize: '9px' }}>C6 (60-64) = GOOD</Typography>
          <Typography sx={{ fontSize: '9px' }}>D7 (55-59) = FAIR</Typography>
          <Typography sx={{ fontSize: '9px' }}>E8 (50-54) = PASS</Typography>
          <Typography sx={{ fontSize: '9px' }}>F9 (0-49) = FAIL</Typography>
        </Box>
      </Box>
    </Box>
  );
});

export default ResultDownloadTemplate;