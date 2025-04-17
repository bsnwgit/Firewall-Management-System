import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def get_fortigate_info(hostname: str, token: str, extra_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Retrieve system information from a Fortigate firewall.
    
    Args:
        hostname: The hostname or IP address of the Fortigate firewall
        token: API key for authentication
        extra_params: Additional parameters for the API call
    
    Returns:
        Dictionary containing the firewall's system information
    """
    try:
        # Construct the API URL
        url = f"https://{hostname}/api/v2/monitor/system/status"
        
        # Set up headers with authentication
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        # Make the API request
        logger.info(f"Making request to Fortigate firewall at {hostname}")
        response = requests.get(url, headers=headers, verify=False)  # In production, handle certificates properly
        
        if response.status_code != 200:
            error_msg = f"Failed to retrieve data from Fortigate: {response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
            
        return response.json()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while connecting to Fortigate firewall: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while retrieving Fortigate info: {str(e)}")
        raise

def get_fortigate_traffic_logs(hostname: str, token: str, extra_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Retrieve traffic logs from a Fortigate firewall.
    
    Args:
        hostname: The hostname or IP address of the Fortigate firewall
        token: API key for authentication
        extra_params: Additional parameters for the API call
    
    Returns:
        Dictionary containing the firewall's traffic logs
    """
    try:
        # Construct the API URL for traffic logs
        url = f"https://{hostname}/api/v2/monitor/firewall/traffic"
        
        # Set up headers with authentication
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        # Add any additional parameters
        params = {}
        if extra_params.get('filter'):
            params['filter'] = extra_params['filter']
        if extra_params.get('limit'):
            params['limit'] = extra_params['limit']
            
        # Make the API request
        logger.info(f"Retrieving traffic logs from Fortigate firewall at {hostname}")
        response = requests.get(url, headers=headers, params=params, verify=False)
        
        if response.status_code != 200:
            error_msg = f"Failed to retrieve traffic logs from Fortigate: {response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
            
        return response.json()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while retrieving Fortigate traffic logs: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while retrieving Fortigate traffic logs: {str(e)}")
        raise 