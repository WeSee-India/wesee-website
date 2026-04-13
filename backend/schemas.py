from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any, List

class WebLead(BaseModel):
    client_id: int
    first_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None # Used for QR code hidden tags
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    custom_fields: Optional[Dict[str, Any]] = {}
    @field_validator('email', mode='before')
    def clean_email(cls, v):
        if v and isinstance(v, str):
            return v.lower().strip()
        return v
        
    @field_validator('first_name', mode='before')
    def clean_name(cls, v):
        if v and isinstance(v, str):
            return v.strip().title()
        return v

class MetaWebhook(BaseModel):
    client_id: int
    first_name: str
    phone: str
    email: str
    ad_id: str
    campaign_name: Optional[str] = None

class GoogleColumnData(BaseModel):
    column_name: str
    string_value: str

class GoogleWebhook(BaseModel):
    lead_id: str
    campaign_id: str
    user_column_data: List[GoogleColumnData]

class WhatsAppWebhook(BaseModel):
    phone: str
    message_body: str
    client_id: int

#DYNAMIC SEGMENTATION
class FilterRule(BaseModel):
    field: str
    op: str  # Supported: "==", ">=", "<=", "in", "ilike"
    value: Any

class LeadFilterRequest(BaseModel):
    filters: List[FilterRule]

class BulkEmailRequest(BaseModel):
    filters: List[FilterRule]
    subject_template: str
    content_template: str

# IAM REFACTOR SCHEMAS
class CompanySignup(BaseModel):
    company_name: str
    admin_email: str
    password: str

    @field_validator('admin_email')
    @classmethod
    def lower_email(cls, v):
        return v.lower().strip()

class UserCreate(BaseModel):
    email: str
    password: str
    first_name: str
    role: str = "sales_rep" # 'admin' or 'sales_rep'

    @field_validator('email')
    @classmethod
    def lower_email(cls, v):
        return v.lower().strip()

class ForgotPassword(BaseModel):
    email: str

    @field_validator('email')
    @classmethod
    def lower_email(cls, v):
        return v.lower().strip()

class ResetPassword(BaseModel):
    token: str
    new_password: str
