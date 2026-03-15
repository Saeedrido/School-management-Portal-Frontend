import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  Person,
  Phone,
  Email,
  LocationOn,
  Bloodtype,
  MedicalServices,
  ContactEmergency,
  School,
  FamilyRestroom,
  ArrowBack,
  Close,
  Badge,
  ConfirmationNumber,
  Wc,
  CalendarMonth,
  CalendarToday,
  EventAvailable,
  HistoryEdu,
  Work,
  HealthAndSafety,
  Warning,
  LocalHospital,
  People,
  Class,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';

const InfoSection = ({ icon, title, color, children }) => (
  <Box sx={{ mb: 4, '&:last-child': { mb: 0 } }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}15`,
          color: color,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: '#1E293B',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
);

const InfoField = ({ icon, label, value, valueColor }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
      p: 2,
      borderRadius: 2,
      background: '#F8FAF9',
      border: '1px solid rgba(111, 175, 143, 0.08)',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: '#F1F5F4',
        borderColor: 'rgba(111, 175, 143, 0.15)',
      },
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        color: '#6FAF8F',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          color: '#64748B',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.7rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          color: valueColor || '#1E293B',
          mt: 0.25,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const StudentProfile = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.classes.getAll();
      if (response.data?.success) {
        setClasses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
      const response = await adminAPI.students.getByClass(classId);
      if (response.data?.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProfile = async (studentId) => {
    setStudentLoading(true);
    try {
      const response = await adminAPI.students.getById(studentId);
      if (response.data?.success) {
        setSelectedStudent(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching student:', err);
    } finally {
      setStudentLoading(false);
    }
  };

  const handleStudentClick = async (student) => {
    await fetchStudentProfile(student.id);
    setProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileOpen(false);
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGenderColor = (gender) => {
    switch (gender) {
      case 'Male': return '#1976D2';
      case 'Female': return '#E91E63';
      default: return '#757575';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Student Profiles"
        subtitle="View student information by class"
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Select Class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.displayName || cls.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by name or student number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="textSecondary">
                {filteredStudents.length} students
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedClass ? (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#E8F5E9' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Student Number</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#1B5E20' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No students found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#2E7D32' }}>
                            {student.firstName?.[0]}{student.lastName?.[0]}
                          </Avatar>
                          <Typography fontWeight={500}>
                            {student.firstName} {student.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{student.studentNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.gender}
                          size="small"
                          sx={{ bgcolor: getGenderColor(student.gender), color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>{student.phoneNumber || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={student.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleStudentClick(student)}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <School sx={{ fontSize: 60, color: '#BDBDBD', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Select a class to view students
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Student Profile Dialog */}
      <Dialog
        open={profileOpen}
        onClose={handleCloseProfile}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'visible',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
          },
        }}
      >
        {studentLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : selectedStudent ? (
          <>
            {/* Header Section */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 50%, #3D6B57 100%)',
                p: 4,
                pb: 6,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      border: '4px solid rgba(255, 255, 255, 0.3)',
                      background: selectedStudent.photo ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                      overflow: 'hidden',
                    }}
                  >
                    {selectedStudent.photo ? (
                      <img 
                        src={selectedStudent.photo} 
                        alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }} 
                      />
                    ) : (
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: '#4E8C70',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {selectedStudent?.firstName?.[0]}{selectedStudent?.lastName?.[0]}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: 'white',
                        letterSpacing: '-0.01em',
                        mb: 0.5,
                      }}
                    >
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<span style={{ color: '#4E8C70', fontWeight: 600 }}>🎓</span>}
                        label={selectedStudent.studentNumber || selectedStudent.studentId}
                        size="small"
                        sx={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          color: '#4E8C70',
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: '#4E8C70' },
                        }}
                      />
                      <Chip
                        icon={<span style={{ color: selectedStudent.isActive ? '#059669' : '#DC2626' }}>●</span>}
                        label={selectedStudent.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          background: selectedStudent.isActive ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <IconButton
                  onClick={handleCloseProfile}
                  sx={{
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': { background: 'rgba(255, 255, 255, 0.25)' },
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            </Box>

            {/* Content Section */}
            <Box sx={{ p: 4, mt: -3, position: 'relative', zIndex: 2, maxHeight: '70vh', overflow: 'auto' }}>
              <Box
                sx={{
                  background: 'white',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(111, 175, 143, 0.1)',
                  p: 4,
                }}
              >
                {/* Student Information Card */}
                <InfoSection
                  icon={<Person />}
                  title="Student Information"
                  color="#6FAF8F"
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Badge />}
                        label="Full Name"
                        value={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<ConfirmationNumber />}
                        label="Student Number"
                        value={selectedStudent.studentNumber}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Wc />}
                        label="Gender"
                        value={selectedStudent.gender}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<CalendarMonth />}
                        label="Date of Birth"
                        value={selectedStudent.dateOfBirth || 'Not specified'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Phone />}
                        label="Phone Number"
                        value={selectedStudent.phoneNumber || 'Not provided'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Email />}
                        label="Email"
                        value={selectedStudent.email || 'Not provided'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InfoField
                        icon={<LocationOn />}
                        label="Address"
                        value={selectedStudent.address || 'Not provided'}
                      />
                    </Grid>
                  </Grid>
                </InfoSection>

                {/* Academic Information Card */}
                <InfoSection
                  icon={<School />}
                  title="Academic Information"
                  color="#8B5CF6"
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Class />}
                        label="Class"
                        value={selectedStudent.className || 'Not assigned'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<CalendarToday />}
                        label="Academic Year"
                        value={selectedStudent.academicYear || 'Not specified'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<EventAvailable />}
                        label="Enrollment Date"
                        value={selectedStudent.admissionDate 
                          ? new Date(selectedStudent.admissionDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) 
                          : 'Not specified'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<HistoryEdu />}
                        label="Admission Number"
                        value={selectedStudent.admissionNumber || selectedStudent.studentId || 'Not provided'}
                      />
                    </Grid>
                  </Grid>
                </InfoSection>

                {/* Parent/Guardian Information Card */}
                <InfoSection
                  icon={<FamilyRestroom />}
                  title="Parent / Guardian Information"
                  color="#F59E0B"
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Person />}
                        label="Parent Name"
                        value={selectedStudent.parentName || 'Not provided'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Phone />}
                        label="Parent Phone"
                        value={selectedStudent.parentPhone || 'Not provided'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Email />}
                        label="Parent Email"
                        value={selectedStudent.parentEmail || 'Not provided'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Work />}
                        label="Parent Occupation"
                        value={selectedStudent.parentOccupation || 'Not provided'}
                      />
                    </Grid>
                  </Grid>
                </InfoSection>

                {/* Medical Information Card */}
                <InfoSection
                  icon={<MedicalServices />}
                  title="Medical Information"
                  color="#EF4444"
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Bloodtype />}
                        label="Blood Group"
                        value={selectedStudent.bloodGroup || 'Not specified'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<HealthAndSafety />}
                        label="Genotype"
                        value={selectedStudent.genotype || 'Not specified'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Warning />}
                        label="Allergies"
                        value={selectedStudent.allergies || 'None'}
                        valueColor={selectedStudent.allergies ? '#EF4444' : undefined}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<LocalHospital />}
                        label="Medical Conditions"
                        value={selectedStudent.medicalConditions || 'None'}
                        valueColor={selectedStudent.medicalConditions ? '#EF4444' : undefined}
                      />
                    </Grid>
                  </Grid>
                </InfoSection>

                {/* Emergency Contact Card */}
                <InfoSection
                  icon={<ContactEmergency />}
                  title="Emergency Contact"
                  color="#EC4899"
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Person />}
                        label="Contact Name"
                        value={selectedStudent.emergencyContactName || 'Not provided'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<Phone />}
                        label="Contact Phone"
                        value={selectedStudent.emergencyContactPhone || 'Not provided'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <InfoField
                        icon={<People />}
                        label="Relationship"
                        value={selectedStudent.emergencyContactRelationship || 'Not provided'}
                      />
                    </Grid>
                  </Grid>
                </InfoSection>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No student data available</Typography>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default StudentProfile;
