# Network Monitoring System

A comprehensive network monitoring solution that provides real-time monitoring, alerting, and historical data analysis for network devices.

## Features

- **Real-time Monitoring**
  - CPU, Memory, Disk, and Network usage
  - Interface statistics
  - Bandwidth utilization
  - Top talkers analysis

- **Device Management**
  - Support for multiple device types (Firewalls, Routers, Switches, Servers)
  - Device grouping and organization
  - Bulk operations and configuration

- **Alerting System**
  - Customizable thresholds
  - Multiple severity levels
  - Various notification channels (Email, Slack, Webhook, etc.)
  - Alert history and management

- **Historical Data**
  - Performance trends
  - Resource utilization history
  - Customizable time ranges
  - Data visualization

- **Reporting**
  - Multiple report templates
  - Custom report generation
  - Export in various formats (JSON, CSV, PDF, Excel)

## System Requirements

- Ubuntu 22.04 LTS
- Python 3.8+
- Node.js 14+
- PostgreSQL 12+
- Redis 6+
- Nginx
- Net-SNMP

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bsnwgit/network-monitoring.git
cd network-monitoring
```

2. Make the installation script executable:
```bash
chmod +x install.sh
```

3. Run the installation script as root:
```bash
sudo ./install.sh
```

The installation script will:
- Install all required dependencies
- Set up the database
- Configure the web server
- Create system services
- Set up initial admin user

## Configuration

### Backend Configuration
Edit `backend/config.py` to configure:
- Database settings
- Redis configuration
- SNMP parameters
- Logging settings
- Security options

### Frontend Configuration
Edit `frontend/.env` to configure:
- API endpoints
- WebSocket settings
- SNMP parameters

### Nginx Configuration
The default configuration is in `/etc/nginx/sites-available/network-monitoring`

## Usage

### Accessing the Application
- Web Interface: http://localhost
- Default Admin Credentials:
  - Username: admin
  - Password: admin123

### Managing Devices
1. Add devices through the web interface
2. Configure monitoring parameters
3. Set up alert thresholds
4. Organize devices into groups

### Setting Up Alerts
1. Configure notification channels
2. Set severity levels
3. Define alert thresholds
4. Test alert notifications

### Generating Reports
1. Select report type
2. Choose time range
3. Select devices/groups
4. Generate and export report

## Security Considerations

1. Change default passwords:
   - Admin user password
   - Database password
   - SNMP community strings

2. Configure SSL/TLS:
   - Generate SSL certificates
   - Update Nginx configuration
   - Enable HTTPS

3. Set up firewall rules:
   - Allow only necessary ports
   - Restrict access to management interface

## Maintenance

### Backup
Regularly backup:
- Database
- Configuration files
- Log files

### Updates
1. Pull latest changes:
```bash
cd /opt/network-monitoring
git pull
```

2. Update dependencies:
```bash
source venv/bin/activate
pip install -r backend/requirements.txt
cd frontend
npm install
npm run build
```

3. Restart services:
```bash
sudo systemctl restart network-monitoring-backend
sudo systemctl restart network-monitoring-frontend
```

## Troubleshooting

### Common Issues

1. **Service Not Starting**
   - Check logs: `journalctl -u network-monitoring-backend`
   - Verify database connection
   - Check Redis status

2. **SNMP Issues**
   - Verify SNMP community strings
   - Check device accessibility
   - Test SNMP queries

3. **Performance Problems**
   - Monitor system resources
   - Check database performance
   - Review log files

### Log Files
- Backend logs: `/var/log/network-monitoring/backend.log`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
1. Check the documentation
2. Review troubleshooting guides
3. Open an issue on GitHub
4. Contact the development team 