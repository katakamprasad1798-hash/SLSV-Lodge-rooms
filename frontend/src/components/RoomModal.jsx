import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function RoomModal({ room, onClose, onSave }) {
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [category, setCategory] = useState('Standard');
  const [acType, setAcType] = useState('AC');
  const [bedCount, setBedCount] = useState(1);
  const [ratePerDay, setRatePerDay] = useState(1500);
  const [extraBedRate, setExtraBedRate] = useState(300);
  const [amenitiesInput, setAmenitiesInput] = useState('Wi-Fi, TV, Geyser');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (room) {
      setRoomNumber(room.room_number || '');
      setFloor(room.floor || 1);
      setCategory(room.category || 'Standard');
      setAcType(room.ac_type || 'AC');
      setBedCount(room.bed_count || 1);
      setRatePerDay(room.rate_per_day || 1500);
      setExtraBedRate(room.extra_bed_rate || 300);
      setAmenitiesInput(room.amenities ? room.amenities.join(', ') : '');
      setDescription(room.description || '');
      setStatus(room.status || 'Available');
    }
  }, [room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      setError('Room Number is required.');
      return;
    }
    setError('');
    setLoading(true);

    const amenitiesList = amenitiesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      room_number: roomNumber.trim(),
      floor: parseInt(floor, 10),
      category,
      ac_type: acType,
      bed_count: parseInt(bedCount, 10),
      rate_per_day: parseFloat(ratePerDay),
      extra_bed_rate: parseFloat(extraBedRate),
      status: status,
      amenities: amenitiesList,
      description,
    };

    try {
      await onSave(payload, room ? room.id : null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save room details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {room ? `Edit Room ${room.room_number}` : 'Add New Room'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Room Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 101"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Floor</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Standard">Standard Room</option>
                <option value="Deluxe">Deluxe Room</option>
                <option value="Executive">Executive Suite</option>
                <option value="Suite">Royal Suite</option>
              </select>
            </div>

            <div className="form-group">
              <label>AC Type</label>
              <select className="form-control" value={acType} onChange={(e) => setAcType(e.target.value)}>
                <option value="AC">AC (Air Conditioned)</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>

            <div className="form-group">
              <label>Room Status</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bed Count</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={bedCount}
                onChange={(e) => setBedCount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Daily Rate (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={ratePerDay}
                onChange={(e) => setRatePerDay(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Extra Bed Rate (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={extraBedRate}
                onChange={(e) => setExtraBedRate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Amenities (Comma separated)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Wi-Fi, TV, Geyser, Mini Fridge"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description / Notes</label>
            <textarea
              rows="2"
              className="form-control"
              placeholder="Optional notes or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Room'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
