import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def get_palo_alto_info(hostname: str, token: str, extra_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Retrieve system information from a Palo Alto firewall.
    
    Args:
        hostname: The hostname or IP address of the Palo Alto firewall
        token: API key for authentication
        extra_params: Additional parameters for the API call
    
    Returns:
        Dictionary containing the firewall's system information
    """
    try:
        # Construct the API URL
        url = f"https://{hostname}/api/?type=op&cmd=<show><system><info></info></system></show>&key={token}"
        
        # Make the API request
        logger.info(f"Making request to Palo Alto firewall at {hostname}")
        response = requests.get(url, verify=False)  # In production, handle certificates properly
        
        if response.status_code != 200:
            error_msg = f"Failed to retrieve data from Palo Alto: {response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
            
        return response.json()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while connecting to Palo Alto firewall: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while retrieving Palo Alto info: {str(e)}")
        raise

def get_palo_alto_traffic_logs(hostname: str, token: str, extra_params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Retrieve traffic logs from a Palo Alto firewall.
    
    Args:
        hostname: The hostname or IP address of the Palo Alto firewall
        token: API key for authentication
        extra_params: Additional parameters for the API call
    
    Returns:
        Dictionary containing the firewall's traffic logs
    """
    try:
        # Construct the API URL for traffic logs
        url = f"https://{hostname}/api/?type=log&log-type=traffic&key={token}"
        
        # Add any additional parameters
        if extra_params.get('query'):
            url += f"&query={extra_params['query']}"
            
        # Make the API request
        logger.info(f"Retrieving traffic logs from Palo Alto firewall at {hostname}")
        response = requests.get(url, verify=False)
        
        if response.status_code != 200:
            error_msg = f"Failed to retrieve traffic logs from Palo Alto: {response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
            
        return response.json()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while retrieving Palo Alto traffic logs: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while retrieving Palo Alto traffic logs: {str(e)}")
        raise 