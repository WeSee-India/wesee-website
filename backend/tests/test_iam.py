import pytest
from fastapi import status
from models import Client, User
from auth import verify_password

def test_company_signup_success(client, db_session):
    """Test Action 1: Company Signup with Transactional Integrity"""
    payload = {
        "company_name": "New Corp",
        "admin_email": "boss@newcorp.com",
        "password": "secretpassword"
    }
    response = client.post("/api/auth/signup", json=payload)
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "client_id" in data
    
    # Verify both records exist in DB
    client_rec = db_session.query(Client).filter(Client.name == "New Corp").first()
    assert client_rec is not None
    
    user_rec = db_session.query(User).filter(User.email == "boss@newcorp.com").first()
    assert user_rec is not None
    assert user_rec.client_id == client_rec.id
    assert user_rec.role == "admin"
    assert verify_password("secretpassword", user_rec.hashed_password)

def test_company_signup_duplicate_email(client, test_data):
    """Ensure we don't allow duplicate emails during signup"""
    payload = {
        "company_name": "Other Corp",
        "admin_email": "admin@tenant-a.com", # Exists in test_data
        "password": "password123"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_admin_creates_user_securely(client, admin_token, test_data, db_session):
    """Test Action 2: Internal User Management with Client ID Injection"""
    payload = {
        "email": "new-rep@tenant-a.com",
        "password": "password123",
        "first_name": "New",
        "role": "sales_rep"
    }
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/api/admin/users", json=payload, headers=headers)
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["client_id"] == test_data["admin_a"].client_id
    
    # Verify user was created in the correct tenant
    user = db_session.query(User).filter(User.email == "new-rep@tenant-a.com").first()
    assert user is not None
    assert user.client_id == test_data["admin_a"].client_id

def test_rbac_sales_rep_cannot_create_users(client, rep_token):
    """Test Action 4: Role Hierarchy Hardening (require_admin)"""
    payload = {
        "email": "hacker@tenant-a.com",
        "password": "password123",
        "first_name": "Hacker",
        "role": "sales_rep"
    }
    headers = {"Authorization": f"Bearer {rep_token}"}
    response = client.post("/api/admin/users", json=payload, headers=headers)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_password_reset_flow(client, test_data, db_session):
    """Test Action 3: Password Reset Logic"""
    # 1. Request Reset
    forgot_payload = {"email": "admin@tenant-a.com"}
    response = client.post("/api/auth/forgot-password", json=forgot_payload)
    assert response.status_code == 200
    
    # 2. Simulate Token Retrieval (In this test we know the secret and salt)
    import itsdangerous
    from config import settings
    serializer = itsdangerous.URLSafeTimedSerializer(settings.SECRET_KEY)
    token = serializer.dumps("admin@tenant-a.com", salt="password-reset-salt")
    
    # 3. Reset Password
    reset_payload = {
        "token": token,
        "new_password": "newsecurepassword"
    }
    response = client.post("/api/auth/reset-password", json=reset_payload)
    assert response.status_code == 200
    
    # 4. Verify Update
    db_session.refresh(test_data["admin_a"])
    assert verify_password("newsecurepassword", test_data["admin_a"].hashed_password)

def test_login_success(client, test_data):
    """Verify login still works after migration to auth router"""
    form_data = {
        "username": "admin@tenant-a.com",
        "password": "password123"
    }
    response = client.post("/api/auth/login", data=form_data)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_current_user_details(client, admin_token, test_data):
    """Action 4: Verification of /auth/me route"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/api/auth/me", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_data["admin_a"].email
    assert data["role"] == "admin"
    assert data["client_id"] == test_data["admin_a"].client_id
    assert "id" in data
