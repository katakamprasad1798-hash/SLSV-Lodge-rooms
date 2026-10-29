import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Invoice, InvoiceCreate, InvoiceUpdate, ServiceItem
from database import DatabaseAccess

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

@router.get("", response_model=List[Invoice])
def list_invoices(
    search: Optional[str] = Query(None, description="Search by Guest name, phone, or invoice number"),
    payment_method: Optional[str] = Query(None)
):
    invoices = DatabaseAccess.get_invoices()
    if search:
        s = search.lower().strip()
        invoices = [
            inv for inv in invoices
            if s in inv.get("invoice_number", "").lower()
            or s in inv.get("guest", {}).get("name", "").lower()
            or s in inv.get("guest", {}).get("phone", "").lower()
            or s in inv.get("room_number", "").lower()
        ]
    if payment_method and payment_method.lower() != "all":
        invoices = [inv for inv in invoices if inv.get("payment_method", "").lower() == payment_method.lower()]
    # Sort latest first
    invoices.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return invoices

@router.post("", response_model=Invoice, status_code=201)
def create_invoice(payload: InvoiceCreate):
    settings = DatabaseAccess.get_settings()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Generate unique invoice number if not provided
    inv_num = payload.invoice_number
    if not inv_num or not inv_num.strip():
        safe_room = str(payload.room_number).replace(" ", "")
        inv_num = f"INV-{datetime.now().strftime('%Y%m%d')}-{safe_room}-{str(uuid.uuid4())[:4].upper()}"
        
    stay_days = max(1, payload.stay_days if payload.stay_days is not None else 1)
    rate_per_day = max(0.0, float(payload.rate_per_day))
    base_room_charges = round(rate_per_day * stay_days, 2)
    extra_bed_charges = round(max(0.0, float(payload.extra_bed_charges or 0.0)), 2)
    
    # Process services summary
    services_summary = []
    if payload.services_summary:
        for s in payload.services_summary:
            s_dict = s.model_dump() if hasattr(s, "model_dump") else dict(s)
            if not s_dict.get("id"):
                s_dict["id"] = "srv_" + str(uuid.uuid4())[:8]
            if not s_dict.get("created_at"):
                s_dict["created_at"] = now_str
            services_summary.append(s_dict)
            
    calc_srv = sum(float(s.get("amount", 0.0)) for s in services_summary)
    service_charges = round(max(0.0, float(payload.service_charges or 0.0)), 2)
    if service_charges == 0 and calc_srv > 0:
        service_charges = round(calc_srv, 2)
        
    cgst_rate = float(settings.get("cgst_rate", 6.0))
    sgst_rate = float(settings.get("sgst_rate", 6.0))
    total_tax_rate = cgst_rate + sgst_rate

    # GST Inclusive Pricing:
    # subtotal represents the Gross Amount (inclusive of GST).
    gross_subtotal = round(base_room_charges + extra_bed_charges + service_charges, 2)
    discount = round(max(0.0, float(payload.discount_amount or 0.0)), 2)

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
    advance_paid = round(max(0.0, float(payload.advance_paid or 0.0)), 2)
    net_payable = max(0.0, round(grand_total - advance_paid, 2))
    
    inv_id = "inv_" + str(uuid.uuid4())[:8]
    invoice_dict = {
        "id": inv_id,
        "invoice_number": inv_num,
        "booking_id": payload.booking_id or "manual",
        "guest": payload.guest.model_dump() if hasattr(payload.guest, "model_dump") else dict(payload.guest),
        "room_number": payload.room_number,
        "room_category": payload.room_category or "Standard",
        "check_in": payload.check_in,
        "check_out": payload.check_out,
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
        "payment_status": payload.payment_status or "Paid",
        "payment_method": payload.payment_method or "Cash",
        "services_summary": services_summary,
        "created_at": now_str
    }
    
    saved = DatabaseAccess.save_invoice(invoice_dict)
    return saved

@router.get("/{invoice_id}", response_model=Invoice)
def get_invoice(invoice_id: str):
    invoice = DatabaseAccess.get_invoice_by_id(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.put("/{invoice_id}", response_model=Invoice)
def update_invoice(invoice_id: str, payload: InvoiceUpdate):
    invoice = DatabaseAccess.get_invoice_by_id(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    settings = DatabaseAccess.get_settings()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    if payload.guest is not None:
        guest_data = payload.guest.model_dump() if hasattr(payload.guest, "model_dump") else dict(payload.guest)
        invoice["guest"] = guest_data
        
    if payload.room_number is not None:
        invoice["room_number"] = payload.room_number
    if payload.room_category is not None:
        invoice["room_category"] = payload.room_category
    if payload.check_in is not None:
        invoice["check_in"] = payload.check_in
    if payload.check_out is not None:
        invoice["check_out"] = payload.check_out
    if payload.stay_days is not None:
        invoice["stay_days"] = max(1, payload.stay_days)
    if payload.rate_per_day is not None:
        invoice["rate_per_day"] = max(0.0, float(payload.rate_per_day))
    if payload.extra_bed_charges is not None:
        invoice["extra_bed_charges"] = max(0.0, float(payload.extra_bed_charges))
    if payload.discount_amount is not None:
        invoice["discount_amount"] = max(0.0, float(payload.discount_amount))
    if payload.advance_paid is not None:
        invoice["advance_paid"] = max(0.0, float(payload.advance_paid))
    if payload.payment_method is not None:
        invoice["payment_method"] = payload.payment_method
    if payload.payment_status is not None:
        invoice["payment_status"] = payload.payment_status
        
    if payload.services_summary is not None:
        services_list = []
        for s in payload.services_summary:
            s_dict = s.model_dump() if hasattr(s, "model_dump") else dict(s)
            if not s_dict.get("id"):
                s_dict["id"] = "srv_" + str(uuid.uuid4())[:8]
            if not s_dict.get("created_at"):
                s_dict["created_at"] = now_str
            services_list.append(s_dict)
        invoice["services_summary"] = services_list
        invoice["service_charges"] = round(sum(float(s.get("amount", 0.0)) for s in services_list), 2)
    elif payload.service_charges is not None:
        invoice["service_charges"] = max(0.0, float(payload.service_charges))
        
    # Recalculate financial breakdown
    stay_days = invoice.get("stay_days", 1)
    rate_per_day = float(invoice.get("rate_per_day", 0.0))
    base_room_charges = round(rate_per_day * stay_days, 2)
    invoice["base_room_charges"] = base_room_charges
    
    extra_bed = float(invoice.get("extra_bed_charges", 0.0))
    srv_charges = float(invoice.get("service_charges", 0.0))
    subtotal = round(base_room_charges + extra_bed + srv_charges, 2)
    invoice["subtotal"] = subtotal
    
    discount = float(invoice.get("discount_amount", 0.0))
    taxable_amount = subtotal
    invoice["taxable_amount"] = taxable_amount
    
    cgst_rate = float(invoice.get("cgst_rate", settings.get("cgst_rate", 6.0)))
    sgst_rate = float(invoice.get("sgst_rate", settings.get("sgst_rate", 6.0)))
    total_tax_rate = cgst_rate + sgst_rate

    gross_subtotal = round(base_room_charges + extra_bed + srv_charges, 2)
    invoice["subtotal"] = gross_subtotal
    discount = float(invoice.get("discount_amount", 0.0))

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

    invoice["taxable_amount"] = taxable_amount
    invoice["cgst_rate"] = cgst_rate
    invoice["sgst_rate"] = sgst_rate
    invoice["cgst_amount"] = cgst_amount
    invoice["sgst_amount"] = sgst_amount
    invoice["total_tax"] = total_tax
    
    grand_total = max(0.0, round(gross_subtotal - discount, 2))
    advance = float(invoice.get("advance_paid", 0.0))
    invoice["grand_total"] = grand_total
    invoice["net_payable"] = max(0.0, round(grand_total - advance, 2))
    
    saved = DatabaseAccess.save_invoice(invoice)
    return saved

@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: str):
    success = DatabaseAccess.delete_invoice(invoice_id)
    if not success:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice deleted successfully", "id": invoice_id}

