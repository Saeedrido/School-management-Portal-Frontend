import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  FamilyRestroom,
  People,
  Email,
  Phone,
  Close,
} from '@mui/icons-material';

const ParentList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, parent: null });
  const [studentFilter, setStudentFilter] = useState('all');

  // Mock parents data
  const mockParents = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+234 567 8901',
      occupation: 'Business Analyst',
      address: '123 Main St, Lagos',
      students: [
        { id: 101, name: 'Jane Doe', class: 'JSS 3A', relationship: 'Father' },
        { id: 102, name: 'John Doe Jr', class: 'JSS 1A', relationship: 'Father' },
      ],
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '+234 567 8902',
      occupation: 'Teacher',
      address: '456 Education Rd, Ikeja',
      students: [
        { id: 103, name: 'Michael Johnson', class: 'SS 2A', relationship: 'Mother' },
      ],
    },
    {
      id: 3,
      firstName: 'Emeka',
      lastName: 'Okafor',
      email: 'emeka.o@example.com',
      phone: '+234 567 8903',
      occupation: 'Doctor',
      address: '789 Hospital Rd, Abuja',
      students: [
        { id: 104, name: 'Chidi Okafor', class: 'JSS 1A', relationship: 'Mother' },
        { id: 105, name: 'Adanna Okafor', class: 'JSS 2A', relationship: 'Mother' },
      ],
    },
    {
      id: 4,
      firstName: 'Ibrahim',
      lastName: 'Yussuf',
      email: 'ibrahim.y@example.com',
      phone: '+234 567 8904',
      occupation: 'Engineer',
      address: '234 Industrial Ave, Kano',
      students: [
        { id: 106, name: 'Fatima Yussuf', class: 'SS 1A', relationship: 'Father' },
      ],
    },
  ];

  // Mock students for filter dropdown
  const mockStudents = [
    { id: 'all', name: 'All Students' },
    { id: 101, name: 'Jane Doe - JSS 3A' },
    { id: 102, name: 'John Doe Jr. - JSS 1A' },
    { id: 103, name: 'Michael Johnson - SS 2A' },
    { id: 104, name: 'Chidi Okafor - JSS 1A' },
    { id: 105, name: 'Adanna Okafor - JSS 2A' },
    { id: 106, name: 'Fatima Yussuf - SS 1A' },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setParents(mockParents);
      setStudents(mockStudents);
      setLoading(false);
    }, 500);
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteClick = (parent) => {
    setDeleteDialog({ open: true, parent });
  };

  const handleDeleteConfirm = () => {
    // Mock delete
    setParents(parents.filter((p) => p.id !== deleteDialog.parent.id));
    setDeleteDialog({ open: false, parent: null });
  };

  const getAvatarColor = (name) => {
    const colors = ['#2196F3', '#66BB6A', '#EF5350', '#FFA726', '#AB47BC'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const getRelationshipColor = (relationship) => {
    switch (relationship) {
      case 'Father':
        return { bgcolor: '#E3F2FD', color: '#1976D2' };
      case 'Mother':
        return { bgcolor: '#FFF3E0', color: '#F57C00' };
      case 'Guardian':
        return { bgcolor: '#E3F2FD', color: '#1976D2' };
      default:
        return { bgcolor: '#F5F5F5', color: '#757575' };
    }
  };

  const filteredParents = parents.filter((parent) =>
    parent.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedParents = filteredParents;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #0a192f 0%, #0d1b2a 40%, #000000 100%)'
          : 'background.default',
      }}
    >
      {/* Header */}
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
          }}
        >
          Parents & Guardians
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary' }}
        >
          Manage student parents and guardians, link parents to students, and update contact information.
        </Typography>

        {/* Action Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
            <TextField
              placeholder="Search parents..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                ),
              }}
              sx={{
                width: 300,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FF3E8A',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/dashboard/parents/new')}
              sx={{
                background: 'secondary.main',
                borderRadius: '50px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'secondary.dark',
                },
              }}
            >
              {window.innerWidth < 600 ? 'Add' : 'Add Parent'}
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'rgba(17, 17, 17, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                '&:hover': {
                  border: '1px solid #FF3E8A',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FamilyRestroom
                    sx={{ fontSize: 40, color: '#FF3E8A' }}
                  />
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, color: '#ffffff' }}
                    >
                      {parents.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      Total Parents
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
                '&:hover': {
                  border: '1px solid #FF3E8A',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person sx={{ fontSize: 40, color: '#66BB6A' }} />
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, color: '#ffffff' }}
                    >
                      {students.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      Total Linkages
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
                '&:hover': {
                  border: '1px solid #FF3E8A',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email sx={{ fontSize: 40, color: '#2196F3' }} />
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, color: '#ffffff' }}
                    >
                      {new Set().toLocaleString('en-NG', { month: 'long' })}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      This Month
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
                '&:hover': {
                  border: '1px solid #FF3E8A',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone sx={{ fontSize: 40, color: '#EF5350' }} />
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, color: '#ffffff' }}
                    >
                      96%
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      Contact Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Parents List */}
        <Card
          sx={{
            background: 'rgba(17, 17, 17, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  Loading parents...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: '#ff6b6b' }}>
                  {error}
                </Typography>
              </Box>
            ) : paginatedParents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Person sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 2 }}
                >
                  No Parents Found
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
                >
                  {searchTerm
                    ? `No parents match "${searchTerm}"`
                    : 'Get started by adding parents'}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Parent</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Occupation</TableCell>
                        <TableCell>Students</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedParents.map((parent) => (
                        <TableRow
                          key={parent.id}
                          sx={{
                            '&:hover': {
                              background: 'rgba(255, 62, 138, 0.05)',
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: getAvatarColor(parent.firstName),
                                  color: '#ffffff',
                                  fontSize: 14,
                                }}
                              >
                                {parent.firstName?.charAt(0) || 'P'}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500, color: '#ffffff' }}
                                >
                                  {parent.firstName} {parent.lastName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                >
                                  {parent.occupation}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{parent.email}</TableCell>
                          <TableCell>{parent.phone}</TableCell>
                          <TableCell>{parent.occupation}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {parent.students.map((student, idx) => (
                                <Chip
                                  key={idx}
                                  size="small"
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Person sx={{ fontSize: 12 }} />
                                      <Box>
                                        <Typography variant="caption" noWrap>
                                          {student.name}
                                        </Typography>
                                        <Chip
                                          size="small"
                                          label={student.relationship}
                                          sx={{
                                            ml: 0.5,
                                            ...getRelationshipColor(student.relationship),
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  }
                                  sx={{ height: 24 }}
                                />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/dashboard/parents/${parent.id}/edit`)}
                                sx={{
                                  color: '#FF3E8A',
                                  '&:hover': {
                                    background: 'rgba(255, 62, 138, 0.1)',
                                  },
                                }}
                              >
                                <Edit sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/dashboard/parents/${parent.id}/students`)}
                                sx={{
                                  color: '#2196F3',
                                  '&:hover': {
                                    background: 'rgba(33, 150, 243, 0.1)',
                                  },
                                }}
                              >
                                <People sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(parent)}
                                sx={{
                                  color: '#ff6b6b',
                                  '&:hover': {
                                    background: 'rgba(211, 47, 47, 0.1)',
                                  },
                                }}
                              >
                                <Delete sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {paginatedParents.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      Showing {paginatedParents.length} of {parents.length} parents
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        sx={{
                          color: '#ffffff',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5,
                          },
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setPage(Math.min(Math.ceil(parents.length / 10), page + 1))}
                        disabled={page >= Math.ceil(parents.length / 10)}
                        sx={{
                          color: '#ffffff',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5,
                          },
                        }}
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, parent: null })}
          maxWidth="sm"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Delete sx={{ color: '#ff6b6b', fontSize: 28 }} />
              <Typography variant="h6">Delete Parent</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete{' '}
              <strong>{deleteDialog.parent?.firstName} {deleteDialog.parent?.lastName}</strong>?
              {' '}This action cannot be undone. All associated student links will be removed.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, parent: null })}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ParentList;
