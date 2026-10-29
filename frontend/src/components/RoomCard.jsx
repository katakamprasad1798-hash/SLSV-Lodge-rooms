import React from 'react';
import {
  Bed,
  Snowflake,
  Wind,
  Wifi,
  Tv,
  Droplet,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Wrench,
  Users,
  UserPlus,
  SquarePen,
  Coffee,
  Sun
} from 'lucide-react';

export default function RoomCard({ room, onStatusChange, onEdit, onCheckIn, onViewStay }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <div className="room-badge-pill room-badge-available">
            <CheckCircle size={14} strokeWidth={2.2} />
            <span>Available</span>
          </div>
        );
      case 'Occupied':
        return (
          <div className="room-badge-pill room-badge-occupied">
            <AlertTriangle size={14} strokeWidth={2.2} />
            <span>Occupied</span>
          </div>
        );
      case 'Cleaning':
        return (
          <div className="room-badge-pill room-badge-cleaning">
            <Sparkles size={14} strokeWidth={2.2} />
            <span>Cleaning</span>
          </div>
        );
      case 'Maintenance':
        return (
          <div className="room-badge-pill room-badge-maintenance">
            <Wrench size={14} strokeWidth={2.2} />
            <span>Maintenance</span>
          </div>
        );
      default:
        return <div className="room-badge-pill">{status}</div>;
    }
  };

  const getAmenityIcon = (name) => {
    const s = (name || '').toLowerCase();
    if (s.includes('wifi') || s.includes('wi-fi') || s.includes('internet')) return <Wifi size={15} />;
    if (s.includes('tv') || s.includes('television')) return <Tv size={15} />;
    if (s.includes('geyser') || s.includes('water') || s.includes('heater') || s.includes('shower')) return <Droplet size={15} />;
    if (s.includes('ac') || s.includes('cool') || s.includes('air')) return <Wind size={15} />;
    if (s.includes('coffee') || s.includes('tea') || s.includes('kettle')) return <Coffee size={15} />;
    if (s.includes('balcony') || s.includes('terrace') || s.includes('view')) return <Sun size={15} />;
    return <Sparkles size={15} />;
  };

  const formatRate = (rate) => {
    const num = Number(rate);
    return isNaN(num) ? rate : num.toLocaleString('en-IN');
  };

  return (
    <div className="room-card">
      <div>
        {/* Top Header */}
        <div className="room-card-header">
          <div className="room-card-title-group">
            <div className="room-icon-box">
              <Bed size={22} strokeWidth={2} />
            </div>
            <div>
              <div className="room-number-heading">Room {room.room_number}</div>
              <div className="room-floor-label">Floor {room.floor}</div>
            </div>
          </div>
          {getStatusBadge(room.status)}
        </div>

        {/* Specs Row */}
        <div className="room-specs-row">
          <div className="room-spec-item">
            <Bed size={16} />
            <span>{room.category} ({room.bed_count} Bed)</span>
          </div>
          <div className="room-spec-item">
            {room.ac_type === 'Non-AC' ? (
              <Snowflake size={16} />
            ) : (
              <Wind size={16} />
            )}
            <span>{room.ac_type}</span>
          </div>
        </div>

        {/* Rate Box */}
        <div className="room-rate-box">
          <div>
            <div className="rate-label">Daily rate</div>
            <div className="rate-daily-val">
              <span>₹{formatRate(room.rate_per_day)}</span>
              <span className="rate-unit">/ night</span>
            </div>
          </div>
          <div>
            <div className="rate-label" style={{ textAlign: 'right' }}>Extra bed</div>
            <div className="rate-extra-val">
              ₹{formatRate(room.extra_bed_rate || 0)}
            </div>
          </div>
        </div>

        {/* Amenities Row */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="room-amenities-row">
            {room.amenities.map((amenity, idx) => (
              <div key={idx} className="room-amenity-item">
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="room-actions-row">
        {room.status === 'Available' && (
          <button
            className="room-btn-action room-btn-action-available"
            onClick={() => onCheckIn(room)}
          >
            <UserPlus size={16} strokeWidth={2.2} />
            <span>Book / Check-In</span>
          </button>
        )}

        {room.status === 'Occupied' && (
          <button
            className="room-btn-action room-btn-action-occupied"
            title="View Active Stay"
            onClick={() => onViewStay && onViewStay(room)}
          >
            <Users size={16} strokeWidth={2.2} />
            <span>Manage Stay</span>
          </button>
        )}

        {room.status === 'Cleaning' && (
          <button
            className="room-btn-action room-btn-action-cleaning"
            onClick={() => onStatusChange(room.id, 'Available')}
          >
            <Sparkles size={16} strokeWidth={2.2} />
            <span>Mark Ready</span>
          </button>
        )}

        {room.status === 'Maintenance' && (
          <button
            className="room-btn-action room-btn-action-maintenance"
            onClick={() => onStatusChange(room.id, 'Available')}
          >
            <Wrench size={16} strokeWidth={2.2} />
            <span>Mark Available</span>
          </button>
        )}

        <button
          className="room-btn-edit"
          title="Edit Room"
          onClick={() => onEdit(room)}
        >
          <SquarePen size={16} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

