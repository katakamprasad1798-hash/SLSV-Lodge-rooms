import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, PlusCircle, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onToggleSidebar }) {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="navbar no-print">
      <div className="navbar-brand-group">
        <button
          className="mobile-menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>
        <h3 className="navbar-title">
          <span>Lodge Management</span>
          <span className="navbar-title-suffix"> Portal</span>
        </h3>
      </div>

      <div className="navbar-actions">
        <div className="navbar-clock">
          <Clock size={16} color="var(--primary)" />
          <span>{formattedDate} • <strong>{formattedTime}</strong></span>
        </div>

        <ThemeToggle />

        <button className="btn btn-primary btn-sm navbar-quick-btn" onClick={() => navigate('/checkin')}>
          <PlusCircle size={16} />
          <span>Quick Check-In</span>
        </button>
      </div>
    </header>
  );
}
