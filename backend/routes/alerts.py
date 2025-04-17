from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ..services.email_service import email_service
from ..models.database import get_db
from sqlalchemy.orm import Session
from datetime import datetime
import subprocess
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/send-alert-email")
async def send_alert_email(
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Send email notifications for alerts.
    
    Expected payload:
    {
        "email": "recipient@example.com",
        "alerts": [
            {
                "type": "cpu",
                "severity": "critical",
                "message": "CPU usage is 95%",
                "timestamp": "2024-01-01T12:00:00"
            }
        ]
    }
    """
    try:
        success = email_service.send_alert_email(
            recipient=data["email"],
            alerts=data["alerts"]
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
        return {"status": "success", "message": "Email sent successfully"}
        
    except Exception as e:
        logger.error(f"Error sending alert email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/restart-service")
async def restart_service(
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Restart a service based on alert type.
    
    Expected payload:
    {
        "service": "cpu"  # or "memory", "disk", "bandwidth"
    }
    """
    try:
        service = data["service"]
        
        # Map service types to actual service names
        service_map = {
            "cpu": "cpu-monitor",
            "memory": "memory-monitor",
            "disk": "disk-monitor",
            "bandwidth": "bandwidth-monitor"
        }
        
        if service not in service_map:
            raise HTTPException(status_code=400, detail="Invalid service type")
            
        # Execute service restart command
        result = subprocess.run(
            ["systemctl", "restart", service_map[service]],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to restart service: {result.stderr}"
            )
            
        # Log the restart action
        logger.info(f"Service {service} restarted successfully")
        
        return {
            "status": "success",
            "message": f"Service {service} restarted successfully"
        }
        
    except Exception as e:
        logger.error(f"Error restarting service: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/block-traffic")
async def block_traffic(
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Block traffic from a specific source.
    
    Expected payload:
    {
        "source": "192.168.1.100"
    }
    """
    try:
        source = data["source"]
        
        # Execute iptables command to block traffic
        result = subprocess.run(
            ["iptables", "-A", "INPUT", "-s", source, "-j", "DROP"],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to block traffic: {result.stderr}"
            )
            
        # Log the block action
        logger.info(f"Traffic from {source} blocked successfully")
        
        return {
            "status": "success",
            "message": f"Traffic from {source} blocked successfully"
        }
        
    except Exception as e:
        logger.error(f"Error blocking traffic: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/notify-admin")
async def notify_admin(
    data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Send a notification to the admin about a specific alert.
    
    Expected payload:
    {
        "alert": {
            "type": "cpu",
            "severity": "critical",
            "message": "CPU usage is 95%",
            "timestamp": "2024-01-01T12:00:00"
        }
    }
    """
    try:
        success = email_service.send_admin_notification(data["alert"])
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to notify admin")
            
        return {"status": "success", "message": "Admin notified successfully"}
        
    except Exception as e:
        logger.error(f"Error notifying admin: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 