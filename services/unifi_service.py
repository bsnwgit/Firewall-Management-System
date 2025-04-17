import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def get_unifi_info(hostname: str, token: str, extra_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Retrieve system information from a UniFi controller.
    
    Args:
        hostname: The hostname or IP address of the UniFi controller
        token: API key for authentication
        extra_params: Additional parameters for the API call
    
    Returns:
        Dictionary containing the controller's system information
    """
    try:
        # Create a session for maintaining cookies
        session = requests.Session()
        
        # Login to the UniFi controller
        login_url = f"https://{hostname}/api/login"
        login_payload = {
            "username": extra_params.get("username", "admin"),
            "password": extra_params.get("password", "admin")
        }
        
        logger.info(f"Logging into UniFi controller at {hostname}")
        login_response = session.post(login_url, json=login_payload, verify=False)
        
        if login_response.status_code != 200:
            error_msg = f"Failed to login to UniFi controller: {login_response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
            
        # Get system information
        info_url = f"https://{hostname}/api/s/default/stat/device"
        logger.info(f"Retrieving system info from UniFi controller at {hostname}")
        info_response = session.get(info_url, verify=False)
        
        if info_response.status_code != 200:
            error_msg = f"Failed to retrieve system info from UniFi: {info_response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
            
        return info_response.json()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while connecting to UniFi controller: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while retrieving UniFi info: {str(e)}")
        raise

def get_unifi_traffic_logs(hostname: str, token: str, extra_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Retrieve traffic logs from a UniFi controller.
    
    Args:
        hostname: The hostname or IP address of the UniFi controller
        token: API key for authentication
        extra_params: Additional parameters for the API call
    
    Returns:
        Dictionary containing the controller's traffic logs
    """
    try:
        # Create a session for maintaining cookies
        session = requests.Session()
        
        # Login to the UniFi controller
        login_url = f"https://{hostname}/api/login"
        login_payload = {
            "username": extra_params.get("username", "admin"),
            "password": extra_params.get("password", "admin")
        }
        
        logger.info(f"Logging into UniFi controller at {hostname}")
        login_response = session.post(login_url, json=login_payload, verify=False)
        
        if login_response.status_code != 200:
            error_msg = f"Failed to login to UniFi controller: {login_response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
            
        # Get traffic logs
        logs_url = f"https://{hostname}/api/s/default/stat/event"
        params = {
            "type": "traffic",
            "limit": extra_params.get("limit", 100)
        }
        
        logger.info(f"Retrieving traffic logs from UniFi controller at {hostname}")
        logs_response = session.get(logs_url, params=params, verify=False)
        
        if logs_response.status_code != 200:
            error_msg = f"Failed to retrieve traffic logs from UniFi: {logs_response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
            
        return logs_response.json()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while retrieving UniFi traffic logs: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while retrieving UniFi traffic logs: {str(e)}")
        raise 