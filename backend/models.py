from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime, timezone
from database import Base

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, index=True) # Tenant ID
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    role = Column(String, default="sales_rep") # 'admin' or 'sales_rep'
    is_active = Column(Boolean, default=True)

class CalendarConnection(Base):
    __tablename__ = "calendar_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    provider = Column(String) # Will be 'google' or 'microsoft'
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    
    # Establish a bi-directional relationship with the User
    user = relationship("User", backref="calendar_connection")


class Pipeline(Base):
    __tablename__ = "pipelines"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, index=True)
    name = Column(String)

class DealStage(Base):
    __tablename__ = "deal_stages"
    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"))
    name = Column(String)
    stage_order = Column(Integer)
    deals = relationship("Deal", backref="stage", order_by="Deal.id")

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, index=True)
    first_name = Column(String)
    email = Column(String, index=True)
    phone = Column(String, index=True)
    status = Column(String, default="new")
    lead_score = Column(Integer, default=0)
    custom_fields = Column(JSON, default=dict) # Handles vertical-specific data
    utm_source = Column(String)
    utm_campaign = Column(String)
    is_subscribed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_active = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    owner_id = Column(Integer, nullable=True, index=True) # Null = unassigned

    @hybrid_property
    def lead_label(self):
        if self.lead_score >= 60:
            return "Hot Lead"
        elif self.lead_score >= 20:
            return "Warm Lead"
        else:
            return "Cold Lead"

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    activity_type = Column(String) # e.g., 'email', 'whatsapp', 'stage_change'
    notes = Column(String, nullable=True)
    data = Column(JSON, default=dict) # Flexible metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Deal(Base):
    __tablename__ = "deals"
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    owner_id = Column(Integer)
    # HOTFIX: Added ForeignKey("deal_stages.id")
    stage_id = Column(Integer, ForeignKey("deal_stages.id"), default=1)

class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationship to steps
    steps = relationship("WorkflowStep", back_populates="workflow", order_by="WorkflowStep.step_order", cascade="all, delete-orphan")

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    step_order = Column(Integer)  
    
    action_type = Column(String)  
    template_name = Column(String, nullable=True)
    message_template = Column(String, nullable=True)
    subject_template = Column(String, nullable=True)
    delay_seconds = Column(Integer, default=0)
    
    workflow = relationship("Workflow", back_populates="steps")

class ConversationSnapshot(Base):
    __tablename__ = "conversation_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    state_data = Column(JSON) 
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
