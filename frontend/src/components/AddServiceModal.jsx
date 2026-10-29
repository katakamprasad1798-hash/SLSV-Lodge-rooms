import React, { useState } from 'react';
import { X, Plus, Utensils, Shirt, Bed, Truck, Package } from 'lucide-react';

export default function AddServiceModal({ booking, onClose, onAddService }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food/Service');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickItems = [
    { title: 'Tea / Coffee', amount: 40, category: 'Food/Service' },
    { title: 'Breakfast Combo', amount: 180, category: 'Food/Service' },
    { title: 'Dinner Thali', amount: 250, category: 'Food/Service' },
    { title: 'Laundry Service', amount: 150, category: 'Laundry' },
    { title: 'Extra Bed Mattress', amount: 250, category: 'Extra Bed' },
    { title: 'Airport Pickup / Drop', amount: 800, category: 'Transport' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || parseFloat(amount) <= 0) {
      setError('Please provide a valid service title and positive amount.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onAddService(booking.id, title, parseFloat(amount), category);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add service charge.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (item) => {
    setTitle(item.title);
    setAmount(item.amount.toString());
    setCategory(item.category);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add Charge to Room {booking.room_number}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Guest: {booking.guest?.name}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid rgba(244,63,94,0.3)' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            QUICK ADD PRESETS
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            {quickItems.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', justifyContent: 'space-between' }}
                onClick={() => handleQuickAdd(item)}
              >
                <span>{item.title}</span>
                <strong style={{ color: 'var(--status-available)' }}>₹{item.amount}</strong>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service / Item Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Mineral Water, Dinner Buffet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="form-control"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Food/Service">Food & Beverage</option>
                <option value="Laundry">Laundry</option>
                <option value="Extra Bed">Extra Bed / Amenities</option>
                <option value="Transport">Transport / Taxi</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              <Plus size={16} />
              <span>{loading ? 'Adding...' : 'Add Charge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
