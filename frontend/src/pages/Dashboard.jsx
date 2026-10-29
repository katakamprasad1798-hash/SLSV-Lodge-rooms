import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';
import RoomCard from '../components/RoomCard';
import AddServiceModal from '../components/AddServiceModal';
import CheckOutModal from '../components/CheckOutModal';
import PrintableBill from '../components/PrintableBill';
import {
  BedDouble,
  CheckCircle,
  AlertTriangle,
  Users,
  IndianRupee,
  Plus,
  Sparkles,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Phone,
  Calendar,
  Utensils
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tabs UI: 'rooms' = Rooms, 'stays' = Active Stays
  const [activeTab, setActiveTab] = useState('rooms');

  // Filters within tabs
  const [roomFilter, setRoomFilter] = useState('All');
  const [staySearch, setStaySearch] = useState('');

  // Modals state
  const [selectedBookingForService, setSelectedBookingForService] = useState(null);
  const [selectedBookingForCheckout, setSelectedBookingForCheckout] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [sData, rData, bData, setRes] = await Promise.all([
        api.getStats(),
        api.getRooms(),
        api.getBookings('Active'),
        api.getSettings(),
      ]);
      setStats(sData);
      setRooms(rData);
      setActiveBookings(bData);
      setSettings(setRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (roomId, status) => {
    try {
      await api.updateRoomStatus(roomId, status);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update room status');
    }
  };

  const handleAddService = async (bookingId, title, amount, category) => {
    await api.addServiceCharge(bookingId, title, amount, category);
    loadData();
  };

  const handleConfirmCheckout = async (bookingId, checkoutData) => {
    const res = await api.checkOut(bookingId, checkoutData);
    setSelectedBookingForCheckout(null);
    setGeneratedInvoice(res.invoice || res);
    loadData();
  };

  // Filtered rooms based on status pill
  const filteredRooms = rooms.filter((r) => {
    if (roomFilter === 'All') return true;
    return (r.status || 'Available').toLowerCase() === roomFilter.toLowerCase();
  });

  // Filtered active stays based on search query
  const filteredBookings = activeBookings.filter((b) => {
    if (!staySearch.trim()) return true;
    const s = staySearch.toLowerCase().trim();
    return (
      (b.guest?.name || '').toLowerCase().includes(s) ||
      (b.guest?.phone || '').includes(s) ||
      (b.room_number || '').toString().includes(s) ||
      (b.booking_number || '').toLowerCase().includes(s)
    );
  });

  if (loading) {
    return (
      <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Sparkles className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
        <h3>Loading Lodge Dashboard...</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="no-print">
        {/* Top Executive Metrics Summary */}
        <div className="dashboard-metrics-grid" style={{ marginBottom: '1.75rem' }}>
          <MetricCard
            title="Total Rooms"
            value={stats?.total_rooms || 0}
            icon={BedDouble}
            color="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
            subtitle="Configured lodge rooms"
          />
          <MetricCard
            title="Available Rooms"
            value={stats?.available_rooms || 0}
            icon={CheckCircle}
            color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            subtitle="Ready for check-in"
          />
          <MetricCard
            title="Occupied Rooms"
            value={stats?.occupied_rooms || 0}
            icon={AlertTriangle}
            color="linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)"
            subtitle="Currently checked-in"
          />
          <MetricCard
            title="Active Stays"
            value={stats?.active_bookings || 0}
            icon={Users}
            color="linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
            subtitle="Guests currently staying"
          />
          <MetricCard
            title="Total Billed Revenue"
            value={`₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`}
            icon={IndianRupee}
            color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            subtitle="Total invoices generated"
          />
        </div>

        {/* Dashboard Tabs Switcher Header */}
        <div className="dashboard-tabs-wrapper">
          <div className="dashboard-tabs-container">
            <button
              type="button"
              className={`dashboard-tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('rooms')}
              title="View live room status grid"
            >
              <BedDouble size={17} />
              <span>Rooms</span>
              <span className="dashboard-tab-badge">{rooms.length}</span>
            </button>

            <button
              type="button"
              className={`dashboard-tab-btn ${activeTab === 'stays' ? 'active' : ''}`}
              onClick={() => setActiveTab('stays')}
              title="View current active guest stays"
            >
              <Users size={17} />
              <span>Active Stays</span>
              <span className="dashboard-tab-badge">{activeBookings.length}</span>
            </button>
          </div>

          <div>
            {activeTab === 'rooms' ? (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/rooms')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Manage All Rooms</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/checkin')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} strokeWidth={2.4} />
                <span>New Guest Check-In</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: Live Room Status Grid                                              */}
        {/* ========================================================================= */}
        {activeTab === 'rooms' && (
          <div>
            {/* Quick Filter Pills with Horizontal Smooth Scroll on Mobile */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div className="filter-pills-scroll" style={{ flex: '1 1 auto' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.25rem', flexShrink: 0 }}>
                  <SlidersHorizontal size={14} /> Filter:
                </span>
                {['All', 'Available', 'Occupied', 'Cleaning', 'Maintenance'].map((st) => {
                  const count =
                    st === 'All'
                      ? rooms.length
                      : rooms.filter((r) => (r.status || 'Available').toLowerCase() === st.toLowerCase()).length;
                  const isSel = roomFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRoomFilter(st)}
                      style={{
                        background: isSel ? 'var(--primary)' : 'var(--bg-subtle)',
                        color: isSel ? '#ffffff' : 'var(--text-secondary)',
                        border: '1px solid ' + (isSel ? 'var(--primary)' : 'var(--border-color)'),
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {st} ({count})
                    </button>
                  );
                })}
              </div>

              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                Showing {filteredRooms.length} of {rooms.length} Rooms
              </span>
            </div>

            {/* Room Cards Grid */}
            <div className="rooms-grid">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onStatusChange={handleStatusChange}
                  onEdit={() => navigate('/rooms')}
                  onCheckIn={(r) => navigate(`/checkin?room_id=${r.id}`)}
                  onViewStay={() => setActiveTab('stays')}
                />
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <BedDouble size={40} style={{ opacity: 0.4, margin: '0 auto 0.75rem auto' }} />
                <h4>No rooms match the "{roomFilter}" filter</h4>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => setRoomFilter('All')}
                >
                  Show All Rooms
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: Current Active Guest Stays                                         */}
        {/* ========================================================================= */}
        {activeTab === 'stays' && (
          <div>
            {/* Search and Action Bar */}
            <div
              className="glass-card"
              style={{
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto' }}>
                <Search
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Search guest name, phone, or room #..."
                  value={staySearch}
                  onChange={(e) => setStaySearch(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>{activeBookings.length}</strong> Guest(s) currently staying
              </div>
            </div>

            {/* Empty State */}
            {filteredBookings.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                <Users size={44} style={{ opacity: 0.35, margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {staySearch ? 'No active stays match your search' : 'No guests currently checked in'}
                </h4>
                <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1.25rem auto' }}>
                  {staySearch
                    ? 'Try clearing your search query to see all active guest stays.'
                    : 'Perform a Quick Check-In to assign a room to an incoming guest.'}
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/checkin')}>
                  <Plus size={16} strokeWidth={2.4} />
                  <span>New Guest Check-In</span>
                </button>
              </div>
            )}

            {/* Desktop Table View */}
            {filteredBookings.length > 0 && (
              <div className="glass-card table-responsive desktop-stays-table" style={{ padding: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Booking #</th>
                      <th>Guest Information</th>
                      <th>Room #</th>
                      <th>Check-In Time</th>
                      <th>Services Added</th>
                      <th style={{ textAlign: 'center', minWidth: '220px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => {
                      const totalServices = (b.services || []).reduce(
                        (acc, s) => acc + (parseFloat(s.amount) || 0),
                        0
                      );
                      return (
                        <tr key={b.id}>
                          <td>
                            <strong style={{ color: 'var(--primary)' }}>{b.booking_number}</strong>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{b.guest?.name || 'Walk-in Guest'}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {b.guest?.phone || 'No phone'}
                              {b.guest?.id_number ? ` • ${b.guest?.id_type}` : ''}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-occupied">Room {b.room_number}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {b.room_category} • ₹{b.rate_per_day}/day
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>{b.check_in}</div>
                            {b.expected_checkout && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Exp: {b.expected_checkout}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>₹{totalServices.toFixed(2)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {(b.services || []).length} item(s)
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setSelectedBookingForService(b)}
                                title="Add Food, Laundry or Extra Charges"
                              >
                                + Add Service
                              </button>
                              <button
                                className="btn btn-gold btn-sm"
                                onClick={() => setSelectedBookingForCheckout(b)}
                                title="Settle bill & check out guest"
                              >
                                Check-Out & Bill
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Touch Cards View (Shown on screens <= 640px) */}
            {filteredBookings.length > 0 && (
              <div className="mobile-stay-cards">
                {filteredBookings.map((b) => {
                  const totalServices = (b.services || []).reduce(
                    (acc, s) => acc + (parseFloat(s.amount) || 0),
                    0
                  );
                  return (
                    <div key={b.id} className="mobile-stay-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {b.guest?.name || 'Walk-in Guest'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                            <Phone size={13} color="var(--primary)" />
                            <span>{b.guest?.phone || 'No phone'}</span>
                          </div>
                        </div>

                        <span className="badge badge-occupied" style={{ fontSize: '0.85rem', padding: '0.25rem 0.65rem' }}>
                          Room {b.room_number}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-subtle)', padding: '0.65rem 0.75rem', borderRadius: '10px', fontSize: '0.78rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Tariff & Category</span>
                          <strong>{b.room_category} • ₹{b.rate_per_day}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>Services Extra</span>
                          <strong style={{ color: 'var(--primary)' }}>₹{totalServices.toFixed(2)}</strong>
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          <Calendar size={13} />
                          <span>In: {b.check_in}</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ justifyContent: 'center' }}
                          onClick={() => setSelectedBookingForService(b)}
                        >
                          <Utensils size={14} /> + Service
                        </button>
                        <button
                          type="button"
                          className="btn btn-gold btn-sm"
                          style={{ justifyContent: 'center' }}
                          onClick={() => setSelectedBookingForCheckout(b)}
                        >
                          Check-Out & Bill
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
