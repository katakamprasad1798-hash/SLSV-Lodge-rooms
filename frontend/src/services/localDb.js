// Local Standalone Database Engine for SLSV Lodge Management
// Ensures the mobile app works 100% offline, standalone on the device without any server required.

const STORAGE_KEYS = {
  ROOMS: 'slsv_local_rooms',
  BOOKINGS: 'slsv_local_bookings',
  INVOICES: 'slsv_local_invoices',
  SETTINGS: 'slsv_local_settings',
  USERS: 'slsv_local_users',
};

const DEFAULT_SETTINGS = {
  "lodge_name": "Sri Lakshmi Srungara Vallabha Service Rooms",
  "tag_line": "Premium Comfort & Hospitality",
  "address": "Divili , Main Road Near Sai Baba Temple",
  "city": "Peddapuram",
  "state": "Andhra Pradesh",
  "pincode": "5334333",
  "phone": "+91 83416 02323",
  "email": "contact@grandhorizonlodge.com",
  "gstin": "",
  "cgst_rate": 6.0,
  "sgst_rate": 6.0,
  "check_out_time": "12:00 PM",
  "currency_symbol": "\u20b9",
  "terms_and_conditions": "1. Check-out time is 12:00 PM.\n2. Please return room key at check-out counter.\n3. Management is not responsible for valuables left in rooms.\n4. All disputes are subject to local jurisdiction.",
  "api_key": ""
};

const DEFAULT_ROOMS = [
  {
    "room_number": "101",
    "floor": 1,
    "category": "Standard",
    "ac_type": "AC",
    "bed_count": 1,
    "rate_per_day": 1200.0,
    "extra_bed_rate": 0.0,
    "status": "Available",
    "amenities": [
      "Wi-Fi",
      "TV",
      "Geyser",
      "Daily Housekeeping"
    ],
    "description": "Cozy single bed non-AC room with attached bathroom.",
    "id": "room_101",
    "status_history": [
      {
        "id": "st_499d7735",
        "from_status": "Cleaning",
        "to_status": "Available",
        "timestamp": "2026-10-18 15:43",
        "note": "Status changed from Cleaning to Available",
        "updated_by": "Staff"
      },
      {
        "id": "st_27a13585",
        "from_status": "Occupied",
        "to_status": "Cleaning",
        "timestamp": "2026-10-18 14:32",
        "note": "Status changed from Occupied to Cleaning",
        "updated_by": "Staff"
      },
      {
        "id": "st_572e37cd",
        "from_status": "Available",
        "to_status": "Occupied",
        "timestamp": "2026-10-18 14:29",
        "note": "Status changed from Available to Occupied",
        "updated_by": "Staff"
      },
      {
        "id": "st_f107e05a",
        "from_status": "Cleaning",
        "to_status": "Available",
        "timestamp": "2026-10-18 14:28",
        "note": "Status changed from Cleaning to Available",
        "updated_by": "Staff"
      },
      {
        "id": "st_bc98d984",
        "from_status": "Occupied",
        "to_status": "Cleaning",
        "timestamp": "2026-10-18 14:27",
        "note": "Status changed from Occupied to Cleaning",
        "updated_by": "Staff"
      },
      {
        "id": "st_0c78c595",
        "from_status": "Available",
        "to_status": "Occupied",
        "timestamp": "2026-10-18 14:26",
        "note": "Status changed from Available to Occupied",
        "updated_by": "Staff"
      }
    ],
    "current_status_since": "2026-10-18 15:43"
  },
  {
    "room_number": "102",
    "floor": 1,
    "category": "Standard",
    "ac_type": "AC",
    "bed_count": 2,
    "rate_per_day": 1200.0,
    "extra_bed_rate": 0.0,
    "status": "Available",
    "amenities": [
      "Wi-Fi",
      "Split AC",
      "LED TV",
      "Geyser",
      "Daily Housekeeping"
    ],
    "description": "",
    "id": "room_102"
  },
  {
    "room_number": "103",
    "floor": 1,
    "category": "Standard",
    "ac_type": "AC",
    "bed_count": 2,
    "rate_per_day": 1200.0,
    "extra_bed_rate": 0.0,
    "status": "Available",
    "amenities": [
      "Wi-Fi",
      "Split AC",
      "LED TV",
      "Geyser",
      "Daily Housekeeping"
    ],
    "description": "Wi-Fi, Split AC, LED TV, Geyser",
    "id": "room_201"
  },
  {
    "room_number": "104",
    "floor": 1,
    "category": "Standard",
    "ac_type": "Non-AC",
    "bed_count": 1,
    "rate_per_day": 1000.0,
    "extra_bed_rate": 300.0,
    "status": "Available",
    "amenities": [
      "Wi-Fi",
      "LED TV",
      "Daily Housekeeping"
    ],
    "description": "",
    "current_status_since": null,
    "status_history": [],
    "id": "room_202"
  },
  {
    "room_number": "105",
    "floor": 1,
    "category": "Standard",
    "ac_type": "Non-AC",
    "bed_count": 1,
    "rate_per_day": 1000.0,
    "extra_bed_rate": 300.0,
    "status": "Available",
    "amenities": [
      "Wi-Fi",
      "LED TV",
      "Geyser",
      "Daily Housekeeping"
    ],
    "description": "",
    "current_status_since": null,
    "status_history": [],
    "id": "room_301"
  },
  {
    "room_number": "106",
    "floor": 1,
    "category": "Standard",
    "ac_type": "Non-AC",
    "bed_count": 1,
    "rate_per_day": 1000.0,
    "extra_bed_rate": 0.0,
    "status": "Available",
    "amenities": [
      "Wi-Fi",
      "TV",
      "Geyser",
      "Daily Housekeeping"
    ],
    "description": "",
    "current_status_since": null,
    "status_history": [],
    "id": "room_1305993b"
  },
  {
    "room_number": "Party Hall",
    "floor": 1,
    "category": "Standard",
    "ac_type": "AC",
    "bed_count": 1,
    "rate_per_day": 4500.0,
    "extra_bed_rate": 300.0,
    "status": "Available",
    "amenities": [
      "Wi-Fi",
      "TV",
      "Geyser",
      "Ac",
      "Daily Housekeeping"
    ],
    "description": "",
    "current_status_since": null,
    "status_history": [],
    "id": "room_c303ba6c"
  }
];

const DEFAULT_BOOKINGS = [
  {
    "id": "bk_d220f7a5",
    "booking_number": "BK-20260913-101",
    "guest": {
      "name": "katakam prasad",
      "phone": "+919912144667",
      "email": "katakampd@gmail.com",
      "id_type": "Aadhaar",
      "id_number": "",
      "address": "DIVILi Main Road Near Sai Baba Temple"
    },
    "room_id": "room_101",
    "room_number": "101",
    "room_category": "Standard",
    "rate_per_day": 1200.0,
    "extra_bed_rate": 0.0,
    "check_in": "2026-09-13 13:19",
    "check_out": "2026-09-13 18:58",
    "expected_checkout": "2026-09-14",
    "status": "CheckedOut",
    "extra_bed_count": 0,
    "advance_paid": 0.0,
    "services": [],
    "notes": "",
    "created_at": "2026-09-13 18:49"
  },
  {
    "guest": {
      "name": "Rahul Sharma",
      "phone": "+91 98765 43210",
      "email": "rahul.sharma@example.com",
      "id_type": "Aadhaar",
      "id_number": "9876-5432-1098",
      "address": "Plot 42, Jubilee Hills, Hyderabad"
    },
    "room_id": "room_102",
    "room_number": "102",
    "room_category": "Standard",
    "rate_per_day": 1200.0,
    "extra_bed_rate": 300.0,
    "check_in": "2026-09-17 12:31",
    "check_out": "2026-09-17 12:41",
    "expected_checkout": "2026-09-18",
    "status": "CheckedOut",
    "extra_bed_count": 1,
    "advance_paid": 500.0,
    "services": [
      {
        "id": "srv_sample1",
        "title": "Welcome Tea & Bottled Water",
        "amount": 100.0,
        "category": "Beverages",
        "created_at": "2026-09-17 12:31"
      }
    ],
    "notes": "Test guest stay for testing billing & checkout flow",
    "booking_number": "BK-20260917-102",
    "created_at": "2026-09-17 12:31",
    "id": "bk_9474fe00"
  },
  {
    "id": "bk_5c88b5cc",
    "booking_number": "BK-20261016-106",
    "guest": {
      "name": "kancharla radhika",
      "phone": "+917013477084",
      "email": "radhakancharla15@gmail.com",
      "id_type": "Aadhaar",
      "id_number": "",
      "address": "pedapalla",
      "gstin": "",
      "business_name": ""
    },
    "room_id": "room_1305993b",
    "room_number": "106",
    "room_category": "Standard",
    "rate_per_day": 1000.0,
    "extra_bed_rate": 0.0,
    "check_in": "2026-10-16 06:07",
    "check_out": "2026-10-16 11:37",
    "expected_checkout": "2026-10-17",
    "status": "CheckedOut",
    "extra_bed_count": 0,
    "advance_paid": 0.0,
    "services": [],
    "notes": "",
    "created_at": "2026-10-16 11:37"
  },
  {
    "id": "bk_f5bb530b",
    "booking_number": "BK-20261016-101",
    "guest": {
      "name": "SUJATHA KANCHARLA",
      "phone": "+917013477084",
      "email": "KVRADHIKA2252@GMAIL.COM",
      "id_type": "Aadhaar",
      "id_number": "",
      "address": "2-150 JASTI VARI STREET",
      "gstin": "",
      "business_name": ""
    },
    "room_id": "room_101",
    "room_number": "101",
    "room_category": "Standard",
    "rate_per_day": 1200.0,
    "extra_bed_rate": 0.0,
    "check_in": "2026-10-16 06:40",
    "check_out": "2026-10-16 12:11",
    "expected_checkout": "2026-10-17",
    "status": "CheckedOut",
    "extra_bed_count": 0,
    "advance_paid": 0.0,
    "services": [
      {
        "id": "srv_e3b1caa1",
        "title": "Airport Pickup / Drop",
        "amount": 800.0,
        "category": "Transport",
        "created_at": "2026-10-16 12:11"
      }
    ],
    "notes": "",
    "created_at": "2026-10-16 12:10"
  },
  {
    "id": "bk_4a0a88a1",
    "booking_number": "BK-20261018-101",
    "guest": {
      "name": "Prasad",
      "phone": "+919912144667",
      "email": "katakampd@gmail.com",
      "id_type": "Aadhaar",
      "id_number": "",
      "address": "DIVILi Main Road Near Sai Baba Temple",
      "gstin": "",
      "business_name": ""
    },
    "room_id": "room_101",
    "room_number": "101",
    "room_category": "Standard",
    "rate_per_day": 1200.0,
    "extra_bed_rate": 0.0,
    "check_in": "2026-10-18 08:56",
    "check_out": "2026-10-18 14:27",
    "expected_checkout": "2026-10-19",
    "status": "CheckedOut",
    "extra_bed_count": 0,
    "advance_paid": 0.0,
    "services": [
      {
        "id": "srv_674cd97e",
        "title": "Airport Pickup / Drop",
        "amount": 800.0,
        "category": "Transport",
        "created_at": "2026-10-18 14:26"
      }
    ],
    "notes": "",
    "created_at": "2026-10-18 14:26"
  },
  {
    "id": "bk_a5cbf2c6",
    "booking_number": "BK-20261018-101",
    "guest": {
      "name": "Raja",
      "phone": "+919912144667",
      "email": "katakampd@gmail.com",
      "id_type": "Voter ID",
      "id_number": "",
      "address": "DIVILi Main Road Near Sai Baba Temple",
      "gstin": "",
      "business_name": ""
    },
    "room_id": "room_101",
    "room_number": "101",
    "room_category": "Standard",
    "rate_per_day": 1200.0,
    "extra_bed_rate": 0.0,
    "check_in": "2026-10-18 08:59",
    "check_out": "2026-10-18 14:32",
    "expected_checkout": "2026-10-19",
    "status": "CheckedOut",
    "extra_bed_count": 0,
    "advance_paid": 500.0,
    "services": [],
    "notes": "",
    "created_at": "2026-10-18 14:29"
  }
];

const DEFAULT_INVOICES = [
  {
    "id": "inv_0439fef4",
    "invoice_number": "INV-20260913-101",
    "booking_id": "bk_d220f7a5",
    "guest": {
      "name": "katakam prasad",
      "phone": "+919912144667",
      "email": "katakampd@gmail.com",
      "id_type": "Aadhaar",
      "id_number": "",
      "address": "DIVILi Main Road Near Sai Baba Temple",
      "gstin": "",
      "business_name": ""
    },
    "room_number": "101",
    "room_category": "Standard",
    "check_in": "2026-09-13 13:19",
    "check_out": "2026-09-13 18:58",
    "stay_days": 1,
    "rate_per_day": 1200.0,
    "base_room_charges": 1200.0,
    "extra_bed_charges": 0.0,
    "service_charges": 0,
    "subtotal": 1200.0,
    "discount_amount": 0.0,
    "taxable_amount": 1071.43,
    "cgst_rate": 6.0,
    "sgst_rate": 6.0,
    "cgst_amount": 64.28,
    "sgst_amount": 64.29,
    "total_tax": 128.57,
    "grand_total": 1200.0,
    "advance_paid": 0.0,
    "net_payable": 1200.0,
    "payment_status": "Paid",
    "payment_method": "Cash",
    "services_summary": [],
    "created_at": "2026-09-13 18:58"
  },
  {
    "id": "inv_7f6ec59a",
    "invoice_number": "INV-20260917-102",
    "booking_id": "bk_9474fe00",
    "guest": {
      "name": "Rahul Sharma",
      "phone": "+91 98765 43210",
      "email": "rahul.sharma@example.com",
      "id_type": "Aadhaar",
      "id_number": "9876-5432-1098",
      "address": "Plot 42, Jubilee Hills, Hyderabad",
      "gstin": "",
      "business_name": ""
    },
    "room_number": "102",
    "room_category": "Standard",
    "check_in": "2026-09-17 12:31",
    "check_out": "2026-09-17 12:41",
    "stay_days": 1,
    "rate_per_day": 1200.0,
    "base_room_charges": 1200.0,
    "extra_bed_charges": 0.0,
    "service_charges": 100.0,
    "subtotal": 1300.0,
    "discount_amount": 0.0,
    "taxable_amount": 1160.71,
    "cgst_rate": 6.0,
    "sgst_rate": 6.0,
    "cgst_amount": 69.64,
    "sgst_amount": 69.65,
    "total_tax": 139.29,
    "grand_total": 1300.0,
    "advance_paid": 0.0,
    "net_payable": 1300.0,
    "payment_status": "Paid",
    "payment_method": "Cash",
    "services_summary": [
      {
        "id": "srv_sample1",
        "title": "Welcome Tea & Bottled Water",
        "amount": 100.0,
        "category": "Beverages",
        "created_at": "2026-09-17 12:31"
      }
    ],
    "created_at": "2026-09-17 12:41"
  },
  {
    "id": "inv_8c96fdd7",
    "invoice_number": "INV-20261016-106",
    "booking_id": "bk_5c88b5cc",
    "guest": {
      "name": "kancharla radhika",
      "phone": "+917013477084",
      "email": "radhakancharla15@gmail.com",
      "id_type": "Aadhaar",
      "id_number": "",
      "address": "pedapalla",
      "gstin": "",
      "business_name": ""
    },
    "room_number": "106",
    "room_category": "Standard",
    "check_in": "2026-10-16 06:07",
    "check_out": "2026-10-16 11:37",
    "stay_days": 1,
    "rate_per_day": 1000.0,
    "base_room_charges": 1000.0,
    "extra_bed_charges": 0.0,
    "service_charges": 0,
    "subtotal": 1000.0,
    "discount_amount": 0.0,
    "taxable_amount": 892.86,
    "cgst_rate": 6.0,
    "sgst_rate": 6.0,
    "cgst_amount": 53.57,
    "sgst_amount": 53.57,
    "total_tax": 107.14,
    "grand_total": 1000.0,
    "advance_paid": 0.0,
    "net_payable": 1000.0,
    "payment_status": "Paid",
    "payment_method": "Cash",
    "services_summary": [],
    "created_at": "2026-10-16 11:37"
  },
  {
    "id": "inv_ca692c09",
    "invoice_number": "INV-20261016-101",
    "booking_id": "bk_f5bb530b",
    "guest": {
      "name": "SUJATHA KANCHARLA",
      "phone": "+917013477084",
      "email": "KVRADHIKA2252@GMAIL.COM",
      "id_type": "Aadhaar",
      "id_number": "",
      "address": "2-150 JASTI VARI STREET",
      "gstin": "",
      "business_name": ""
    },
    "room_number": "101",
    "room_category": "Standard",
    "check_in": "2026-10-16 06:40",
    "check_out": "2026-10-16 12:11",
    "stay_days": 1,
    "rate_per_day": 1200.0,
    "base_room_charges": 1200.0,
    "extra_bed_charges": 0.0,
    "service_charges": 800.0,
    "subtotal": 2000.0,
    "discount_amount": 0.0,
    "taxable_amount": 1785.71,
    "cgst_rate": 6.0,
    "sgst_rate": 6.0,
    "cgst_amount": 107.14,
    "sgst_amount": 107.15,
    "total_tax": 214.29,
    "grand_total": 2000.0,
    "advance_paid": 0.0,
    "net_payable": 2000.0,
    "payment_status": "Paid",
    "payment_method": "Cash",
    "services_summary": [
      {
        "id": "srv_e3b1caa1",
        "title": "Airport Pickup / Drop",
        "amount": 800.0,
        "category": "Transport",
        "created_at": "2026-10-16 12:11"
      }
    ],
    "created_at": "2026-10-16 12:11"
  },
  {
    "id": "inv_b188f9af",
    "invoice_number": "INV-20261018-101",
    "booking_id": "bk_4a0a88a1",
    "guest": {
      "name": "Prasad",
      "phone": "+919912144667",
      "email": "katakampd@gmail.com",
      "id_type": "Aadhaar",
      "id_number": "",
      "address": "DIVILi Main Road Near Sai Baba Temple",
      "gstin": "",
      "business_name": ""
    },
    "room_number": "101",
    "room_category": "Standard",
    "check_in": "2026-10-18 08:56",
    "check_out": "2026-10-18 14:27",
    "stay_days": 1,
    "rate_per_day": 1200.0,
    "base_room_charges": 1200.0,
    "extra_bed_charges": 0.0,
    "service_charges": 800.0,
    "subtotal": 2000.0,
    "discount_amount": 0.0,
    "taxable_amount": 1785.71,
    "cgst_rate": 6.0,
    "sgst_rate": 6.0,
    "cgst_amount": 107.14,
    "sgst_amount": 107.15,
    "total_tax": 214.29,
    "grand_total": 2000.0,
    "advance_paid": 0.0,
    "net_payable": 2000.0,
    "payment_status": "Paid",
    "payment_method": "UPI",
    "services_summary": [
      {
        "id": "srv_674cd97e",
        "title": "Airport Pickup / Drop",
        "amount": 800.0,
        "category": "Transport",
        "created_at": "2026-10-18 14:26"
      }
    ],
    "created_at": "2026-10-18 14:27"
  },
  {
    "id": "inv_7817d933",
    "invoice_number": "INV-20261018-101",
    "booking_id": "bk_a5cbf2c6",
    "guest": {
      "name": "Raja",
      "phone": "+919912144667",
      "email": "katakampd@gmail.com",
      "id_type": "Voter ID",
      "id_number": "",
      "address": "DIVILi Main Road Near Sai Baba Temple",
      "gstin": "",
      "business_name": ""
    },
    "room_number": "101",
    "room_category": "Standard",
    "check_in": "2026-10-18 08:59",
    "check_out": "2026-10-18 14:32",
    "stay_days": 1,
    "rate_per_day": 1200.0,
    "base_room_charges": 1200.0,
    "extra_bed_charges": 0.0,
    "service_charges": 0,
    "subtotal": 1200.0,
    "discount_amount": 0.0,
    "taxable_amount": 1071.43,
    "cgst_rate": 6.0,
    "sgst_rate": 6.0,
    "cgst_amount": 64.28,
    "sgst_amount": 64.29,
    "total_tax": 128.57,
    "grand_total": 1200.0,
    "advance_paid": 500.0,
    "net_payable": 700.0,
    "payment_status": "Paid",
    "payment_method": "Net Banking",
    "services_summary": [],
    "created_at": "2026-10-18 14:32"
  }
];

const DEFAULT_USERS = [
  {
    "id": "admin-1",
    "name": "Administrator",
    "email": "admin@lodge.com",
    "password": "adminpassword123",
    "role": "Administrator",
    "phone": "+919876543210",
    "created_at": "2026-10-14T06:07:59.774516",
    "last_login": "2026-10-30T04:53:15.748725"
  },
  {
    "id": "f03927b8-c57b-4bfc-b052-3d888e55c217",
    "name": "Prasad",
    "email": "katakampd@gmail.com",
    "password": "Prasad@143",
    "role": "Administrator",
    "phone": "9912144667",
    "created_at": "2026-10-29T05:55:01.566315",
    "last_login": null
  }
];

function readStorage(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) {
      writeStorage(key, fallback);
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[LocalDB] Error reading ${key}:`, e);
    return fallback;
  }
}

function writeStorage(key, val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    console.error(`[LocalDB] Error saving ${key}:`, e);
  }
}

// Initialize seed data if not present, and auto-hydrate if cache is missing data
export function initLocalDatabase() {
  readStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  // Sync / Hydrate rooms
  const savedRooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
  if (!savedRooms || savedRooms.length < DEFAULT_ROOMS.length || savedRooms.some(r => r.id === 'room_201' && r.floor === 2)) {
    writeStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
  }

  // Sync / Hydrate bookings
  const savedBookings = readStorage(STORAGE_KEYS.BOOKINGS, DEFAULT_BOOKINGS);
  if (!savedBookings || savedBookings.length < DEFAULT_BOOKINGS.length) {
    const existingIds = new Set((savedBookings || []).map(b => b.id));
    const merged = [...(savedBookings || [])];
    for (const b of DEFAULT_BOOKINGS) {
      if (!existingIds.has(b.id)) merged.push(b);
    }
    writeStorage(STORAGE_KEYS.BOOKINGS, merged);
  }

  // Sync / Hydrate invoices: ensures all 6 invoices are present on mobile
  const savedInvoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
  if (!savedInvoices || savedInvoices.length < DEFAULT_INVOICES.length) {
    const existingIds = new Set((savedInvoices || []).map(i => i.id));
    const merged = [...(savedInvoices || [])];
    for (const inv of DEFAULT_INVOICES) {
      if (!existingIds.has(inv.id)) merged.push(inv);
    }
    writeStorage(STORAGE_KEYS.INVOICES, merged);
  }

  // Sync / Hydrate users
  const savedUsers = readStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  if (!savedUsers || savedUsers.length < DEFAULT_USERS.length) {
    writeStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }
}

// Generate unique IDs
function genId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export const localDb = {
  // Stats
  async getStats() {
    const rooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    const bookings = readStorage(STORAGE_KEYS.BOOKINGS, []);
    const invoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);

    const available_rooms = rooms.filter(r => (r.status || 'Available').toLowerCase() === 'available').length;
    const occupied_rooms = rooms.filter(r => (r.status || '').toLowerCase() === 'occupied').length;
    const cleaning_rooms = rooms.filter(r => (r.status || '').toLowerCase() === 'cleaning').length;
    const maintenance_rooms = rooms.filter(r => (r.status || '').toLowerCase() === 'maintenance').length;
    const active_bookings = bookings.filter(b => (b.status || 'Active').toLowerCase() === 'active').length;
    const total_revenue = invoices.reduce((acc, curr) => acc + (parseFloat(curr.grand_total) || 0), 0);

    return {
      total_rooms: rooms.length,
      available_rooms,
      occupied_rooms,
      cleaning_rooms,
      maintenance_rooms,
      active_bookings,
      total_invoices: invoices.length,
      total_revenue
    };
  },

  // Rooms
  async getRooms(status, category) {
    let rooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    if (status) {
      rooms = rooms.filter(r => (r.status || '').toLowerCase() === status.toLowerCase());
    }
    if (category) {
      rooms = rooms.filter(r => (r.category || '').toLowerCase() === category.toLowerCase());
    }
    return rooms;
  },

  async getRoom(id) {
    const rooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    const found = rooms.find(r => r.id === id || r.room_number === id);
    if (!found) throw new Error("Room not found");
    return found;
  },

  async createRoom(roomData) {
    const rooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    if (rooms.some(r => r.room_number.toString().trim() === roomData.room_number.toString().trim())) {
      throw new Error(`Room number '${roomData.room_number}' already exists!`);
    }
    const newRoom = {
      ...roomData,
      id: genId('room'),
      status: roomData.status || 'Available',
      status_history: []
    };
    rooms.push(newRoom);
    writeStorage(STORAGE_KEYS.ROOMS, rooms);
    return newRoom;
  },

  async updateRoom(id, roomData) {
    const rooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    const idx = rooms.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Room not found");
    const updated = { ...rooms[idx], ...roomData, id };
    rooms[idx] = updated;
    writeStorage(STORAGE_KEYS.ROOMS, rooms);
    return updated;
  },

  async updateRoomStatus(id, status) {
    const rooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    const idx = rooms.findIndex(r => r.id === id || r.room_number === id);
    if (idx === -1) throw new Error("Room not found");
    const prevStatus = rooms[idx].status;
    rooms[idx].status = status;
    const historyItem = {
      id: genId('st'),
      from_status: prevStatus,
      to_status: status,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      note: `Status updated from ${prevStatus} to ${status}`
    };
    rooms[idx].status_history = [historyItem, ...(rooms[idx].status_history || [])];
    rooms[idx].current_status_since = historyItem.timestamp;
    writeStorage(STORAGE_KEYS.ROOMS, rooms);
    return rooms[idx];
  },

  async deleteRoom(id) {
    let rooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    rooms = rooms.filter(r => r.id !== id);
    writeStorage(STORAGE_KEYS.ROOMS, rooms);
    return { success: true, message: "Room deleted" };
  },

  // Bookings
  async getBookings(status) {
    let bookings = readStorage(STORAGE_KEYS.BOOKINGS, []);
    if (status) {
      bookings = bookings.filter(b => (b.status || 'Active').toLowerCase() === status.toLowerCase());
    }
    return bookings;
  },

  async getBooking(id) {
    const bookings = readStorage(STORAGE_KEYS.BOOKINGS, []);
    const found = bookings.find(b => b.id === id || b.booking_number === id);
    if (!found) throw new Error("Booking not found");
    return found;
  },

  async createBooking(bookingData) {
    const bookings = readStorage(STORAGE_KEYS.BOOKINGS, []);
    const rooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);

    const roomIdx = rooms.findIndex(r => r.id === bookingData.room_id || r.room_number === bookingData.room_number);
    if (roomIdx === -1) throw new Error("Selected room not found");

    const now = new Date();
    const dStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const bookingNumber = `BK-${dStr}-${rooms[roomIdx].room_number}`;

    const newBooking = {
      ...bookingData,
      id: genId('bk'),
      booking_number: bookingNumber,
      room_id: rooms[roomIdx].id,
      room_number: rooms[roomIdx].room_number,
      room_category: rooms[roomIdx].category,
      rate_per_day: rooms[roomIdx].rate_per_day,
      extra_bed_rate: rooms[roomIdx].extra_bed_rate || 250,
      status: 'Active',
      services: [],
      created_at: now.toISOString().slice(0, 16).replace('T', ' ')
    };

    bookings.unshift(newBooking);
    writeStorage(STORAGE_KEYS.BOOKINGS, bookings);

    // Update room status to Occupied
    rooms[roomIdx].status = 'Occupied';
    rooms[roomIdx].current_guest = bookingData.guest?.name || 'Guest';
    writeStorage(STORAGE_KEYS.ROOMS, rooms);

    return newBooking;
  },

  async addServiceCharge(bookingId, title, amount, category = 'Food/Service') {
    const bookings = readStorage(STORAGE_KEYS.BOOKINGS, []);
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) throw new Error("Booking not found");

    const serviceItem = {
      id: genId('srv'),
      title,
      amount: parseFloat(amount) || 0,
      category,
      created_at: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    bookings[idx].services = [...(bookings[idx].services || []), serviceItem];
    writeStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return bookings[idx];
  },

  async checkOut(bookingId, checkoutData) {
    const bookings = readStorage(STORAGE_KEYS.BOOKINGS, []);
    const rooms = readStorage(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    const invoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    const settings = readStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

    const bIdx = bookings.findIndex(b => b.id === bookingId);
    if (bIdx === -1) throw new Error("Booking record not found");
    const b = bookings[bIdx];

    const checkInDate = new Date(b.check_in);
    const checkOutDate = new Date();
    const diffHours = Math.max(1, (checkOutDate - checkInDate) / (1000 * 60 * 60));
    const stayDays = Math.max(1, Math.ceil(diffHours / 24));

    const rate = parseFloat(b.rate_per_day) || 1200;
    const baseRoom = stayDays * rate;
    const extraBed = (b.extra_bed_count || 0) * (b.extra_bed_rate || 0) * stayDays;
    const servicesTotal = (b.services || []).reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const discount = parseFloat(checkoutData.discount_amount) || 0;
    const advance = parseFloat(b.advance_paid) || 0;

    const grossSubtotal = baseRoom + extraBed + servicesTotal;
    const cgstRate = settings.cgst_rate || 6.0;
    const sgstRate = settings.sgst_rate || 6.0;
    const totalGstRate = cgstRate + sgstRate;

    const taxable = totalGstRate > 0 ? (grossSubtotal / (1 + totalGstRate / 100)) : grossSubtotal;
    const totalTax = grossSubtotal - taxable;
    const cgstAmount = totalTax / 2;
    const sgstAmount = totalTax / 2;

    const grandTotal = Math.max(0, grossSubtotal - discount);
    const netPayable = Math.max(0, grandTotal - advance);

    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${b.room_number}`;
    const invoice = {
      id: genId('inv'),
      invoice_number: invoiceNumber,
      booking_id: b.id,
      guest: b.guest,
      room_number: b.room_number,
      room_category: b.room_category,
      check_in: b.check_in,
      check_out: checkOutDate.toISOString().slice(0, 16).replace('T', ' '),
      stay_days: stayDays,
      rate_per_day: rate,
      base_room_charges: baseRoom,
      extra_bed_charges: extraBed,
      service_charges: servicesTotal,
      subtotal: grossSubtotal,
      discount_amount: discount,
      taxable_amount: Math.round(taxable * 100) / 100,
      cgst_rate: cgstRate,
      sgst_rate: sgstRate,
      cgst_amount: Math.round(cgstAmount * 100) / 100,
      sgst_amount: Math.round(sgstAmount * 100) / 100,
      total_tax: Math.round(totalTax * 100) / 100,
      grand_total: Math.round(grandTotal * 100) / 100,
      advance_paid: advance,
      net_payable: Math.round(netPayable * 100) / 100,
      payment_method: checkoutData.payment_method || 'Cash',
      payment_status: 'Paid',
      services_summary: (b.services || []).map(s => ({
        id: s.id,
        title: s.title,
        amount: s.amount,
        category: s.category || 'Service'
      })),
      created_at: checkOutDate.toISOString().slice(0, 16).replace('T', ' ')
    };

    invoices.unshift(invoice);
    writeStorage(STORAGE_KEYS.INVOICES, invoices);

    // Update booking to CheckedOut
    bookings[bIdx].status = 'CheckedOut';
    bookings[bIdx].check_out = invoice.check_out;
    writeStorage(STORAGE_KEYS.BOOKINGS, bookings);

    // Update room to Cleaning
    const rIdx = rooms.findIndex(r => r.room_number === b.room_number);
    if (rIdx !== -1) {
      rooms[rIdx].status = 'Cleaning';
      rooms[rIdx].current_guest = null;
      writeStorage(STORAGE_KEYS.ROOMS, rooms);
    }

    return {
      message: `Check-Out completed for Room ${b.room_number}`,
      invoice,
      booking: bookings[bIdx]
    };
  },

  // Invoices
  async getInvoices(search, paymentMethod) {
    let invoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    if (paymentMethod && paymentMethod !== 'All') {
      invoices = invoices.filter(inv => (inv.payment_method || '').toLowerCase() === paymentMethod.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase().trim();
      invoices = invoices.filter(inv =>
        (inv.invoice_number || '').toLowerCase().includes(s) ||
        (inv.guest?.name || '').toLowerCase().includes(s) ||
        (inv.guest?.phone || '').includes(s) ||
        (inv.room_number || '').toString().includes(s)
      );
    }
    return invoices;
  },

  async getInvoice(id) {
    const invoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    const found = invoices.find(inv => inv.id === id || inv.invoice_number === id);
    if (!found) throw new Error("Invoice not found");
    return found;
  },

  async createInvoice(invoiceData) {
    const invoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    const settings = readStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

    const stayDays = parseInt(invoiceData.stay_days) || 1;
    const rate = parseFloat(invoiceData.rate_per_day) || 1200;
    const baseRoom = stayDays * rate;
    const extraBed = parseFloat(invoiceData.extra_bed_charges) || 0;
    const serviceCharges = parseFloat(invoiceData.service_charges) || 0;
    const grossSubtotal = baseRoom + extraBed + serviceCharges;
    const discount = parseFloat(invoiceData.discount_amount) || 0;
    const advance = parseFloat(invoiceData.advance_paid) || 0;

    const cgstRate = settings.cgst_rate || 6.0;
    const sgstRate = settings.sgst_rate || 6.0;
    const totalGstRate = cgstRate + sgstRate;

    const taxable = totalGstRate > 0 ? (grossSubtotal / (1 + totalGstRate / 100)) : grossSubtotal;
    const totalTax = grossSubtotal - taxable;
    const cgstAmount = totalTax / 2;
    const sgstAmount = totalTax / 2;
    const grandTotal = Math.max(0, grossSubtotal - discount);
    const netPayable = Math.max(0, grandTotal - advance);

    const invoiceNumber = invoiceData.invoice_number || `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${invoiceData.room_number || '101'}`;

    const newInvoice = {
      ...invoiceData,
      id: genId('inv'),
      invoice_number: invoiceNumber,
      base_room_charges: baseRoom,
      subtotal: grossSubtotal,
      taxable_amount: Math.round(taxable * 100) / 100,
      cgst_rate: cgstRate,
      sgst_rate: sgstRate,
      cgst_amount: Math.round(cgstAmount * 100) / 100,
      sgst_amount: Math.round(sgstAmount * 100) / 100,
      total_tax: Math.round(totalTax * 100) / 100,
      grand_total: Math.round(grandTotal * 100) / 100,
      net_payable: Math.round(netPayable * 100) / 100,
      created_at: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    invoices.unshift(newInvoice);
    writeStorage(STORAGE_KEYS.INVOICES, invoices);
    return newInvoice;
  },

  async updateInvoice(id, invoiceData) {
    const invoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    const idx = invoices.findIndex(inv => inv.id === id);
    if (idx === -1) throw new Error("Invoice not found");

    const settings = readStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const stayDays = parseInt(invoiceData.stay_days) || 1;
    const rate = parseFloat(invoiceData.rate_per_day) || 1200;
    const baseRoom = stayDays * rate;
    const extraBed = parseFloat(invoiceData.extra_bed_charges) || 0;
    const serviceCharges = parseFloat(invoiceData.service_charges) || 0;
    const grossSubtotal = baseRoom + extraBed + serviceCharges;
    const discount = parseFloat(invoiceData.discount_amount) || 0;
    const advance = parseFloat(invoiceData.advance_paid) || 0;

    const cgstRate = settings.cgst_rate || 6.0;
    const sgstRate = settings.sgst_rate || 6.0;
    const totalGstRate = cgstRate + sgstRate;

    const taxable = totalGstRate > 0 ? (grossSubtotal / (1 + totalGstRate / 100)) : grossSubtotal;
    const totalTax = grossSubtotal - taxable;
    const cgstAmount = totalTax / 2;
    const sgstAmount = totalTax / 2;
    const grandTotal = Math.max(0, grossSubtotal - discount);
    const netPayable = Math.max(0, grandTotal - advance);

    const updated = {
      ...invoices[idx],
      ...invoiceData,
      id,
      base_room_charges: baseRoom,
      subtotal: grossSubtotal,
      taxable_amount: Math.round(taxable * 100) / 100,
      cgst_rate: cgstRate,
      sgst_rate: sgstRate,
      cgst_amount: Math.round(cgstAmount * 100) / 100,
      sgst_amount: Math.round(sgstAmount * 100) / 100,
      total_tax: Math.round(totalTax * 100) / 100,
      grand_total: Math.round(grandTotal * 100) / 100,
      net_payable: Math.round(netPayable * 100) / 100
    };

    invoices[idx] = updated;
    writeStorage(STORAGE_KEYS.INVOICES, invoices);
    return updated;
  },

  async deleteInvoice(id) {
    let invoices = readStorage(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    invoices = invoices.filter(inv => inv.id !== id);
    writeStorage(STORAGE_KEYS.INVOICES, invoices);
    return { success: true, message: "Invoice deleted" };
  },

  // Settings
  async getSettings() {
    return readStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  async updateSettings(settingsData) {
    const current = readStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const updated = { ...current, ...settingsData };
    writeStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // Auth
  async login(credentials) {
    const users = readStorage(STORAGE_KEYS.USERS, []);
    const email = (credentials.email || '').toLowerCase().trim();
    const found = users.find(u => (u.email || '').toLowerCase() === email);

    // Accept default admin or existing user or allow offline admin access
    const user = found || {
      id: "admin-offline",
      name: "Lodge Administrator",
      email: credentials.email || "admin@lodge.com",
      role: "Administrator",
      phone: "+91 83416 02323"
    };

    return {
      message: "Login successful (Offline Standalone Mode)",
      token: `slsv_local_token_${Date.now()}`,
      user
    };
  },

  async register(userData) {
    const users = readStorage(STORAGE_KEYS.USERS, []);
    const newUser = {
      id: genId('user'),
      name: userData.name || 'Staff Member',
      email: userData.email,
      role: userData.role || 'Receptionist',
      phone: userData.phone || ''
    };
    users.push(newUser);
    writeStorage(STORAGE_KEYS.USERS, users);
    return {
      message: "Registration successful",
      token: `slsv_local_token_${Date.now()}`,
      user: newUser
    };
  }
};

// Seed on module load
initLocalDatabase();

