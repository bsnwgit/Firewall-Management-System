import os
from typing import List, Dict, Any
from pydantic import BaseSettings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SecuritySettings:
    def __init__(self):
        # CORS Configuration
        self.CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        
        # Add all server IP addresses to CORS origins
        if os.getenv("IP_ADDRESSES"):
            for ip in os.getenv("IP_ADDRESSES", "").split(","):
                self.CORS_ORIGINS.extend([
                    f"http://{ip}:3000",
                    f"http://{ip}:8000",
                    f"https://{ip}:3000",
                    f"https://{ip}:8000"
                ])
        
        # Security Headers
        self.SECURITY_HEADERS: dict = {
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
        
        # Rate Limiting Configuration
        self.RATE_LIMIT: Dict[str, Any] = {
            "enabled": os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true",
            "requests": int(os.getenv("RATE_LIMIT_REQUESTS", "100")),
            "window": int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # in seconds
        }
        
        # Session Configuration
        self.SESSION_CONFIG: Dict[str, Any] = {
            "lifetime": int(os.getenv("SESSION_LIFETIME", "3600")),  # in seconds
            "secure": os.getenv("SESSION_SECURE", "true").lower() == "true",
            "httponly": os.getenv("SESSION_HTTPONLY", "true").lower() == "true",
            "samesite": os.getenv("SESSION_SAMESITE", "lax")
        }
        
        # WebSocket Security
        self.WEBSOCKET_SECURITY: dict = {
            "ping_interval": 20,  # seconds
            "ping_timeout": 10,   # seconds
            "max_message_size": 1024 * 1024,  # 1MB
            "max_queue_size": 32
        }
        
        # Network Security
        self.NETWORK_SECURITY: dict = {
            "allowed_hosts": ["*"],  # Configure based on your needs
            "trusted_proxies": [],   # List of trusted proxy IPs
            "max_connections": 1000,
            "timeout": 30,  # seconds
        }
        
        # SSL/TLS Configuration
        self.SSL_CONFIG: Dict[str, Any] = {
            "enabled": os.getenv("SSL_ENABLED", "false").lower() == "true",
            "cert_path": os.getenv("SSL_CERT_PATH", ""),
            "key_path": os.getenv("SSL_KEY_PATH", ""),
            "verify_mode": "CERT_REQUIRED",
            "check_hostname": True
        }

# Create a singleton instance
security_settings = SecuritySettings()

class Config:
    env_file = ".env"
    case_sensitive = True

# Create settings instance
security_settings = SecuritySettings() 