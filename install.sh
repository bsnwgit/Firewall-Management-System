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
    if [ ! -f "package.json" ]; then
        print_warning "package.json not found, creating default..."
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
    fi
    
    if [ ! -d "src" ]; then
        print_warning "src directory not found, creating default structure..."
        mkdir -p src/components src/pages src/utils src/assets
        cat > src/App.js << EOL
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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

        cat > src/index.js << EOL
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOL
    fi

    if [ ! -d "public" ]; then
        print_warning "public directory not found, creating it..."
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

    mkdir -p src/components src/pages src/utils src/assets
    cat > src/App.js << EOL
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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

    cat > src/index.js << EOL
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
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

# Nginx configuration
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

# Enable Nginx site
print_message "Configuring Nginx..."
ln -s /etc/nginx/sites-available/network-monitoring /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

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