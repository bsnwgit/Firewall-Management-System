import time
import logging
from typing import Dict, Any
from datetime import datetime

from .palo_alto_service import get_palo_alto_traffic_logs
from .fortigate_service import get_fortigate_traffic_logs
from .unifi_service import get_unifi_traffic_logs

logger = logging.getLogger(__name__)

class MonitoringService:
    def __init__(self, interval: int = 60):
        """
        Initialize the monitoring service.
        
        Args:
            interval: How frequently (in seconds) to poll the firewalls
        """
        self.interval = interval
        self.running = True
        self.firewalls = {
            "palo_alto": [],
            "fortigate": [],
            "unifi": []
        }
        
    def add_firewall(self, firewall_type: str, hostname: str, token: str, extra_params: Dict[str, Any] = None):
        """
        Add a firewall to monitor.
        
        Args:
            firewall_type: Type of firewall ('palo_alto', 'fortigate', or 'unifi')
            hostname: Hostname or IP address of the firewall
            token: API key or token for authentication
            extra_params: Additional parameters for the API calls
        """
        if firewall_type not in self.firewalls:
            raise ValueError(f"Unsupported firewall type: {firewall_type}")
            
        self.firewalls[firewall_type].append({
            "hostname": hostname,
            "token": token,
            "extra_params": extra_params or {}
        })
        logger.info(f"Added {firewall_type} firewall at {hostname} to monitoring")
        
    def run(self):
        """
        Main monitoring loop that periodically polls all configured firewalls.
        """
        logger.info("Starting firewall monitoring service")
        
        while self.running:
            try:
                self._poll_firewalls()
            except Exception as e:
                logger.error(f"Error during firewall polling: {str(e)}")
                
            time.sleep(self.interval)
            
    def _poll_firewalls(self):
        """
        Poll all configured firewalls for traffic logs and stats.
        """
        timestamp = datetime.now().isoformat()
        
        # Poll Palo Alto firewalls
        for firewall in self.firewalls["palo_alto"]:
            try:
                logs = get_palo_alto_traffic_logs(
                    firewall["hostname"],
                    firewall["token"],
                    firewall["extra_params"]
                )
                self._process_logs("palo_alto", firewall["hostname"], logs, timestamp)
            except Exception as e:
                logger.error(f"Error polling Palo Alto firewall {firewall['hostname']}: {str(e)}")
                
        # Poll Fortigate firewalls
        for firewall in self.firewalls["fortigate"]:
            try:
                logs = get_fortigate_traffic_logs(
                    firewall["hostname"],
                    firewall["token"],
                    firewall["extra_params"]
                )
                self._process_logs("fortigate", firewall["hostname"], logs, timestamp)
            except Exception as e:
                logger.error(f"Error polling Fortigate firewall {firewall['hostname']}: {str(e)}")
                
        # Poll UniFi controllers
        for firewall in self.firewalls["unifi"]:
            try:
                logs = get_unifi_traffic_logs(
                    firewall["hostname"],
                    firewall["token"],
                    firewall["extra_params"]
                )
                self._process_logs("unifi", firewall["hostname"], logs, timestamp)
            except Exception as e:
                logger.error(f"Error polling UniFi controller {firewall['hostname']}: {str(e)}")
                
    def _process_logs(self, firewall_type: str, hostname: str, logs: Dict[str, Any], timestamp: str):
        """
        Process and store the logs from a firewall.
        In a production environment, this would store the logs in a database or file.
        
        Args:
            firewall_type: Type of firewall
            hostname: Hostname or IP address of the firewall
            logs: Log data from the firewall
            timestamp: Timestamp of when the logs were retrieved
        """
        # In a real implementation, you would store these logs in a database
        # or process them in some way. For now, we'll just log them.
        logger.info(f"Retrieved {len(logs.get('data', []))} logs from {firewall_type} firewall at {hostname}")
        
    def stop(self):
        """
        Stop the monitoring service.
        """
        logger.info("Stopping firewall monitoring service")
        self.running = False 