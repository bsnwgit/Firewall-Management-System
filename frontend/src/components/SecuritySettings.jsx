import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Switch, FormControlLabel, Button, Alert } from '@mui/material';
import { useSnackbar } from 'notistack';

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    cors: {
      origins: [],
      enabled: true
    },
    rateLimiting: {
      enabled: true,
      requests: 100,
      window: 60
    },
    session: {
      lifetime: 3600,
      secure: true,
      httponly: true,
      samesite: 'strict'
    },
    ssl: {
      enabled: false,
      certPath: '',
      keyPath: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/security/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/security/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      enqueueSnackbar('Security settings updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Security Settings
      </Typography>

      <Grid container spacing={3}>
        {/* CORS Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              CORS Configuration
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.cors.enabled}
                  onChange={(e) => handleChange('cors', 'enabled', e.target.checked)}
                />
              }
              label="Enable CORS"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Allowed Origins"
              value={settings.cors.origins.join('\n')}
              onChange={(e) => handleChange('cors', 'origins', e.target.value.split('\n'))}
              margin="normal"
            />
          </Paper>
        </Grid>

        {/* Rate Limiting */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rate Limiting
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.rateLimiting.enabled}
                  onChange={(e) => handleChange('rateLimiting', 'enabled', e.target.checked)}
                />
              }
              label="Enable Rate Limiting"
            />
            <TextField
              fullWidth
              type="number"
              label="Requests per Window"
              value={settings.rateLimiting.requests}
              onChange={(e) => handleChange('rateLimiting', 'requests', parseInt(e.target.value))}
              margin="normal"
            />
            <TextField
              fullWidth
              type="number"
              label="Window (seconds)"
              value={settings.rateLimiting.window}
              onChange={(e) => handleChange('rateLimiting', 'window', parseInt(e.target.value))}
              margin="normal"
            />
          </Paper>
        </Grid>

        {/* Session Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Session Configuration
            </Typography>
            <TextField
              fullWidth
              type="number"
              label="Session Lifetime (seconds)"
              value={settings.session.lifetime}
              onChange={(e) => handleChange('session', 'lifetime', parseInt(e.target.value))}
              margin="normal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.session.secure}
                  onChange={(e) => handleChange('session', 'secure', e.target.checked)}
                />
              }
              label="Secure Cookies"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.session.httponly}
                  onChange={(e) => handleChange('session', 'httponly', e.target.checked)}
                />
              }
              label="HTTP Only Cookies"
            />
          </Paper>
        </Grid>

        {/* SSL Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              SSL/TLS Configuration
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.ssl.enabled}
                  onChange={(e) => handleChange('ssl', 'enabled', e.target.checked)}
                />
              }
              label="Enable SSL/TLS"
            />
            {settings.ssl.enabled && (
              <>
                <TextField
                  fullWidth
                  label="Certificate Path"
                  value={settings.ssl.certPath}
                  onChange={(e) => handleChange('ssl', 'certPath', e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Key Path"
                  value={settings.ssl.keyPath}
                  onChange={(e) => handleChange('ssl', 'keyPath', e.target.value)}
                  margin="normal"
                />
              </>
            )}
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ mt: 2 }}
          >
            Save Settings
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecuritySettings; 