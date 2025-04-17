from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
import threading
import os
import logging
from datetime import timedelta
from typing import Optional
import socket

from services.palo_alto_service import get_palo_alto_info
from services.fortigate_service import get_fortigate_info
from services.unifi_service import get_unifi_info
from services.monitoring_service import MonitoringService
from services.auth_service import (
    User, authenticate_user, create_access_token, 
    get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from routes.firewall_rules import router as firewall_rules_router
from routes.view_preferences import router as view_preferences_router
from models import init_db
from config.security import security_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get all available IP addresses
def get_ip_addresses():
    ip_addresses = []
    hostname = socket.gethostname()
    ip_addresses.append(socket.gethostbyname(hostname))
    
    # Get all network interfaces
    for interface in socket.if_nameindex():
        try:
            ip = socket.if_indextoname(interface[0])
            ip_addresses.append(ip)
        except:
            continue
    
    return list(set(ip_addresses))  # Remove duplicates

# FastAPI initialization
app = FastAPI(
    title="Firewall Management System",
    description="API for monitoring Fortigate, Palo Alto, and UniFi firewalls",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=security_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    for header, value in security_settings.SECURITY_HEADERS.items():
        response.headers[header] = value
    return response

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=security_settings.NETWORK_SECURITY["allowed_hosts"]
)

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Configure rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "your-secret-key-here"),
    session_cookie="session",
    max_age=security_settings.SESSION_CONFIG["lifetime"],
    secure=security_settings.SESSION_CONFIG["secure"],
    httponly=security_settings.SESSION_CONFIG["httponly"],
    samesite=security_settings.SESSION_CONFIG["samesite"]
)

# Include routers
app.include_router(firewall_rules_router)
app.include_router(view_preferences_router)

# Initialize database
init_db()

# Request models
class FirewallConfigRequest(BaseModel):
    hostname: str
    token: str
    extra_params: dict = {}

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserInDB(User):
    hashed_password: str

# Authentication endpoints
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: dict):
    user = authenticate_user(form_data["username"], form_data["password"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Protected routes
@app.get("/")
async def index(current_user: User = Depends(get_current_active_user)):
    return {
        "status": "Firewall Management System is running",
        "version": "1.0.0",
        "supported_firewalls": ["Palo Alto", "Fortigate", "UniFi"],
        "user": current_user.username
    }

@app.post("/paloalto/info")
async def palo_alto_info(
    config: FirewallConfigRequest,
    current_user: User = Depends(get_current_active_user)
):
    try:
        logger.info(f"Retrieving Palo Alto info from {config.hostname}")
        data = get_palo_alto_info(config.hostname, config.token, config.extra_params)
        return {"palo_alto_data": data}
    except Exception as exc:
        logger.error(f"Error retrieving Palo Alto info: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/fortigate/info")
async def fortigate_info(
    config: FirewallConfigRequest,
    current_user: User = Depends(get_current_active_user)
):
    try:
        logger.info(f"Retrieving Fortigate info from {config.hostname}")
        data = get_fortigate_info(config.hostname, config.token, config.extra_params)
        return {"fortigate_data": data}
    except Exception as exc:
        logger.error(f"Error retrieving Fortigate info: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/unifi/info")
async def unifi_info(
    config: FirewallConfigRequest,
    current_user: User = Depends(get_current_active_user)
):
    try:
        logger.info(f"Retrieving UniFi info from {config.hostname}")
        data = get_unifi_info(config.hostname, config.token, config.extra_params)
        return {"unifi_data": data}
    except Exception as exc:
        logger.error(f"Error retrieving UniFi info: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

# Initialize our monitoring service
monitoring_service = MonitoringService(interval=60)  # 60s interval

@app.on_event("startup")
async def start_monitoring():
    logger.info("Starting monitoring service")
    # Start monitoring in a separate thread
    monitoring_thread = threading.Thread(target=monitoring_service.run, daemon=True)
    monitoring_thread.start()

if __name__ == "__main__":
    import uvicorn
    import ssl
    
    # Get all available IP addresses
    ip_addresses = get_ip_addresses()
    logger.info(f"Available IP addresses: {ip_addresses}")
    
    # SSL configuration if enabled
    ssl_context = None
    if security_settings.SSL_CONFIG["enabled"]:
        ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        ssl_context.load_cert_chain(
            security_settings.SSL_CONFIG["cert_path"],
            security_settings.SSL_CONFIG["key_path"]
        )
    
    # Start the server on all available IP addresses
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        ssl_keyfile=security_settings.SSL_CONFIG["key_path"] if security_settings.SSL_CONFIG["enabled"] else None,
        ssl_certfile=security_settings.SSL_CONFIG["cert_path"] if security_settings.SSL_CONFIG["enabled"] else None,
        timeout_keep_alive=security_settings.NETWORK_SECURITY["timeout"],
        limit_concurrency=security_settings.NETWORK_SECURITY["max_connections"],
        websocket_ping_interval=security_settings.WEBSOCKET_SECURITY["ping_interval"],
        websocket_ping_timeout=security_settings.WEBSOCKET_SECURITY["ping_timeout"],
        websocket_max_size=security_settings.WEBSOCKET_SECURITY["max_message_size"],
        websocket_max_queue=security_settings.WEBSOCKET_SECURITY["max_queue_size"]
    ) 