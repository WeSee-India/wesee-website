import os
import sys
import pytest
from unittest.mock import patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Add root directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, get_db
from main import app
from auth import get_password_hash, create_access_token
from models import Client, User, Contact

# --- DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_engine():
    # Create tables once per module
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    # Establish a fresh session for every single test
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

# --- GLOBAL MOCKS ---
@pytest.fixture(autouse=True)
def mock_email_outbound():
    with patch("communications.send_email_outbound") as mock1, \
         patch("routers.auth.send_email_outbound") as mock2:
        mock1.return_value = True
        mock2.return_value = True
        yield (mock1, mock2)

# --- APP FIXTURES ---
@pytest.fixture(scope="function")
def client(db_session):
    # Override get_db tool to use our test session
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

# --- DATA GENERATION FIXTURES ---
@pytest.fixture
def test_data(db_session):
    # Setup Tenant A
    client_a = Client(name="Tenant A")
    db_session.add(client_a)
    db_session.commit()
    db_session.refresh(client_a)
    
    admin_a = User(
        client_id=client_a.id,
        email="admin@tenant-a.com",
        hashed_password=get_password_hash("password123"),
        first_name="Admin",
        role="admin"
    )
    rep_a = User(
        client_id=client_a.id,
        email="rep@tenant-a.com",
        hashed_password=get_password_hash("password123"),
        first_name="Rep",
        role="sales_rep"
    )
    db_session.add_all([admin_a, rep_a])
    db_session.commit()
    db_session.refresh(admin_a)
    db_session.refresh(rep_a)
    
    return {
        "client_a": client_a,
        "admin_a": admin_a,
        "rep_a": rep_a
    }

@pytest.fixture
def admin_token(test_data):
    user = test_data["admin_a"]
    return create_access_token(data={
        "sub": str(user.id),
        "client_id": user.client_id,
        "role": user.role
    })

@pytest.fixture
def rep_token(test_data):
    user = test_data["rep_a"]
    return create_access_token(data={
        "sub": str(user.id),
        "client_id": user.client_id,
        "role": user.role
    })
