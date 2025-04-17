from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from config.security import security_settings

router = APIRouter()

class SecuritySettings(BaseModel):
    cors_origins: List[str]
    rate_limit: Dict[str, Any]
    session_config: Dict[str, Any]
    ssl_config: Dict[str, Any]

@router.get("/settings", response_model=SecuritySettings)
async def get_security_settings():
    """Get current security settings"""
    return SecuritySettings(
        cors_origins=security_settings.CORS_ORIGINS,
        rate_limit=security_settings.RATE_LIMIT,
        session_config=security_settings.SESSION_CONFIG,
        ssl_config=security_settings.SSL_CONFIG
    )

@router.post("/settings")
async def update_security_settings(settings: SecuritySettings):
    """Update security settings"""
    try:
        # Update CORS origins
        os.environ["CORS_ORIGINS"] = ",".join(settings.cors_origins)
        security_settings.CORS_ORIGINS = settings.cors_origins

        # Update rate limiting
        os.environ["RATE_LIMIT_ENABLED"] = str(settings.rate_limit["enabled"]).lower()
        os.environ["RATE_LIMIT_REQUESTS"] = str(settings.rate_limit["requests"])
        os.environ["RATE_LIMIT_WINDOW"] = str(settings.rate_limit["window"])
        security_settings.RATE_LIMIT = settings.rate_limit

        # Update session config
        os.environ["SESSION_LIFETIME"] = str(settings.session_config["lifetime"])
        os.environ["SESSION_SECURE"] = str(settings.session_config["secure"]).lower()
        os.environ["SESSION_HTTPONLY"] = str(settings.session_config["httponly"]).lower()
        os.environ["SESSION_SAMESITE"] = settings.session_config["samesite"]
        security_settings.SESSION_CONFIG = settings.session_config

        # Update SSL config
        os.environ["SSL_ENABLED"] = str(settings.ssl_config["enabled"]).lower()
        os.environ["SSL_CERT_PATH"] = settings.ssl_config["cert_path"]
        os.environ["SSL_KEY_PATH"] = settings.ssl_config["key_path"]
        security_settings.SSL_CONFIG = settings.ssl_config

        # Write changes to .env file
        with open(".env", "a") as f:
            f.write("\n# Security Settings\n")
            f.write(f"CORS_ORIGINS={','.join(settings.cors_origins)}\n")
            f.write(f"RATE_LIMIT_ENABLED={str(settings.rate_limit['enabled']).lower()}\n")
            f.write(f"RATE_LIMIT_REQUESTS={settings.rate_limit['requests']}\n")
            f.write(f"RATE_LIMIT_WINDOW={settings.rate_limit['window']}\n")
            f.write(f"SESSION_LIFETIME={settings.session_config['lifetime']}\n")
            f.write(f"SESSION_SECURE={str(settings.session_config['secure']).lower()}\n")
            f.write(f"SESSION_HTTPONLY={str(settings.session_config['httponly']).lower()}\n")
            f.write(f"SESSION_SAMESITE={settings.session_config['samesite']}\n")
            f.write(f"SSL_ENABLED={str(settings.ssl_config['enabled']).lower()}\n")
            f.write(f"SSL_CERT_PATH={settings.ssl_config['cert_path']}\n")
            f.write(f"SSL_KEY_PATH={settings.ssl_config['key_path']}\n")

        return {"message": "Security settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 