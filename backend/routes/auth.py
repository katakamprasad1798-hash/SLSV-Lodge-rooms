from fastapi import APIRouter, HTTPException, status
from models import UserRegister, UserLogin, UserResponse, AuthResponse
import uuid
from datetime import datetime
from database import db_handler

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse)
def register_user(user: UserRegister):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    users = db_handler.get_all("users")
    for u in users:
        if u.get("email") == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": user.password,  # Storing plain text for demo, normally hashed
        "role": user.role,
        "phone": user.phone,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None
    }
    db_handler.create("users", user_id, new_user)
    
    return AuthResponse(
        user=UserResponse(**new_user),
        token=f"mock-jwt-token-{user_id}",
        message="User registered successfully"
    )

@router.post("/login", response_model=AuthResponse)
def login_user(creds: UserLogin):
    users = db_handler.get_all("users")
    for u in users:
        if u.get("email") == creds.email and u.get("password") == creds.password:
            # Update last login
            u["last_login"] = datetime.utcnow().isoformat()
            db_handler.update("users", u["id"], {"last_login": u["last_login"]})
            
            return AuthResponse(
                user=UserResponse(**u),
                token=f"mock-jwt-token-{u['id']}",
                message="Login successful"
            )
            
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password"
    )
