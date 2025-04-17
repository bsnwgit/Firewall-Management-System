import React, { useState, useEffect, useRef } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Slider,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Alert,
  Snackbar,
  AlertTitle,
  Badge,
  Chip,
  Menu,
  Tabs,
  Tab
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  PriorityHigh as PriorityHighIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  RestartAlt as RestartAltIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  NetworkCheck as NetworkCheckIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Router as RouterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Move as MoveIcon,
  Hub as HubIcon,
  Computer as ComputerIcon,
  Balance as BalanceIcon,
  Wifi as WifiIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  SystemUpdate as SystemUpdateIcon,
  Email as EmailIcon,
  Slack as SlackIcon,
  Webhook as WebhookIcon,
  Teams as TeamsIcon,
  PagerDuty as PagerDutyIcon,
  Sms as SmsIcon,
  Schedule as ScheduleIcon,
  Code as CodeIcon,
  Template as TemplateIcon,
  Webex as WebexIcon,
  Discord as DiscordIcon,
  Telegram as TelegramIcon,
  Inventory as InventoryIcon,
  Compliance as ComplianceIcon,
  ServiceNow as ServiceNowIcon,
  Jira as JiraIcon,
  Zabbix as ZabbixIcon,
  Prometheus as PrometheusIcon,
  Grafana as GrafanaIcon
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

const NetworkMonitoring = () => {
  // Load user preferences from localStorage
  const loadPreferences = () => {
    const savedPrefs = localStorage.getItem('networkMonitoringPrefs');
    return savedPrefs ? JSON.parse(savedPrefs) : {
      visibleSections: {
        systemOverview: true,
        systemInfo: true,
        interfaceStats: true,
        bandwidthChart: true,
        topTalkers: true,
        protocolStats: true
      },
      refreshInterval: 30,
      thresholds: {
        cpu: 80,
        memory: 85,
        disk: 90,
        bandwidth: 75
      },
      alerts: {
        enabled: true,
        email: '',
        sound: true
      },
      layout: {
        systemOverview: { xs: 12, md: 6 },
        systemInfo: { xs: 12, md: 6 },
        interfaceStats: { xs: 12 },
        bandwidthChart: { xs: 12 },
        topTalkers: { xs: 12, md: 6 },
        protocolStats: { xs: 12, md: 6 }
      },
      severityLevels: {
        critical: {
          enabled: true,
          threshold: 90,
          color: '#d32f2f',
          sound: '/critical-alert.mp3',
          email: true,
          notification: true,
          actions: {
            autoRestart: true,
            blockTraffic: true,
            notifyAdmin: true
          }
        },
        warning: {
          enabled: true,
          threshold: 75,
          color: '#ed6c02',
          sound: '/warning-alert.mp3',
          email: true,
          notification: true,
          actions: {
            autoRestart: false,
            blockTraffic: false,
            notifyAdmin: true
          }
        },
        info: {
          enabled: true,
          threshold: 60,
          color: '#0288d1',
          sound: '/info-alert.mp3',
          email: false,
          notification: true,
          actions: {
            autoRestart: false,
            blockTraffic: false,
            notifyAdmin: false
          }
        }
      },
      alertFilters: {
        severity: ['critical', 'warning', 'info'],
        type: ['cpu', 'memory', 'disk', 'bandwidth'],
        timeRange: '24h'
      },
      deviceGroups: [
        {
          id: 'group1',
          name: 'Core Network',
          description: 'Core network devices',
          devices: ['device1', 'device2']
        },
        {
          id: 'group2',
          name: 'Edge Network',
          description: 'Edge network devices',
          devices: []
        }
      ],
      devices: [
        {
          id: 'device1',
          name: 'Firewall 1',
          ip: '192.168.1.1',
          type: 'firewall',
          group: 'group1',
          enabled: true,
          thresholds: {
            cpu: { warning: 70, critical: 85 },
            memory: { warning: 75, critical: 90 },
            disk: { warning: 80, critical: 95 },
            bandwidth: { warning: 70, critical: 85 }
          },
          metrics: {
            cpu: {
              cores: 4,
              model: 'Intel Xeon',
              temperature: true,
              loadAverage: true
            },
            memory: {
              total: 16384,
              swap: true,
              cache: true
            },
            disk: {
              partitions: true,
              iops: true,
              latency: true
            },
            network: {
              interfaces: true,
              connections: true,
              protocols: true
            }
          }
        },
        {
          id: 'device2',
          name: 'Router 1',
          ip: '192.168.1.2',
          type: 'router',
          group: 'group1',
          enabled: true,
          thresholds: {
            cpu: { warning: 65, critical: 80 },
            memory: { warning: 70, critical: 85 },
            disk: { warning: 75, critical: 90 },
            bandwidth: { warning: 75, critical: 90 }
          },
          metrics: {
            cpu: {
              cores: 2,
              model: 'Intel Atom',
              temperature: true,
              loadAverage: true
            },
            memory: {
              total: 8192,
              swap: true,
              cache: true
            },
            disk: {
              partitions: true,
              iops: true,
              latency: true
            },
            network: {
              interfaces: true,
              connections: true,
              protocols: true
            }
          }
        }
      ],
      deviceTypes: {
        firewall: {
          icon: <SecurityIcon />,
          metrics: {
            cpu: true,
            memory: true,
            disk: true,
            network: true,
            security: true,
            sessions: true,
            rules: true
          }
        },
        router: {
          icon: <RouterIcon />,
          metrics: {
            cpu: true,
            memory: true,
            disk: true,
            network: true,
            routing: true,
            bgp: true,
            ospf: true
          }
        },
        switch: {
          icon: <HubIcon />,
          metrics: {
            cpu: true,
            memory: true,
            network: true,
            vlans: true,
            spanningTree: true,
            macAddresses: true
          }
        },
        server: {
          icon: <ComputerIcon />,
          metrics: {
            cpu: true,
            memory: true,
            disk: true,
            network: true,
            services: true,
            processes: true,
            users: true
          }
        },
        loadBalancer: {
          icon: <BalanceIcon />,
          metrics: {
            cpu: true,
            memory: true,
            network: true,
            pools: true,
            virtualServers: true,
            connections: true
          }
        },
        wireless: {
          icon: <WifiIcon />,
          metrics: {
            cpu: true,
            memory: true,
            network: true,
            clients: true,
            accessPoints: true,
            channels: true
          }
        }
      },
    };
  };

  // State for current monitoring data
  const [snmpData, setSnmpData] = useState({});
  const [netflowData, setNetflowData] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [historicalData, setHistoricalData] = useState({});
  const [preferences, setPreferences] = useState(loadPreferences());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [bulkSelection, setBulkSelection] = useState([]);
  const [groupView, setGroupView] = useState('all');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [bulkConfigDialogOpen, setBulkConfigDialogOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    slack: false,
    webhook: false,
    sound: true,
    desktop: true
  });

  const [reportTemplates] = useState({
    executive: {
      name: 'Executive Summary',
      description: 'High-level overview for management',
      sections: ['summary', 'trends', 'alerts', 'recommendations'],
      charts: ['overview', 'trends', 'alerts'],
      metrics: ['cpu', 'memory', 'bandwidth', 'security']
    },
    technical: {
      name: 'Technical Report',
      description: 'Detailed technical analysis',
      sections: ['metrics', 'logs', 'configs', 'performance'],
      charts: ['metrics', 'performance', 'topology'],
      metrics: ['all']
    },
    capacity: {
      name: 'Capacity Planning',
      description: 'Resource utilization and forecasting',
      sections: ['utilization', 'forecast', 'recommendations'],
      charts: ['utilization', 'forecast', 'trends'],
      metrics: ['cpu', 'memory', 'disk', 'bandwidth', 'sessions']
    },
    security: {
      name: 'Security Analysis',
      description: 'Security events and threat analysis',
      sections: ['threats', 'events', 'vulnerabilities', 'recommendations'],
      charts: ['threats', 'events', 'vulnerabilities'],
      metrics: ['security', 'threats', 'sessions', 'rules']
    },
    compliance: {
      name: 'Compliance Report',
      description: 'Compliance status and audit data',
      sections: ['status', 'findings', 'remediation', 'evidence'],
      charts: ['compliance', 'findings', 'remediation'],
      metrics: ['config', 'rules', 'access', 'events']
    },
    custom: {
      name: 'Custom Report',
      description: 'Create your own report template',
      sections: [],
      charts: [],
      metrics: []
    },
    performance: {
      name: 'Performance Analysis',
      description: 'Detailed performance metrics and analysis',
      sections: ['metrics', 'trends', 'bottlenecks', 'recommendations'],
      charts: ['performance', 'trends', 'comparison'],
      metrics: ['cpu', 'memory', 'disk', 'network', 'response']
    },
    security: {
      name: 'Security Assessment',
      description: 'Comprehensive security analysis',
      sections: ['vulnerabilities', 'threats', 'compliance', 'recommendations'],
      charts: ['threats', 'vulnerabilities', 'compliance'],
      metrics: ['security', 'threats', 'vulnerabilities', 'compliance']
    },
    audit: {
      name: 'Audit Report',
      description: 'Comprehensive audit findings',
      sections: ['findings', 'evidence', 'recommendations', 'actionItems'],
      charts: ['findings', 'compliance', 'trends'],
      metrics: ['compliance', 'security', 'configuration']
    },
    incident: {
      name: 'Incident Report',
      description: 'Detailed incident analysis',
      sections: ['timeline', 'impact', 'rootCause', 'resolution'],
      charts: ['timeline', 'impact', 'recovery'],
      metrics: ['availability', 'performance', 'security']
    },
    capacity: {
      name: 'Capacity Planning',
      description: 'Resource utilization and forecasting',
      sections: ['utilization', 'trends', 'forecast', 'recommendations'],
      charts: ['utilization', 'forecast', 'trends'],
      metrics: ['cpu', 'memory', 'disk', 'bandwidth', 'sessions']
    },
    custom: {
      name: 'Custom Report',
      description: 'Create your own report template',
      sections: [],
      charts: [],
      metrics: [],
      options: {
        layout: 'default',
        format: 'pdf',
        include: ['summary', 'charts', 'details']
      }
    }
  });

  const [visualizations] = useState({
    overview: {
      name: 'Overview Dashboard',
      description: 'High-level system overview',
      components: ['metrics', 'alerts', 'topology'],
      layout: 'grid'
    },
    topology: {
      name: 'Network Topology',
      description: 'Interactive network map',
      components: ['devices', 'connections', 'status'],
      layout: 'graph'
    },
    metrics: {
      name: 'Metrics Dashboard',
      description: 'Detailed performance metrics',
      components: ['charts', 'gauges', 'tables'],
      layout: 'grid'
    },
    alerts: {
      name: 'Alerts Dashboard',
      description: 'Alert monitoring and management',
      components: ['alerts', 'history', 'actions'],
      layout: 'list'
    },
    trends: {
      name: 'Trend Analysis',
      description: 'Historical trends and patterns',
      components: ['charts', 'forecast', 'comparison'],
      layout: 'timeline'
    },
    security: {
      name: 'Security Dashboard',
      description: 'Security monitoring and analysis',
      components: ['threats', 'events', 'rules'],
      layout: 'grid'
    },
    heatmap: {
      name: 'Resource Heatmap',
      description: 'Visual representation of resource usage',
      components: ['cpu', 'memory', 'disk', 'bandwidth'],
      layout: 'grid',
      options: {
        colorScale: 'temperature',
        aggregation: 'average',
        timeRange: '24h'
      }
    },
    timeline: {
      name: 'Event Timeline',
      description: 'Chronological view of events',
      components: ['alerts', 'changes', 'maintenance'],
      layout: 'timeline',
      options: {
        groupBy: 'type',
        showDetails: true,
        zoom: true
      }
    },
    correlation: {
      name: 'Correlation Analysis',
      description: 'Identify relationships between metrics',
      components: ['metrics', 'events', 'alerts'],
      layout: 'matrix',
      options: {
        correlationType: 'pearson',
        threshold: 0.7,
        showHeatmap: true
      }
    },
    forecast: {
      name: 'Resource Forecast',
      description: 'Predict future resource usage',
      components: ['trends', 'predictions', 'confidence'],
      layout: 'chart',
      options: {
        algorithm: 'arima',
        horizon: '7d',
        confidence: 95
      }
    },
    comparison: {
      name: 'Performance Comparison',
      description: 'Compare metrics across devices',
      components: ['devices', 'metrics', 'timeRanges'],
      layout: 'table',
      options: {
        normalize: true,
        showDelta: true,
        sortBy: 'performance'
      }
    }
  });

  const [exportFormats] = useState({
    json: {
      name: 'JSON',
      description: 'Structured data format',
      fields: ['all']
    },
    csv: {
      name: 'CSV',
      description: 'Tabular data format',
      fields: ['basic', 'metrics', 'alerts']
    },
    pdf: {
      name: 'PDF',
      description: 'Printable document format',
      fields: ['summary', 'charts', 'tables']
    },
    excel: {
      name: 'Excel',
      description: 'Spreadsheet format',
      fields: ['metrics', 'alerts', 'trends']
    }
  });

  const [bulkOperations] = useState({
    enable: {
      name: 'Enable Monitoring',
      description: 'Enable monitoring for selected devices',
      icon: <PlayArrowIcon />
    },
    disable: {
      name: 'Disable Monitoring',
      description: 'Disable monitoring for selected devices',
      icon: <StopIcon />
    },
    move: {
      name: 'Move to Group',
      description: 'Move devices to a different group',
      icon: <MoveIcon />
    },
    delete: {
      name: 'Delete Devices',
      description: 'Remove devices from monitoring',
      icon: <DeleteIcon />
    },
    config: {
      name: 'Configure',
      description: 'Configure thresholds and metrics',
      icon: <SettingsIcon />
    },
    backup: {
      name: 'Backup Config',
      description: 'Backup device configurations',
      icon: <BackupIcon />
    },
    restore: {
      name: 'Restore Config',
      description: 'Restore device configurations',
      icon: <RestoreIcon />
    },
    update: {
      name: 'Update Firmware',
      description: 'Update device firmware',
      icon: <SystemUpdateIcon />
    },
    schedule: {
      name: 'Schedule Maintenance',
      description: 'Schedule maintenance windows',
      icon: <ScheduleIcon />,
      options: {
        startTime: '',
        endTime: '',
        devices: [],
        actions: []
      }
    },
    script: {
      name: 'Run Script',
      description: 'Execute custom scripts',
      icon: <CodeIcon />,
      options: {
        script: '',
        devices: [],
        parameters: {}
      }
    },
    template: {
      name: 'Apply Template',
      description: 'Apply configuration template',
      icon: <TemplateIcon />,
      options: {
        template: '',
        devices: [],
        variables: {}
      }
    },
    backup: {
      name: 'Backup Config',
      description: 'Backup device configurations',
      icon: <BackupIcon />,
      options: {
        format: 'json',
        devices: [],
        include: ['config', 'rules', 'settings']
      }
    },
    restore: {
      name: 'Restore Config',
      description: 'Restore device configurations',
      icon: <RestoreIcon />,
      options: {
        backup: '',
        devices: [],
        options: ['overwrite', 'merge', 'validate']
      }
    },
    update: {
      name: 'Update Firmware',
      description: 'Update device firmware',
      icon: <SystemUpdateIcon />,
      options: {
        version: '',
        devices: [],
        options: ['backup', 'validate', 'rollback']
      }
    },
    audit: {
      name: 'Security Audit',
      description: 'Perform security audit on devices',
      icon: <SecurityIcon />,
      options: {
        type: ['vulnerability', 'compliance', 'configuration'],
        devices: [],
        schedule: 'immediate'
      }
    },
    inventory: {
      name: 'Inventory Collection',
      description: 'Collect device inventory data',
      icon: <InventoryIcon />,
      options: {
        categories: ['hardware', 'software', 'network', 'security'],
        devices: [],
        format: 'json'
      }
    },
    compliance: {
      name: 'Compliance Check',
      description: 'Check device compliance',
      icon: <ComplianceIcon />,
      options: {
        standard: ['cis', 'nist', 'pci', 'custom'],
        devices: [],
        report: true
      }
    },
    backup: {
      name: 'Configuration Backup',
      description: 'Backup device configurations',
      icon: <BackupIcon />,
      options: {
        format: ['json', 'xml', 'text'],
        devices: [],
        schedule: 'daily'
      }
    },
    restore: {
      name: 'Configuration Restore',
      description: 'Restore device configurations',
      icon: <RestoreIcon />,
      options: {
        backup: '',
        devices: [],
        validation: true
      }
    },
    firmware: {
      name: 'Firmware Update',
      description: 'Update device firmware',
      icon: <SystemUpdateIcon />,
      options: {
        version: '',
        devices: [],
        rollback: true
      }
    }
  });

  const [notificationChannels] = useState({
    email: {
      name: 'Email',
      description: 'Send alerts via email',
      icon: <EmailIcon />,
      config: {
        server: '',
        port: '',
        username: '',
        password: '',
        recipients: []
      }
    },
    slack: {
      name: 'Slack',
      description: 'Send alerts to Slack channel',
      icon: <SlackIcon />,
      config: {
        webhook: '',
        channel: '',
        username: ''
      }
    },
    webhook: {
      name: 'Webhook',
      description: 'Send alerts to custom webhook',
      icon: <WebhookIcon />,
      config: {
        url: '',
        method: 'POST',
        headers: {},
        body: {}
      }
    },
    teams: {
      name: 'Microsoft Teams',
      description: 'Send alerts to Teams channel',
      icon: <TeamsIcon />,
      config: {
        webhook: '',
        channel: ''
      }
    },
    pagerduty: {
      name: 'PagerDuty',
      description: 'Send alerts to PagerDuty',
      icon: <PagerDutyIcon />,
      config: {
        apiKey: '',
        serviceId: ''
      }
    },
    sms: {
      name: 'SMS',
      description: 'Send alerts via SMS',
      icon: <SmsIcon />,
      config: {
        provider: '',
        apiKey: '',
        numbers: []
      }
    },
    webex: {
      name: 'Cisco Webex',
      description: 'Send alerts to Webex space',
      icon: <WebexIcon />,
      config: {
        token: '',
        roomId: '',
        format: 'markdown'
      }
    },
    discord: {
      name: 'Discord',
      description: 'Send alerts to Discord channel',
      icon: <DiscordIcon />,
      config: {
        webhook: '',
        channel: '',
        format: 'embed'
      }
    },
    telegram: {
      name: 'Telegram',
      description: 'Send alerts to Telegram channel',
      icon: <TelegramIcon />,
      config: {
        botToken: '',
        chatId: '',
        format: 'markdown'
      }
    }
  });

  const [notificationIntegrations] = useState({
    servicenow: {
      name: 'ServiceNow',
      description: 'Create ServiceNow incidents',
      icon: <ServiceNowIcon />,
      config: {
        instance: '',
        username: '',
        password: '',
        impact: 'medium',
        urgency: 'medium'
      }
    },
    jira: {
      name: 'Jira',
      description: 'Create Jira tickets',
      icon: <JiraIcon />,
      config: {
        url: '',
        project: '',
        issueType: 'incident',
        priority: 'medium'
      }
    },
    zabbix: {
      name: 'Zabbix',
      description: 'Send alerts to Zabbix',
      icon: <ZabbixIcon />,
      config: {
        server: '',
        host: '',
        severity: 'average',
        acknowledge: true
      }
    },
    prometheus: {
      name: 'Prometheus',
      description: 'Send metrics to Prometheus',
      icon: <PrometheusIcon />,
      config: {
        endpoint: '',
        job: 'network_monitoring',
        labels: {}
      }
    },
    grafana: {
      name: 'Grafana',
      description: 'Send alerts to Grafana',
      icon: <GrafanaIcon />,
      config: {
        url: '',
        dashboard: '',
        panel: '',
        tags: []
      }
    }
  });

  // Initialize selected devices
  useEffect(() => {
    const enabledDevices = preferences.devices
      .filter(device => device.enabled)
      .map(device => device.id);
    setSelectedDevices(enabledDevices);
  }, [preferences.devices]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('networkMonitoringPrefs', JSON.stringify(preferences));
  }, [preferences]);

  // Initialize audio for alerts
  useEffect(() => {
    audioRef.current = new Audio('/alert-sound.mp3'); // You'll need to add this sound file
  }, []);

  // Fetch current monitoring data for all selected devices
  const fetchCurrentData = async () => {
    setLoading(true);
    try {
      const devicePromises = selectedDevices.map(async (deviceId) => {
        const device = preferences.devices.find(d => d.id === deviceId);
        const [snmpResponse, netflowResponse] = await Promise.all([
          fetch(`/api/snmp?device=${deviceId}`),
          fetch(`/api/netflow?device=${deviceId}`)
        ]);
        const snmpData = await snmpResponse.json();
        const netflowData = await netflowResponse.json();
        return { deviceId, snmpData, netflowData };
      });

      const results = await Promise.all(devicePromises);
      const newSnmpData = {};
      const newNetflowData = {};

      results.forEach(({ deviceId, snmpData, netflowData }) => {
        newSnmpData[deviceId] = snmpData;
        newNetflowData[deviceId] = netflowData;
      });

      setSnmpData(newSnmpData);
      setNetflowData(newNetflowData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical data for all selected devices
  const fetchHistoricalData = async () => {
    try {
      const devicePromises = selectedDevices.map(async (deviceId) => {
        const [metricsResponse, interfaceStatsResponse, netflowResponse, topTalkersResponse] = await Promise.all([
          fetch(`/api/history/metrics?device=${deviceId}&time_range=${timeRange}`),
          fetch(`/api/history/interface-stats?device=${deviceId}&time_range=${timeRange}`),
          fetch(`/api/history/netflow?device=${deviceId}&time_range=${timeRange}`),
          fetch(`/api/history/netflow/top-talkers?device=${deviceId}&time_range=${timeRange}`)
        ]);

        const metricsData = await metricsResponse.json();
        const interfaceStatsData = await interfaceStatsResponse.json();
        const netflowData = await netflowResponse.json();
        const topTalkersData = await topTalkersResponse.json();

        return {
          deviceId,
          data: {
            metrics: metricsData,
            interfaceStats: interfaceStatsData,
            netflow: netflowData,
            topTalkers: topTalkersData
          }
        };
      });

      const results = await Promise.all(devicePromises);
      const newHistoricalData = {};

      results.forEach(({ deviceId, data }) => {
        newHistoricalData[deviceId] = data;
      });

      setHistoricalData(newHistoricalData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  // Process historical data for charts
  const processMetricsData = (deviceId) => {
    const deviceData = historicalData[deviceId]?.metrics || [];
    const cpuData = deviceData.filter(m => m.metric_type === 'cpu');
    const memoryData = deviceData.filter(m => m.metric_type === 'memory');
    const diskData = deviceData.filter(m => m.metric_type === 'disk');
    const bandwidthData = deviceData.filter(m => m.metric_type === 'bandwidth');

    return {
      labels: cpuData.map(d => new Date(d.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label: 'CPU Usage',
          data: cpuData.map(d => d.value),
          borderColor: '#d32f2f',
          tension: 0.1
        },
        {
          label: 'Memory Usage',
          data: memoryData.map(d => d.value),
          borderColor: '#1976d2',
          tension: 0.1
        },
        {
          label: 'Disk Usage',
          data: diskData.map(d => d.value),
          borderColor: '#ed6c02',
          tension: 0.1
        },
        {
          label: 'Bandwidth Usage',
          data: bandwidthData.map(d => d.value),
          borderColor: '#2e7d32',
          tension: 0.1
        }
      ]
    };
  };

  const processTopTalkersData = (deviceId) => {
    const deviceData = historicalData[deviceId]?.topTalkers || [];
    return {
      labels: deviceData.map(t => t.source_ip),
      datasets: [
        {
          label: 'Total Bytes',
          data: deviceData.map(t => t.total_bytes),
          backgroundColor: '#1976d2'
        }
      ]
    };
  };

  const metricsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Resource Usage Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Usage (%)'
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Talkers'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Bytes'
        }
      }
    }
  };

  useEffect(() => {
    fetchCurrentData();
    fetchHistoricalData();
    // Set up polling interval
    const interval = setInterval(() => {
      fetchCurrentData();
      fetchHistoricalData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  // Handle preference changes
  const handlePreferenceChange = (section, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Handle layout changes
  const handleLayoutChange = (section, size) => {
    setPreferences(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [section]: size
      }
    }));
  };

  // Filter alerts based on preferences
  useEffect(() => {
    const filtered = alerts.filter(alert => 
      preferences.alertFilters.severity.includes(alert.severity) &&
      preferences.alertFilters.type.includes(alert.type)
    );
    setFilteredAlerts(filtered);
  }, [alerts, preferences.alertFilters]);

  // Handle severity-specific actions
  const handleAction = async (action, alert) => {
    try {
      let endpoint = '';
      let payload = {};

      switch (action) {
        case 'restart':
          endpoint = '/api/restart-service';
          payload = { service: alert.type };
          break;
        case 'block':
          endpoint = '/api/block-traffic';
          payload = { source: alert.source };
          break;
        case 'notify':
          endpoint = '/api/notify-admin';
          payload = { alert };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to execute ${action}`);
      }

      // Update alert status
      setAlerts(prev => prev.map(a => 
        a.id === alert.id ? { ...a, actionTaken: action } : a
      ));
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
    } finally {
      setAnchorEl(null);
      setSelectedAlert(null);
    }
  };

  // Render severity-specific actions menu
  const renderActionMenu = (alert) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => {
        setAnchorEl(null);
        setSelectedAlert(null);
      }}
    >
      {alert.actionTaken !== 'restart' && (
        <MenuItem onClick={() => handleAction('restart', alert)}>
          <RestartAltIcon sx={{ mr: 1 }} />
          Restart Service
        </MenuItem>
      )}
      {alert.actionTaken !== 'block' && (
        <MenuItem onClick={() => handleAction('block', alert)}>
          <SecurityIcon sx={{ mr: 1 }} />
          Block Traffic
        </MenuItem>
      )}
      {alert.actionTaken !== 'notify' && (
        <MenuItem onClick={() => handleAction('notify', alert)}>
          <PowerSettingsNewIcon sx={{ mr: 1 }} />
          Notify Admin
        </MenuItem>
      )}
    </Menu>
  );

  // Update the alert rendering to include actions
  const renderAlert = (alert) => (
    <ListItem
      key={alert.id}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            edge="end"
            size="small"
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setSelectedAlert(alert);
            }}
          >
            <MoreVertIcon />
          </IconButton>
          <IconButton
            edge="end"
            size="small"
            onClick={() => handleClearAlert(alert.id)}
          >
            <ErrorIcon />
          </IconButton>
        </Box>
      }
    >
      <ListItemText
        primary={
          <Alert 
            severity={alert.severity}
            sx={{ 
              backgroundColor: preferences.severityLevels[alert.severity].color + '15',
              borderLeft: `4px solid ${preferences.severityLevels[alert.severity].color}`
            }}
          >
            <AlertTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {alert.severity === 'critical' && <PriorityHighIcon />}
                {alert.severity === 'warning' && <WarningIcon />}
                {alert.severity === 'info' && <InfoIcon />}
                {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                {alert.actionTaken && (
                  <Chip
                    size="small"
                    label={`Action: ${alert.actionTaken}`}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </AlertTitle>
            {alert.message}
            <Typography variant="caption" display="block">
              {alert.timestamp.toLocaleTimeString()}
            </Typography>
          </Alert>
        }
      />
    </ListItem>
  );

  // Update the settings dialog to include alert filters
  const renderAlertFilters = () => (
    <Box>
      <ListItem>
        <ListItemText primary="Alert Filters" />
        <ListItemSecondaryAction>
          <IconButton edge="end" onClick={() => handlePreferenceChange('alertFilters', 'expanded', !preferences.alertFilters.expanded)}>
            {preferences.alertFilters.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={preferences.alertFilters.expanded}>
        <List component="div" disablePadding>
          <ListItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Severity Levels
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.keys(preferences.severityLevels).map(level => (
                  <Chip
                    key={level}
                    label={level.charAt(0).toUpperCase() + level.slice(1)}
                    onClick={() => {
                      const newFilters = [...preferences.alertFilters.severity];
                      const index = newFilters.indexOf(level);
                      if (index === -1) {
                        newFilters.push(level);
                      } else {
                        newFilters.splice(index, 1);
                      }
                      handlePreferenceChange('alertFilters', 'severity', newFilters);
                    }}
                    color={preferences.alertFilters.severity.includes(level) ? 'primary' : 'default'}
                    sx={{ backgroundColor: preferences.severityLevels[level].color + '15' }}
                  />
                ))}
              </Box>
            </Box>
          </ListItem>
          <ListItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Alert Types
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['cpu', 'memory', 'disk', 'bandwidth'].map(type => (
                  <Chip
                    key={type}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    onClick={() => {
                      const newFilters = [...preferences.alertFilters.type];
                      const index = newFilters.indexOf(type);
                      if (index === -1) {
                        newFilters.push(type);
                      } else {
                        newFilters.splice(index, 1);
                      }
                      handlePreferenceChange('alertFilters', 'type', newFilters);
                    }}
                    color={preferences.alertFilters.type.includes(type) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>
          </ListItem>
        </List>
      </Collapse>
    </Box>
  );

  // Settings dialog content
  const renderSettings = () => (
    <Dialog
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Monitoring Settings</DialogTitle>
      <DialogContent>
        <List>
          {/* Visible Sections */}
          <ListItem>
            <ListItemText primary="Visible Sections" />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handlePreferenceChange('visibleSections', 'expanded', !preferences.visibleSections.expanded)}>
                {preferences.visibleSections.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <Collapse in={preferences.visibleSections.expanded}>
            <List component="div" disablePadding>
              {Object.entries(preferences.visibleSections).map(([key, value]) => {
                if (key === 'expanded') return null;
                return (
                  <ListItem key={key}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={value}
                          onChange={(e) => handlePreferenceChange('visibleSections', key, e.target.checked)}
                        />
                      }
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Collapse>

          <Divider />

          {/* Refresh Interval */}
          <ListItem>
            <ListItemText
              primary="Refresh Interval"
              secondary={`${preferences.refreshInterval} seconds`}
            />
            <ListItemSecondaryAction>
              <Slider
                value={preferences.refreshInterval}
                onChange={(e, value) => handlePreferenceChange('refreshInterval', '', value)}
                min={5}
                max={300}
                step={5}
                marks
                sx={{ width: 200 }}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider />

          {/* Thresholds */}
          <ListItem>
            <ListItemText primary="Alert Thresholds" />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handlePreferenceChange('thresholds', 'expanded', !preferences.thresholds.expanded)}>
                {preferences.thresholds.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <Collapse in={preferences.thresholds.expanded}>
            <List component="div" disablePadding>
              {Object.entries(preferences.thresholds).map(([key, value]) => {
                if (key === 'expanded') return null;
                return (
                  <ListItem key={key}>
                    <ListItemText
                      primary={`${key.toUpperCase()} Threshold`}
                      secondary={`${value}%`}
                    />
                    <ListItemSecondaryAction>
                      <Slider
                        value={value}
                        onChange={(e, newValue) => handlePreferenceChange('thresholds', key, newValue)}
                        min={50}
                        max={100}
                        step={5}
                        marks
                        sx={{ width: 200 }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>

          <Divider />

          {/* Alerts */}
          <ListItem>
            <ListItemText primary="Alert Settings" />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handlePreferenceChange('alerts', 'expanded', !preferences.alerts.expanded)}>
                {preferences.alerts.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <Collapse in={preferences.alerts.expanded}>
            <List component="div" disablePadding>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.alerts.enabled}
                      onChange={(e) => handlePreferenceChange('alerts', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Alerts"
                />
              </ListItem>
              <ListItem>
                <TextField
                  fullWidth
                  label="Alert Email"
                  value={preferences.alerts.email}
                  onChange={(e) => handlePreferenceChange('alerts', 'email', e.target.value)}
                  disabled={!preferences.alerts.enabled}
                />
              </ListItem>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.alerts.sound}
                      onChange={(e) => handlePreferenceChange('alerts', 'sound', e.target.checked)}
                      disabled={!preferences.alerts.enabled}
                    />
                  }
                  label="Sound Alerts"
                />
              </ListItem>
            </List>
          </Collapse>

          <Divider />

          {/* Severity Levels */}
          {renderSeveritySettings()}

          <Divider />

          {renderAlertFilters()}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        <Button onClick={() => {
          localStorage.removeItem('networkMonitoringPrefs');
          setPreferences(loadPreferences());
        }} color="error">
          Reset to Defaults
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Add severity settings to the settings dialog
  const renderSeveritySettings = () => (
    <Box>
      <ListItem>
        <ListItemText primary="Severity Levels" />
        <ListItemSecondaryAction>
          <IconButton edge="end" onClick={() => handlePreferenceChange('severityLevels', 'expanded', !preferences.severityLevels.expanded)}>
            {preferences.severityLevels.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={preferences.severityLevels.expanded}>
        <List component="div" disablePadding>
          {Object.entries(preferences.severityLevels).map(([level, config]) => {
            if (level === 'expanded') return null;
            return (
              <ListItem key={level}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip
                      label={level.charAt(0).toUpperCase() + level.slice(1)}
                      sx={{ 
                        backgroundColor: config.color,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.enabled}
                          onChange={(e) => handlePreferenceChange('severityLevels', level, {
                            ...config,
                            enabled: e.target.checked
                          })}
                        />
                      }
                      label="Enabled"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2">Threshold:</Typography>
                      <Slider
                        value={config.threshold}
                        onChange={(e, value) => handlePreferenceChange('severityLevels', level, {
                          ...config,
                          threshold: value
                        })}
                        min={0}
                        max={100}
                        step={5}
                        marks
                        sx={{ width: 200 }}
                      />
                      <Typography variant="body2">{config.threshold}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.email}
                            onChange={(e) => handlePreferenceChange('severityLevels', level, {
                              ...config,
                              email: e.target.checked
                            })}
                          />
                        }
                        label="Email Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.notification}
                            onChange={(e) => handlePreferenceChange('severityLevels', level, {
                              ...config,
                              notification: e.target.checked
                            })}
                          />
                        }
                        label="UI Notifications"
                      />
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );

  // Handle device selection
  const handleDeviceSelection = (deviceId) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  // Clear specific alert
  const handleClearAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Clear all alerts
  const handleClearAllAlerts = () => {
    setAlerts([]);
  };

  // Check thresholds when data updates
  useEffect(() => {
    if (preferences.alerts.enabled) {
      checkThresholds();
    }
  }, [snmpData, netflowData, preferences.thresholds, preferences.alerts.enabled]);

  // Check for threshold violations
  const checkThresholds = () => {
    const newAlerts = [];
    
    // Helper function to determine severity
    const getSeverity = (value, thresholds) => {
      if (value >= thresholds.critical.threshold) return 'critical';
      if (value >= thresholds.warning.threshold) return 'warning';
      if (value >= thresholds.info.threshold) return 'info';
      return null;
    };

    // Iterate over selected devices
    selectedDevices.forEach(deviceId => {
      const deviceSnmpData = snmpData[deviceId] || {};
      const deviceNetflowData = netflowData[deviceId] || {};

      // CPU Alert
      const cpuSeverity = getSeverity(deviceSnmpData?.cpuUsage, preferences.severityLevels);
      if (cpuSeverity && preferences.severityLevels[cpuSeverity].enabled) {
        newAlerts.push({
          id: Date.now(),
          type: 'cpu',
          severity: cpuSeverity,
          message: `CPU usage is ${deviceSnmpData?.cpuUsage}% (${cpuSeverity} threshold: ${preferences.severityLevels[cpuSeverity].threshold}%)`,
          timestamp: new Date(),
          deviceId
        });
      }

      // Memory Alert
      const memorySeverity = getSeverity(deviceSnmpData?.memoryUsage, preferences.severityLevels);
      if (memorySeverity && preferences.severityLevels[memorySeverity].enabled) {
        newAlerts.push({
          id: Date.now() + 1,
          type: 'memory',
          severity: memorySeverity,
          message: `Memory usage is ${deviceSnmpData?.memoryUsage}% (${memorySeverity} threshold: ${preferences.severityLevels[memorySeverity].threshold}%)`,
          timestamp: new Date(),
          deviceId
        });
      }

      // Disk Alert
      const diskSeverity = getSeverity(deviceSnmpData?.diskUsage, preferences.severityLevels);
      if (diskSeverity && preferences.severityLevels[diskSeverity].enabled) {
        newAlerts.push({
          id: Date.now() + 2,
          type: 'disk',
          severity: diskSeverity,
          message: `Disk usage is ${deviceSnmpData?.diskUsage}% (${diskSeverity} threshold: ${preferences.severityLevels[diskSeverity].threshold}%)`,
          timestamp: new Date(),
          deviceId
        });
      }

      // Bandwidth Alert
      const totalBandwidth = deviceNetflowData?.bandwidthUsage || 0;
      const maxBandwidth = 1000; // Assuming 1Gbps as max
      const bandwidthPercentage = (totalBandwidth / maxBandwidth) * 100;
      
      const bandwidthSeverity = getSeverity(bandwidthPercentage, preferences.severityLevels);
      if (bandwidthSeverity && preferences.severityLevels[bandwidthSeverity].enabled) {
        newAlerts.push({
          id: Date.now() + 3,
          type: 'bandwidth',
          severity: bandwidthSeverity,
          message: `Bandwidth usage is ${bandwidthPercentage.toFixed(1)}% (${bandwidthSeverity} threshold: ${preferences.severityLevels[bandwidthSeverity].threshold}%)`,
          timestamp: new Date(),
          deviceId
        });
      }
    });

    // If we have new alerts and alerts are enabled
    if (newAlerts.length > 0 && preferences.alerts.enabled) {
      setAlerts(prev => [...prev, ...newAlerts]);
      
      // Play appropriate sound for each alert
      newAlerts.forEach(alert => {
        if (preferences.severityLevels[alert.severity].sound && audioRef.current) {
          audioRef.current.src = preferences.severityLevels[alert.severity].sound;
          audioRef.current.play().catch(error => {
            console.error('Error playing alert sound:', error);
          });
        }
      });

      // Send email notification if configured
      if (preferences.alerts.email) {
        sendEmailNotification(newAlerts);
      }
    }
  };

  // Send email notification
  const sendEmailNotification = async (newAlerts) => {
    try {
      const response = await fetch('/api/send-alert-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: preferences.alerts.email,
          alerts: newAlerts
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  // Handle device management
  const handleAddDevice = (device) => {
    setPreferences(prev => ({
      ...prev,
      devices: [...prev.devices, device]
    }));
  };

  const handleEditDevice = (device) => {
    setPreferences(prev => ({
      ...prev,
      devices: prev.devices.map(d => d.id === device.id ? device : d)
    }));
  };

  const handleDeleteDevice = (deviceId) => {
    setPreferences(prev => ({
      ...prev,
      devices: prev.devices.filter(d => d.id !== deviceId),
      deviceGroups: prev.deviceGroups.map(group => ({
        ...group,
        devices: group.devices.filter(id => id !== deviceId)
      }))
    }));
  };

  // Handle group management
  const handleAddGroup = (group) => {
    setPreferences(prev => ({
      ...prev,
      deviceGroups: [...prev.deviceGroups, group]
    }));
  };

  const handleEditGroup = (group) => {
    setPreferences(prev => ({
      ...prev,
      deviceGroups: prev.deviceGroups.map(g => g.id === group.id ? group : g)
    }));
  };

  const handleDeleteGroup = (groupId) => {
    setPreferences(prev => ({
      ...prev,
      deviceGroups: prev.deviceGroups.filter(g => g.id !== groupId),
      devices: prev.devices.map(device => 
        device.group === groupId ? { ...device, group: null } : device
      )
    }));
  };

  // Toggle group expansion
  const handleGroupToggle = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Enhanced device dialog
  const renderDeviceDialog = () => (
    <Dialog
      open={deviceDialogOpen}
      onClose={() => {
        setDeviceDialogOpen(false);
        setSelectedDevice(null);
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {selectedDevice ? 'Edit Device' : 'Add New Device'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Device Name"
            value={selectedDevice?.name || ''}
            onChange={(e) => setSelectedDevice(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="IP Address"
            value={selectedDevice?.ip || ''}
            onChange={(e) => setSelectedDevice(prev => ({ ...prev, ip: e.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Device Type</InputLabel>
            <Select
              value={selectedDevice?.type || ''}
              onChange={(e) => setSelectedDevice(prev => ({ ...prev, type: e.target.value }))}
              label="Device Type"
            >
              <MenuItem value="firewall">Firewall</MenuItem>
              <MenuItem value="router">Router</MenuItem>
              <MenuItem value="switch">Switch</MenuItem>
              <MenuItem value="server">Server</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Device Group</InputLabel>
            <Select
              value={selectedDevice?.group || ''}
              onChange={(e) => setSelectedDevice(prev => ({ ...prev, group: e.target.value }))}
              label="Device Group"
            >
              <MenuItem value="">None</MenuItem>
              {preferences.deviceGroups.map(group => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="h6">Thresholds</Typography>
          <Grid container spacing={2}>
            {['cpu', 'memory', 'disk', 'bandwidth'].map(metric => (
              <Grid item xs={6} key={metric}>
                <Typography variant="subtitle2">{metric.toUpperCase()}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Warning"
                    type="number"
                    value={selectedDevice?.thresholds?.[metric]?.warning || 70}
                    onChange={(e) => setSelectedDevice(prev => ({
                      ...prev,
                      thresholds: {
                        ...prev.thresholds,
                        [metric]: {
                          ...prev.thresholds?.[metric],
                          warning: parseInt(e.target.value)
                        }
                      }
                    }))}
                    size="small"
                  />
                  <TextField
                    label="Critical"
                    type="number"
                    value={selectedDevice?.thresholds?.[metric]?.critical || 85}
                    onChange={(e) => setSelectedDevice(prev => ({
                      ...prev,
                      thresholds: {
                        ...prev.thresholds,
                        [metric]: {
                          ...prev.thresholds?.[metric],
                          critical: parseInt(e.target.value)
                        }
                      }
                    }))}
                    size="small"
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
          <Typography variant="h6">Metrics to Monitor</Typography>
          <Grid container spacing={2}>
            {Object.entries(selectedDevice?.metrics || {}).map(([category, options]) => (
              <Grid item xs={12} key={category}>
                <Typography variant="subtitle2">{category.toUpperCase()}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(options).map(([option, enabled]) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Switch
                          checked={enabled}
                          onChange={(e) => setSelectedDevice(prev => ({
                            ...prev,
                            metrics: {
                              ...prev.metrics,
                              [category]: {
                                ...prev.metrics?.[category],
                                [option]: e.target.checked
                              }
                            }
                          }))}
                        />
                      }
                      label={option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    />
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setDeviceDialogOpen(false);
          setSelectedDevice(null);
        }}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (selectedDevice?.id) {
              handleEditDevice(selectedDevice);
            } else {
              handleAddDevice({
                ...selectedDevice,
                id: `device${Date.now()}`,
                enabled: true
              });
            }
            setDeviceDialogOpen(false);
            setSelectedDevice(null);
          }}
          variant="contained"
        >
          {selectedDevice?.id ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Enhanced group dialog
  const renderGroupDialog = () => (
    <Dialog
      open={groupDialogOpen}
      onClose={() => {
        setGroupDialogOpen(false);
        setSelectedGroup(null);
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {selectedGroup ? 'Edit Group' : 'Add New Group'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Group Name"
            value={selectedGroup?.name || ''}
            onChange={(e) => setSelectedGroup(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Description"
            value={selectedGroup?.description || ''}
            onChange={(e) => setSelectedGroup(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            multiline
            rows={2}
          />
          <FormControl fullWidth>
            <InputLabel>Devices</InputLabel>
            <Select
              multiple
              value={selectedGroup?.devices || []}
              onChange={(e) => setSelectedGroup(prev => ({ ...prev, devices: e.target.value }))}
              label="Devices"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((deviceId) => {
                    const device = preferences.devices.find(d => d.id === deviceId);
                    return (
                      <Chip
                        key={deviceId}
                        label={`${device?.name} (${device?.ip})`}
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {preferences.devices.map(device => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name} ({device.ip})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setGroupDialogOpen(false);
          setSelectedGroup(null);
        }}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (selectedGroup?.id) {
              handleEditGroup(selectedGroup);
            } else {
              handleAddGroup({
                ...selectedGroup,
                id: `group${Date.now()}`
              });
            }
            setGroupDialogOpen(false);
            setSelectedGroup(null);
          }}
          variant="contained"
        >
          {selectedGroup?.id ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Handle bulk operations
  const handleBulkSelection = (deviceId) => {
    setBulkSelection(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  const handleBulkOperation = async (operation, options = {}) => {
    try {
      switch (operation) {
        case 'enable':
          await bulkEnableDevices(bulkSelection);
          break;
        case 'disable':
          await bulkDisableDevices(bulkSelection);
          break;
        case 'move':
          await bulkMoveDevices(bulkSelection, options.groupId);
          break;
        case 'delete':
          await bulkDeleteDevices(bulkSelection);
          break;
        case 'config':
          await bulkConfigureDevices(bulkSelection, options.config);
          break;
        case 'backup':
          await bulkBackupConfigs(bulkSelection);
          break;
        case 'restore':
          await bulkRestoreConfigs(bulkSelection, options.backupId);
          break;
        case 'update':
          await bulkUpdateFirmware(bulkSelection, options.version);
          break;
        case 'schedule':
          await bulkScheduleMaintenance(options);
          break;
        case 'script':
          await bulkRunScript(options);
          break;
        case 'template':
          await bulkApplyTemplate(options);
          break;
        case 'audit':
          await bulkSecurityAudit(options);
          break;
        case 'inventory':
          await bulkInventoryCollection(options);
          break;
        case 'compliance':
          await bulkComplianceCheck(options);
          break;
        case 'backup':
          await bulkConfigurationBackup(options);
          break;
        case 'restore':
          await bulkConfigurationRestore(options);
          break;
        case 'firmware':
          await bulkFirmwareUpdate(options);
          break;
      }
      setBulkSelection([]);
    } catch (error) {
      console.error(`Error performing bulk operation ${operation}:`, error);
    }
  };

  // Enhanced group-based monitoring
  const getGroupMetrics = (groupId) => {
    const groupDevices = preferences.devices.filter(device => device.group === groupId);
    return {
      cpu: {
        average: groupDevices.reduce((sum, device) => sum + (snmpData[device.id]?.cpuUsage || 0), 0) / groupDevices.length,
        max: Math.max(...groupDevices.map(device => snmpData[device.id]?.cpuUsage || 0))
      },
      memory: {
        average: groupDevices.reduce((sum, device) => sum + (snmpData[device.id]?.memoryUsage || 0), 0) / groupDevices.length,
        max: Math.max(...groupDevices.map(device => snmpData[device.id]?.memoryUsage || 0))
      },
      bandwidth: {
        average: groupDevices.reduce((sum, device) => sum + (netflowData[device.id]?.bandwidthUsage || 0), 0) / groupDevices.length,
        max: Math.max(...groupDevices.map(device => netflowData[device.id]?.bandwidthUsage || 0))
      }
    };
  };

  // Enhanced alert system
  const checkGroupThresholds = () => {
    const newAlerts = [];
    
    preferences.deviceGroups.forEach(group => {
      const groupMetrics = getGroupMetrics(group.id);
      const groupDevices = preferences.devices.filter(device => device.group === group.id);
      
      // Check group-level thresholds
      if (groupMetrics.cpu.average >= 80) {
        newAlerts.push({
          id: `group-${group.id}-cpu-${Date.now()}`,
          type: 'group-cpu',
          severity: 'warning',
          message: `High CPU usage in group ${group.name} (${groupMetrics.cpu.average.toFixed(1)}%)`,
          groupId: group.id,
          timestamp: new Date()
        });
      }

      if (groupMetrics.memory.average >= 85) {
        newAlerts.push({
          id: `group-${group.id}-memory-${Date.now()}`,
          type: 'group-memory',
          severity: 'warning',
          message: `High memory usage in group ${group.name} (${groupMetrics.memory.average.toFixed(1)}%)`,
          groupId: group.id,
          timestamp: new Date()
        });
      }

      // Check device-level thresholds within group
      groupDevices.forEach(device => {
        const deviceSnmpData = snmpData[device.id] || {};
        const deviceNetflowData = netflowData[device.id] || {};

        if (deviceSnmpData.cpuUsage >= device.thresholds.cpu.critical) {
          newAlerts.push({
            id: `device-${device.id}-cpu-${Date.now()}`,
            type: 'device-cpu',
            severity: 'critical',
            message: `Critical CPU usage on ${device.name} (${deviceSnmpData.cpuUsage}%)`,
            deviceId: device.id,
            groupId: group.id,
            timestamp: new Date()
          });
        }

        if (deviceNetflowData.bandwidthUsage >= device.thresholds.bandwidth.critical) {
          newAlerts.push({
            id: `device-${device.id}-bandwidth-${Date.now()}`,
            type: 'device-bandwidth',
            severity: 'critical',
            message: `Critical bandwidth usage on ${device.name} (${deviceNetflowData.bandwidthUsage}%)`,
            deviceId: device.id,
            groupId: group.id,
            timestamp: new Date()
          });
        }
      });
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
    }
  };

  // Enhanced device metrics
  const getDeviceMetrics = (deviceId) => {
    const device = preferences.devices.find(d => d.id === deviceId);
    const deviceType = preferences.deviceTypes[device.type];
    const deviceData = snmpData[deviceId] || {};
    const netflowData = netflowData[deviceId] || {};

    const metrics = {
      system: {
        uptime: deviceData.uptime,
        temperature: deviceData.temperature,
        power: deviceData.powerStatus
      },
      cpu: {
        usage: deviceData.cpuUsage,
        cores: deviceData.cpuCores,
        loadAverage: deviceData.loadAverage,
        temperature: deviceData.cpuTemperature
      },
      memory: {
        usage: deviceData.memoryUsage,
        total: deviceData.memoryTotal,
        used: deviceData.memoryUsed,
        free: deviceData.memoryFree,
        swap: deviceData.swapUsage
      },
      disk: {
        usage: deviceData.diskUsage,
        total: deviceData.diskTotal,
        used: deviceData.diskUsed,
        free: deviceData.diskFree,
        iops: deviceData.diskIOPS,
        latency: deviceData.diskLatency
      },
      network: {
        bandwidth: netflowData.bandwidthUsage,
        packets: netflowData.packets,
        errors: netflowData.errors,
        connections: netflowData.connections
      }
    };

    // Add device-specific metrics
    if (device.type === 'firewall') {
      metrics.security = {
        sessions: deviceData.sessions,
        rules: deviceData.rules,
        threats: deviceData.threats,
        blocked: deviceData.blocked
      };
    } else if (device.type === 'router') {
      metrics.routing = {
        routes: deviceData.routes,
        bgp: deviceData.bgpStatus,
        ospf: deviceData.ospfStatus
      };
    } else if (device.type === 'switch') {
      metrics.switching = {
        vlans: deviceData.vlans,
        spanningTree: deviceData.spanningTree,
        macAddresses: deviceData.macAddresses
      };
    }

    return metrics;
  };

  // Generate reports
  const generateReport = (template, options = {}) => {
    const report = {
      timestamp: new Date(),
      template: reportTemplates[template].name,
      summary: {
        totalDevices: preferences.devices.length,
        totalGroups: preferences.deviceGroups.length,
        activeAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
        warningAlerts: alerts.filter(a => a.severity === 'warning').length,
        securityAlerts: alerts.filter(a => a.type === 'security').length
      },
      sections: reportTemplates[template].sections.map(section => ({
        name: section,
        content: generateSectionContent(section, options)
      })),
      charts: reportTemplates[template].charts.map(chart => ({
        name: chart,
        data: generateChartData(chart, options)
      })),
      recommendations: generateRecommendations(options),
      metadata: {
        generatedBy: 'Network Monitoring System',
        version: '1.0.0',
        options
      }
    };

    return report;
  };

  // Generate section content
  const generateSectionContent = (section, options) => {
    switch (section) {
      case 'summary':
        return generateSummaryContent(options);
      case 'trends':
        return generateTrendsContent(options);
      case 'alerts':
        return generateAlertsContent(options);
      case 'recommendations':
        return generateRecommendations(options);
      case 'metrics':
        return generateMetricsContent(options);
      case 'logs':
        return generateLogsContent(options);
      case 'configs':
        return generateConfigsContent(options);
      case 'performance':
        return generatePerformanceContent(options);
      case 'utilization':
        return generateUtilizationContent(options);
      case 'forecast':
        return generateForecastContent(options);
      case 'threats':
        return generateThreatsContent(options);
      case 'events':
        return generateEventsContent(options);
      case 'vulnerabilities':
        return generateVulnerabilitiesContent(options);
      case 'status':
        return generateStatusContent(options);
      case 'findings':
        return generateFindingsContent(options);
      case 'remediation':
        return generateRemediationContent(options);
      case 'evidence':
        return generateEvidenceContent(options);
      default:
        return null;
    }
  };

  // Generate chart data
  const generateChartData = (chart, options) => {
    switch (chart) {
      case 'overview':
        return generateOverviewChart(options);
      case 'trends':
        return generateTrendsChart(options);
      case 'alerts':
        return generateAlertsChart(options);
      case 'metrics':
        return generateMetricsChart(options);
      case 'performance':
        return generatePerformanceChart(options);
      case 'topology':
        return generateTopologyChart(options);
      case 'utilization':
        return generateUtilizationChart(options);
      case 'forecast':
        return generateForecastChart(options);
      case 'threats':
        return generateThreatsChart(options);
      case 'events':
        return generateEventsChart(options);
      case 'vulnerabilities':
        return generateVulnerabilitiesChart(options);
      case 'compliance':
        return generateComplianceChart(options);
      case 'findings':
        return generateFindingsChart(options);
      case 'remediation':
        return generateRemediationChart(options);
      default:
        return null;
    }
  };

  // Enhanced export functionality
  const exportData = (format, options = {}) => {
    const data = {
      devices: preferences.devices,
      groups: preferences.deviceGroups,
      alerts: alerts,
      metrics: Object.keys(snmpData).reduce((acc, deviceId) => {
        acc[deviceId] = getDeviceMetrics(deviceId);
        return acc;
      }, {}),
      trends: {
        cpu: calculateTrend('cpu'),
        memory: calculateTrend('memory'),
        disk: calculateTrend('disk'),
        bandwidth: calculateTrend('bandwidth')
      }
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return generateCSV(data, options.fields);
      case 'pdf':
        return generatePDF(data, options);
      case 'excel':
        return generateExcel(data, options);
      default:
        return null;
    }
  };

  // Generate CSV
  const generateCSV = (data, fields) => {
    const csvRows = [];
    
    if (fields.includes('basic')) {
      csvRows.push(['Device ID', 'Name', 'Type', 'Group', 'Status']);
      preferences.devices.forEach(device => {
        csvRows.push([
          device.id,
          device.name,
          device.type,
          device.group,
          device.enabled ? 'Enabled' : 'Disabled'
        ]);
      });
    }

    if (fields.includes('metrics')) {
      csvRows.push(['Device ID', 'CPU Usage', 'Memory Usage', 'Disk Usage', 'Bandwidth Usage']);
      preferences.devices.forEach(device => {
        const metrics = getDeviceMetrics(device.id);
        csvRows.push([
          device.id,
          metrics.cpu.usage,
          metrics.memory.usage,
          metrics.disk.usage,
          metrics.network.bandwidth
        ]);
      });
    }

    if (fields.includes('alerts')) {
      csvRows.push(['Alert ID', 'Severity', 'Type', 'Device', 'Group', 'Message', 'Timestamp']);
      alerts.forEach(alert => {
        csvRows.push([
          alert.id,
          alert.severity,
          alert.type,
          alert.deviceId,
          alert.groupId,
          alert.message,
          alert.timestamp
        ]);
      });
    }

    return csvRows.map(row => row.join(',')).join('\n');
  };

  // Bulk configuration
  const handleBulkConfig = (config) => {
    setPreferences(prev => ({
      ...prev,
      devices: prev.devices.map(device =>
        bulkSelection.includes(device.id)
          ? {
              ...device,
              thresholds: {
                ...device.thresholds,
                ...config.thresholds
              },
              metrics: {
                ...device.metrics,
                ...config.metrics
              }
            }
          : device
      )
    }));
  };

  // Enhanced alert notifications
  const sendAlertNotification = async (alert) => {
    const notificationPromises = [];

    // Email notification
    if (notificationSettings.email) {
      notificationPromises.push(
        fetch('/api/send-alert-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId),
            config: notificationChannels.email.config
          })
        })
      );
    }

    // Slack notification
    if (notificationSettings.slack) {
      notificationPromises.push(
        fetch('/api/send-slack-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId),
            config: notificationChannels.slack.config
          })
        })
      );
    }

    // Webhook notification
    if (notificationSettings.webhook) {
      notificationPromises.push(
        fetch('/api/send-webhook-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId),
            config: notificationChannels.webhook.config
          })
        })
      );
    }

    // Teams notification
    if (notificationSettings.teams) {
      notificationPromises.push(
        fetch('/api/send-teams-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId),
            config: notificationChannels.teams.config
          })
        })
      );
    }

    // PagerDuty notification
    if (notificationSettings.pagerduty) {
      notificationPromises.push(
        fetch('/api/send-pagerduty-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId),
            config: notificationChannels.pagerduty.config
          })
        })
      );
    }

    // SMS notification
    if (notificationSettings.sms) {
      notificationPromises.push(
        fetch('/api/send-sms-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId),
            config: notificationChannels.sms.config
          })
        })
      );
    }

    // Webex notification
    if (notificationSettings.webex) {
      notificationPromises.push(
        fetch('/api/send-webex-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId),
            config: notificationIntegrations.webex.config
          })
        })
      );
    }

    // Discord notification
    if (notificationSettings.discord) {
      notificationPromises.push(
        fetch('/api/send-discord-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId),
            config: notificationIntegrations.discord.config
          })
        })
      );
    }

    // Telegram notification
    if (notificationSettings.telegram) {
      notificationPromises.push(
        fetch('/api/send-telegram-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId),
            config: notificationIntegrations.telegram.config
          })
        })
      );
    }

    // Desktop notification
    if (notificationSettings.desktop) {
      if (Notification.permission === 'granted') {
        new Notification('Network Alert', {
          body: alert.message,
          icon: '/alert-icon.png',
          tag: alert.id,
          data: {
            alert,
            device: preferences.devices.find(d => d.id === alert.deviceId),
            group: preferences.deviceGroups.find(g => g.id === alert.groupId)
          }
        });
      }
    }

    // Sound notification
    if (notificationSettings.sound) {
      const audio = new Audio('/alert-sound.mp3');
      audio.play().catch(error => {
        console.error('Error playing alert sound:', error);
      });
    }

    try {
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Network Monitoring</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
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
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchCurrentData();
              fetchHistoricalData();
            }}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </Button>
          <IconButton
            color={alerts.length > 0 ? "error" : "default"}
            onClick={() => setShowAlerts(!showAlerts)}
          >
            <Badge badgeContent={alerts.length} color="error">
              {alerts.length > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* Device and Group Management */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Devices and Groups</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedDevice(null);
                setDeviceDialogOpen(true);
              }}
            >
              Add Device
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedGroup(null);
                setGroupDialogOpen(true);
              }}
            >
              Add Group
            </Button>
          </Box>
        </Box>

        {/* Groups */}
        {preferences.deviceGroups.map(group => (
          <Card key={group.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton
                  onClick={() => handleGroupToggle(group.id)}
                  size="small"
                >
                  {expandedGroups[group.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {group.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  {group.description}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedGroup(group);
                    setGroupDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Collapse in={expandedGroups[group.id]}>
                <Box sx={{ pl: 2 }}>
                  {preferences.devices
                    .filter(device => device.group === group.id)
                    .map(device => (
                      <Box
                        key={device.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                          p: 1,
                          bgcolor: 'background.default',
                          borderRadius: 1
                        }}
                      >
                        <Chip
                          label={device.type}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography sx={{ flexGrow: 1 }}>
                          {device.name} ({device.ip})
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedDevice(device);
                            setDeviceDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        ))}

        {/* Ungrouped Devices */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Ungrouped Devices
              </Typography>
            </Box>
            {preferences.devices
              .filter(device => !device.group)
              .map(device => (
                <Box
                  key={device.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    p: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}
                >
                  <Chip
                    label={device.type}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography sx={{ flexGrow: 1 }}>
                    {device.name} ({device.ip})
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedDevice(device);
                      setDeviceDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteDevice(device.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
          </CardContent>
        </Card>
      </Box>

      {/* Bulk Operations */}
      {bulkSelection.length > 0 && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {bulkSelection.length} devices selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              onClick={() => handleBulkOperation('enable')}
            >
              Enable
            </Button>
            <Button
              variant="outlined"
              startIcon={<StopIcon />}
              onClick={() => handleBulkOperation('disable')}
            >
              Disable
            </Button>
            <Button
              variant="outlined"
              startIcon={<MoveIcon />}
              onClick={() => handleBulkOperation('move')}
            >
              Move to Group
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleBulkOperation('delete')}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              onClick={() => setBulkSelection([])}
            >
              Clear Selection
            </Button>
          </Box>
        </Box>
      )}

      {/* Group View Selection */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>View</InputLabel>
          <Select
            value={groupView}
            onChange={(e) => setGroupView(e.target.value)}
            label="View"
          >
            <MenuItem value="all">All Devices</MenuItem>
            {preferences.deviceGroups.map(group => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Group Metrics */}
      {groupView !== 'all' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Group Metrics
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(getGroupMetrics(groupView)).map(([metric, data]) => (
              <Grid item xs={12} md={4} key={metric}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {metric.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average: {data.average.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Maximum: {data.max.toFixed(1)}%
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={data.average}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: 'background.default',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: data.average >= 80 ? 'error.main' : 'primary.main'
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Current Status" />
        <Tab label="Historical Data" />
      </Tabs>

      {selectedTab === 0 && (
        <>
          {/* Current Status Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {selectedDevices.map(deviceId => {
              const device = preferences.devices.find(d => d.id === deviceId);
              const deviceSnmpData = snmpData[deviceId] || {};
              const deviceNetflowData = netflowData[deviceId] || {};

              return (
                <Grid item xs={12} key={deviceId}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {device.name} ({device.ip})
                        </Typography>
                        <Chip
                          label={device.type}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <MemoryIcon sx={{ mr: 1 }} />
                                <Typography variant="h6">CPU Usage</Typography>
                              </Box>
                              <Typography variant="h4">
                                {deviceSnmpData?.cpuUsage || 0}%
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <StorageIcon sx={{ mr: 1 }} />
                                <Typography variant="h6">Memory Usage</Typography>
                              </Box>
                              <Typography variant="h4">
                                {deviceSnmpData?.memoryUsage || 0}%
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <SpeedIcon sx={{ mr: 1 }} />
                                <Typography variant="h6">Disk Usage</Typography>
                              </Box>
                              <Typography variant="h4">
                                {deviceSnmpData?.diskUsage || 0}%
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <NetworkCheckIcon sx={{ mr: 1 }} />
                                <Typography variant="h6">Bandwidth Usage</Typography>
                              </Box>
                              <Typography variant="h4">
                                {deviceNetflowData?.bandwidthUsage || 0}%
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {selectedTab === 1 && (
        <>
          {/* Historical Data Charts */}
          {selectedDevices.map(deviceId => {
            const device = preferences.devices.find(d => d.id === deviceId);
            return (
              <Grid container spacing={3} sx={{ mb: 3 }} key={deviceId}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {device.name} ({device.ip}) - Resource Usage
                      </Typography>
                      <Line data={processMetricsData(deviceId)} options={metricsChartOptions} />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {device.name} ({device.ip}) - Top Talkers
                      </Typography>
                      <Bar data={processTopTalkersData(deviceId)} options={barChartOptions} />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            );
          })}
        </>
      )}

      {lastUpdated && (
        <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
          Last updated: {lastUpdated.toLocaleString()}
        </Typography>
      )}

      {selectedAlert && renderActionMenu(selectedAlert)}

      {renderSettings()}
      {renderDeviceDialog()}
      {renderGroupDialog()}

      {/* Bulk Move Dialog */}
      <Dialog
        open={bulkDialogOpen}
        onClose={() => {
          setBulkDialogOpen(false);
          setBulkOperation(null);
        }}
      >
        <DialogTitle>Move Selected Devices</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Target Group</InputLabel>
            <Select
              value={selectedGroup?.id || ''}
              onChange={(e) => {
                const group = preferences.deviceGroups.find(g => g.id === e.target.value);
                setSelectedGroup(group);
              }}
              label="Target Group"
            >
              <MenuItem value="">Ungrouped</MenuItem>
              {preferences.deviceGroups.map(group => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setBulkDialogOpen(false);
            setBulkOperation(null);
          }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedGroup) {
                setPreferences(prev => ({
                  ...prev,
                  devices: prev.devices.map(device =>
                    bulkSelection.includes(device.id)
                      ? { ...device, group: selectedGroup.id }
                      : device
                  )
                }));
              }
              setBulkDialogOpen(false);
              setBulkOperation(null);
            }}
            variant="contained"
          >
            Move
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Generation */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                <MenuItem value="summary">Summary Report</MenuItem>
                <MenuItem value="detailed">Detailed Report</MenuItem>
                <MenuItem value="alerts">Alerts Report</MenuItem>
                <MenuItem value="performance">Performance Report</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={reportTimeRange}
                onChange={(e) => setReportTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => {
                const report = generateReport(reportType, reportTimeRange);
                // Handle report display or download
                setReportDialogOpen(false);
              }}
            >
              Generate Report
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      >
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                label="Export Format"
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => {
                const data = exportData(exportFormat);
                // Handle data download
                setExportDialogOpen(false);
              }}
            >
              Export
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Bulk Configuration Dialog */}
      <Dialog
        open={bulkConfigDialogOpen}
        onClose={() => setBulkConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bulk Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Typography variant="h6">Thresholds</Typography>
            <Grid container spacing={2}>
              {['cpu', 'memory', 'disk', 'bandwidth'].map(metric => (
                <Grid item xs={6} key={metric}>
                  <Typography variant="subtitle2">{metric.toUpperCase()}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Warning"
                      type="number"
                      value={bulkConfig.thresholds[metric].warning}
                      onChange={(e) => setBulkConfig(prev => ({
                        ...prev,
                        thresholds: {
                          ...prev.thresholds,
                          [metric]: {
                            ...prev.thresholds[metric],
                            warning: parseInt(e.target.value)
                          }
                        }
                      }))}
                      size="small"
                    />
                    <TextField
                      label="Critical"
                      type="number"
                      value={bulkConfig.thresholds[metric].critical}
                      onChange={(e) => setBulkConfig(prev => ({
                        ...prev,
                        thresholds: {
                          ...prev.thresholds,
                          [metric]: {
                            ...prev.thresholds[metric],
                            critical: parseInt(e.target.value)
                          }
                        }
                      }))}
                      size="small"
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Typography variant="h6">Metrics</Typography>
            <Grid container spacing={2}>
              {Object.entries(bulkConfig.metrics).map(([category, options]) => (
                <Grid item xs={12} key={category}>
                  <Typography variant="subtitle2">{category.toUpperCase()}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(options).map(([option, enabled]) => (
                      <FormControlLabel
                        key={option}
                        control={
                          <Switch
                            checked={enabled}
                            onChange={(e) => setBulkConfig(prev => ({
                              ...prev,
                              metrics: {
                                ...prev.metrics,
                                [category]: {
                                  ...prev.metrics[category],
                                  [option]: e.target.checked
                                }
                              }
                            }))}
                          />
                        }
                        label={option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      />
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkConfigDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleBulkConfig(bulkConfig);
              setBulkConfigDialogOpen(false);
            }}
            variant="contained"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Settings */}
      <Dialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
      >
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.email}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    email: e.target.checked
                  }))}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.slack}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    slack: e.target.checked
                  }))}
                />
              }
              label="Slack Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.webhook}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    webhook: e.target.checked
                  }))}
                />
              }
              label="Webhook Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.sound}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    sound: e.target.checked
                  }))}
                />
              }
              label="Sound Alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.desktop}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    desktop: e.target.checked
                  }))}
                />
              }
              label="Desktop Notifications"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NetworkMonitoring; 