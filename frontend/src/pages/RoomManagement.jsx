import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import RoomCard from '../components/RoomCard';
import RoomModal from '../components/RoomModal';
import { Plus, Search, Filter, Sparkles } from 'lucide-react';

export default function RoomManagement() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await api.updateRoomStatus(roomId, newStatus);
      loadRooms();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleSaveRoom = async (payload, roomId) => {
    if (roomId) {
      await api.updateRoom(roomId, payload);
    } else {
      await api.createRoom(payload);
    }
    loadRooms();
  };

  const filteredRooms = rooms.filter((r) => {
    if (statusFilter !== 'All' && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (categoryFilter !== 'All' && r.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (search && !r.room_number.includes(search) && !r.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="room-page-header">
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Room Management</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Configure rooms, rates, amenities, and room status
          </span>
        </div>

        <button
          className="btn btn-primary room-add-btn"
          onClick={() => {
            setSelectedRoomForEdit(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="glass-card room-filter-card">
        {/* Horizontal Smooth Scrollable Status Chips with Counts */}
        <div className="filter-pills-scroll" style={{ marginBottom: '0.85rem' }}>
          {['All', 'Available', 'Occupied', 'Cleaning', 'Maintenance'].map((tab) => {
            const count =
              tab === 'All'
                ? rooms.length
                : rooms.filter((r) => (r.status || 'Available').toLowerCase() === tab.toLowerCase()).length;
            const isSel = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                className={`room-status-chip status-${tab.toLowerCase()} ${isSel ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab)}
              >
                <span>{tab}</span>
                <span className="chip-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Responsive Search & Category Row */}
        <div className="room-filter-inputs-grid">
          <div className="room-input-wrapper">
            <Search size={16} className="room-input-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search room # or category..."
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

          <div className="room-input-wrapper">
            <Filter size={15} className="room-input-icon" />
            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Executive">Executive</option>
              <option value="Suite">Suite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <Sparkles className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <span>Loading rooms list...</span>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No rooms match the selected criteria.</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Try resetting the filters or adding a new room.</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onStatusChange={handleStatusChange}
              onEdit={(r) => {
                setSelectedRoomForEdit(r);
                setIsModalOpen(true);
              }}
              onCheckIn={(r) => navigate(`/checkin?room_id=${r.id}`)}
              onViewStay={(r) => navigate('/active-stays')}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Room Modal */}
      {isModalOpen && (
        <RoomModal
          room={selectedRoomForEdit}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRoomForEdit(null);
          }}
          onSave={handleSaveRoom}
        />
      )}
    </div>
  );
}
