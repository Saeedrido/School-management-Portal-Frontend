import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Paper,
  Collapse,
} from '@mui/material';
import {
  Send,
  Close,
  Info,
  Event,
  AttachMoney,
  School,
  People,
  Person,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { adminAPI, informationAPI } from '../../services/api';

const InformationModal = ({ open, onClose }) => {
  const [messageType, setMessageType] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientType, setRecipientType] = useState('');

  // Specific Students mode
  const [specificClassId, setSpecificClassId] = useState('');
  const [specificClassStudents, setSpecificClassStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [loadedClasses, setLoadedClasses] = useState({});

  // By Class mode
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classStudents, setClassStudents] = useState([]);
  const [selectedClassStudentIds, setSelectedClassStudentIds] = useState(new Set());

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSelectedStudents, setShowSelectedStudents] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClasses();
      resetForm();
    }
  }, [open]);

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.classes.getAll();
      if (response.data?.success) {
        setClasses(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const fetchStudentsByClass = async (classId) => {
    if (!classId) return [];
    setLoadingStudents(true);
    try {
      const response = await adminAPI.students.getByClass(classId);
      if (response.data?.success) {
        return response.data.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoadingStudents(false);
    }
    return [];
  };

  const handleLoadSpecificClass = async (classId) => {
    setSpecificClassId(classId);
    if (!classId) {
      setSpecificClassStudents([]);
      return;
    }
    if (loadedClasses[classId]) {
      setSpecificClassStudents(loadedClasses[classId]);
      return;
    }
    const students = await fetchStudentsByClass(classId);
    setSpecificClassStudents(students);
    setLoadedClasses(prev => ({ ...prev, [classId]: students }));
  };

  const handleToggleSpecificStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleLoadClassStudents = async (classId) => {
    setSelectedClassId(classId);
    setSelectedClassStudentIds(new Set());
    if (!classId) {
      setClassStudents([]);
      return;
    }
    const students = await fetchStudentsByClass(classId);
    setClassStudents(students);
  };

  const handleToggleClassStudent = (studentId) => {
    setSelectedClassStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const resetForm = () => {
    setMessageType('');
    setMessage('');
    setDate('');
    setAmount('');
    setRecipientType('');
    setSpecificClassId('');
    setSpecificClassStudents([]);
    setSelectedStudentIds(new Set());
    setLoadedClasses({});
    setSelectedClassId('');
    setClassStudents([]);
    setSelectedClassStudentIds(new Set());
    setError('');
    setSuccess('');
    setShowSelectedStudents(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRecipientTypeChange = (e) => {
    setRecipientType(e.target.value);
    setSpecificClassId('');
    setSpecificClassStudents([]);
    setSelectedStudentIds(new Set());
    setSelectedClassId('');
    setClassStudents([]);
    setSelectedClassStudentIds(new Set());
    setError('');
  };

  const getSelectedStudentCount = () => {
    return selectedStudentIds.size;
  };

  const getAllSelectedStudents = () => {
    const all = [];
    selectedStudentIds.forEach(sid => {
      for (const clsStudents of Object.values(loadedClasses)) {
        const found = clsStudents.find(s => s.id === sid || s.studentProfileId === sid);
        if (found) {
          all.push(found);
          break;
        }
      }
    });
    return all;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!messageType) {
      setError('Please select a message type.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    if (!recipientType) {
      setError('Please select a recipient type.');
      return;
    }

    const payload = {
      messageType,
      message: message.trim(),
      recipientType: recipientType.toLowerCase(),
    };

    if (messageType === 'Excursion' && date) {
      payload.date = new Date(date).toISOString();
    }
    if (messageType === 'School Fees Reminder' && amount) {
      payload.amount = parseFloat(amount);
    }

    if (recipientType === 'specific') {
      if (selectedStudentIds.size === 0) {
        setError('Please select at least one student.');
        return;
      }
      payload.recipientType = 'single';
      payload.studentIds = Array.from(selectedStudentIds);
    } else if (recipientType === 'class') {
      if (!selectedClassId) {
        setError('Please select a class.');
        return;
      }
      if (selectedClassStudentIds.size > 0) {
        payload.recipientType = 'single';
        payload.studentIds = Array.from(selectedClassStudentIds);
      } else {
        payload.classId = selectedClassId;
      }
    }

    setLoading(true);
    try {
      const response = await informationAPI.send(payload);
      if (response.data?.success) {
        const result = response.data.data;
        let successMsg = `Information sent successfully!`;
        if (result.sentCount !== undefined) {
          successMsg += ` Sent: ${result.sentCount}, Failed: ${result.failedCount}`;
          if (result.skippedCount > 0) {
            successMsg += `, Skipped: ${result.skippedCount} (no linked parent)`;
          }
          if (result.failedStudentNames?.length > 0) {
            successMsg += `\nSkipped students: ${result.failedStudentNames.join(', ')}`;
          }
        }
        setSuccess(successMsg);
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(response.data?.message || 'Failed to send information.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0] || 'Failed to send information. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send color="primary" />
          <Typography variant="h6">Send Information</Typography>
        </Box>
        <Button onClick={handleClose} size="small">
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: 480, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControl fullWidth>
            <InputLabel>Message Type</InputLabel>
            <Select
              value={messageType}
              label="Message Type"
              onChange={(e) => setMessageType(e.target.value)}
            >
              <MenuItem value="Excursion">Excursion</MenuItem>
              <MenuItem value="School Fees Reminder">School Fees Reminder</MenuItem>
              <MenuItem value="General Information">General Information</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Message Content"
            multiline
            rows={4}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
          />

          {messageType === 'Excursion' && (
            <TextField
              label="Excursion Date"
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Event color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {messageType === 'School Fees Reminder' && (
            <TextField
              label="Amount (&#8358;)"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <FormControl fullWidth>
            <InputLabel>Send To</InputLabel>
            <Select
              value={recipientType}
              label="Send To"
              onChange={handleRecipientTypeChange}
            >
              <MenuItem value="specific">Specific Students</MenuItem>
              <MenuItem value="class">By Class</MenuItem>
              <MenuItem value="all">Whole School</MenuItem>
            </Select>
          </FormControl>

          {/* Specific Students - Multi-select across classes */}
          {recipientType === 'specific' && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person fontSize="small" /> Select Students
              </Typography>

              <FormControl fullWidth size="small">
                <InputLabel>Choose a class</InputLabel>
                <Select
                  value={specificClassId}
                  label="Choose a class"
                  onChange={(e) => handleLoadSpecificClass(e.target.value)}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {specificClassId && specificClassStudents.length > 0 && (
                <Paper variant="outlined" sx={{ mt: 1.5, maxHeight: 200, overflow: 'auto', borderRadius: 2 }}>
                  <List dense disablePadding>
                    {specificClassStudents.map((student) => {
                      const studentId = student.id || student.studentProfileId;
                      const labelId = `specific-student-${studentId}`;
                      return (
                        <ListItem key={studentId} disablePadding>
                          <ListItemButton
                            dense
                            onClick={() => handleToggleSpecificStudent(studentId)}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Checkbox
                                edge="start"
                                checked={selectedStudentIds.has(studentId)}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                                sx={{ '&.Mui-checked': { color: '#6FAF8F' } }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              id={labelId}
                              primary={`${student.firstName || ''} ${student.lastName || ''}`}
                              secondary={student.studentNumber}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              )}

              {specificClassId && specificClassStudents.length === 0 && !loadingStudents && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  No students found in this class.
                </Typography>
              )}

              {loadingStudents && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#6FAF8F' }} />
                </Box>
              )}

              {getSelectedStudentCount() > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    onClick={() => setShowSelectedStudents(!showSelectedStudents)}
                    sx={{ textTransform: 'none', color: '#6FAF8F', fontWeight: 600, fontSize: '0.8rem' }}
                    endIcon={showSelectedStudents ? <ExpandLess /> : <ExpandMore />}
                  >
                    {getSelectedStudentCount()} student{getSelectedStudentCount() > 1 ? 's' : ''} selected
                  </Button>
                  <Collapse in={showSelectedStudents}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {getAllSelectedStudents().map((student) => {
                        const studentId = student.id || student.studentProfileId;
                        return (
                          <Chip
                            key={studentId}
                            label={`${student.firstName || ''} ${student.lastName || ''}`}
                            size="small"
                            onDelete={() => handleToggleSpecificStudent(studentId)}
                            sx={{
                              bgcolor: 'rgba(111, 175, 143, 0.1)',
                              color: '#4E8C70',
                              fontWeight: 500,
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                Pick a class, select students, then switch to another class to add more. Selections persist across classes.
              </Typography>
            </Box>
          )}

          {/* By Class - with optional student-level selection */}
          {recipientType === 'class' && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <School fontSize="small" /> Select Class
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={selectedClassId}
                  label="Select Class"
                  onChange={(e) => handleLoadClassStudents(e.target.value)}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedClassId && classStudents.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Optionally select specific students (leave all unchecked to send to entire class):
                  </Typography>
                  <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', borderRadius: 2 }}>
                    <List dense disablePadding>
                      {classStudents.map((student) => {
                        const studentId = student.id || student.studentProfileId;
                        const labelId = `class-student-${studentId}`;
                        return (
                          <ListItem key={studentId} disablePadding>
                            <ListItemButton
                              dense
                              onClick={() => handleToggleClassStudent(studentId)}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Checkbox
                                  edge="start"
                                  checked={selectedClassStudentIds.has(studentId)}
                                  tabIndex={-1}
                                  disableRipple
                                  inputProps={{ 'aria-labelledby': labelId }}
                                  sx={{ '&.Mui-checked': { color: '#6FAF8F' } }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                id={labelId}
                                primary={`${student.firstName || ''} ${student.lastName || ''}`}
                                secondary={student.studentNumber}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                  {selectedClassStudentIds.size > 0 && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6FAF8F', fontWeight: 600 }}>
                      {selectedClassStudentIds.size} of {classStudents.length} student(s) selected
                    </Typography>
                  )}
                </Box>
              )}

              {selectedClassId && classStudents.length === 0 && !loadingStudents && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  No students found in this class.
                </Typography>
              )}

              {loadingStudents && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#6FAF8F' }} />
                </Box>
              )}
            </Box>
          )}

          {recipientType === 'all' && (
            <Alert severity="info" icon={<Info fontSize="small" />}>
              This will send the information to all students with linked parent email addresses.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
        >
          {loading ? 'Sending...' : 'Send Information'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InformationModal;
