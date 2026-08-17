import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Avatar, Chip, Button,
  IconButton, CircularProgress, Alert, Divider,
} from '@mui/material';
import {
  ArrowBack, Person, School, Badge, Phone, Email, LocationOn,
  Wc, CalendarMonth, Download, Print, CheckCircle, Cancel,
  FamilyRestroom, MedicalServices, Bloodtype, HealthAndSafety,
  Warning, LocalHospital, ContactEmergency, People, Class,
  EventAvailable,
  ConfirmationNumber,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InfoField = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'flex-start', gap: 2, p: 2,
      borderRadius: 2, background: '#F8FAF9',
      border: '1px solid rgba(111, 175, 143, 0.08)',
    }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: 1.5, display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: 'white',
        color: '#6FAF8F', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)', flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{
          color: '#64748B', fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.05em', fontSize: '0.7rem',
        }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{
          fontWeight: 600, color: '#1E293B', mt: 0.25, wordBreak: 'break-word',
        }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

const SectionCard = ({ icon, title, color, children }) => (
  <Card sx={{
    borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: `${color}15`, color: color,
        }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
          {title}
        </Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
);

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const idCardRef = useRef(null);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.students.getById(id);
      if (res.data?.success) {
        setStudent(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const downloadIdCard = useCallback(async () => {
    if (!idCardRef.current) return;
    try {
      const canvas = await html2canvas(idCardRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', [54, 86]);
      const pdfWidth = 86;
      const pdfHeight = 54;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`${student?.firstName || 'student'}_${student?.lastName || 'id'}_IDCard.pdf`);
    } catch (err) {
      console.error('Failed to download ID card:', err);
    }
  }, [student]);

  if (!student) {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#6FAF8F' }} />
            <Typography sx={{ mt: 2, color: '#64748B' }}>Loading student details...</Typography>
          </Box>
        </Box>
      );
    }
    if (error) {
      return (
        <Box>
          <PageHeader title="Student Detail" subtitle="View student information" />
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        </Box>
      );
    }
    return null;
  }

  const fullName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student';
  const initial = (student.firstName || student.fullName || 'S').charAt(0).toUpperCase();
  const className = student.currentClasses?.[0]?.displayName || student.currentClasses?.[0]?.name || '';
  const email = student.user?.email || '';
  const parents = student.parents || [];
  const hasParent = parents.length > 0;
  const primaryParent = parents.find(p => p.isPrimaryContact) || parents[0];
  const parentName = primaryParent?.parent ? `${primaryParent.parent.firstName || ''} ${primaryParent.parent.lastName || ''}`.trim() : '';
  const parentPhone = primaryParent?.parent?.phoneNumber || '';
  const parentEmail = primaryParent?.parent?.email || '';
  const parentRelationship = primaryParent?.relationship || '';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate('/admin-dashboard/students')} sx={{ color: '#6FAF8F' }}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B' }}>
            Student Profile
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            {className || 'No class'} {student.studentNumber ? `• ${student.studentNumber}` : ''}
          </Typography>
        </Box>
      </Box>

      {/* Profile Header Card */}
      <Card sx={{
        borderRadius: 3, overflow: 'hidden', mb: 3,
        background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 50%, #3D6B57 100%)',
      }}>
        <Box sx={{ p: 4, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <Box sx={{ display: 'flex', alignItems: { xs: 'center', md: 'flex-end' }, gap: 3, flexDirection: { xs: 'column', md: 'row' }, position: 'relative', zIndex: 1 }}>
            <Avatar sx={{
              width: 100, height: 100, border: '4px solid rgba(255,255,255,0.3)',
              bgcolor: 'rgba(255,255,255,0.95)', color: '#4E8C70',
              fontWeight: 700, fontSize: '2.2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}>
              {initial}
            </Avatar>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                {fullName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                {className && (
                  <Chip icon={<School sx={{ fontSize: 14 }} />} label={className} size="small" sx={{ background: 'rgba(255,255,255,0.9)', color: '#3D6B57', fontWeight: 600 }} />
                )}
                {student.studentNumber && (
                  <Chip icon={<Badge sx={{ fontSize: 14 }} />} label={student.studentNumber} size="small" sx={{ background: 'rgba(255,255,255,0.9)', color: '#3D6B57', fontWeight: 600 }} />
                )}
                <Chip label={student.isActive ? 'Active' : 'Inactive'} size="small" sx={{
                  background: student.isActive ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                  color: 'white', fontWeight: 600,
                }} />
                <Chip
                  icon={hasParent ? <CheckCircle sx={{ fontSize: 14 }} /> : <Cancel sx={{ fontSize: 14 }} />}
                  label={hasParent ? 'Linked to Parent' : 'No Parent Linked'}
                  size="small"
                  sx={{
                    background: hasParent ? 'rgba(255,255,255,0.9)' : 'rgba(255,200,200,0.85)',
                    color: hasParent ? '#2E7D32' : '#C62828',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Print />}
                onClick={() => window.print()}
                sx={{
                  background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                  color: 'white', borderRadius: 2,
                  '&:hover': { background: 'rgba(255,255,255,0.3)' },
                }}
              >
                Print
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={downloadIdCard}
                sx={{
                  background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                  color: 'white', borderRadius: 2,
                  '&:hover': { background: 'rgba(255,255,255,0.3)' },
                }}
              >
                Download ID
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <SectionCard icon={<Person />} title="Personal Information" color="#6FAF8F">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><InfoField icon={<Badge />} label="Full Name" value={fullName} /></Grid>
              {student.studentNumber && (
                <Grid item xs={12} sm={6}><InfoField icon={<ConfirmationNumber />} label="Student Number" value={student.studentNumber} /></Grid>
              )}
              {student.gender && (
                <Grid item xs={12} sm={6}><InfoField icon={<Wc />} label="Gender" value={student.gender} /></Grid>
              )}
              {student.dateOfBirth && (
                <Grid item xs={12} sm={6}>
                  <InfoField icon={<CalendarMonth />} label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                </Grid>
              )}
              {student.phoneNumber && (
                <Grid item xs={12} sm={6}><InfoField icon={<Phone />} label="Phone" value={student.phoneNumber} /></Grid>
              )}
              {student.address && (
                <Grid item xs={12}><InfoField icon={<LocationOn />} label="Address" value={student.address} /></Grid>
              )}
            </Grid>
          </SectionCard>
        </Grid>

        {/* Academic Information */}
        <Grid item xs={12} md={6}>
          <SectionCard icon={<School />} title="Academic Information" color="#8B5CF6">
            <Grid container spacing={2}>
              {className && (
                <Grid item xs={12} sm={6}><InfoField icon={<Class />} label="Class" value={className} /></Grid>
              )}
              {student.admissionDate && (
                <Grid item xs={12} sm={6}>
                  <InfoField icon={<EventAvailable />} label="Enrollment Date" value={new Date(student.admissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                </Grid>
              )}
            </Grid>
          </SectionCard>

          {/* Parent / Guardian Information — only shown when linked */}
          {hasParent && (
            <Box sx={{ mt: 3 }}>
              <SectionCard icon={<FamilyRestroom />} title="Parent / Guardian" color="#F59E0B">
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 600,
                    background: 'rgba(16,185,129,0.1)',
                    color: '#059669',
                  }}>
                    Linked to Parent
                  </Box>
                  {parentRelationship && (
                    <Box sx={{
                      px: 1.5, py: 0.5, borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 500,
                      background: 'rgba(111,175,143,0.08)',
                      color: '#64748B',
                    }}>
                      {parentRelationship}
                    </Box>
                  )}
                </Box>
                <Grid container spacing={2}>
                  {parentName && <Grid item xs={12} sm={6}><InfoField icon={<Person />} label="Parent Name" value={parentName} /></Grid>}
                  {parentPhone && <Grid item xs={12} sm={6}><InfoField icon={<Phone />} label="Parent Phone" value={parentPhone} /></Grid>}
                  {parentEmail && <Grid item xs={12} sm={6}><InfoField icon={<Email />} label="Parent Email" value={parentEmail} /></Grid>}
                </Grid>
              </SectionCard>
            </Box>
          )}
        </Grid>

        {/* Medical Information */}
        <Grid item xs={12} md={6}>
          <SectionCard icon={<MedicalServices />} title="Medical Information" color="#EF4444">
            <Grid container spacing={2}>
              {student.bloodGroup && <Grid item xs={12} sm={6}><InfoField icon={<Bloodtype />} label="Blood Group" value={student.bloodGroup} /></Grid>}
              {student.genotype && <Grid item xs={12} sm={6}><InfoField icon={<HealthAndSafety />} label="Genotype" value={student.genotype} /></Grid>}
              {student.allergies && <Grid item xs={12} sm={6}><InfoField icon={<Warning />} label="Allergies" value={student.allergies} /></Grid>}
              {student.medicalConditions && <Grid item xs={12} sm={6}><InfoField icon={<LocalHospital />} label="Medical Conditions" value={student.medicalConditions} /></Grid>}
            </Grid>
          </SectionCard>
        </Grid>

        {/* Emergency Contact */}
        <Grid item xs={12} md={6}>
          <SectionCard icon={<ContactEmergency />} title="Emergency Contact" color="#EC4899">
            <Grid container spacing={2}>
              {student.emergencyContactName && <Grid item xs={12} sm={6}><InfoField icon={<Person />} label="Contact Name" value={student.emergencyContactName} /></Grid>}
              {student.emergencyContactPhone && <Grid item xs={12} sm={6}><InfoField icon={<Phone />} label="Contact Phone" value={student.emergencyContactPhone} /></Grid>}
              {student.emergencyContactRelationship && <Grid item xs={12}><InfoField icon={<People />} label="Relationship" value={student.emergencyContactRelationship} /></Grid>}
            </Grid>
          </SectionCard>
        </Grid>

        {/* ID Card Section */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 2, mt: 1 }}>
            School ID Card
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box ref={idCardRef} sx={{ width: 380, maxWidth: '100%' }}>
              {/* Front of Card */}
              <Card sx={{
                borderRadius: 2, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(111,175,143,0.2)',
              }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
                  p: 2, textAlign: 'center',
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 0.5 }}>
                    300 ARUNDEL LEARNING LIMITED
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>
                    School Identification Card
                  </Typography>
                </Box>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar sx={{
                      width: 70, height: 70, borderRadius: 2,
                      bgcolor: '#E8F5E9', color: '#2E7D32',
                      fontWeight: 700, fontSize: '1.5rem',
                    }}>
                      {initial}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, color: '#1B5E20', fontSize: '1rem' }}>
                        {fullName}
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Student
                      </Typography>
                      <Divider sx={{ my: 0.8, borderColor: 'rgba(111,175,143,0.15)' }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        {className && (
                          <Box>
                            <Typography sx={{ color: '#64748B', fontSize: '0.55rem', textTransform: 'uppercase' }}>Class</Typography>
                            <Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.75rem' }}>{className}</Typography>
                          </Box>
                        )}
                        {student.studentNumber && (
                          <Box>
                            <Typography sx={{ color: '#64748B', fontSize: '0.55rem', textTransform: 'uppercase' }}>Student ID</Typography>
                            <Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.75rem' }}>{student.studentNumber}</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{
                    background: '#F8FAF9', borderRadius: 1.5, p: 1.5,
                    border: '1px solid rgba(111,175,143,0.1)',
                  }}>
                    {student.gender && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ color: '#64748B', fontSize: '0.55rem', textTransform: 'uppercase' }}>Gender</Typography>
                        <Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.7rem' }}>{student.gender}</Typography>
                      </Box>
                    )}
                    {student.bloodGroup && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#64748B', fontSize: '0.55rem', textTransform: 'uppercase' }}>Blood Group</Typography>
                        <Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.7rem' }}>{student.bloodGroup}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                <Box sx={{
                  background: '#F1F5F4', p: 1, textAlign: 'center',
                  borderTop: '1px solid rgba(111,175,143,0.1)',
                }}>
                  <Typography sx={{ color: '#64748B', fontSize: '0.5rem' }}>
                    Valid for {new Date().getFullYear()}/{new Date().getFullYear() + 1} Academic Session
                  </Typography>
                </Box>
              </Card>

              {/* Back of Card */}
              <Card sx={{
                borderRadius: 2, overflow: 'hidden', mt: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(111,175,143,0.2)',
              }}>
                <Box sx={{
                  background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
                  p: 1, textAlign: 'center',
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem', letterSpacing: 0.5 }}>
                    300 ARUNDEL LEARNING LIMITED
                  </Typography>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: '#2E7D32', fontSize: '0.7rem', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Emergency Contact
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography sx={{ color: '#64748B', fontSize: '0.55rem' }}>Name:</Typography>
                    <Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.7rem' }}>{student.emergencyContactName || parentName || 'Not provided'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                    <Typography sx={{ color: '#64748B', fontSize: '0.55rem' }}>Phone:</Typography>
                    <Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: '0.7rem' }}>{student.emergencyContactPhone || parentPhone || 'Not provided'}</Typography>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: 'rgba(111,175,143,0.15)' }} />
                  <Typography sx={{ fontWeight: 700, color: '#2E7D32', fontSize: '0.65rem', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Address
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: '0.65rem', lineHeight: 1.4 }}>
                    {student.address || '13 Modiubada Str, off Carwash Bus Stop, Ikotun, Lagos'}
                  </Typography>
                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(111,175,143,0.1)', textAlign: 'center' }}>
                    <Typography sx={{ color: '#94A3B8', fontSize: '0.5rem' }}>
                      If found, please return to 300 Arundel Learning Limited
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={() => window.print()}
              sx={{
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                borderRadius: 2.5, px: 4,
              }}
            >
              Print ID Card
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadIdCard}
              sx={{
                borderColor: '#6FAF8F', color: '#6FAF8F', borderRadius: 2.5, px: 4,
                '&:hover': { borderColor: '#4E8C70', background: 'rgba(111,175,143,0.06)' },
              }}
            >
              Download PDF
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDetail;
