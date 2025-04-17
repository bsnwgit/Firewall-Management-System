from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from models.database import get_db
from models.user import User
from models.firewall_rule import FirewallRule
from schemas.firewall_rule import FirewallRuleCreate, FirewallRuleUpdate, FirewallRule
from auth.auth import get_current_user

router = APIRouter(
    prefix="/firewall-rules",
    tags=["firewall-rules"]
)

@router.post("/", response_model=FirewallRule)
def create_firewall_rule(
    rule: FirewallRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_rule = FirewallRule(
        **rule.model_dump(),
        created_by=current_user.id,
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat()
    )
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule

@router.get("/", response_model=List[FirewallRule])
def get_firewall_rules(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rules = db.query(FirewallRule).offset(skip).limit(limit).all()
    return rules

@router.get("/{rule_id}", response_model=FirewallRule)
def get_firewall_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = db.query(FirewallRule).filter(FirewallRule.id == rule_id).first()
    if rule is None:
        raise HTTPException(status_code=404, detail="Firewall rule not found")
    return rule

@router.put("/{rule_id}", response_model=FirewallRule)
def update_firewall_rule(
    rule_id: int,
    rule_update: FirewallRuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_rule = db.query(FirewallRule).filter(FirewallRule.id == rule_id).first()
    if db_rule is None:
        raise HTTPException(status_code=404, detail="Firewall rule not found")
    
    # Only allow the creator or admin to update the rule
    if db_rule.created_by != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    update_data = rule_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_rule, field, value)
    
    db_rule.updated_at = datetime.utcnow().isoformat()
    db.commit()
    db.refresh(db_rule)
    return db_rule

@router.delete("/{rule_id}")
def delete_firewall_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_rule = db.query(FirewallRule).filter(FirewallRule.id == rule_id).first()
    if db_rule is None:
        raise HTTPException(status_code=404, detail="Firewall rule not found")
    
    # Only allow the creator or admin to delete the rule
    if db_rule.created_by != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(db_rule)
    db.commit()
    return {"message": "Firewall rule deleted successfully"} 