import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, Banknote, QrCode } from 'lucide-react';

export default function CheckOutModal({ booking, settings, onClose, onConfirmCheckOut }) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculations preview
  const ratePerDay = booking.rate_per_day || 0;
  // Estimate 1 day min
  const stayDays = 1; 
  const baseRoomCharges = ratePerDay * stayDays;
  const extraBedCharges = (booking.extra_bed_count || 0) * (booking.extra_bed_rate || 250) * stayDays;
  const serviceCharges = (booking.services || []).reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
  const grossSubtotal = baseRoomCharges + extraBedCharges + serviceCharges;
  const subtotal = grossSubtotal;
  const disc = parseFloat(discountAmount) || 0;

  const cgstRate = settings?.cgst_rate || 6.0;
  const sgstRate = settings?.sgst_rate || 6.0;
  const totalTaxRate = cgstRate + sgstRate;

  const taxable = totalTaxRate > 0 ? grossSubtotal / (1 + totalTaxRate / 100) : grossSubtotal;
  const totalTax = grossSubtotal - taxable;
  const cgst = totalTaxRate > 0 ? (totalTax * (cgstRate / totalTaxRate)) : 0;
  const sgst = totalTax - cgst;

  const grandTotal = Math.max(0, grossSubtotal - disc);
  const advance = booking.advance_paid || 0;
  const netPayable = Math.max(0, grandTotal - advance);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onConfirmCheckOut(booking.id, {
        payment_method: paymentMethod,
        discount_amount: parseFloat(discountAmount) || 0,
        notes,
      });
    } catch (err) {
      setError(err.message || 'Check-out failed.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Check-Out & Bill Generation</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Room {booking.room_number} • Guest: {booking.guest?.name}
            </span>
          </div>
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
          {/* Bill Calculation Breakdown */}
          <div style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Room Rate ({booking.room_category}):</span>
              <strong>₹{ratePerDay} / day</strong>
            </div>

            {extraBedCharges > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Extra Bed Charges:</span>
                <span>₹{extraBedCharges}</span>
              </div>
            )}

            {serviceCharges > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Room Services ({booking.services.length} items):</span>
                <span>₹{serviceCharges}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              <span>Gross Total (GST Inclusive):</span>
              <span>₹{grossSubtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <span>Taxable Base Value:</span>
              <span>₹{taxable.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Includes CGST ({cgstRate}%):</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Includes SGST ({sgstRate}%):</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Discount Allowed (₹):</span>
              <input
                type="number"
                min="0"
                className="form-control"
                style={{ width: '120px', padding: '0.35rem 0.6rem', textAlign: 'right' }}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </div>

            {advance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--status-available)', marginBottom: '0.25rem' }}>
                <span>Advance Paid:</span>
                <span>- ₹{advance.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-available)' }}>
              <span>Est. Net Payable:</span>
              <span>₹{netPayable.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          {/* Payment Method Selector */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>Select Payment Method</label>
            <div className="checkout-payment-methods">
              {['Cash', 'UPI', 'Card', 'Net Banking'].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`btn ${paymentMethod === m ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.82rem', padding: '0.5rem' }}
                  onClick={() => setPaymentMethod(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Check-Out Notes (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Key returned, guest satisfied"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer-responsive" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold" disabled={loading}>
              <CheckCircle size={18} />
              <span>{loading ? 'Processing Check-Out...' : 'Complete Check-Out & Generate Bill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
