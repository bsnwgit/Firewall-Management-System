from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class FirewallRule(Base):
    __tablename__ = "firewall_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    source_ip = Column(String)
    destination_ip = Column(String)
    protocol = Column(String)
    port = Column(String)
    action = Column(String)  # 'allow' or 'deny'
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(String)  # Store as ISO format string
    updated_at = Column(String)  # Store as ISO format string

    # Relationship with user
    creator = relationship("User", back_populates="firewall_rules") 