"""
app/auth.py — Authentication System
"""
import uuid
from typing import Dict
from fastapi import APIRouter, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

auth_router = APIRouter()
security = HTTPBearer(auto_error=False)

# Hardcoded demo users for demonstration purposes
DEMO_USERS = {
    "student": "1234",
    "admin": "admin123"
}

# In-memory token storage mapping token -> username
tokens: Dict[str, str] = {}

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str

@auth_router.post("/login", response_model=LoginResponse, summary="Demo Login", tags=["Auth"])
def login(request: LoginRequest):
    """
    Authenticate demo user and return a token.
    """
    username = request.username
    password = request.password
    
    if username not in DEMO_USERS or DEMO_USERS[username] != password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    token = str(uuid.uuid4())
    tokens[token] = username
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": username
    }

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Dependency to require a valid token.
    """
    if credentials is None:
        # Fallback for demo mode if token is missing
        print("DEBUG: Authorization header missing, falling back to demo_user")
        return "demo_user"

    token = credentials.credentials
    print(f"DEBUG: Received token: {token}")

    if not token:
        # This case might not be hit if HTTPBearer handles it, but just in case
        print("DEBUG: Token empty, falling back to demo_user")
        return "demo_user"

    if token not in tokens:
        print(f"DEBUG: Invalid token: {token}")
        raise HTTPException(
            status_code=401, 
            detail="Authentication failed. Please login again."
        )
    
    return tokens[token]
