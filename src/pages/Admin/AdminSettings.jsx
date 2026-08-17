import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import {
  Save,
  GpsFixed,
  MyLocation,
  ToggleOn,
  ToggleOff,
  Refresh,
  OpenInNew,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { PageHeader } from '../../components/ui';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const geofencingKeys = ['GeofencingEnabled', 'SchoolLatitude', 'SchoolLongitude', 'AllowedRadiusMeters'];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.settings.getAll();
      if (response.data?.success && response.data?.data) {
        const settingsMap = {};
        response.data.data.forEach(s => { settingsMap[s.key] = s; });
        setSettings(settingsMap);
      } else {
        setError('Failed to load settings');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value: String(value) },
    }));
  };

  const handleSave = async (key) => {
    setSaving(key);
    setError(null);
    setSuccess(null);
    try {
      const response = await adminAPI.settings.update(key, settings[key].value);
      if (response.data?.success) {
        setSuccess(`"${key}" updated successfully`);
      } else {
        setError(response.data?.message || `Failed to update "${key}"`);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Error updating "${key}"`);
    } finally {
      setSaving(null);
    }
  };

  const handleToggleGeofencing = async () => {
    setSaving('toggle');
    setError(null);
    setSuccess(null);
    try {
      const response = await adminAPI.settings.toggleGeofencing();
      if (response.data?.success) {
        setSuccess(response.data?.message || 'Geofencing toggled');
        await fetchSettings();
      } else {
        setError(response.data?.message || 'Failed to toggle geofencing');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error toggling geofencing');
    } finally {
      setSaving(null);
    }
  };

  const geofencingEnabled = settings.GeofencingEnabled?.value === 'true';

  if (loading) {
    return (
      <Box>
        <PageHeader title="System Settings" subtitle="Manage system configuration and geofencing" />
        <Card sx={{ borderRadius: 3, p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="System Settings"
        subtitle="Manage system configuration and geofencing"
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <MyLocation sx={{ color: '#6FAF8F', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Geofencing Settings
                </Typography>
                <Chip
                  label={geofencingEnabled ? 'Enabled' : 'Disabled'}
                  color={geofencingEnabled ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Box sx={{ mb: 3, p: 2.5, borderRadius: '12px', background: 'rgba(111, 175, 143, 0.06)', border: '1px solid rgba(111, 175, 143, 0.15)' }}>
                <Typography sx={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  Geofencing ensures students are physically within the school premises before they can start an exam.
                  When enabled, the system checks the student's GPS coordinates against the school's location.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2, borderRadius: '12px', background: '#F8FAF9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {geofencingEnabled ? <ToggleOn sx={{ color: '#6FAF8F', fontSize: 28 }} /> : <ToggleOff sx={{ color: '#999', fontSize: 28 }} />}
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>Geofencing</Typography>
                    <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>Require GPS location to start exams</Typography>
                  </Box>
                </Box>
                <Button
                  variant={geofencingEnabled ? 'outlined' : 'contained'}
                  onClick={handleToggleGeofencing}
                  disabled={saving === 'toggle'}
                  startIcon={saving === 'toggle' ? <CircularProgress size={16} /> : null}
                  sx={{
                    borderRadius: 2.5,
                    ...(geofencingEnabled ? {
                      borderColor: '#ef5350',
                      color: '#ef5350',
                      '&:hover': { borderColor: '#d32f2f', background: 'rgba(239, 83, 80, 0.08)' },
                    } : {
                      background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                      boxShadow: '0 4px 14px rgba(111, 175, 143, 0.3)',
                    }),
                  }}
                >
                  {geofencingEnabled ? 'Disable' : 'Enable'}
                </Button>
              </Box>

              {geofencingKeys.filter(k => k !== 'GeofencingEnabled').map((key) => {
                const setting = settings[key];
                if (!setting) return null;

                return (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                      <TextField
                        fullWidth
                        label={setting.description || key}
                        value={setting.value || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        size="small"
                        type={setting.dataType === 'Integer' ? 'number' : 'text'}
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: 2.5, backgroundColor: '#F8FAF9' },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => handleSave(key)}
                        disabled={saving === key}
                        startIcon={saving === key ? <CircularProgress size={16} /> : <Save />}
                        sx={{
                          background: 'linear-gradient(135deg, #6FAF8F 0%, #4E8C70 100%)',
                          borderRadius: 2.5,
                          whiteSpace: 'nowrap',
                          minWidth: 100,
                          boxShadow: '0 4px 14px rgba(111, 175, 143, 0.3)',
                        }}
                      >
                        {saving === key ? 'Saving...' : 'Save'}
                      </Button>
                    </Box>
                    <Typography sx={{ color: '#999', fontSize: '0.75rem', mt: 0.5 }}>
                      Type: {setting.dataType} | Key: {key}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(111, 175, 143, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <GpsFixed sx={{ color: '#6FAF8F' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1rem' }}>
                  Current Coordinates
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '12px', background: '#F8FAF9', mb: 2 }}>
                <Typography sx={{ color: '#666', fontSize: '0.85rem', mb: 0.5 }}>
                  Latitude
                </Typography>
                <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                  {settings.SchoolLatitude?.value || '—'}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '12px', background: '#F8FAF9', mb: 2 }}>
                <Typography sx={{ color: '#666', fontSize: '0.85rem', mb: 0.5 }}>
                  Longitude
                </Typography>
                <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                  {settings.SchoolLongitude?.value || '—'}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: '12px', background: '#F8FAF9' }}>
                <Typography sx={{ color: '#666', fontSize: '0.85rem', mb: 0.5 }}>
                  Allowed Radius
                </Typography>
                <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                  {settings.AllowedRadiusMeters?.value || '—'} meters
                </Typography>
              </Box>

              {settings.SchoolLatitude?.value && settings.SchoolLongitude?.value && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  href={`https://www.google.com/maps?q=${settings.SchoolLatitude.value},${settings.SchoolLongitude.value}`}
                  target="_blank"
                  rel="noopener"
                  sx={{ mt: 2, borderRadius: 2.5, borderColor: '#6FAF8F', color: '#6FAF8F' }}
                >
                  View on Google Maps
                </Button>
              )}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchSettings}
                sx={{ mt: 1, borderRadius: 2.5, borderColor: '#6FAF8F', color: '#6FAF8F' }}
              >
                Refresh Settings
              </Button>

              <Box sx={{ mt: 2.5, p: 2, borderRadius: '12px', background: 'rgba(111, 175, 143, 0.06)', border: '1px solid rgba(111, 175, 143, 0.15)' }}>
                <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '0.85rem', mb: 1 }}>
                  How to find your school's coordinates:
                </Typography>
                <Typography sx={{ color: '#555', fontSize: '0.8rem', lineHeight: 1.7 }}>
                  1. Go to <strong>maps.google.com</strong><br />
                  2. Search for your school address<br />
                  3. Right-click on the location<br />
                  4. Select <strong>"What's here?"</strong><br />
                  5. Copy the latitude and longitude shown
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSettings;
