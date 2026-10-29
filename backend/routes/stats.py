from fastapi import APIRouter
from database import DatabaseAccess

router = APIRouter(prefix="/api/stats", tags=["Dashboard Statistics"])

@router.get("")
def get_dashboard_stats():
    rooms = DatabaseAccess.get_rooms()
    bookings = DatabaseAccess.get_bookings(status_filter="Active")
    invoices = DatabaseAccess.get_invoices()
    
    total_rooms = len(rooms)
    available_rooms = sum(1 for r in rooms if r.get("status") == "Available")
    occupied_rooms = sum(1 for r in rooms if r.get("status") == "Occupied")
    cleaning_rooms = sum(1 for r in rooms if r.get("status") == "Cleaning")
    maintenance_rooms = sum(1 for r in rooms if r.get("status") == "Maintenance")
    
    total_revenue = sum(float(inv.get("grand_total", 0.0)) for inv in invoices)
    
    return {
        "total_rooms": total_rooms,
        "available_rooms": available_rooms,
        "occupied_rooms": occupied_rooms,
        "cleaning_rooms": cleaning_rooms,
        "maintenance_rooms": maintenance_rooms,
        "active_bookings": len(bookings),
        "total_invoices": len(invoices),
        "total_revenue": round(total_revenue, 2)
    }
