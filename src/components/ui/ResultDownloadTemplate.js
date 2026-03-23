import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import schoolLogo from '../../assets/school logo imj/school-logo bck.png';

const ResultDownloadTemplate = React.forwardRef(({ result, student, term, academicYear, subjectResults, totals }, ref) => {
  const getGradeColor = (grade) => {
    if (!grade) return { color: '#757575', bgcolor: '#F5F5F5' };
    const firstChar = grade.toUpperCase().charAt(0);
    if (['A'].includes(firstChar)) return { color: '#fff', bgcolor: '#2E7D32' };
    if (['B'].includes(firstChar)) return { color: '#fff', bgcolor: '#1976D2' };
    if (['C'].includes(firstChar)) return { color: '#fff', bgcolor: '#F57C00' };
    if (['D'].includes(firstChar)) return { color: '#fff', bgcolor: '#C62828' };
    if (['F'].includes(firstChar)) return { color: '#fff', bgcolor: '#C62828' };
    return { color: '#757575', bgcolor: '#F5F5F5' };
  };

  const studentName = student 
    ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
    : result?.student?.firstName 
      ? `${result.student.firstName} ${result.student.lastName}`
      : result?.Student?.firstName 
        ? `${result.Student.firstName} ${result.Student.lastName}`
        : 'Unknown Student';

  const studentNumber = student?.studentNumber 
    || student?.admissionNumber 
    || result?.student?.studentNumber 
    || result?.Student?.studentNumber 
    || 'N/A';

  const className = result?.class?.name || result?.Class?.name || 'N/A';
  const termName = term?.name || term?.Name || result?.term?.name || result?.Term?.name || 'N/A';
  const academicYearName = academicYear?.name || academicYear?.Name || 'N/A';
  const position = result?.positionInClass || result?.PositionInClass;
  const teacherRemarks = result?.teacherRemarks || result?.TeacherRemarks || '';
  const headmasterComment = result?.headmasterComment || result?.HeadmasterComment || '';
  const overallGradeLetter = result?.overallGradeLetter || result?.OverallGradeLetter;
  const isPublished = result?.isPublished || result?.IsPublished;

  return (
    <Box
      ref={ref}
      sx={{
        width: '210mm',
        minHeight: '297mm',
        bgcolor: '#fff',
        p: 4,
        fontFamily: '"Segoe UI", Arial, sans-serif',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pb: 2, borderBottom: '2px solid #2E7D32' }}>
        <Box
          component="img"
          src={schoolLogo}
          alt="School Logo"
          sx={{ width: 80, height: 80, objectFit: 'contain', mr: 3 }}
        />
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography 
            sx={{ 
              fontSize: '24px', 
              fontWeight: 800, 
              color: '#1B5E20',
              letterSpacing: '1px'
            }}
          >
            300 ARUNDEL LEARNING CENTRE
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#666', mt: 0.5 }}>
            Academic Excellence | Character Development
          </Typography>
        </Box>
      </Box>

      {/* Term Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#2E7D32' }}>
          STUDENT TERMINAL REPORT
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#666', mt: 0.5 }}>
          {termName} - {academicYearName}
        </Typography>
      </Box>

      {/* Student Info */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3, 
        p: 2, 
        bgcolor: '#E8F5E9',
        borderRadius: 1,
        border: '1px solid #2E7D32'
      }}>
        <Box>
          <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>STUDENT NAME</Typography>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1B5E20' }}>{studentName}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>ADMISSION NO.</Typography>
          <Typography sx={{ fontSize: '14px', fontWeight: 700 }}>{studentNumber}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>CLASS</Typography>
          <Typography sx={{ fontSize: '14px', fontWeight: 700 }}>{className}</Typography>
        </Box>
        {position && (
          <Box>
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>POSITION</Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#2E7D32' }}>{position}</Typography>
          </Box>
        )}
      </Box>

      {/* Results Table */}
      <TableContainer sx={{ mb: 3, border: '1px solid #2E7D32' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#2E7D32' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '12px', border: '1px solid #1B5E20', width: '5%' }}>S/N</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '12px', border: '1px solid #1B5E20' }}>SUBJECT</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: '12px', border: '1px solid #1B5E20', width: '12%' }}>OBJECTIVE</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: '12px', border: '1px solid #1B5E20', width: '12%' }}>THEORY</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: '12px', border: '1px solid #1B5E20', width: '12%' }}>TOTAL</TableCell>
              <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: '12px', border: '1px solid #1B5E20', width: '10%' }}>GRADE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjectResults.map((sr, index) => {
              const objectiveScore = sr.objectiveScore ?? sr.ObjectiveScore ?? 0;
              const theoryScore = sr.theoryScore ?? sr.TheoryScore ?? 0;
              const totalScore = sr.totalScore ?? sr.TotalScore ?? 0;
              const maximumScore = sr.maximumScore ?? sr.MaximumScore ?? 0;
              const gradeLetter = sr.gradeLetter ?? sr.GradeLetter ?? 'N/A';
              const subjectName = sr.subjectName ?? sr.SubjectName ?? 'Unknown';
              const gradeStyle = getGradeColor(gradeLetter);

              return (
                <TableRow 
                  key={sr.subjectId || sr.SubjectId || index}
                  sx={{ 
                    bgcolor: index % 2 === 0 ? '#fff' : '#F1F8E9',
                    '&:hover': { bgcolor: '#E8F5E9' }
                  }}
                >
                  <TableCell sx={{ fontSize: '11px', border: '1px solid #E0E0E0' }}>{index + 1}</TableCell>
                  <TableCell sx={{ fontSize: '11px', fontWeight: 600, border: '1px solid #E0E0E0' }}>{subjectName}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', border: '1px solid #E0E0E0' }}>{objectiveScore}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', border: '1px solid #E0E0E0' }}>{theoryScore}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 700, border: '1px solid #E0E0E0' }}>
                    {totalScore} / {maximumScore}
                  </TableCell>
                  <TableCell align="center" sx={{ border: '1px solid #E0E0E0' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.25,
                        bgcolor: gradeStyle.bgcolor,
                        color: gradeStyle.color,
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {gradeLetter}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Box sx={{ 
          flex: 1, 
          p: 2, 
          bgcolor: '#E3F2FD', 
          borderRadius: 1,
          border: '1px solid #1976D2',
          textAlign: 'center'
        }}>
          <Typography sx={{ fontSize: '10px', color: '#666', mb: 0.5 }}>TOTAL SCORE</Typography>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#1565C0' }}>
            {totals.totalObtained} / {totals.totalMaximum}
          </Typography>
        </Box>
        <Box sx={{ 
          flex: 1, 
          p: 2, 
          bgcolor: '#FFF3E0', 
          borderRadius: 1,
          border: '1px solid #F57C00',
          textAlign: 'center'
        }}>
          <Typography sx={{ fontSize: '10px', color: '#666', mb: 0.5 }}>PERCENTAGE</Typography>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#E65100' }}>
            {totals.overallPercentage.toFixed(1)}%
          </Typography>
        </Box>
        <Box sx={{ 
          flex: 1, 
          p: 2, 
          bgcolor: '#E8F5E9', 
          borderRadius: 1,
          border: '1px solid #2E7D32',
          textAlign: 'center'
        }}>
          <Typography sx={{ fontSize: '10px', color: '#666', mb: 0.5 }}>OVERALL GRADE</Typography>
          <Box
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.5,
              bgcolor: getGradeColor(overallGradeLetter).bgcolor,
              color: getGradeColor(overallGradeLetter).color,
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            {overallGradeLetter || 'N/A'}
          </Box>
        </Box>
      </Box>

      {/* Remarks */}
      {(teacherRemarks || headmasterComment) && (
        <Box sx={{ mb: 3 }}>
          {teacherRemarks && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#F5F5F5', borderRadius: 1, borderLeft: '4px solid #1976D2' }}>
              <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: 700, mb: 0.5 }}>TEACHER'S REMARK</Typography>
              <Typography sx={{ fontSize: '12px', fontStyle: 'italic' }}>"{teacherRemarks}"</Typography>
            </Box>
          )}
          {headmasterComment && (
            <Box sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: 1, borderLeft: '4px solid #2E7D32' }}>
              <Typography sx={{ fontSize: '11px', color: '#666', fontWeight: 700, mb: 0.5 }}>HEADMASTER'S COMMENT</Typography>
              <Typography sx={{ fontSize: '12px', fontStyle: 'italic' }}>"{headmasterComment}"</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        mt: 4,
        pt: 2,
        borderTop: '1px solid #E0E0E0'
      }}>
        <Box>
          <Typography sx={{ fontSize: '10px', color: '#999' }}>
            {isPublished ? 'Published' : 'Not Yet Published'}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '10px', color: '#999' }}>
            300 Arundel Learning Centre
          </Typography>
          <Typography sx={{ fontSize: '9px', color: '#ccc' }}>
            Generated on {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

ResultDownloadTemplate.displayName = 'ResultDownloadTemplate';

export default ResultDownloadTemplate;
