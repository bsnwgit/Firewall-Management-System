from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from models.database import get_db
from models.user import User
from models.view_preference import ViewPreference
from schemas.view_preference import ViewPreferenceCreate, ViewPreferenceUpdate, ViewPreference
from auth.auth import get_current_user

router = APIRouter(
    prefix="/view-preferences",
    tags=["view-preferences"]
)

@router.post("/", response_model=ViewPreference)
def create_view_preference(
    preference: ViewPreferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # If this is set as default, unset any other default preferences for this user
    if preference.is_default:
        db.query(ViewPreference).filter(
            ViewPreference.user_id == current_user.id,
            ViewPreference.is_default == True
        ).update({"is_default": False})
    
    db_preference = ViewPreference(
        **preference.model_dump(),
        user_id=current_user.id,
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )
    db.add(db_preference)
    db.commit()
    db.refresh(db_preference)
    return db_preference

@router.get("/", response_model=List[ViewPreference])
def get_view_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preferences = db.query(ViewPreference).filter(
        ViewPreference.user_id == current_user.id
    ).all()
    return preferences

@router.get("/{preference_id}", response_model=ViewPreference)
def get_view_preference(
    preference_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preference = db.query(ViewPreference).filter(
        ViewPreference.id == preference_id,
        ViewPreference.user_id == current_user.id
    ).first()
    if preference is None:
        raise HTTPException(status_code=404, detail="View preference not found")
    return preference

@router.put("/{preference_id}", response_model=ViewPreference)
def update_view_preference(
    preference_id: int,
    preference_update: ViewPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_preference = db.query(ViewPreference).filter(
        ViewPreference.id == preference_id,
        ViewPreference.user_id == current_user.id
    ).first()
    if db_preference is None:
        raise HTTPException(status_code=404, detail="View preference not found")
    
    # If this is being set as default, unset any other default preferences
    if preference_update.is_default:
        db.query(ViewPreference).filter(
            ViewPreference.user_id == current_user.id,
            ViewPreference.is_default == True,
            ViewPreference.id != preference_id
        ).update({"is_default": False})
    
    update_data = preference_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_preference, field, value)
    
    db_preference.updated_at = datetime.utcnow().isoformat()
    db.commit()
    db.refresh(db_preference)
    return db_preference

@router.delete("/{preference_id}")
def delete_view_preference(
    preference_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_preference = db.query(ViewPreference).filter(
        ViewPreference.id == preference_id,
        ViewPreference.user_id == current_user.id
    ).first()
    if db_preference is None:
        raise HTTPException(status_code=404, detail="View preference not found")
    
    db.delete(db_preference)
    db.commit()
    return {"message": "View preference deleted successfully"} 