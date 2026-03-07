import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  IconButton,
} from '@mui/material';
import {
  Person,
  School,
  EmojiEvents,
  Assessment,
  Visibility,
  Email,
  Phone,
  CalendarToday,
} from '@mui/icons-material';
import { parentAPI, adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAcademicYear, setActiveAcademicYear] = useState(null);
  const [activeTerm, setActiveTerm] = useState(null);

  useEffect(() => {
    fetchChildrenData();
    fetchAcademicData();
  }, []);

  const fetchChildrenData = async () => {
    try {
      setLoading(true);
      setError('');

      // TODO: Update this when backend endpoint is ready
      // const response = await parentAPI.children.getAll();
      // if (response.data?.success) {
      //   setChildren(response.data.data);
      //   if (response.data.data.length > 0) {
      //     setSelectedChild(response.data.data[0]);
      //   }
      // }

      // For now, use mock data
      const mockChildren = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          studentId: 'STU001',
          className: 'JSS 1',
          gender: 'Male',
          dateOfBirth: '2012-05-15',
          enrollmentDate: '2023-09-01',
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Doe',
          studentId: 'STU002',
          className: 'JSS 2',
          gender: 'Female',
          dateOfBirth: '2011-08-20',
          enrollmentDate: '2022-09-01',
        },
      ];
      setChildren(mockChildren);
      if (mockChildren.length > 0) {
        setSelectedChild(mockChildren[0]);
      }
    } catch (err) {
      console.error('Error fetching children:', err);
      setError('Failed to load children data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicData = async () => {
    try {
      // Fetch active academic year and term
      const [academicYearResponse, termResponse] = await Promise.all([
        adminAPI.academicYears.getActive(),
        adminAPI.terms.getActive(),
      ]);

      if (academicYearResponse.data?.success) {
        setActiveAcademicYear(academicYearResponse.data.data);
      }
      if (termResponse.data?.success) {
        setActiveTerm(termResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching academic data:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
  };

  const handleViewResults = (child) => {
    if (activeTerm) {
      navigate(`/dashboard/results?studentId=${child.id}`);
    }
  };

  const handleViewReportCard = (child) => {
    if (activeTerm) {
      navigate(`/dashboard/report-cards?studentId=${child.id}&termId=${activeTerm.id}`);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress sx={{ color: '#FF3E8A' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#ffffff',
            mb: 0.5,
          }}
        >
          Parent Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Welcome, {user?.name || 'Parent'}! Monitor your children's academic progress.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Academic Year & Term Info */}
      {activeAcademicYear && (
        <Card
          sx={{
            mb: 3,
            background: 'rgba(17, 17, 17, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday sx={{ color: '#FF3E8A', fontSize: 20 }} />
                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                  {activeAcademicYear.name}
                </Typography>
              </Box>
              {activeTerm && (
                <>
                  <Chip
                    label={activeTerm.name}
                    sx={{
                      background: 'rgba(255, 62, 138, 0.2)',
                      color: '#FF3E8A',
                      fontWeight: 600,
                    }}
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Children Selector */}
      {children.length > 1 && (
        <Card
          sx={{
            mb: 3,
            background: 'rgba(17, 17, 17, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 2,
                fontWeight: 600,
              }}
            >
              Select Child to View
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {children.map((child) => (
                <Button
                  key={child.id}
                  onClick={() => handleChildSelect(child)}
                  variant={selectedChild?.id === child.id ? 'contained' : 'outlined'}
                  sx={{
                    py: 1,
                    px: 2,
                    borderRadius: '50px',
                    fontWeight: 600,
                    textTransform: 'none',
                    ...(selectedChild?.id === child.id
                      ? {
                          background: '#FF3E8A',
                          color: '#ffffff',
                          boxShadow: '0 4px 20px rgba(255, 62, 138, 0.4)',
                        }
                      : {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: '#ffffff',
                        }),
                  }}
                >
                  {child.firstName} {child.lastName}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {selectedChild && (
        <>
          {/* Child Overview */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'rgba(17, 17, 17, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        background: 'rgba(33, 150, 243, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Person sx={{ fontSize: 28, color: '#2196F3' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: '#ffffff' }}
                      >
                        {selectedChild.firstName} {selectedChild.lastName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      >
                        {selectedChild.studentId}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'rgba(17, 17, 17, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        background: 'rgba(102, 187, 106, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <School sx={{ fontSize: 28, color: '#66BB6A' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: '#ffffff' }}
                      >
                        {selectedChild.className}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      >
                        Current Class
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'rgba(17, 17, 17, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  height: '100%',
                  cursor: 'pointer',
                }}
                onClick={() => handleViewResults(selectedChild)}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        background: 'rgba(255, 167, 38, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Assessment sx={{ fontSize: 28, color: '#FFA726' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: '#ffffff' }}
                      >
                        Results
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      >
                        View Performance
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  background: 'rgba(17, 17, 17, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  height: '100%',
                  cursor: 'pointer',
                }}
                onClick={() => handleViewReportCard(selectedChild)}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        background: 'rgba(255, 62, 138, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <EmojiEvents sx={{ fontSize: 28, color: '#FF3E8A' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: '#ffffff' }}
                      >
                        Report Card
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      >
                        View Report
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs for different views */}
          <Card
            sx={{
              background: 'rgba(17, 17, 17, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
            }}
          >
            <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab
                  label="Overview"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': { color: '#FF3E8A' },
                  }}
                />
                <Tab
                  label="Results"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': { color: '#FF3E8A' },
                  }}
                />
                <Tab
                  label="Report Card"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': { color: '#FF3E8A' },
                  }}
                />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}
                >
                  Student Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}
                      >
                        Student ID
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        {selectedChild.studentId}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}
                      >
                        Class
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        {selectedChild.className}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}
                      >
                        Gender
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        {selectedChild.gender}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 0.5 }}
                      >
                        Date of Birth
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff' }}>
                        {selectedChild.dateOfBirth}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 2, textAlign: 'center', py: 4 }}>
                <Assessment
                  sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }}
                />
                <Typography
                  variant="h6"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                >
                  View Results
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}
                >
                  Click below to view detailed results and performance
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleViewResults(selectedChild)}
                  sx={{
                    background: '#FF3E8A',
                    borderRadius: '50px',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  View Results
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ px: 2, textAlign: 'center', py: 4 }}>
                <EmojiEvents
                  sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }}
                />
                <Typography
                  variant="h6"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                >
                  View Report Card
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}
                >
                  Click below to view the full report card
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleViewReportCard(selectedChild)}
                  sx={{
                    background: '#FF3E8A',
                    borderRadius: '50px',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  View Report Card
                </Button>
              </Box>
            </TabPanel>
          </Card>
        </>
      )}

      {children.length === 0 && !loading && (
        <Card
          sx={{
            background: 'rgba(17, 17, 17, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            textAlign: 'center',
            py: 8,
          }}
        >
          <Person
            sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }}
          />
          <Typography
            variant="h6"
            sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
          >
            No Children Found
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            No children are linked to your account yet. Please contact the school
            administrator.
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default ParentDashboard;
