import React from 'react';
import { Box, Typography } from '@mui/material';
import schoolLogo from '../../assets/school logo imj/school-logo bck.png';

const KG_ASSESSMENT_ITEMS = [
  'Ability to Identify Shapes',
  'Ability to Colour',
  'Ability to Communicate with Peer',
  'Showing Good Habit',
  'Table Manner',
  'Communication Skill & Language',
  'Ability to Identify & Write Letters',
  'Ability to Identify Objects at School',
  'Ability to Identify Objects at Home',
  'Attitude Towards Classwork',
  'Punctuality',
  'Physical Appearance',
  'Adjusting to Good Habit',
  'Adjusting to Good Eating Habit',
  'Regularity in School',
  'Ability to Differentiate Colour',
  'Ability to Scribble',
  'Ability to Recite Rhymes',
  'Sport',
  'Ability to Clap to Tone',
  'Ability to Dance to Music',
  'Ability to Twist',
  'Ability to Relate with Peer',
  'Attitude Towards Assignment',
];

const getGradeForItem = (itemLabel, psychomotor, affective) => {
  const keyMap = {
    'Ability to Identify Shapes': 'abilityToIdentifyShapes',
    'Ability to Colour': 'abilityToColour',
    'Ability to Communicate with Peer': 'abilityToCommunicateWithPeer',
    'Showing Good Habit': 'showingGoodHabit',
    'Table Manner': 'tableManner',
    'Communication Skill & Language': 'communicationSkillLanguage',
    'Ability to Identify & Write Letters': 'abilityToIdentifyWriteLetters',
    'Ability to Identify Objects at School': 'abilityToIdentifyObjectsSchool',
    'Ability to Identify Objects at Home': 'abilityToIdentifyObjectsHome',
    'Attitude Towards Classwork': 'attitudeTowardsClasswork',
    'Punctuality': 'kgPunctuality',
    'Physical Appearance': 'kgPhysicalAppearance',
    'Adjusting to Good Habit': 'kgAdjustingGoodHabit',
    'Adjusting to Good Eating Habit': 'kgAdjustingGoodEating',
    'Regularity in School': 'kgRegularityInSchool',
    'Ability to Differentiate Colour': 'abilityToDifferentiateColour',
    'Ability to Scribble': 'abilityToScribble',
    'Ability to Recite Rhymes': 'abilityToReciteRhymes',
    'Sport': 'kgSport',
    'Ability to Clap to Tone': 'abilityToClapToTone',
    'Ability to Dance to Music': 'abilityToDanceToMusic',
    'Ability to Twist': 'abilityToTwist',
    'Ability to Relate with Peer': 'kgAbilityToRelateWithPeer',
    'Attitude Towards Assignment': 'kgAttitudeTowardsAssignment',
  };

  const key = keyMap[itemLabel];
  if (!key) return null;

  const allTraits = { ...psychomotor, ...affective };
  return allTraits[key] || null;
};

const renderGradeCell = (itemLabel, grade, psychomotor, affective) => {
  const isActive = getGradeForItem(itemLabel, psychomotor, affective) === grade;
  return (
    <td style={{
      width: 40,
      textAlign: 'center',
      border: '1px solid #333',
      padding: '4px 0',
      fontSize: '13px',
      fontWeight: isActive ? 'bold' : 'normal',
      color: isActive ? '#000' : '#999',
    }}>
      {isActive ? grade : ''}
    </td>
  );
};

const KGResultSheet = ({ data = {}, readOnly = false }) => {
  const student = data?.student || data?.Student || data?.StudentProfile || {};
  const term = data?.Term || data?.term || {};
  const academicYear = data?.AcademicYear || data?.academicYear || {};
  const classInfo = data?.Class || data?.class || {};
  const subjectResults = data?.SubjectResults || data?.subjectResults || [];

  const psychomotor = data?.PsychomotorSkills || data?.psychomotorSkills || {};
  const affective = data?.AffectiveTraits || data?.affectiveTraits || {};

  const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || '_______________________________';
  const admissionNo = student.studentNumber || student.admissionNumber || '______';
  const sex = student.gender ? (typeof student.gender === 'string' ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : student.gender) : '______';
  const dob = student.dateOfBirth ? Math.floor((new Date() - new Date(student.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : '__';
  const className = classInfo.name || classInfo.Name || classInfo.displayName || 'Preparatory';

  const teacherComment = data?.teacherRemarks || data?.TeacherRemarks || '';
  const headTeacherComment = data?.headmasterComment || data?.HeadmasterComment || '';

  const termResume = term?.nextTermResumeDate || term?.NextTermResumeDate || '';
  const nextTermBegins = termResume ? new Date(termResume).toLocaleDateString() : '____________';
  const numberInClass = data?.numberOfStudents || data?.NumberOfStudents || '______';

  // Detect 3rd term / cumulative
  const termType = term?.termType || term?.TermType || '';
  const isThirdTerm = typeof termType === 'string' ? termType.toLowerCase().includes('third') || termType === '3' : termType === 3;
  const hasCumulativeFields = data?.cumulativeAveragePercentage !== undefined || data?.CumulativeAveragePercentage !== undefined;
  const isCumulative = isThirdTerm || hasCumulativeFields;

  // Calculate overall from subjects
  let totalScore = 0;
  let totalMax = 0;
  subjectResults.forEach(s => {
    totalScore += (s.TotalScore || s.totalScore || s.ThirdTermTestScore || s.thirdTermTestScore || 0) +
                  (s.ThirdTermExamScore || s.thirdTermExamScore || s.ObjectiveScore || s.objectiveScore || 0) +
                  (s.TheoryScore || s.theoryScore || 0);
    totalMax += (s.MaximumScore || s.maximumScore || 100);
  });
  const percentage = totalMax > 0 ? (totalScore / totalMax * 100).toFixed(1) : '0';

  // Overall grade letter
  const overallGrade = data?.overallGradeLetter || data?.OverallGradeLetter ||
    (parseFloat(percentage) >= 70 ? 'A' :
     parseFloat(percentage) >= 60 ? 'B' :
     parseFloat(percentage) >= 50 ? 'C' :
     parseFloat(percentage) >= 40 ? 'D' : 'F');

  const getGradeColor = (grade) => {
    if (!grade) return { bgcolor: '#f5f5f5', color: '#757575' };
    const g = grade.toUpperCase().charAt(0);
    if (g === 'A') return { bgcolor: '#e8f5e9', color: '#2e7d32' };
    if (g === 'B') return { bgcolor: '#e3f2fd', color: '#1565c0' };
    if (g === 'C') return { bgcolor: '#fff3e0', color: '#f57c00' };
    if (g === 'D') return { bgcolor: '#fff3e0', color: '#f57c00' };
    return { bgcolor: '#ffebee', color: '#c62828' };
  };

  return (
    <Box
      sx={{
        width: '210mm',
        minHeight: '297mm',
        bgcolor: '#fff',
        p: '10mm',
        fontFamily: '"Times New Roman", Arial, serif',
        fontSize: '13px',
        color: '#000',
        '@media print': {
          width: '100%',
          minHeight: 'auto',
          p: 0,
        },
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: '2px solid #000', pb: 2 }}>
        <Box component="img" src={schoolLogo} sx={{ height: 140, mr: 2 }} alt="School Logo" />
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '22px', letterSpacing: '1px', m: 0 }}>
            300 ARUNDEL LEARNING CENTRE
          </Typography>
          <Typography variant="body2" sx={{ m: 0, fontSize: '12px', color: '#333' }}>
            12A, Olusegun Asokun Close, Nopa Bus Stop
          </Typography>
          <Typography variant="body2" sx={{ m: 0, fontSize: '12px', color: '#333' }}>
            Evita OjoKoro Road, Ikorodu
          </Typography>
          <Typography variant="body2" sx={{ m: 0, fontSize: '12px', color: '#333' }}>
            Phone: 08023196047, 08033995565
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px', mt: 1.5, m: 0 }}>
            {academicYear?.name || academicYear?.Name || '________'} ACADEMIC SESSION
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '18px', mt: 1, m: 0 }}>
            {term?.name || term?.Name || 'TERM'} RESULT
          </Typography>
        </Box>
      </Box>

      {/* STUDENT INFORMATION */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', mb: 1, alignItems: 'baseline' }}>
          <strong style={{ minWidth: 80 }}>NAME:</strong>
          <Box sx={{ flex: 1, borderBottom: '1px solid #000', mx: 1, pb: '2px' }}>
            <Typography component="span" sx={{ fontSize: '13px' }}>{studentName}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', mb: 1, gap: 3, alignItems: 'baseline' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <strong>ADMISSION NO:</strong>
            <Box sx={{ borderBottom: '1px solid #000', mx: 1, minWidth: 80, pb: '2px' }}>
              <Typography component="span">{admissionNo}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <strong>SEX:</strong>
            <Box sx={{ borderBottom: '1px solid #000', mx: 1, minWidth: 40, pb: '2px' }}>
              <Typography component="span">{sex}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <strong>AGE:</strong>
            <Box sx={{ borderBottom: '1px solid #000', mx: 1, minWidth: 30, pb: '2px' }}>
              <Typography component="span">{dob}</Typography>
            </Box>
            <Typography component="span">YRS</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <strong>CLASS:</strong>
            <Box sx={{ borderBottom: '1px solid #000', mx: 1, minWidth: 100, pb: '2px' }}>
              <Typography component="span">{className}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', mb: 1, gap: 3, alignItems: 'baseline' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <strong>NO IN CLASS:</strong>
            <Box sx={{ borderBottom: '1px solid #000', mx: 1, minWidth: 40, pb: '2px' }}>
              <Typography component="span">{numberInClass}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <strong>NEXT TERM BEGINS:</strong>
            <Box sx={{ borderBottom: '1px solid #000', mx: 1, minWidth: 100, pb: '2px' }}>
              <Typography component="span">{nextTermBegins}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', mb: 1, alignItems: 'baseline' }}>
          <strong>GRADES:</strong>
          <Box sx={{ flex: 1, borderBottom: '1px solid #000', mx: 1, pb: '2px' }}>
            <Typography component="span">A = Excellent, B = Very Good, C = Good, D = Fair</Typography>
          </Box>
        </Box>
      </Box>

      {/* SUBJECTS TABLE - only if subjects exist */}
      {subjectResults.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center', mb: 1, m: 0 }}>
            SUBJECT RESULTS
          </Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #333', padding: '4px 6px', textAlign: 'left', fontWeight: 'bold', bgcolor: '#f0f0f0' }}>Subject</th>
                <th style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center', fontWeight: 'bold', bgcolor: '#f0f0f0', width: 60 }}>Score</th>
                <th style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center', fontWeight: 'bold', bgcolor: '#f0f0f0', width: 50 }}>%</th>
                <th style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center', fontWeight: 'bold', bgcolor: '#f0f0f0', width: 50 }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {subjectResults.map((s, i) => {
                const name = s.SubjectName || s.subjectName || 'Unknown';
                const score = (s.TotalScore || s.totalScore || 0);
                const max = s.MaximumScore || s.maximumScore || 100;
                const pct = s.Percentage || s.percentage || 0;
                const grade = s.GradeLetter || s.gradeLetter || 'N/A';
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ border: '1px solid #333', padding: '4px 6px' }}>{name}</td>
                    <td style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center' }}>{score} / {max}</td>
                    <td style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center' }}>{pct.toFixed(0)}%</td>
                    <td style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center' }}>{grade}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      )}

      {/* MAIN ASSESSMENT TABLE */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px', textAlign: 'center', mb: 1, m: 0 }}>
          AFFECTIVE / PSYCHOMOTOR ASSESSMENT
        </Typography>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{
                border: '1px solid #333', padding: '4px 6px', textAlign: 'left',
                fontWeight: 'bold', bgcolor: '#f0f0f0', width: '72%',
              }}>
                Assessment Item
              </th>
              <th style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center', fontWeight: 'bold', bgcolor: '#f0f0f0', width: '7%' }}>A</th>
              <th style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center', fontWeight: 'bold', bgcolor: '#f0f0f0', width: '7%' }}>B</th>
              <th style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center', fontWeight: 'bold', bgcolor: '#f0f0f0', width: '7%' }}>C</th>
              <th style={{ border: '1px solid #333', padding: '4px 0', textAlign: 'center', fontWeight: 'bold', bgcolor: '#f0f0f0', width: '7%' }}>D</th>
            </tr>
          </thead>
          <tbody>
            {KG_ASSESSMENT_ITEMS.map((item, index) => (
              <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ border: '1px solid #333', padding: '3px 6px', fontSize: '11.5px' }}>{item}</td>
                {renderGradeCell(item, 'A', psychomotor, affective)}
                {renderGradeCell(item, 'B', psychomotor, affective)}
                {renderGradeCell(item, 'C', psychomotor, affective)}
                {renderGradeCell(item, 'D', psychomotor, affective)}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* OVERALL GRADE - show for 3rd term / cumulative */}
      {isCumulative && (
        <Box sx={{ mb: 2, textAlign: 'center', p: 1, borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>
            OVERALL GRADE:
          </Typography>
          <Box sx={{ display: 'inline-block', mx: 2, px: 3, py: 0.5, borderRadius: 1,
            bgcolor: getGradeColor(overallGrade).bgcolor, color: getGradeColor(overallGrade).color,
            fontWeight: 'bold', fontSize: '20px', minWidth: 60, textAlign: 'center' }}>
            {overallGrade}
          </Box>
          <Typography sx={{ fontSize: '12px', color: '#555' }}>
            {parseFloat(percentage).toFixed(1)}% — {totalScore} / {totalMax}
          </Typography>
        </Box>
      )}

      {/* COMMENT SECTION */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', mb: 1, alignItems: 'baseline' }}>
          <strong style={{ minWidth: 180 }}>CLASS TEACHER'S COMMENT:</strong>
          <Box sx={{ flex: 1, borderBottom: '1px solid #000', mx: 1, pb: '2px' }}>
            <Typography component="span">{teacherComment || '___________________________'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', mb: 1, alignItems: 'baseline' }}>
          <strong style={{ minWidth: 180 }}>HEADTEACHER'S COMMENT:</strong>
          <Box sx={{ flex: 1, borderBottom: '1px solid #000', mx: 1, pb: '2px' }}>
            <Typography component="span">{headTeacherComment || '___________________________'}</Typography>
          </Box>
        </Box>
      </Box>

      {/* APPROVAL SECTION */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 'bold', mb: 1 }}>
          Result Approved by: The Headteacher & Academic Committee
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mt: 2 }}>
          <strong>Signature & Date:</strong>
          <Box sx={{ borderBottom: '1px solid #000', mx: 1, minWidth: 200, pb: '2px' }}></Box>
        </Box>
      </Box>

      {/* GRADING SCALE */}
      <Box sx={{ textAlign: 'right', mb: 2, fontSize: '12px' }}>
        <strong>GRADING SCALE:</strong>
        <Box sx={{ mt: 1 }}>
          <div>A - Excellent</div>
          <div>B - Very Good</div>
          <div>C - Good</div>
          <div>D - Fair</div>
        </Box>
      </Box>

      {/* FOOTER */}
      <Box sx={{ textAlign: 'center', borderTop: '1px solid #999', pt: 2, mt: 2 }}>
        <Typography sx={{ fontStyle: 'italic', fontSize: '13px', color: '#333' }}>
          "We prepare future leaders graciously"
        </Typography>
      </Box>
    </Box>
  );
};

export default KGResultSheet;
