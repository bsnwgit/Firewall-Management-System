from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class NetworkMonitoringHistory(Base):
    __tablename__ = "network_monitoring_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source = Column(String, nullable=False)  # IP address or hostname
    metric_type = Column(String, nullable=False)  # cpu, memory, disk, bandwidth, etc.
    value = Column(Float, nullable=False)
    unit = Column(String)  # %, MB, GB, Mbps, etc.
    metadata = Column(JSON)  # Additional monitoring data

    # Indexes for faster querying
    __table_args__ = (
        Index('idx_network_monitoring_timestamp', timestamp),
        Index('idx_network_monitoring_source', source),
        Index('idx_network_monitoring_metric_type', metric_type)
    )

class InterfaceStatsHistory(Base):
    __tablename__ = "interface_stats_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    interface_name = Column(String, nullable=False)
    status = Column(String)  # up, down, etc.
    speed = Column(Integer)  # in Mbps
    in_bytes = Column(Integer)
    out_bytes = Column(Integer)
    in_errors = Column(Integer)
    out_errors = Column(Integer)
    metadata = Column(JSON)  # Additional interface data

    # Indexes for faster querying
    __table_args__ = (
        Index('idx_interface_stats_timestamp', timestamp),
        Index('idx_interface_stats_interface', interface_name)
    )

class NetFlowHistory(Base):
    __tablename__ = "netflow_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_ip = Column(String)
    destination_ip = Column(String)
    protocol = Column(String)
    port = Column(Integer)
    bytes = Column(Integer)
    packets = Column(Integer)
    duration = Column(Integer)  # in seconds
    metadata = Column(JSON)  # Additional NetFlow data

    # Indexes for faster querying
    __table_args__ = (
        Index('idx_netflow_timestamp', timestamp),
        Index('idx_netflow_source_ip', source_ip),
        Index('idx_netflow_destination_ip', destination_ip)
    ) 