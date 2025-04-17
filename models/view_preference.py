from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class ViewPreference(Base):
    __tablename__ = "view_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)  # Name of the view
    layout = Column(JSON)  # Store layout configuration
    widgets = Column(JSON)  # Store widget configuration
    is_default = Column(Boolean, default=False)

    # Relationship with user
    user = relationship("User", back_populates="view_preferences") 