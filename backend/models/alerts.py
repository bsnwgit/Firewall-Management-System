from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # cpu, memory, disk, bandwidth
    severity = Column(String, nullable=False)  # critical, warning, info
    message = Column(String, nullable=False)
    source = Column(String)  # IP address or hostname
    value = Column(Integer)  # The value that triggered the alert
    threshold = Column(Integer)  # The threshold that was exceeded
    created_at = Column(DateTime, default=datetime.utcnow)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String)  # Username of who acknowledged
    acknowledged_at = Column(DateTime)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    metadata = Column(JSON)  # Additional alert data

    # Relationship with alert history
    history = relationship("AlertHistory", back_populates="alert", cascade="all, delete-orphan")

class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"))
    action = Column(String, nullable=False)  # created, acknowledged, resolved, etc.
    performed_by = Column(String)  # Username of who performed the action
    performed_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String)  # Additional notes about the action
    metadata = Column(JSON)  # Additional history data

    # Relationship with alert
    alert = relationship("Alert", back_populates="history") 