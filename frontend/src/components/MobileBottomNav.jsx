import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BedDouble, UserCheck, Users, FileText } from 'lucide-react';

export default function MobileBottomNav({ isHidden = false }) {
  if (isHidden) return null;

  return (
    <nav className="mobile-bottom-nav no-print" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-bottom-tab ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/rooms"
        className={({ isActive }) => `mobile-bottom-tab ${isActive ? 'active' : ''}`}
      >
        <BedDouble size={20} />
        <span>Rooms</span>
      </NavLink>

      <NavLink
        to="/checkin"
        className={({ isActive }) => `mobile-bottom-tab tab-primary ${isActive ? 'active' : ''}`}
      >
        <div className="tab-primary-icon">
          <UserCheck size={20} />
        </div>
        <span>Check-In</span>
      </NavLink>

      <NavLink
        to="/active-stays"
        className={({ isActive }) => `mobile-bottom-tab ${isActive ? 'active' : ''}`}
      >
        <Users size={20} />
        <span>Stays</span>
      </NavLink>

      <NavLink
        to="/invoices"
        className={({ isActive }) => `mobile-bottom-tab ${isActive ? 'active' : ''}`}
      >
        <FileText size={20} />
        <span>Bills</span>
      </NavLink>
    </nav>
  );
}
