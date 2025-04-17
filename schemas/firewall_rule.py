from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FirewallRuleBase(BaseModel):
    name: str
    description: Optional[str] = None
    source_ip: str
    destination_ip: str
    protocol: str
    port: str
    action: str  # 'allow' or 'deny'
    is_active: bool = True

class FirewallRuleCreate(FirewallRuleBase):
    pass

class FirewallRuleUpdate(FirewallRuleBase):
    name: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    protocol: Optional[str] = None
    port: Optional[str] = None
    action: Optional[str] = None
    is_active: Optional[bool] = None

class FirewallRule(FirewallRuleBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 