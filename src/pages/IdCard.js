import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Grid,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Print,
  QRCode,
  School,
  CalendarToday,
  Phone,
  Email,
  Person,
  Badge,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useMockData } from '../context/MockDataContext';

// Mock QR Code component (placeholder)
const MockQRCode = ({ value }) => (
  <Box
    sx={{
      width: 100,
      height: 100,
      background: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      border: '2px solid #000',
      borderRadius: 1,
    }}
  />
);

const IdCard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students } = useMockData();

  // Find student based on logged-in user
  // For teachers/admins, show a list or first student
  const [selectedStudentId, setSelectedStudentId] = useState(
    user?.role === 'Student' ? students.find(s => s.email === user?.email)?.id : students[0]?.id
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  if (!selectedStudent) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Badge sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            No student records found
          </Typography>
        </Box>
      </Box>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 }, textAlign: { xs: 'center', sm: 'left' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'secondary.main',
                background: theme.palette.mode === 'dark' ? 'rgba(255, 62, 138, 0.1)' : 'rgba(255, 62, 138, 0.05)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 0.5,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
              }}
            >
              Student ID Card
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              Official identification document
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{
              color: 'text.primary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.primary',
                background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            sx={{
              background: 'secondary.main',
              '&:hover': { background: 'secondary.dark' },
            }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* ID Card */}
      <Grid container spacing={3} justifyContent="center">
        {/* Front of Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #0a192f 0%, #1a2332 50%, #0d1b2a 100%)',
              border: '2px solid rgba(255, 62, 138, 0.3)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '8px',
                background: 'linear-gradient(90deg, #FF3E8A 0%, #FF5DA3 50%, #2196F3 100%)',
              },
            }}
          >
            {/* School Header */}
            <Box
              sx={{
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #FF3E8A 0%, #FF5DA3 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <School sx={{ fontSize: 30, color: '#ffffff' }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Excellence Academy
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                  }}
                >
                  Excellence in Education
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* Photo Section */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={selectedStudent.photo}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '4px solid #FF3E8A',
                      boxShadow: '0 0 30px rgba(255, 62, 138, 0.4)',
                      bgcolor: '#111111',
                      fontSize: '2.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {!selectedStudent.photo && (
                      <Person sx={{ fontSize: 60 }} />
                    )}
                  </Avatar>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      px: 1.5,
                      py: 0.5,
                      background: 'linear-gradient(135deg, #FF3E8A 0%, #FF5DA3 100%)',
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      textTransform: 'uppercase',
                    }}
                  >
                    {selectedStudent.gender === 'Male' ? 'STUDENT' : 'STUDENT'}
                  </Box>
                </Box>
              </Box>

              {/* Name */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    mb: 0.5,
                  }}
                >
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  STUDENT
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

              {/* Details Grid */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Badge sx={{ fontSize: 16, color: '#FF3E8A' }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        Student ID
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        {selectedStudent.studentId}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <School sx={{ fontSize: 16, color: '#FF3E8A' }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        Class
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        {selectedStudent.className}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: '#FF3E8A' }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        Date of Birth
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        {selectedStudent.dateOfBirth}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Phone sx={{ fontSize: 16, color: '#FF3E8A' }} />
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        Gender
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        {selectedStudent.gender}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Validity */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  background: 'rgba(255, 62, 138, 0.1)',
                  border: '1px solid rgba(255, 62, 138, 0.3)',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  Valid Until
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FF3E8A',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  {new Date().getFullYear() + 1} - {new Date().getFullYear() + 2} Academic Year
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Back of Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #0a192f 0%, #1a2332 50%, #0d1b2a 100%)',
              border: '2px solid rgba(255, 62, 138, 0.3)',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              height: '100%',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '8px',
                background: 'linear-gradient(90deg, #FF3E8A 0%, #FF5DA3 50%, #2196F3 100%)',
              },
            }}
          >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Emergency Contact */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FF3E8A',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    mb: 2,
                    letterSpacing: 1,
                  }}
                >
                  Emergency Contact
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Person sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.6)' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.65rem',
                        display: 'block',
                      }}
                    >
                      Parent/Guardian Name
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      {selectedStudent.parentName || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Phone sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.6)' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.65rem',
                        display: 'block',
                      }}
                    >
                      Parent Phone
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      {selectedStudent.parentPhone || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Email sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.6)' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.65rem',
                        display: 'block',
                      }}
                    >
                      Parent Email
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      {selectedStudent.parentEmail || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

              {/* Address */}
              <Box sx={{ mb: 3, flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FF3E8A',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    mb: 1.5,
                    letterSpacing: 1,
                  }}
                >
                  Contact Address
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                  }}
                >
                  {selectedStudent.address || 'N/A'}
                </Typography>
              </Box>

              {/* QR Code Section */}
              <Box sx={{ textAlign: 'center' }}>
                <MockQRCode value={selectedStudent.studentId} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.65rem',
                    mt: 1,
                    display: 'block',
                  }}
                >
                  Scan for verification
                </Typography>
              </Box>

              {/* Terms */}
              <Box
                sx={{
                  mt: 'auto',
                  pt: 2,
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.6rem',
                    lineHeight: 1.5,
                    textAlign: 'center',
                  }}
                >
                  This card is the property of Excellence Academy. If found, please return to the school office.
                  <br />
                  Valid for current academic year only.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Student Selector (for Admin/Teacher) */}
      {(user?.role === 'Admin' || user?.role === 'Teacher') && students.length > 1 && (
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              mb: 2,
            }}
          >
            View Other Student Cards
          </Typography>
          <Grid container spacing={2}>
            {students.slice(0, 6).map((student) => (
              <Grid item xs={12} sm={6} md={4} key={student.id}>
                <Card
                  sx={{
                    background: 'rgba(17, 17, 17, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    cursor: 'pointer',
                    '&:hover': {
                      border: '1px solid #FF3E8A',
                      boxShadow: '0 0 20px rgba(255, 62, 138, 0.3)',
                    },
                    ...(selectedStudentId === student.id && {
                      border: '1px solid #FF3E8A',
                      boxShadow: '0 0 20px rgba(255, 62, 138, 0.3)',
                    }),
                  }}
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 45,
                          height: 45,
                          border: '2px solid #FF3E8A',
                          bgcolor: '#111111',
                        }}
                      >
                        {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                          }}
                        >
                          {student.firstName} {student.lastName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {student.className} • {student.studentId}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default IdCard;
