from .database import Base, engine
from .user import User
from .firewall_rule import FirewallRule

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine) 