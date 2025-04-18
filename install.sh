#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Print with color
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check command success
check_command() {
    if [ $? -ne 0 ]; then
        print_error "Command failed: $1"
        exit 1
    fi
}

# Function to verify package installation
verify_package() {
    if ! dpkg -l | grep -q "^ii  $1 "; then
        print_error "Package $1 not installed properly"
        return 1
    fi
    return 0
}

# Function to check system requirements
check_system_requirements() {
    print_message "Checking system requirements..."
    
    # Check Ubuntu version
    if [ ! -f /etc/os-release ]; then
        print_error "Not running on Ubuntu"
        exit 1
    fi
    
    . /etc/os-release
    if [ "$VERSION_ID" != "22.04" ]; then
        print_warning "This script is designed for Ubuntu 22.04. You are running $VERSION_ID"
    fi
    
    # Check disk space
    FREE_SPACE=$(df -h / | awk 'NR==2 {print $4}')
    if [ ${FREE_SPACE%G} -lt 10 ]; then
        print_error "Insufficient disk space. Need at least 10GB free"
        exit 1
    fi
    
    # Check memory
    TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
    if [ $TOTAL_MEM -lt 4 ]; then
        print_warning "Low memory. Recommended at least 4GB RAM"
    fi
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root"
    exit 1
fi

# Check system requirements
check_system_requirements

# Update system
print_message "Updating system packages..."
apt update && apt upgrade -y
check_command "System update"

# Install required system packages
print_message "Installing system dependencies..."
apt install -y python3 python3-pip python3-full git build-essential libssl-dev libffi-dev python3-dev curl wget unzip make gcc g++ snmp snmpd tcpdump net-tools iproute2 iptables nginx redis-server postgresql postgresql-contrib libpq-dev libsnmp-dev libffi-dev libssl-dev libxml2-dev libxslt1-dev libjpeg-dev libpng-dev libfreetype-dev libblas-dev liblapack-dev libatlas-base-dev gfortran python3-pysnmp4 python3-psycopg2 python3-redis python3-flask python3-flask-sqlalchemy python3-flask-migrate python3-flask-cors python3-jwt python3-cryptography python3-pandas python3-numpy python3-matplotlib python3-seaborn python3-scipy python3-requests python3-paramiko python3-netaddr python3-yaml python3-jinja2 python3-markupsafe python3-werkzeug python3-click python3-itsdangerous python3-six python3-dateutil python3-urllib3 python3-chardet python3-certifi python3-idna python3-requests-oauthlib python3-oauthlib python3-bcrypt python3-cffi python3-pycparser python3-asn1crypto python3-cryptography python3-future logrotate rsyslog htop iotop iftop nethogs ufw fail2ban rsync ntp sysstat supervisor
check_command "System dependencies installation"

# Verify critical packages
print_message "Verifying critical packages..."
verify_package python3
verify_package python3-pip
verify_package nginx
verify_package postgresql
verify_package redis-server
verify_package nodejs

# Install pipx for isolated Python package installation
print_message "Installing pipx..."
apt install -y pipx
pipx ensurepath
check_command "pipx installation"

# Install additional Python packages using pip with --break-system-packages
print_message "Installing additional Python packages..."
pip3 install --break-system-packages pytz configparser pathlib2 scandir
check_command "Additional Python packages installation"

# Install Node.js and npm from NodeSource
print_message "Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    check_command "NodeSource setup"
    apt install -y nodejs
    check_command "Node.js installation"
else
    print_message "Node.js already installed"
fi

# Verify Node.js and npm installation
print_message "Verifying Node.js and npm installation..."
node --version
npm --version
check_command "Node.js verification"

# Create project directory
print_message "Creating project directory..."
mkdir -p /opt/network-monitoring
cd /opt/network-monitoring
check_command "Project directory creation"

# Configure git safe directory
print_message "Configuring git safe directory..."
git config --global --add safe.directory /opt/network-monitoring
check_command "Git safe directory configuration"

# Clone repository
print_message "Cloning repository..."
if [ -d ".git" ]; then
    print_warning "Repository already exists. Pulling latest changes..."
    # Check for local changes
    if git status --porcelain | grep -q "^ M"; then
        print_warning "Local changes detected, stashing them..."
        git stash
        STASHED=true
    else
        STASHED=false
    fi
    
    # Pull changes
    git pull
    
    # Restore stashed changes if any
    if [ "$STASHED" = true ]; then
        print_warning "Restoring stashed changes..."
        git stash pop
    fi
else
    git clone https://github.com/bsnwgit/network-monitoring.git .
fi
check_command "Repository setup"

# Install Python dependencies
print_message "Installing Python dependencies..."
if [ -f "backend/requirements.txt" ]; then
    # Convert requirements.txt to apt packages
    while IFS= read -r line; do
        package=$(echo "$line" | cut -d'=' -f1 | cut -d'>' -f1 | cut -d'<' -f1)
        if ! apt install -y "python3-${package}" 2>/dev/null; then
            print_warning "Package python3-${package} not found in repositories, trying pip..."
            pip3 install --break-system-packages $package || print_warning "Failed to install $package"
        fi
    done < backend/requirements.txt
else
    print_warning "requirements.txt not found, creating default requirements..."
    mkdir -p backend
    cat > backend/requirements.txt << EOL
flask==2.0.1
flask-sqlalchemy==2.5.1
flask-migrate==3.1.0
flask-cors==3.0.10
flask-jwt-extended==4.3.1
psycopg2-binary==2.9.3
redis==4.3.4
pysnmp==4.4.12
paramiko==2.11.0
netaddr==0.8.0
pyyaml==6.0
pandas==1.4.2
numpy==1.22.3
matplotlib==3.5.1
seaborn==0.11.2
scipy==1.8.0
requests==2.27.1
cryptography==36.0.1
bcrypt==3.2.0
EOL
    
    # Install default requirements
    while IFS= read -r line; do
        package=$(echo "$line" | cut -d'=' -f1 | cut -d'>' -f1 | cut -d'<' -f1)
        if ! apt install -y "python3-${package}" 2>/dev/null; then
            print_warning "Package python3-${package} not found in repositories, trying pip..."
            pip3 install --break-system-packages $package || print_warning "Failed to install $package"
        fi
    done < backend/requirements.txt
fi
check_command "Python dependencies installation"

# Install Node.js dependencies
print_message "Installing Node.js dependencies..."
if [ -d "frontend" ]; then
    cd frontend
    if [ ! -d "src" ]; then
        mkdir -p src
    fi

    # Create index.js if it doesn't exist
    if [ ! -f "src/index.js" ]; then
        print_warning "index.js not found, creating default..."
        cat > src/index.js << EOL
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme/theme';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
EOL
    fi

    # Create store.js if it doesn't exist
    if [ ! -f "src/store.js" ]; then
        print_warning "store.js not found, creating default..."
        cat > src/store.js << EOL
import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './features/device/deviceSlice';
import authReducer from './features/auth/authSlice';
import alertReducer from './features/alert/alertSlice';

export const store = configureStore({
  reducer: {
    device: deviceReducer,
    auth: authReducer,
    alert: alertReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
EOL
    fi

    # Create features directory and slices if they don't exist
    if [ ! -d "src/features" ]; then
        mkdir -p src/features/device src/features/auth src/features/alert
    fi

    if [ ! -f "src/features/device/deviceSlice.js" ]; then
        print_warning "deviceSlice.js not found, creating default..."
        cat > src/features/device/deviceSlice.js << EOL
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  devices: [],
  selectedDevice: null,
  loading: false,
  error: null,
};

const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDevices: (state, action) => {
      state.devices = action.payload;
    },
    setSelectedDevice: (state, action) => {
      state.selectedDevice = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setDevices, setSelectedDevice, setLoading, setError } = deviceSlice.actions;
export default deviceSlice.reducer;
EOL
    fi

    if [ ! -f "src/features/auth/authSlice.js" ]; then
        print_warning "authSlice.js not found, creating default..."
        cat > src/features/auth/authSlice.js << EOL
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { setUser, setToken, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
EOL
    fi

    if [ ! -f "src/features/alert/alertSlice.js" ]; then
        print_warning "alertSlice.js not found, creating default..."
        cat > src/features/alert/alertSlice.js << EOL
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  alerts: [],
  loading: false,
  error: null,
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlerts: (state, action) => {
      state.alerts = action.payload;
    },
    addAlert: (state, action) => {
      state.alerts.push(action.payload);
    },
    updateAlert: (state, action) => {
      const index = state.alerts.findIndex(alert => alert.id === action.payload.id);
      if (index !== -1) {
        state.alerts[index] = action.payload;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setAlerts, addAlert, updateAlert, setLoading, setError } = alertSlice.actions;
export default alertSlice.reducer;
EOL
    fi

    # Create missing utility files
    if [ ! -f "src/utils/format.js" ]; then
        print_warning "format.js not found, creating default..."
        cat > src/utils/format.js << EOL
import { format } from 'date-fns';

export const formatDate = (date, pattern = 'yyyy-MM-dd HH:mm:ss') => {
  return format(new Date(date), pattern);
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return \`\${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} \${sizes[i]}\`;
};

export const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value, decimals = 2) => {
  return \`\${formatNumber(value * 100, decimals)}%\`;
};
EOL
    fi

    if [ ! -f "src/utils/validation.js" ]; then
        print_warning "validation.js not found, creating default..."
        cat > src/utils/validation.js << EOL
import * as Yup from 'yup';

export const ipAddressSchema = Yup.string()
  .matches(
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    'Invalid IP address'
  )
  .required('IP address is required');

export const macAddressSchema = Yup.string()
  .matches(
    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    'Invalid MAC address'
  )
  .required('MAC address is required');

export const portSchema = Yup.number()
  .min(1, 'Port must be between 1 and 65535')
  .max(65535, 'Port must be between 1 and 65535')
  .required('Port is required');

export const snmpCommunitySchema = Yup.string()
  .min(1, 'Community string is required')
  .max(32, 'Community string is too long')
  .required('Community string is required');
EOL
    fi

    if [ ! -f "src/utils/constants.js" ]; then
        print_warning "constants.js not found, creating default..."
        cat > src/utils/constants.js << EOL
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  DEVICES: {
    LIST: '/devices',
    DETAIL: (id) => \`/devices/\${id}\`,
    STATS: (id) => \`/devices/\${id}/stats\`,
    CONFIG: (id) => \`/devices/\${id}/config\`,
  },
  ALERTS: {
    LIST: '/alerts',
    DETAIL: (id) => \`/alerts/\${id}\`,
    ACKNOWLEDGE: (id) => \`/alerts/\${id}/acknowledge\`,
  },
  REPORTS: {
    GENERATE: '/reports/generate',
    DOWNLOAD: (id) => \`/reports/\${id}/download\`,
  },
};

export const SNMP_VERSIONS = {
  V1: '1',
  V2C: '2c',
  V3: '3',
};

export const ALERT_SEVERITIES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
};

export const DATE_FORMATS = {
  DEFAULT: 'yyyy-MM-dd HH:mm:ss',
  SHORT: 'MM/dd/yyyy',
  LONG: 'MMMM dd, yyyy',
  TIME: 'HH:mm:ss',
};
EOL
    fi

    # Create missing service files
    if [ ! -f "src/services/api/deviceService.js" ]; then
        print_warning "deviceService.js not found, creating default..."
        cat > src/services/api/deviceService.js << EOL
import api from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';

export const getDevices = async () => {
  const response = await api.get(API_ENDPOINTS.DEVICES.LIST);
  return response.data;
};

export const getDevice = async (id) => {
  const response = await api.get(API_ENDPOINTS.DEVICES.DETAIL(id));
  return response.data;
};

export const getDeviceStats = async (id) => {
  const response = await api.get(API_ENDPOINTS.DEVICES.STATS(id));
  return response.data;
};

export const updateDeviceConfig = async (id, config) => {
  const response = await api.put(API_ENDPOINTS.DEVICES.CONFIG(id), config);
  return response.data;
};
EOL
    fi

    if [ ! -f "src/services/snmp/snmpService.js" ]; then
        print_warning "snmpService.js not found, creating default..."
        cat > src/services/snmp/snmpService.js << EOL
import config from '../../config';

export const getSnmpConfig = () => {
  return {
    community: config.snmp.community,
    version: config.snmp.version,
    timeout: config.snmp.timeout,
    retries: config.snmp.retries,
  };
};

export const getDeviceInfo = async (ip, oids) => {
  try {
    const response = await fetch(\`\${config.api.baseUrl}/snmp/get\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip,
        oids,
        ...getSnmpConfig(),
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('SNMP request failed:', error);
    throw error;
  }
};

export const setDeviceConfig = async (ip, oid, value) => {
  try {
    const response = await fetch(\`\${config.api.baseUrl}/snmp/set\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip,
        oid,
        value,
        ...getSnmpConfig(),
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('SNMP set request failed:', error);
    throw error;
  }
};
EOL
    fi

    # Create missing hook files
    if [ ! -f "src/hooks/useDevices.js" ]; then
        print_warning "useDevices.js not found, creating default..."
        cat > src/hooks/useDevices.js << EOL
import { useState, useEffect } from 'react';
import { getDevices, getDeviceStats } from '../services/api/deviceService';

export const useDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await getDevices();
        setDevices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const refreshDeviceStats = async (deviceId) => {
    try {
      const stats = await getDeviceStats(deviceId);
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId ? { ...device, stats } : device
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return { devices, loading, error, refreshDeviceStats };
};
EOL
    fi

    if [ ! -f "src/hooks/useWebSocket.js" ]; then
        print_warning "useWebSocket.js not found, creating default..."
        cat > src/hooks/useWebSocket.js << EOL
import { useEffect, useRef, useCallback } from 'react';
import config from '../config';

export const useWebSocket = (onMessage) => {
  const ws = useRef(null);

  const connect = useCallback(() => {
    ws.current = new WebSocket(config.websocket.url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(connect, config.websocket.reconnectInterval);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage };
};
EOL
    fi

    # Create missing context files
    if [ ! -f "src/context/DeviceContext.js" ]; then
        print_warning "DeviceContext.js not found, creating default..."
        cat > src/context/DeviceContext.js << EOL
import React, { createContext, useContext, useState } from 'react';
import { useDevices } from '../hooks/useDevices';

const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const { devices, loading, error, refreshDeviceStats } = useDevices();
  const [selectedDevice, setSelectedDevice] = useState(null);

  const value = {
    devices,
    loading,
    error,
    selectedDevice,
    setSelectedDevice,
    refreshDeviceStats,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
};
EOL
    fi

    # Create missing configuration files
    if [ ! -f "src/config.js" ]; then
        print_warning "config.js not found, creating default..."
        cat > src/config.js << EOL
export default {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    timeout: 10000,
    retryAttempts: 3,
  },
  websocket: {
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:8000',
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
  },
  snmp: {
    community: process.env.REACT_APP_SNMP_COMMUNITY || 'public',
    version: process.env.REACT_APP_SNMP_VERSION || '2c',
    timeout: 5000,
    retries: 3,
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiration: 3600,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  charts: {
    defaultColors: [
      '#90caf9',
      '#f48fb1',
      '#66bb6a',
      '#ffa726',
      '#29b6f6',
      '#ab47bc',
      '#ec407a',
      '#7e57c2',
    ],
  },
};
EOL
    fi

    # Create missing style files
    if [ ! -f "src/index.css" ]; then
        print_warning "index.css not found, creating default..."
        cat > src/index.css << EOL
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #616161;
}
EOL
    fi

    if [ ! -f "src/App.css" ]; then
        print_warning "App.css not found, creating default..."
        cat > src/App.css << EOL
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-top: 64px;
  margin-left: 240px;
}

@media (max-width: 600px) {
  .main-content {
    margin-left: 0;
  }
}

/* Common utility classes */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.full-width {
  width: 100%;
}

.full-height {
  height: 100%;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }
.mt-4 { margin-top: 32px; }

.mb-1 { margin-bottom: 8px; }
.mb-2 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 32px; }

.ml-1 { margin-left: 8px; }
.ml-2 { margin-left: 16px; }
.ml-3 { margin-left: 24px; }
.ml-4 { margin-left: 32px; }

.mr-1 { margin-right: 8px; }
.mr-2 { margin-right: 16px; }
.mr-3 { margin-right: 24px; }
.mr-4 { margin-right: 32px; }

.p-1 { padding: 8px; }
.p-2 { padding: 16px; }
.p-3 { padding: 24px; }
.p-4 { padding: 32px; }
EOL
    fi

    # Create missing test files
    if [ ! -f "src/setupTests.js" ]; then
        print_warning "setupTests.js not found, creating default..."
        cat > src/setupTests.js << EOL
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
EOL
    fi

    # Create missing service worker
    if [ ! -f "src/serviceWorker.js" ]; then
        print_warning "serviceWorker.js not found, creating default..."
        cat > src/serviceWorker.js << EOL
// This service worker file is effectively a 'no-op' that will reset any
// previous service worker registered for the same host:port combination.
// In the production build, this file is replaced with an actual service worker
// file that will precache your site's local assets.

const CACHE_NAME = 'network-monitoring-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
EOL
    fi

    # Create missing test files
    if [ ! -f "src/App.test.js" ]; then
        print_warning "App.test.js not found, creating default..."
        cat > src/App.test.js << EOL
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const linkElement = screen.getByText(/Welcome to Network Monitoring/i);
  expect(linkElement).toBeInTheDocument();
});
EOL
    fi

    # Create missing public assets
    if [ ! -f "public/favicon.ico" ]; then
        print_warning "favicon.ico not found, creating default..."
        touch public/favicon.ico
    fi

    if [ ! -f "public/logo192.png" ]; then
        print_warning "logo192.png not found, creating default..."
        touch public/logo192.png
    fi

    if [ ! -f "public/logo512.png" ]; then
        print_warning "logo512.png not found, creating default..."
        touch public/logo512.png
    fi

    npm install --no-audit --no-fund
    cd ..
else
    print_warning "frontend directory not found, creating it..."
    mkdir -p frontend
    cd frontend
    cat > package.json << EOL
{
  "name": "network-monitoring-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.10.5",
    "@emotion/styled": "^11.10.5",
    "@mui/icons-material": "^5.11.0",
    "@mui/material": "^5.11.0",
    "@mui/x-data-grid": "^5.17.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.2.1",
    "chart.js": "^4.0.1",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.0.1",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.6.1",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOL

    mkdir -p src/components src/pages src/utils src/assets src/services src/hooks src/context
    cat > src/index.js << EOL
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
EOL

    cat > src/reportWebVitals.js << EOL
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
EOL

    cat > src/App.js << EOL
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<div>Welcome to Network Monitoring</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
EOL

    mkdir -p public
    cat > public/index.html << EOL
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Network Monitoring System"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Network Monitoring</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOL

    cat > public/manifest.json << EOL
{
  "short_name": "Network Monitor",
  "name": "Network Monitoring System",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOL

    cat > public/robots.txt << EOL
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
EOL

    npm install --no-audit --no-fund
    cd ..
fi
check_command "Node.js dependencies installation"

# Configure PostgreSQL
print_message "Configuring PostgreSQL..."
if ! sudo -u postgres psql -c "SELECT 1" &>/dev/null; then
    print_error "PostgreSQL service not running"
    systemctl start postgresql
    sleep 2
fi

sudo -u postgres psql -c "CREATE DATABASE network_monitoring;" || print_warning "Database might already exist"
sudo -u postgres psql -c "CREATE USER network_monitoring WITH PASSWORD 'your_secure_password';" || print_warning "User might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE network_monitoring TO network_monitoring;"
check_command "PostgreSQL configuration"

# Create configuration files
print_message "Creating configuration files..."

# Backend configuration
cat > backend/config.py << EOL
import os

# Database configuration
DATABASE = {
    'host': 'localhost',
    'port': 5432,
    'database': 'network_monitoring',
    'user': 'network_monitoring',
    'password': 'your_secure_password'
}

# Redis configuration
REDIS = {
    'host': 'localhost',
    'port': 6379,
    'db': 0
}

# SNMP configuration
SNMP = {
    'community': 'public',
    'version': '2c',
    'timeout': 5,
    'retries': 3
}

# Logging configuration
LOGGING = {
    'level': 'INFO',
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': '/var/log/network-monitoring/backend.log'
}

# Security configuration
SECURITY = {
    'secret_key': os.urandom(24).hex(),
    'token_expiration': 3600
}
EOL

# Frontend configuration
cat > frontend/.env << EOL
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_SNMP_COMMUNITY=public
REACT_APP_SNMP_VERSION=2c
EOL

# Configure Nginx
print_message "Configuring Nginx..."
if [ -f "/etc/nginx/sites-enabled/network-monitoring" ]; then
    print_warning "Nginx configuration already exists, removing old configuration..."
    rm -f /etc/nginx/sites-enabled/network-monitoring
fi

if [ -f "/etc/nginx/sites-available/network-monitoring" ]; then
    print_warning "Nginx configuration file already exists, backing up..."
    mv /etc/nginx/sites-available/network-monitoring /etc/nginx/sites-available/network-monitoring.bak
fi

# Create Nginx configuration
cat > /etc/nginx/sites-available/network-monitoring << EOL
server {
    listen 80;
    server_name localhost;

    location / {
        root /opt/network-monitoring/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOL

# Create symbolic link
ln -sf /etc/nginx/sites-available/network-monitoring /etc/nginx/sites-enabled/

# Test Nginx configuration
print_message "Testing Nginx configuration..."
nginx -t
check_command "Nginx configuration test"

# Restart Nginx
print_message "Restarting Nginx..."
systemctl restart nginx
check_command "Nginx restart"

# Create systemd service files
print_message "Creating systemd service files..."

# Backend service
cat > /etc/systemd/system/network-monitoring-backend.service << EOL
[Unit]
Description=Network Monitoring Backend
After=network.target postgresql.service redis-server.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/network-monitoring/backend
Environment="PATH=/opt/network-monitoring/venv/bin"
ExecStart=/opt/network-monitoring/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Frontend service
cat > /etc/systemd/system/network-monitoring-frontend.service << EOL
[Unit]
Description=Network Monitoring Frontend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/network-monitoring/frontend
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Create log directory
print_message "Creating log directory..."
mkdir -p /var/log/network-monitoring
chown -R www-data:www-data /var/log/network-monitoring

# Set permissions
print_message "Setting permissions..."
chown -R www-data:www-data /opt/network-monitoring
chmod -R 755 /opt/network-monitoring

# Build frontend
print_message "Building frontend..."
cd frontend
npm run build
cd ..

# Enable and start services
print_message "Starting services..."
systemctl daemon-reload
systemctl enable network-monitoring-backend
systemctl enable network-monitoring-frontend
systemctl start network-monitoring-backend
systemctl start network-monitoring-frontend

# Create initial admin user
print_message "Creating initial admin user..."
cd backend
source ../venv/bin/activate
python -c "
from app import db, User
db.create_all()
admin = User(username='admin', email='admin@example.com', is_admin=True)
admin.set_password('admin123')
db.session.add(admin)
db.session.commit()
"
cd ..

print_message "Installation completed successfully!"
print_warning "Please change the default passwords and secrets in the configuration files!"
print_message "You can access the application at http://localhost"
print_message "Default admin credentials:"
print_message "Username: admin"
print_message "Password: admin123" 