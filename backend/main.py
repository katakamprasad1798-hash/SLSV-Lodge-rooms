import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from routes import rooms, bookings, invoices, settings, stats, auth
from config import is_firebase_active, logger

app = FastAPI(
    title="Lodge Booking & Bill Generation System API",
    description="Python Backend API for Lodge Management, Room Reservation, and Automated GST Invoice Generation",
    version="1.0.0"
)

# CORS middleware setup (Restricted to Local React Frontend & Mobile App)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "https://localhost",
    "capacitor://localhost",
    "ionic://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Middleware for Security Headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Global Exception Handler
@app.exception_handler(Exception)
def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled Exception at %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact system administrator."}
    )

# Include API Routers
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(invoices.router)
app.include_router(settings.router)
app.include_router(stats.router)
app.include_router(auth.router)

@app.get("/api")
def api_root():
    return {
        "status": "Online",
        "app": "Lodge Booking & Bill Generation API",
        "database": "Google Firebase Firestore" if is_firebase_active else "Local Persistent JSON DB (Fallback Mode)",
        "docs": "/docs"
    }

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "status": "Online",
            "app": "Lodge Booking & Bill Generation API",
            "database": "Google Firebase Firestore" if is_firebase_active else "Local Persistent JSON DB (Fallback Mode)",
            "docs": "/docs"
        }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
