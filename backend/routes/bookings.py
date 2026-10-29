import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models import Booking, BookingCreate, ServiceItem, CheckOutRequest, Invoice
from database import DatabaseAccess

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

def calculate_stay_days(check_in_str: str, check_out_str: str) -> int:
    try:
        # Try parsing ISO or YYYY-MM-DD
        dt_in = datetime.fromisoformat(check_in_str.replace("Z", "+00:00")) if "T" in check_in_str else datetime.strptime(check_in_str, "%Y-%m-%d")
        dt_out = datetime.fromisoformat(check_out_str.replace("Z", "+00:00")) if "T" in check_out_str else datetime.strptime(check_out_str, "%Y-%m-%d")
        
        delta = dt_out - dt_in
        days = delta.days
        if delta.seconds > 3600 * 2:  # If stayed more than 2 extra hours, count extra day
            days += 1
        return max(1, days)
    except Exception:
        return 1

@router.get("", response_model=List[Booking])
def list_bookings(status: Optional[str] = Query(None, description="Filter by status: Active, CheckedOut")):
    return DatabaseAccess.get_bookings(status_filter=status)

@router.get("/{booking_id}", response_model=Booking)
def get_booking(booking_id: str):
    booking = DatabaseAccess.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.post("", response_model=Booking, status_code=201)
def create_booking(b_in: BookingCreate):
    room = DatabaseAccess.get_room_by_id(b_in.room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Selected room not found")
    
    if room.get("status") == "Occupied":
        raise HTTPException(status_code=400, detail=f"Room {room['room_number']} is currently Occupied!")
    
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    booking_no = f"BK-{datetime.now().strftime('%Y%m%d')}-{room['room_number']}"
    
    booking_dict = {
        "id": "bk_" + str(uuid.uuid4())[:8],
        "booking_number": booking_no,
        "guest": b_in.guest.model_dump(),
        "room_id": room["id"],
        "room_number": room["room_number"],
        "room_category": room.get("category", "Standard"),
        "rate_per_day": room.get("rate_per_day", 0.0),
        "extra_bed_rate": room.get("extra_bed_rate", 250.0),
        "check_in": b_in.check_in or now_str,
        "check_out": None,
        "expected_checkout": b_in.expected_checkout,
        "status": "Active",
        "extra_bed_count": b_in.extra_bed_count,
        "advance_paid": b_in.advance_paid,
        "services": [],
        "notes": b_in.notes or "",
        "created_at": now_str
    }
    
    saved_booking = DatabaseAccess.save_booking(booking_dict)
    # Set room status to Occupied
    DatabaseAccess.update_room_status(room["id"], "Occupied")
    return saved_booking

@router.post("/{booking_id}/services", response_model=Booking)
def add_service_charge(booking_id: str, title: str = Query(...), amount: float = Query(...), category: str = Query("Food/Service")):
    booking = DatabaseAccess.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.get("status") != "Active":
        raise HTTPException(status_code=400, detail="Cannot add service charges to a completed/checkout stay.")
    
    new_service = {
        "id": "srv_" + str(uuid.uuid4())[:8],
        "title": title,
        "amount": amount,
        "category": category,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    
    booking.setdefault("services", []).append(new_service)
    saved = DatabaseAccess.save_booking(booking)
    return saved

@router.post("/{booking_id}/checkout", response_model=Invoice)
def process_checkout(booking_id: str, req: CheckOutRequest):
    booking = DatabaseAccess.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.get("status") == "CheckedOut":
        raise HTTPException(status_code=400, detail="This booking has already been checked out.")
    
    settings = DatabaseAccess.get_settings()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    check_in_time = booking["check_in"]
    check_out_time = now_str
    
    stay_days = calculate_stay_days(check_in_time, check_out_time)
    
    rate_per_day = float(booking.get("rate_per_day", 0.0))
    base_room_charges = round(rate_per_day * stay_days, 2)
    
    extra_bed_count = int(booking.get("extra_bed_count", 0))
    extra_bed_rate = float(booking.get("extra_bed_rate", 250.0))
    extra_bed_charges = round(extra_bed_count * extra_bed_rate * stay_days, 2)
    
    service_charges = round(sum(float(s.get("amount", 0.0)) for s in booking.get("services", [])), 2)
    
    gross_subtotal = round(base_room_charges + extra_bed_charges + service_charges, 2)
    discount = round(req.discount_amount, 2)

    cgst_rate = float(settings.get("cgst_rate", 6.0))
    sgst_rate = float(settings.get("sgst_rate", 6.0))
    total_tax_rate = cgst_rate + sgst_rate

    if total_tax_rate > 0:
        taxable_amount = round(gross_subtotal / (1.0 + (total_tax_rate / 100.0)), 2)
        total_tax = round(gross_subtotal - taxable_amount, 2)
        cgst_amount = round(total_tax * (cgst_rate / total_tax_rate), 2)
        sgst_amount = round(total_tax - cgst_amount, 2)
    else:
        taxable_amount = gross_subtotal
        cgst_amount = 0.0
        sgst_amount = 0.0
        total_tax = 0.0

    subtotal = gross_subtotal
    grand_total = max(0.0, round(gross_subtotal - discount, 2))
    advance_paid = round(float(booking.get("advance_paid", 0.0)), 2)
    net_payable = max(0.0, round(grand_total - advance_paid, 2))
    
    invoice_no = f"INV-{datetime.now().strftime('%Y%m%d')}-{booking['room_number']}"
    
    guest_info = dict(booking["guest"])
    if getattr(req, "guest_gstin", None):
        guest_info["gstin"] = req.guest_gstin
    if getattr(req, "business_name", None):
        guest_info["business_name"] = req.business_name

    invoice_dict = {
        "id": "inv_" + str(uuid.uuid4())[:8],
        "invoice_number": invoice_no,
        "booking_id": booking_id,
        "guest": guest_info,
        "room_number": booking["room_number"],
        "room_category": booking["room_category"],
        "check_in": check_in_time,
        "check_out": check_out_time,
        "stay_days": stay_days,
        "rate_per_day": rate_per_day,
        "base_room_charges": base_room_charges,
        "extra_bed_charges": extra_bed_charges,
        "service_charges": service_charges,
        "subtotal": subtotal,
        "discount_amount": discount,
        "taxable_amount": taxable_amount,
        "cgst_rate": cgst_rate,
        "sgst_rate": sgst_rate,
        "cgst_amount": cgst_amount,
        "sgst_amount": sgst_amount,
        "total_tax": total_tax,
        "grand_total": grand_total,
        "advance_paid": advance_paid,
        "net_payable": net_payable,
        "payment_status": "Paid",
        "payment_method": req.payment_method,
        "services_summary": booking.get("services", []),
        "created_at": now_str
    }
    
    saved_invoice = DatabaseAccess.save_invoice(invoice_dict)
    
    # Update booking status
    booking["status"] = "CheckedOut"
    booking["check_out"] = check_out_time
    DatabaseAccess.save_booking(booking)
    
    # Update room status to Cleaning
    DatabaseAccess.update_room_status(booking["room_id"], "Cleaning")
    
    return saved_invoice
