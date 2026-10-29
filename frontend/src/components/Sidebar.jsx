import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  UserCheck,
  Users,
  FileText,
  Settings,
  Hotel,
  X,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logoutUser, isAuthenticated } = useAuth();

  const handleLogout = () => {
    if (onClose) onClose();
    logoutUser();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-backdrop no-print"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar no-print ${isOpen ? 'sidebar-open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem 1.5rem 0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src="/logo.png"
              alt="SLSV Logo"
              style={{
                width: '46px',
                height: '46px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '2px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              }}
            />
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2 }}>SLSV Lodge</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Service Rooms & Billing</span>
            </div>
          </div>
          <button
            className="mobile-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close Navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <NavLink to="/" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/rooms" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BedDouble size={20} />
            <span>Room Management</span>
          </NavLink>

          <NavLink to="/checkin" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserCheck size={20} />
            <span>New Check-In</span>
          </NavLink>

          <NavLink to="/active-stays" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Active Stays</span>
          </NavLink>

          <NavLink to="/invoices" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Bills & Invoices</span>
          </NavLink>

          <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Lodge Settings</span>
          </NavLink>
        </nav>

        {/* User Account & Logout in Sidebar */}
        {isAuthenticated && user && (
          <div style={{
            padding: '0.75rem',
            background: 'var(--bg-subtle)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginTop: '1rem',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={18} />
              </div>
              <div style={{ overflow: 'hidden', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-danger btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
              title="Sign Out of Lodge"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}

        <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>System Database</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-available)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-available)', display: 'inline-block' }}></span>
            Google Firebase Firestore
          </div>
        </div>
      </aside>
    </>
  );
}
