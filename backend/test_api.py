import unittest
from fastapi.testclient import TestClient
from main import app
from database import DatabaseAccess

class TestLodgeBookingAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_root_health_check(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "Online")

    def test_02_get_rooms(self):
        response = self.client.get("/api/rooms")
        self.assertEqual(response.status_code, 200)
        rooms = response.json()
        self.assertIsInstance(rooms, list)
        self.assertGreater(len(rooms), 0)

    def test_03_room_status_filter(self):
        response = self.client.get("/api/rooms?status=Available")
        self.assertEqual(response.status_code, 200)
        for r in response.json():
            self.assertEqual(r["status"].lower(), "available")

    def test_04_booking_flow_and_invoice(self):
        # 1. Pick an available room or temporarily mark room_101 available
        DatabaseAccess.update_room_status("room_101", "Available")
        
        # 2. Create a test booking
        booking_payload = {
            "guest": {
                "name": "Test Guest",
                "phone": "+919876543210",
                "email": "testguest@example.com",
                "id_type": "Aadhaar",
                "id_number": "1234-5678-9012",
                "address": "123 Test Street, Hyd"
            },
            "room_id": "room_101",
            "check_in": "2026-09-17 10:00",
            "expected_checkout": "2026-09-18",
            "extra_bed_count": 1,
            "advance_paid": 500.0,
            "notes": "Automated test booking"
        }
        b_res = self.client.post("/api/bookings", json=booking_payload)
        self.assertEqual(b_res.status_code, 201)
        booking = b_res.json()
        booking_id = booking["id"]
        self.assertEqual(booking["guest"]["name"], "Test Guest")
        
        # Room should now be Occupied
        room = DatabaseAccess.get_room_by_id("room_101")
        self.assertEqual(room["status"], "Occupied")

        # 3. Add a service charge (e.g. Food / Laundry)
        service_payload = {
            "title": "Room Service Tea & Snacks",
            "amount": 150.0,
            "category": "Food"
        }
        s_res = self.client.post(f"/api/bookings/{booking_id}/services", params=service_payload)
        self.assertEqual(s_res.status_code, 200)
        updated_booking = s_res.json()
        self.assertEqual(len(updated_booking["services"]), 1)
        self.assertEqual(updated_booking["services"][0]["amount"], 150.0)

        # 4. Check out the guest
        checkout_payload = {
            "check_out": "2026-09-18 11:00",
            "discount_amount": 50.0,
            "payment_method": "UPI",
            "payment_status": "Paid"
        }
        co_res = self.client.post(f"/api/bookings/{booking_id}/checkout", json=checkout_payload)
        self.assertEqual(co_res.status_code, 200)
        invoice = co_res.json()
        
        # Verify invoice calculations
        self.assertIn("INV-", invoice["invoice_number"])
        self.assertEqual(invoice["guest"]["name"], "Test Guest")
        self.assertGreater(invoice["grand_total"], 0)
        self.assertEqual(invoice["advance_paid"], 500.0)
        self.assertEqual(invoice["payment_method"], "UPI")
        self.assertEqual(invoice["payment_status"], "Paid")

        # Room status should now be Cleaning
        room_after = DatabaseAccess.get_room_by_id("room_101")
        self.assertEqual(room_after["status"], "Cleaning")

        # 5. Mark room back to Available
        m_res = self.client.patch("/api/rooms/room_101/status?status=Available")
        self.assertEqual(m_res.status_code, 200)
        room_ready = DatabaseAccess.get_room_by_id("room_101")
        self.assertEqual(room_ready["status"], "Available")

        # Cleanup test records
        DatabaseAccess.delete_booking(booking_id)
        if "id" in invoice:
            DatabaseAccess.delete_invoice(invoice["id"])

    def test_05_stats_endpoint(self):
        res = self.client.get("/api/stats")
        self.assertEqual(res.status_code, 200)
        stats = res.json()
        self.assertIn("total_rooms", stats)
        self.assertIn("available_rooms", stats)
        self.assertIn("occupied_rooms", stats)
        self.assertIn("total_revenue", stats)

    def test_06_invoice_crud(self):
        # 1. Create manual invoice
        create_payload = {
            "guest": {
                "name": "Jane Doe",
                "phone": "+919123456780",
                "email": "jane@example.com",
                "id_type": "Passport",
                "id_number": "Z1234567",
                "address": "45 Ocean Drive"
            },
            "room_number": "202",
            "room_category": "Executive",
            "check_in": "2026-10-10 12:00",
            "check_out": "2026-10-12 11:00",
            "stay_days": 2,
            "rate_per_day": 3500.0,
            "extra_bed_charges": 500.0,
            "service_charges": 200.0,
            "discount_amount": 200.0,
            "advance_paid": 1000.0,
            "payment_method": "UPI",
            "payment_status": "Paid",
            "services_summary": [
                {
                    "title": "Laundry Service",
                    "amount": 200.0,
                    "category": "Laundry"
                }
            ]
        }
        res = self.client.post("/api/invoices", json=create_payload)
        self.assertEqual(res.status_code, 201)
        inv = res.json()
        inv_id = inv["id"]
        self.assertEqual(inv["guest"]["name"], "Jane Doe")
        self.assertEqual(inv["room_number"], "202")
        self.assertEqual(inv["base_room_charges"], 7000.0)
        self.assertEqual(inv["subtotal"], 7700.0)
        self.assertEqual(inv["taxable_amount"], 6875.0)
        self.assertEqual(inv["cgst_amount"], 412.5)
        self.assertEqual(inv["sgst_amount"], 412.5)
        self.assertEqual(inv["total_tax"], 825.0)
        self.assertEqual(inv["grand_total"], 7500.0)
        self.assertEqual(inv["advance_paid"], 1000.0)
        self.assertEqual(inv["net_payable"], 6500.0)

        # 2. View / Read invoice
        get_res = self.client.get(f"/api/invoices/{inv_id}")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["id"], inv_id)

        # 3. Edit / Update invoice
        update_payload = {
            "discount_amount": 500.0,
            "payment_method": "Card",
            "payment_status": "Paid"
        }
        put_res = self.client.put(f"/api/invoices/{inv_id}", json=update_payload)
        self.assertEqual(put_res.status_code, 200)
        updated_inv = put_res.json()
        self.assertEqual(updated_inv["discount_amount"], 500.0)
        self.assertEqual(updated_inv["taxable_amount"], 6875.0)
        self.assertEqual(updated_inv["cgst_amount"], 412.5)
        self.assertEqual(updated_inv["sgst_amount"], 412.5)
        self.assertEqual(updated_inv["total_tax"], 825.0)
        self.assertEqual(updated_inv["grand_total"], 7200.0)
        self.assertEqual(updated_inv["net_payable"], 6200.0)
        self.assertEqual(updated_inv["payment_method"], "Card")

        # 4. Delete invoice
        del_res = self.client.delete(f"/api/invoices/{inv_id}")
        self.assertEqual(del_res.status_code, 200)

        # 5. Verify deletion
        verify_res = self.client.get(f"/api/invoices/{inv_id}")
        self.assertEqual(verify_res.status_code, 404)

if __name__ == "__main__":
    unittest.main()
