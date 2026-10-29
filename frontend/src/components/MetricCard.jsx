import React from 'react';

export default function MetricCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-primary)' }}>{value}</h2>
          {subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
        <div style={{
          background: color || 'var(--primary-gradient)',
          padding: '0.75rem',
          borderRadius: '12px',
          display: 'flex',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <Icon size={24} color="#ffffff" />
        </div>
      </div>
    </div>
  );
}
