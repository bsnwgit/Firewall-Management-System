import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AlertDashboard = () => {
  // State for alerts and statistics
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [acknowledgeDialogOpen, setAcknowledgeDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [acknowledgeNotes, setAcknowledgeNotes] = useState('');
  const [filters, setFilters] = useState({
    severity: [],
    type: [],
    status: 'all', // all, active, acknowledged, resolved
    timeRange: '24h' // 1h, 6h, 24h, 7d, 30d
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    acknowledged: 0,
    resolved: 0,
    bySeverity: {
      critical: 0,
      warning: 0,
      info: 0
    },
    byType: {
      cpu: 0,
      memory: 0,
      disk: 0,
      bandwidth: 0
    }
  });

  // Fetch alerts and statistics
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/alerts/stats');
      const data = await response.json();
      setStats(data.stats);
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alert data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch alert history
  const fetchAlertHistory = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/history`);
      const data = await response.json();
      setAlertHistory(data);
    } catch (error) {
      console.error('Error fetching alert history:', error);
    }
  };

  // Handle alert acknowledgment
  const handleAcknowledge = async () => {
    if (!selectedAlert) return;

    try {
      const response = await fetch(`/api/alerts/${selectedAlert.id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: acknowledgeNotes
        })
      });

      if (response.ok) {
        fetchData(); // Refresh data
        setAcknowledgeDialogOpen(false);
        setSelectedAlert(null);
        setAcknowledgeNotes('');
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  // Handle alert resolution
  const handleResolve = async (alertId) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter(alert => {
    if (filters.severity.length > 0 && !filters.severity.includes(alert.severity)) {
      return false;
    }
    if (filters.type.length > 0 && !filters.type.includes(alert.type)) {
      return false;
    }
    if (filters.status !== 'all') {
      if (filters.status === 'active' && (alert.acknowledged || alert.resolved)) {
        return false;
      }
      if (filters.status === 'acknowledged' && (!alert.acknowledged || alert.resolved)) {
        return false;
      }
      if (filters.status === 'resolved' && !alert.resolved) {
        return false;
      }
    }
    return true;
  });

  // Chart data for alert trends
  const alertTrendsData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Critical',
        data: [2, 3, 1, 4, 2, 3],
        borderColor: '#d32f2f',
        tension: 0.1
      },
      {
        label: 'Warning',
        data: [5, 4, 6, 3, 5, 4],
        borderColor: '#ed6c02',
        tension: 0.1
      },
      {
        label: 'Info',
        data: [8, 7, 9, 6, 8, 7],
        borderColor: '#0288d1',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Alert Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Alerts'
        }
      }
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling interval
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Alert Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Alerts
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Alerts
              </Typography>
              <Typography variant="h4" color="error">
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acknowledged
              </Typography>
              <Typography variant="h4" color="warning">
                {stats.acknowledged}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resolved
              </Typography>
              <Typography variant="h4" color="success">
                {stats.resolved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Trends Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Line data={alertTrendsData} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              multiple
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              label="Severity"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="info">Info</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              multiple
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              label="Type"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="cpu">CPU</MenuItem>
              <MenuItem value="memory">Memory</MenuItem>
              <MenuItem value="disk">Disk</MenuItem>
              <MenuItem value="bandwidth">Bandwidth</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="acknowledged">Acknowledged</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={filters.timeRange}
              onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
              label="Time Range"
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="6h">Last 6 Hours</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>

          <Button
            startIcon={<ClearIcon />}
            onClick={() => setFilters({
              severity: [],
              type: [],
              status: 'all',
              timeRange: '24h'
            })}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Alerts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Severity</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Threshold</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  {alert.severity === 'critical' && <ErrorIcon color="error" />}
                  {alert.severity === 'warning' && <WarningIcon color="warning" />}
                  {alert.severity === 'info' && <InfoIcon color="info" />}
                  {alert.severity}
                </TableCell>
                <TableCell>{alert.type}</TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>{alert.source}</TableCell>
                <TableCell>{alert.value}%</TableCell>
                <TableCell>{alert.threshold}%</TableCell>
                <TableCell>
                  {new Date(alert.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {alert.resolved ? (
                    <Chip label="Resolved" color="success" size="small" />
                  ) : alert.acknowledged ? (
                    <Chip label="Acknowledged" color="warning" size="small" />
                  ) : (
                    <Chip label="Active" color="error" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!alert.acknowledged && (
                      <Tooltip title="Acknowledge">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setAcknowledgeDialogOpen(true);
                          }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {!alert.resolved && (
                      <Tooltip title="Resolve">
                        <IconButton
                          size="small"
                          onClick={() => handleResolve(alert.id)}
                        >
                          <TimelineIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="History">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedAlert(alert);
                          fetchAlertHistory(alert.id);
                          setHistoryDialogOpen(true);
                        }}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Acknowledge Dialog */}
      <Dialog
        open={acknowledgeDialogOpen}
        onClose={() => setAcknowledgeDialogOpen(false)}
      >
        <DialogTitle>Acknowledge Alert</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={acknowledgeNotes}
            onChange={(e) => setAcknowledgeNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcknowledgeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAcknowledge} variant="contained">
            Acknowledge
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Alert History</DialogTitle>
        <DialogContent>
          <List>
            {alertHistory.map((history) => (
              <ListItem key={history.id}>
                <ListItemText
                  primary={history.action}
                  secondary={
                    <>
                      <Typography variant="body2">
                        By: {history.performed_by}
                      </Typography>
                      <Typography variant="caption">
                        {new Date(history.performed_at).toLocaleString()}
                      </Typography>
                      {history.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Notes: {history.notes}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertDashboard; 