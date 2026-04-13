from database import SessionLocal
from models import User, Client
from auth import get_password_hash
from datetime import datetime, timezone

def seed_admin():
    db = SessionLocal()
    try:
        # 1. Create a Test Tenant (Client)
        client = db.query(Client).filter(Client.name == "WeSee Internal").first()
        if not client:
            client = Client(
                name="WeSee Internal",
                created_at=datetime.now(timezone.utc)
            )
            db.add(client)
            db.commit()
            db.refresh(client)

        # 2. Create the Admin User
        admin_email = "admin@weseegpt.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if not admin:
            # We must hash the password, otherwise the login endpoint will reject it
            hashed_pw = get_password_hash("admin123") 
            admin = User(
                client_id=client.id,
                email=admin_email,
                hashed_password=hashed_pw,
                first_name="Boss",
                role="admin", # Admin role sees all leads
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"✅ Success! Created Admin -> Email: {admin_email} | Password: admin123")
        else:
            print("⚠️ Admin user already exists.")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
