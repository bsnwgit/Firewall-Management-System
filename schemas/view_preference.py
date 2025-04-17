from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

class WidgetConfig(BaseModel):
    type: str  # e.g., "bandwidth", "connections", "alerts"
    title: str
    position: Dict[str, int]  # x, y coordinates
    size: Dict[str, int]  # width, height
    refresh_interval: int  # in seconds
    config: Dict  # widget-specific configuration

class LayoutConfig(BaseModel):
    columns: int
    row_height: int
    margin: List[int]  # [x, y]
    container_padding: List[int]  # [x, y]

class ViewPreferenceBase(BaseModel):
    name: str
    layout: LayoutConfig
    widgets: List[WidgetConfig]
    is_default: bool = False

class ViewPreferenceCreate(ViewPreferenceBase):
    pass

class ViewPreferenceUpdate(ViewPreferenceBase):
    name: Optional[str] = None
    layout: Optional[LayoutConfig] = None
    widgets: Optional[List[WidgetConfig]] = None
    is_default: Optional[bool] = None

class ViewPreference(ViewPreferenceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 