import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { UserCheck, BedDouble, Calendar, DollarSign, User, ShieldCheck } from 'lucide-react';

export default function CheckIn() {
  const [searchParams] = useSearchParams();
  const preSelectedRoomId = searchParams.get('room_id');

  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(preSelectedRoomId || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [checkInTime, setCheckInTime] = useState(new Date().toISOString().slice(0, 16));
  
  // Default expected checkout to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [expectedCheckout, setExpectedCheckout] = useState(tomorrow.toISOString().slice(0, 10));

  const [extraBedCount, setExtraBedCount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [notes, setNotes] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAvailableRooms() {
      try {
        setLoading(true);
        const rooms = await api.getRooms();
        // Allow rooms that are Available or Cleaning
        const avail = rooms.filter((r) => r.status === 'Available' || r.status === 'Cleaning');
        setAvailableRooms(avail);

        if (preSelectedRoomId && avail.some((r) => r.id === preSelectedRoomId)) {
          setSelectedRoomId(preSelectedRoomId);
        } else if (avail.length > 0) {
          setSelectedRoomId(avail[0].id);
        }
      } catch (err) {
        setError('Failed to fetch room details');
      } finally {
        setLoading(false);
      }
    }
    fetchAvailableRooms();
  }, [preSelectedRoomId]);

  const selectedRoom = availableRooms.find((r) => r.id === selectedRoomId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError('Please select an available room.');
      return;
    }
    if (!guestName || !phone) {
      setError('Guest Name and Phone number are required.');
      return;
    }

    setError('');
    setSubmitting(true);

    const payload = {
      guest: {
        name: guestName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        id_type: idType,
        id_number: idNumber.trim(),
        address: address.trim(),
      },
      room_id: selectedRoomId,
      check_in: checkInTime.replace('T', ' '),
      expected_checkout: expectedCheckout,
      extra_bed_count: parseInt(extraBedCount, 10) || 0,
      advance_paid: parseFloat(advancePaid) || 0,
      notes,
    };

    try {
      await api.createBooking(payload);
      navigate('/active-stays');
    } catch (err) {
      setError(err.message || 'Failed to complete guest check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Guest Registration & Room Check-In</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Register guest details, allocate room, and record advance deposit
        </span>
      </div>

      {error && (
        <div style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(244,63,94,0.3)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Room Selection Section */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <BedDouble size={20} />
            Step 1: Select Room
          </h3>

          {loading ? (
            <div>Loading available rooms...</div>
          ) : availableRooms.length === 0 ? (
            <div style={{ color: '#f43f5e' }}>No rooms currently available for check-in! Please mark a cleaning room as available first.</div>
          ) : (
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Available Room</label>
                <select
                  className="form-control"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  required
                >
                  {availableRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} — {r.category} ({r.ac_type}) — ₹{r.rate_per_day}/night
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoom && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Room Tariff Summary</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-available)' }}>
                    ₹{selectedRoom.rate_per_day} <span style={{ fontSize: '0.75rem' }}>/ night</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Extra bed: ₹{selectedRoom.extra_bed_rate} / night
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guest Information */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <User size={20} />
            Step 2: Guest Information
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ramesh Kumar"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Identity Proof Type</label>
              <select className="form-control" value={idType} onChange={(e) => setIdType(e.target.value)}>
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>

            <div className="form-group">
              <label>ID Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 1234-5678-9012"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Residential Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="City, State, Country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {/* Stay & Payment Section */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Calendar size={20} />
            Step 3: Stay Duration & Deposit
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Check-In Date & Time</label>
              <input
                type="datetime-local"
                className="form-control"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Expected Check-Out Date</label>
              <input
                type="date"
                className="form-control"
                value={expectedCheckout}
                onChange={(e) => setExpectedCheckout(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Extra Bed Mattress Count</label>
              <input
                type="number"
                min="0"
                max="5"
                className="form-control"
                value={extraBedCount}
                onChange={(e) => setExtraBedCount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Advance Payment Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes / Special Preferences</label>
            <textarea
              rows="2"
              className="form-control"
              placeholder="e.g. Extra towels requested, late check-in..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting || availableRooms.length === 0}>
            <UserCheck size={18} />
            <span>{submitting ? 'Registering Check-In...' : 'Confirm Guest Check-In'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
