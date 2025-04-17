from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List, Optional
from ..models.network_monitoring import NetworkMonitoringHistory, InterfaceStatsHistory, NetFlowHistory
from ..database import get_db
from ..schemas.network_monitoring import (
    NetworkMonitoringHistoryResponse,
    InterfaceStatsHistoryResponse,
    NetFlowHistoryResponse,
    TimeRange
)

router = APIRouter()

@router.get("/history/metrics", response_model=List[NetworkMonitoringHistoryResponse])
async def get_metrics_history(
    source: Optional[str] = None,
    metric_type: Optional[str] = None,
    time_range: TimeRange = TimeRange.last_24h,
    db: Session = Depends(get_db)
):
    """Get historical metrics data with optional filtering"""
    query = db.query(NetworkMonitoringHistory)
    
    # Apply time range filter
    now = datetime.utcnow()
    if time_range == TimeRange.last_hour:
        start_time = now - timedelta(hours=1)
    elif time_range == TimeRange.last_6h:
        start_time = now - timedelta(hours=6)
    elif time_range == TimeRange.last_24h:
        start_time = now - timedelta(hours=24)
    elif time_range == TimeRange.last_7d:
        start_time = now - timedelta(days=7)
    else:  # last_30d
        start_time = now - timedelta(days=30)
    
    query = query.filter(NetworkMonitoringHistory.timestamp >= start_time)
    
    # Apply optional filters
    if source:
        query = query.filter(NetworkMonitoringHistory.source == source)
    if metric_type:
        query = query.filter(NetworkMonitoringHistory.metric_type == metric_type)
    
    # Order by timestamp descending
    query = query.order_by(desc(NetworkMonitoringHistory.timestamp))
    
    return query.all()

@router.get("/history/interface-stats", response_model=List[InterfaceStatsHistoryResponse])
async def get_interface_stats_history(
    interface_name: Optional[str] = None,
    time_range: TimeRange = TimeRange.last_24h,
    db: Session = Depends(get_db)
):
    """Get historical interface statistics"""
    query = db.query(InterfaceStatsHistory)
    
    # Apply time range filter
    now = datetime.utcnow()
    if time_range == TimeRange.last_hour:
        start_time = now - timedelta(hours=1)
    elif time_range == TimeRange.last_6h:
        start_time = now - timedelta(hours=6)
    elif time_range == TimeRange.last_24h:
        start_time = now - timedelta(hours=24)
    elif time_range == TimeRange.last_7d:
        start_time = now - timedelta(days=7)
    else:  # last_30d
        start_time = now - timedelta(days=30)
    
    query = query.filter(InterfaceStatsHistory.timestamp >= start_time)
    
    # Apply optional interface filter
    if interface_name:
        query = query.filter(InterfaceStatsHistory.interface_name == interface_name)
    
    # Order by timestamp descending
    query = query.order_by(desc(InterfaceStatsHistory.timestamp))
    
    return query.all()

@router.get("/history/netflow", response_model=List[NetFlowHistoryResponse])
async def get_netflow_history(
    source_ip: Optional[str] = None,
    destination_ip: Optional[str] = None,
    protocol: Optional[str] = None,
    time_range: TimeRange = TimeRange.last_24h,
    db: Session = Depends(get_db)
):
    """Get historical NetFlow data"""
    query = db.query(NetFlowHistory)
    
    # Apply time range filter
    now = datetime.utcnow()
    if time_range == TimeRange.last_hour:
        start_time = now - timedelta(hours=1)
    elif time_range == TimeRange.last_6h:
        start_time = now - timedelta(hours=6)
    elif time_range == TimeRange.last_24h:
        start_time = now - timedelta(hours=24)
    elif time_range == TimeRange.last_7d:
        start_time = now - timedelta(days=7)
    else:  # last_30d
        start_time = now - timedelta(days=30)
    
    query = query.filter(NetFlowHistory.timestamp >= start_time)
    
    # Apply optional filters
    if source_ip:
        query = query.filter(NetFlowHistory.source_ip == source_ip)
    if destination_ip:
        query = query.filter(NetFlowHistory.destination_ip == destination_ip)
    if protocol:
        query = query.filter(NetFlowHistory.protocol == protocol)
    
    # Order by timestamp descending
    query = query.order_by(desc(NetFlowHistory.timestamp))
    
    return query.all()

@router.get("/history/metrics/summary")
async def get_metrics_summary(
    source: Optional[str] = None,
    metric_type: Optional[str] = None,
    time_range: TimeRange = TimeRange.last_24h,
    db: Session = Depends(get_db)
):
    """Get summary statistics for metrics"""
    query = db.query(
        NetworkMonitoringHistory.metric_type,
        func.avg(NetworkMonitoringHistory.value).label('average'),
        func.max(NetworkMonitoringHistory.value).label('maximum'),
        func.min(NetworkMonitoringHistory.value).label('minimum'),
        func.count(NetworkMonitoringHistory.id).label('count')
    )
    
    # Apply time range filter
    now = datetime.utcnow()
    if time_range == TimeRange.last_hour:
        start_time = now - timedelta(hours=1)
    elif time_range == TimeRange.last_6h:
        start_time = now - timedelta(hours=6)
    elif time_range == TimeRange.last_24h:
        start_time = now - timedelta(hours=24)
    elif time_range == TimeRange.last_7d:
        start_time = now - timedelta(days=7)
    else:  # last_30d
        start_time = now - timedelta(days=30)
    
    query = query.filter(NetworkMonitoringHistory.timestamp >= start_time)
    
    # Apply optional filters
    if source:
        query = query.filter(NetworkMonitoringHistory.source == source)
    if metric_type:
        query = query.filter(NetworkMonitoringHistory.metric_type == metric_type)
    
    # Group by metric type
    query = query.group_by(NetworkMonitoringHistory.metric_type)
    
    return query.all()

@router.get("/history/netflow/top-talkers")
async def get_top_talkers(
    time_range: TimeRange = TimeRange.last_24h,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get top talkers based on NetFlow data"""
    query = db.query(
        NetFlowHistory.source_ip,
        func.sum(NetFlowHistory.bytes).label('total_bytes'),
        func.sum(NetFlowHistory.packets).label('total_packets')
    )
    
    # Apply time range filter
    now = datetime.utcnow()
    if time_range == TimeRange.last_hour:
        start_time = now - timedelta(hours=1)
    elif time_range == TimeRange.last_6h:
        start_time = now - timedelta(hours=6)
    elif time_range == TimeRange.last_24h:
        start_time = now - timedelta(hours=24)
    elif time_range == TimeRange.last_7d:
        start_time = now - timedelta(days=7)
    else:  # last_30d
        start_time = now - timedelta(days=30)
    
    query = query.filter(NetFlowHistory.timestamp >= start_time)
    
    # Group by source IP and order by total bytes
    query = query.group_by(NetFlowHistory.source_ip)
    query = query.order_by(desc('total_bytes'))
    query = query.limit(limit)
    
    return query.all() 