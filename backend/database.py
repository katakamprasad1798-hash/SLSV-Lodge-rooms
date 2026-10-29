import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from config import firebase_db, is_firebase_active, DATA_DIR, logger
from models import Room, Booking, Invoice, LodgeSettings

# Local Storage File Paths
ROOMS_FILE = DATA_DIR / "rooms.json"
BOOKINGS_FILE = DATA_DIR / "bookings.json"
INVOICES_FILE = DATA_DIR / "invoices.json"
SETTINGS_FILE = DATA_DIR / "settings.json"
USERS_FILE = DATA_DIR / "users.json"

def _read_json(file_path: Path, default_content: Any) -> Any:
    if not file_path.exists():
        _write_json(file_path, default_content)
        return default_content
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("Error reading %s: %s", file_path, e)
        return default_content

def _write_json(file_path: Path, data: Any):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def seed_initial_data_if_empty():
    rooms = _read_json(ROOMS_FILE, None)
    if rooms is None or len(rooms) == 0:
        initial_rooms = [
            {
                "id": "room_101",
                "room_number": "101",
                "floor": 1,
                "category": "Standard",
                "ac_type": "Non-AC",
                "bed_count": 1,
                "rate_per_day": 1200.0,
                "extra_bed_rate": 200.0,
                "status": "Available",
                "amenities": ["Wi-Fi", "TV", "Geyser", "Daily Housekeeping"],
                "description": "Cozy single bed non-AC room with attached bathroom."
            },
            {
                "id": "room_102",
                "room_number": "102",
                "floor": 1,
                "category": "Standard",
                "ac_type": "AC",
                "bed_count": 2,
                "rate_per_day": 1800.0,
                "extra_bed_rate": 250.0,
                "status": "Occupied",
                "amenities": ["Wi-Fi", "Split AC", "LED TV", "Geyser"],
                "description": "Double bed AC room with garden view."
            },
            {
                "id": "room_201",
                "room_number": "201",
                "floor": 2,
                "category": "Deluxe",
                "ac_type": "AC",
                "bed_count": 2,
                "rate_per_day": 2800.0,
                "extra_bed_rate": 350.0,
                "status": "Available",
                "amenities": ["High Speed Wi-Fi", "Split AC", "Smart TV", "Mini Fridge", "Balcony"],
                "description": "Spacious Deluxe AC room with private balcony."
            },
            {
                "id": "room_202",
                "room_number": "202",
                "floor": 2,
                "category": "Executive",
                "ac_type": "AC",
                "bed_count": 2,
                "rate_per_day": 3500.0,
                "extra_bed_rate": 400.0,
                "status": "Cleaning",
                "amenities": ["Ultra HD Smart TV", "Split AC", "Coffee Maker", "Work Desk", "Balcony"],
                "description": "Executive AC room designed for corporate guests."
            },
            {
                "id": "room_301",
                "room_number": "301",
                "floor": 3,
                "category": "Suite",
                "ac_type": "AC",
                "bed_count": 3,
                "rate_per_day": 5000.0,
                "extra_bed_rate": 500.0,
                "status": "Available",
                "amenities": ["King Size Bed", "Living Lounge", "Jacuzzi", "Mini Fridge", "24/7 Room Service"],
                "description": "Luxury Royal Suite with panoramic city view."
            }
        ]
        _write_json(ROOMS_FILE, initial_rooms)

    settings = _read_json(SETTINGS_FILE, None)
    if settings is None:
        initial_settings = LodgeSettings().model_dump()
        _write_json(SETTINGS_FILE, initial_settings)

    bookings = _read_json(BOOKINGS_FILE, None)
    if bookings is None:
        _write_json(BOOKINGS_FILE, [])

    invoices = _read_json(INVOICES_FILE, None)
    if invoices is None:
        _write_json(INVOICES_FILE, [])

    users = _read_json(USERS_FILE, None)
    if users is None:
        _write_json(USERS_FILE, [
            {
                "id": "admin-1",
                "name": "Administrator",
                "email": "admin@lodge.com",
                "password": "adminpassword123",
                "role": "Administrator",
                "phone": "+919876543210",
                "created_at": datetime.utcnow().isoformat(),
                "last_login": None
            }
        ])

seed_initial_data_if_empty()

class DBHandler:
    @staticmethod
    def _get_file(collection: str) -> Path:
        return DATA_DIR / f"{collection}.json"

    def get_all(self, collection: str) -> List[Dict[str, Any]]:
        if is_firebase_active and firebase_db:
            docs = firebase_db.collection(collection).stream()
            return [doc.to_dict() for doc in docs]
        return _read_json(self._get_file(collection), [])

    def get(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        if is_firebase_active and firebase_db:
            doc = firebase_db.collection(collection).document(doc_id).get()
            return doc.to_dict() if doc.exists else None
        items = _read_json(self._get_file(collection), [])
        for item in items:
            if item.get("id") == doc_id:
                return item
        return None

    def create(self, collection: str, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data["id"] = doc_id
        if is_firebase_active and firebase_db:
            firebase_db.collection(collection).document(doc_id).set(data)
        else:
            items = _read_json(self._get_file(collection), [])
            updated = False
            for idx, it in enumerate(items):
                if it.get("id") == doc_id:
                    items[idx] = data
                    updated = True
                    break
            if not updated:
                items.append(data)
            _write_json(self._get_file(collection), items)
        return data

    def update(self, collection: str, doc_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if is_firebase_active and firebase_db:
            doc_ref = firebase_db.collection(collection).document(doc_id)
            doc_ref.update(updates)
            updated_doc = doc_ref.get()
            return updated_doc.to_dict() if updated_doc.exists else None
        else:
            items = _read_json(self._get_file(collection), [])
            for idx, it in enumerate(items):
                if it.get("id") == doc_id:
                    items[idx].update(updates)
                    _write_json(self._get_file(collection), items)
                    return items[idx]
        return None

    def delete(self, collection: str, doc_id: str) -> bool:
        if is_firebase_active and firebase_db:
            firebase_db.collection(collection).document(doc_id).delete()
            return True
        items = _read_json(self._get_file(collection), [])
        filtered = [it for it in items if it.get("id") != doc_id]
        if len(filtered) != len(items):
            _write_json(self._get_file(collection), filtered)
            return True
        return False

db_handler = DBHandler()


# --- Database Access Layer ---

class DatabaseAccess:
    @staticmethod
    def get_rooms() -> List[Dict[str, Any]]:
        if is_firebase_active and firebase_db:
            docs = firebase_db.collection("rooms").stream()
            return [doc.to_dict() for doc in docs]
        return _read_json(ROOMS_FILE, [])

    @staticmethod
    def get_room_by_id(room_id: str) -> Optional[Dict[str, Any]]:
        if is_firebase_active and firebase_db:
            doc = firebase_db.collection("rooms").document(room_id).get()
            return doc.to_dict() if doc.exists else None
        rooms = _read_json(ROOMS_FILE, [])
        for r in rooms:
            if r["id"] == room_id:
                return r
        return None

    @staticmethod
    def save_room(room_data: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in room_data or not room_data["id"]:
            room_data["id"] = "room_" + str(uuid.uuid4())[:8]
        if is_firebase_active and firebase_db:
            firebase_db.collection("rooms").document(room_data["id"]).set(room_data)
        else:
            rooms = _read_json(ROOMS_FILE, [])
            updated = False
            for idx, r in enumerate(rooms):
                if r["id"] == room_data["id"]:
                    rooms[idx] = room_data
                    updated = True
                    break
            if not updated:
                rooms.append(room_data)
            _write_json(ROOMS_FILE, rooms)
        return room_data

    @staticmethod
    def delete_room(room_id: str) -> bool:
        if is_firebase_active and firebase_db:
            firebase_db.collection("rooms").document(room_id).delete()
            return True
        rooms = _read_json(ROOMS_FILE, [])
        filtered = [r for r in rooms if r["id"] != room_id]
        if len(filtered) != len(rooms):
            _write_json(ROOMS_FILE, filtered)
            return True
        return False

    @staticmethod
    def update_room_status(room_id: str, new_status: str, note: Optional[str] = None, updated_by: Optional[str] = None) -> bool:
        room = DatabaseAccess.get_room_by_id(room_id)
        if room:
            prev_status = room.get("status", "Available")
            now_iso = datetime.now().strftime("%Y-%m-%d %H:%M")
            
            history = room.get("status_history", [])
            if not isinstance(history, list):
                history = []
            
            # Record previous state transition if changing
            history.insert(0, {
                "id": "st_" + str(uuid.uuid4())[:8],
                "from_status": prev_status,
                "to_status": new_status,
                "timestamp": now_iso,
                "note": note or f"Status changed from {prev_status} to {new_status}",
                "updated_by": updated_by or "Staff"
            })
            
            # Keep latest 50 history entries
            room["status_history"] = history[:50]
            room["current_status_since"] = now_iso
            room["status"] = new_status
            DatabaseAccess.save_room(room)
            return True
        return False

    @staticmethod
    def get_bookings(status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        if is_firebase_active and firebase_db:
            query = firebase_db.collection("bookings")
            if status_filter:
                query = query.where("status", "==", status_filter)
            docs = query.stream()
            return [doc.to_dict() for doc in docs]
        bookings = _read_json(BOOKINGS_FILE, [])
        if status_filter:
            bookings = [b for b in bookings if b.get("status") == status_filter]
        return bookings

    @staticmethod
    def get_booking_by_id(booking_id: str) -> Optional[Dict[str, Any]]:
        if is_firebase_active and firebase_db:
            doc = firebase_db.collection("bookings").document(booking_id).get()
            return doc.to_dict() if doc.exists else None
        bookings = _read_json(BOOKINGS_FILE, [])
        for b in bookings:
            if b["id"] == booking_id:
                return b
        return None

    @staticmethod
    def save_booking(booking_data: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in booking_data or not booking_data["id"]:
            booking_data["id"] = "bk_" + str(uuid.uuid4())[:8]
        if is_firebase_active and firebase_db:
            firebase_db.collection("bookings").document(booking_data["id"]).set(booking_data)
        else:
            bookings = _read_json(BOOKINGS_FILE, [])
            updated = False
            for idx, b in enumerate(bookings):
                if b["id"] == booking_data["id"]:
                    bookings[idx] = booking_data
                    updated = True
                    break
            if not updated:
                bookings.append(booking_data)
            _write_json(BOOKINGS_FILE, bookings)
        return booking_data

    @staticmethod
    def get_invoices() -> List[Dict[str, Any]]:
        if is_firebase_active and firebase_db:
            docs = firebase_db.collection("invoices").stream()
            return [doc.to_dict() for doc in docs]
        return _read_json(INVOICES_FILE, [])

    @staticmethod
    def get_invoice_by_id(invoice_id: str) -> Optional[Dict[str, Any]]:
        if is_firebase_active and firebase_db:
            doc = firebase_db.collection("invoices").document(invoice_id).get()
            return doc.to_dict() if doc.exists else None
        invoices = _read_json(INVOICES_FILE, [])
        for inv in invoices:
            if inv["id"] == invoice_id:
                return inv
        return None

    @staticmethod
    def save_invoice(invoice_data: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in invoice_data or not invoice_data["id"]:
            invoice_data["id"] = "inv_" + str(uuid.uuid4())[:8]
        if is_firebase_active and firebase_db:
            firebase_db.collection("invoices").document(invoice_data["id"]).set(invoice_data)
        else:
            invoices = _read_json(INVOICES_FILE, [])
            updated = False
            for idx, inv in enumerate(invoices):
                if inv["id"] == invoice_data["id"]:
                    invoices[idx] = invoice_data
                    updated = True
                    break
            if not updated:
                invoices.append(invoice_data)
            _write_json(INVOICES_FILE, invoices)
        return invoice_data

    @staticmethod
    def delete_booking(booking_id: str) -> bool:
        if is_firebase_active and firebase_db:
            firebase_db.collection("bookings").document(booking_id).delete()
            return True
        bookings = _read_json(BOOKINGS_FILE, [])
        filtered = [b for b in bookings if b["id"] != booking_id]
        if len(filtered) != len(bookings):
            _write_json(BOOKINGS_FILE, filtered)
            return True
        return False

    @staticmethod
    def delete_invoice(invoice_id: str) -> bool:
        if is_firebase_active and firebase_db:
            firebase_db.collection("invoices").document(invoice_id).delete()
            return True
        invoices = _read_json(INVOICES_FILE, [])
        filtered = [inv for inv in invoices if inv["id"] != invoice_id]
        if len(filtered) != len(invoices):
            _write_json(INVOICES_FILE, filtered)
            return True
        return False

    @staticmethod
    def get_settings() -> Dict[str, Any]:
        if is_firebase_active and firebase_db:
            doc = firebase_db.collection("settings").document("lodge_config").get()
            if doc.exists:
                return doc.to_dict()
        return _read_json(SETTINGS_FILE, LodgeSettings().model_dump())

    @staticmethod
    def save_settings(settings_data: Dict[str, Any]) -> Dict[str, Any]:
        if is_firebase_active and firebase_db:
            firebase_db.collection("settings").document("lodge_config").set(settings_data)
        else:
            _write_json(SETTINGS_FILE, settings_data)
        return settings_data
