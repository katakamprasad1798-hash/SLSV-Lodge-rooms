from fastapi import APIRouter
from models import LodgeSettings
from database import DatabaseAccess
from config import is_firebase_active

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("")
def get_settings():
    settings = DatabaseAccess.get_settings()
    settings["is_firebase_active"] = is_firebase_active
    return settings

@router.post("")
def update_settings(settings_in: LodgeSettings):
    dict_val = settings_in.model_dump()
    saved = DatabaseAccess.save_settings(dict_val)
    saved["is_firebase_active"] = is_firebase_active
    return saved
