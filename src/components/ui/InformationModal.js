import React, { useState, useEffect } from 'react';
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
  Autocomplete,
  Chip,
  InputAdornment,
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
} from '@mui/icons-material';
import { adminAPI, informationAPI } from '../../services/api';

const InformationModal = ({ open, onClose }) => {
  const [messageType, setMessageType] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientType, setRecipientType] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (!classId) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    try {
      const response = await adminAPI.students.getByClass(classId);
      if (response.data?.success) {
        setStudents(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const resetForm = () => {
    setMessageType('');
    setMessage('');
    setDate('');
    setAmount('');
    setRecipientType('');
    setSelectedStudent(null);
    setSelectedClass('');
    setStudents([]);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRecipientTypeChange = (e) => {
    setRecipientType(e.target.value);
    setSelectedStudent(null);
    setSelectedClass('');
    setStudents([]);
    setError('');
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    if (recipientType === 'class') {
      fetchStudentsByClass(classId);
    }
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

    if (recipientType === 'single') {
      if (!selectedStudent) {
        setError('Please select a student.');
        return;
      }
      payload.studentId = selectedStudent.id;
    } else if (recipientType === 'class') {
      if (!selectedClass) {
        setError('Please select a class.');
        return;
      }
      payload.classId = selectedClass;
    }

    setLoading(true);
    try {
      const response = await informationAPI.send(payload);
      if (response.data?.success) {
        const result = response.data.data;
        let successMsg = `Information sent successfully!`;
        if (result.sentCount !== undefined) {
          successMsg += ` Sent: ${result.sentCount}, Skipped: ${result.skippedCount}, Failed: ${result.failedCount}`;
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

      <DialogContent dividers>
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
          {/* Message Type */}
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

          {/* Message Content */}
          <TextField
            label="Message Content"
            multiline
            rows={4}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
          />

          {/* Conditional: Date for Excursion */}
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

          {/* Conditional: Amount for School Fees */}
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

          {/* Recipient Type */}
          <FormControl fullWidth>
            <InputLabel>Send To</InputLabel>
            <Select
              value={recipientType}
              label="Send To"
              onChange={handleRecipientTypeChange}
            >
              <MenuItem value="single">Single Student</MenuItem>
              <MenuItem value="class">By Class</MenuItem>
              <MenuItem value="all">Whole School</MenuItem>
            </Select>
          </FormControl>

          {/* Conditional: Single Student Selection */}
          {recipientType === 'single' && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person fontSize="small" /> Select Student
              </Typography>
              <Autocomplete
                options={students}
                loading={loadingStudents}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.studentNumber})`}
                value={selectedStudent}
                onChange={(e, newValue) => setSelectedStudent(newValue)}
                onInputChange={(e, newInputValue) => {
                  if (newInputValue.length >= 2) {
                    fetchStudentsByClass(selectedClass);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search by name or student number..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.firstName} {option.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.studentNumber}
                      </Typography>
                    </Box>
                  </Box>
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Tip: Select a class below to filter students, or search by name/student number
              </Typography>
              {/* Class filter for student search */}
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Filter by Class (optional)</InputLabel>
                <Select
                  value={selectedClass}
                  label="Filter by Class (optional)"
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    fetchStudentsByClass(e.target.value);
                  }}
                  size="small"
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Conditional: Class Selection */}
          {recipientType === 'class' && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <School fontSize="small" /> Select Class
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Select Class"
                  onChange={handleClassChange}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedClass && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {students.length} student(s) in this class
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Whole School confirmation */}
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
