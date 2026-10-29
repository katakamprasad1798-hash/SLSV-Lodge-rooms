from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

class RoomBase(BaseModel):
    room_number: str = Field(..., description="Unique room number e.g. 101, 202")
    floor: int = Field(default=1, ge=0)
    category: str = Field(default="Standard", description="Standard, Deluxe, Executive, Suite")
    ac_type: str = Field(default="AC", description="AC or Non-AC")
    bed_count: int = Field(default=1, ge=1)
    rate_per_day: float = Field(..., ge=0, description="Daily tariff rate in INR")
    extra_bed_rate: float = Field(default=250.0, ge=0, description="Rate for extra bed per night")
    status: str = Field(default="Available", description="Available, Occupied, Cleaning, Maintenance")
    amenities: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    current_status_since: Optional[str] = None
    status_history: List[dict] = Field(default_factory=list)

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: str

class GuestInfo(BaseModel):
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=8)
    email: Optional[str] = ""
    id_type: str = Field(default="Aadhaar", description="Aadhaar, Driving License, Passport, Voter ID")
    id_number: str = Field(default="")
    address: Optional[str] = ""
    gstin: Optional[str] = ""
    business_name: Optional[str] = ""

class ServiceItem(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., min_length=1)
    amount: float = Field(..., ge=0)
    category: str = Field(default="Food/Service", description="Food, Laundry, Extra Bed, Transport, Miscellaneous")
    created_at: Optional[str] = None

class BookingCreate(BaseModel):
    guest: GuestInfo
    room_id: str
    check_in: str  # ISO string or YYYY-MM-DD HH:MM
    expected_checkout: str
    extra_bed_count: int = Field(default=0, ge=0)
    advance_paid: float = Field(default=0.0, ge=0)
    notes: Optional[str] = ""

class Booking(BaseModel):
    id: str
    booking_number: str
    guest: GuestInfo
    room_id: str
    room_number: str
    room_category: str
    rate_per_day: float
    check_in: str
    check_out: Optional[str] = None
    expected_checkout: str
    status: str = Field(default="Active", description="Active, CheckedOut, Cancelled")
    extra_bed_count: int = 0
    extra_bed_rate: float = 0.0
    advance_paid: float = 0.0
    services: List[ServiceItem] = []
    notes: Optional[str] = ""
    created_at: str

class CheckOutRequest(BaseModel):
    booking_id: Optional[str] = None
    payment_method: str = Field(default="Cash", description="Cash, UPI, Card, Net Banking")
    discount_amount: float = Field(default=0.0, ge=0)
    notes: Optional[str] = ""
    guest_gstin: Optional[str] = ""
    business_name: Optional[str] = ""

class Invoice(BaseModel):
    id: str
    invoice_number: str
    booking_id: str
    guest: GuestInfo
    room_number: str
    room_category: str
    check_in: str
    check_out: str
    stay_days: int
    rate_per_day: float
    base_room_charges: float
    extra_bed_charges: float
    service_charges: float
    subtotal: float
    discount_amount: float
    taxable_amount: float
    cgst_rate: float
    sgst_rate: float
    cgst_amount: float
    sgst_amount: float
    total_tax: float
    grand_total: float
    advance_paid: float
    net_payable: float
    payment_status: str = Field(default="Paid", description="Paid, Pending, Partial")
    payment_method: str = Field(default="Cash")
    services_summary: List[ServiceItem] = []
    created_at: str

class InvoiceCreate(BaseModel):
    invoice_number: Optional[str] = None
    booking_id: Optional[str] = "manual"
    guest: GuestInfo
    room_number: str
    room_category: Optional[str] = "Standard"
    check_in: str
    check_out: str
    stay_days: Optional[int] = 1
    rate_per_day: float = Field(..., ge=0)
    extra_bed_charges: Optional[float] = 0.0
    service_charges: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0
    advance_paid: Optional[float] = 0.0
    payment_method: Optional[str] = "Cash"
    payment_status: Optional[str] = "Paid"
    services_summary: Optional[List[ServiceItem]] = []

class InvoiceUpdate(BaseModel):
    guest: Optional[GuestInfo] = None
    room_number: Optional[str] = None
    room_category: Optional[str] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    stay_days: Optional[int] = None
    rate_per_day: Optional[float] = None
    base_room_charges: Optional[float] = None
    extra_bed_charges: Optional[float] = None
    service_charges: Optional[float] = None
    discount_amount: Optional[float] = None
    advance_paid: Optional[float] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    services_summary: Optional[List[ServiceItem]] = None

class LodgeSettings(BaseModel):
    lodge_name: str = "Grand Horizon Lodge & Suites"
    tag_line: str = "Premium Comfort & Hospitality"
    address: str = "123 Heritage Main Road, Station Circle"
    city: str = "Bengaluru"
    state: str = "Karnataka"
    pincode: str = "560001"
    phone: str = "+91 98765 43210"
    email: str = "contact@grandhorizonlodge.com"
    gstin: str = "29ABCDE1234F1Z5"
    cgst_rate: float = 6.0
    sgst_rate: float = 6.0
    check_out_time: str = "12:00 PM"
    currency_symbol: str = "₹"
    terms_and_conditions: str = (
        "1. Check-out time is 12:00 PM.\n"
        "2. Please return room key at check-out counter.\n"
        "3. Management is not responsible for valuables left in rooms.\n"
        "4. All disputes are subject to local jurisdiction."
    )
    api_key: Optional[str] = ""

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: Optional[str] = None
    role: str = Field(default="Receptionist", description="Administrator, Receptionist, Manager")
    phone: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    phone: Optional[str] = ""
    created_at: str
    last_login: Optional[str] = None

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    token_type: str = "Bearer"
    message: Optional[str] = "Authentication successful"

