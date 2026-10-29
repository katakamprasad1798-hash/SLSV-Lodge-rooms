import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AddServiceModal from '../components/AddServiceModal';
import CheckOutModal from '../components/CheckOutModal';
import PrintableBill from '../components/PrintableBill';
import { Users, Plus, CheckCircle, Search, Sparkles, Utensils } from 'lucide-react';

export default function ActiveStays() {
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedBookingForService, setSelectedBookingForService] = useState(null);
  const [selectedBookingForCheckout, setSelectedBookingForCheckout] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  const loadActiveStays = async () => {
    try {
      setLoading(true);
      const [bData, setRes] = await Promise.all([
        api.getBookings('Active'),
        api.getSettings(),
      ]);
      setBookings(bData);
      setSettings(setRes);
    } catch (err) {
      console.error('Failed to load active stays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveStays();
  }, []);

  const handleAddService = async (bookingId, title, amount, category) => {
    await api.addServiceCharge(bookingId, title, amount, category);
    loadActiveStays();
  };

  const handleConfirmCheckout = async (bookingId, checkoutData) => {
    const invoice = await api.checkOut(bookingId, checkoutData);
    setSelectedBookingForCheckout(null);
    setGeneratedInvoice(invoice);
    loadActiveStays();
  };

  const filteredBookings = bookings.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      b.guest?.name?.toLowerCase().includes(s) ||
      b.guest?.phone?.includes(s) ||
      b.room_number?.includes(s) ||
      b.booking_number?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <div className="no-print">
        <div className="page-header-responsive" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Active Guest Stays</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Manage currently checked-in guests, add room services, and process check-outs
            </span>
          </div>

          <div className="header-search-wrapper">
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.2rem', paddingRight: search ? '2rem' : '0.85rem' }}
              placeholder="Search name, phone, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="room-input-clear"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <Sparkles className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
            <span>Loading active stays...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No active guest stays found.</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Use the "New Check-In" page to register guests.</p>
          </div>
        ) : (
          <div className="active-stays-grid">
            {filteredBookings.map((b) => {
              const serviceTotal = (b.services || []).reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
              return (
                <div key={b.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span className="badge badge-occupied" style={{ marginBottom: '0.35rem' }}>
                          Room {b.room_number} ({b.room_category})
                        </span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{b.guest?.name}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ph: {b.guest?.phone}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Booking No</span>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{b.booking_number}</div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Check-In Date:</span>
                        <strong>{b.check_in}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Daily Rate:</span>
                        <span>₹{b.rate_per_day} / night</span>
                      </div>
                      {b.extra_bed_count > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Extra Beds:</span>
                          <span>{b.extra_bed_count} (₹{b.extra_bed_rate}/night)</span>
                        </div>
                      )}
                      {b.advance_paid > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-available)' }}>
                          <span>Advance Paid:</span>
                          <strong>₹{b.advance_paid}</strong>
                        </div>
                      )}
                    </div>

                    {/* Services Summary */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Utensils size={14} /> Add-on Room Services ({b.services ? b.services.length : 0})
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--status-available)' }}>₹{serviceTotal}</strong>
                      </div>

                      {b.services && b.services.length > 0 ? (
                        <div style={{ maxHeight: '90px', overflowY: 'auto', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '0.4rem' }}>
                          {b.services.map((s, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.2rem 0.35rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <span>{s.title}</span>
                              <span style={{ fontWeight: 600 }}>₹{s.amount}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No extra room services added yet.</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => setSelectedBookingForService(b)}
                    >
                      + Add Charge
                    </button>

                    <button
                      className="btn btn-gold btn-sm"
                      style={{ flex: 1.2 }}
                      onClick={() => setSelectedBookingForCheckout(b)}
                    >
                      <CheckCircle size={14} /> Check-Out & Bill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
        {selectedBookingForService && (
          <AddServiceModal
            booking={selectedBookingForService}
            onClose={() => setSelectedBookingForService(null)}
            onAddService={handleAddService}
          />
        )}

        {selectedBookingForCheckout && (
          <CheckOutModal
            booking={selectedBookingForCheckout}
            settings={settings}
            onClose={() => setSelectedBookingForCheckout(null)}
            onConfirmCheckOut={handleConfirmCheckout}
          />
        )}
      </div>

      {generatedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-available)' }}>
                ✓ Check-Out Completed! Invoice Generated
              </h3>
              <button className="close-btn" onClick={() => setGeneratedInvoice(null)}>
                ✕
              </button>
            </div>
            <PrintableBill invoice={generatedInvoice} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
}
