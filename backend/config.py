import os
import logging
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lodge_backend")

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("API_KEY", "")
CREDENTIALS_PATH = BASE_DIR / "firebase_credentials.json"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

firebase_db = None
is_firebase_active = False

def init_firebase():
    global firebase_db, is_firebase_active
    try:
        if CREDENTIALS_PATH.exists():
            cred = credentials.Certificate(str(CREDENTIALS_PATH))
            firebase_admin.initialize_app(cred)
            firebase_db = firestore.client()
            is_firebase_active = True
            logger.info("Firebase Admin SDK initialized successfully with service account credentials!")
        else:
            # Check environment variables
            env_cred = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            if env_cred and Path(env_cred).exists():
                cred = credentials.Certificate(env_cred)
                firebase_admin.initialize_app(cred)
                firebase_db = firestore.client()
                is_firebase_active = True
                logger.info("Firebase Admin SDK initialized successfully via GOOGLE_APPLICATION_CREDENTIALS!")
            else:
                logger.warning(
                    "No Firebase credentials found at %s. Operating in local JSON fallback database mode. "
                    "Provide firebase_credentials.json to switch to Google Cloud Firestore.",
                    CREDENTIALS_PATH
                )
    except Exception as e:
        logger.error("Failed to initialize Firebase: %s. Reverting to local JSON database mode.", e)
        is_firebase_active = False
        firebase_db = None

# Initialize on module import
init_firebase()
