from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

class TimeRange(str, Enum):
    last_hour = "1h"
    last_6h = "6h"
    last_24h = "24h"
    last_7d = "7d"
    last_30d = "30d"

class NetworkMonitoringHistoryBase(BaseModel):
    source: str
    metric_type: str
    value: float
    unit: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class NetworkMonitoringHistoryCreate(NetworkMonitoringHistoryBase):
    pass

class NetworkMonitoringHistoryResponse(NetworkMonitoringHistoryBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

class InterfaceStatsHistoryBase(BaseModel):
    interface_name: str
    status: Optional[str] = None
    speed: Optional[int] = None
    in_bytes: Optional[int] = None
    out_bytes: Optional[int] = None
    in_errors: Optional[int] = None
    out_errors: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class InterfaceStatsHistoryCreate(InterfaceStatsHistoryBase):
    pass

class InterfaceStatsHistoryResponse(InterfaceStatsHistoryBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

class NetFlowHistoryBase(BaseModel):
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    protocol: Optional[str] = None
    port: Optional[int] = None
    bytes: Optional[int] = None
    packets: Optional[int] = None
    duration: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class NetFlowHistoryCreate(NetFlowHistoryBase):
    pass

class NetFlowHistoryResponse(NetFlowHistoryBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

class MetricsSummary(BaseModel):
    metric_type: str
    average: float
    maximum: float
    minimum: float
    count: int

class TopTalker(BaseModel):
    source_ip: str
    total_bytes: int
    total_packets: int 