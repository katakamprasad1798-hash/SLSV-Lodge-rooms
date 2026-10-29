import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings as SettingsIcon, Save, Database, ShieldCheck, Info, Sun } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    lodge_name: '',
    tag_line: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    gstin: '',
    cgst_rate: 6.0,
    sgst_rate: 6.0,
    check_out_time: '12:00 PM',
    terms_and_conditions: '',
  });

  const [isFirebaseActive, setIsFirebaseActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setFormData({
          lodge_name: data.lodge_name || '',
          tag_line: data.tag_line || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          phone: data.phone || '',
          email: data.email || '',
          gstin: data.gstin || '',
          cgst_rate: data.cgst_rate || 6.0,
          sgst_rate: data.sgst_rate || 6.0,
          check_out_time: data.check_out_time || '12:00 PM',
          terms_and_conditions: data.terms_and_conditions || '',
        });
        setIsFirebaseActive(data.is_firebase_active || false);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        ...formData,
        cgst_rate: parseFloat(formData.cgst_rate),
        sgst_rate: parseFloat(formData.sgst_rate),
      };
      await api.updateSettings(payload);
      setMessage({ type: 'success', text: 'Lodge settings saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Lodge Settings & Configuration</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Configure Lodge contact information, GST tax rules, and Google Firebase Database connection
        </span>
      </div>

      {message.text && (
        <div
          style={{
            background: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
            color: message.type === 'success' ? '#10b981' : '#f43f5e',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Database Connection Status Card */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', borderLeft: `4px solid ${isFirebaseActive ? '#10b981' : '#f59e0b'}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ background: isFirebaseActive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', padding: '0.75rem', borderRadius: '12px' }}>
            <Database size={24} color={isFirebaseActive ? '#10b981' : '#f59e0b'} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Google Firebase Firestore Status:{' '}
              <span style={{ color: isFirebaseActive ? '#10b981' : '#f59e0b' }}>
                {isFirebaseActive ? 'Active (Connected)' : 'Fallback Mode (Local Storage)'}
              </span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {isFirebaseActive
                ? 'Your Python FastAPI backend is connected to Google Cloud Firebase Firestore using admin credentials.'
                : 'Operating seamlessly with local JSON file storage. To connect your live Google Firebase Firestore project, place your service account file at: backend/firebase_credentials.json'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Theme Card */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-subtle-hover)', padding: '0.75rem', borderRadius: '12px' }}>
            <Sun size={22} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.15rem' }}>
              Portal Theme & Appearance
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Switch between Dark and Light mode preferences for the management interface
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Lodge Identity & Header Information */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
            1. Lodge Identity & Header Details
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Lodge / Hotel Name</label>
              <input
                type="text"
                name="lodge_name"
                className="form-control"
                value={formData.lodge_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tagline / Subtitle</label>
              <input
                type="text"
                name="tag_line"
                className="form-control"
                value={formData.tag_line}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Street Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                className="form-control"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* GST & Tax Configuration */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
            2. Tax Registration & GST Rules
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>GSTIN Number</label>
              <input
                type="text"
                name="gstin"
                className="form-control"
                placeholder="29ABCDE1234F1Z5"
                value={formData.gstin}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CGST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                name="cgst_rate"
                className="form-control"
                value={formData.cgst_rate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>SGST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                name="sgst_rate"
                className="form-control"
                value={formData.sgst_rate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bill Terms & Conditions (Appears on printed invoice footer)</label>
            <textarea
              rows="3"
              name="terms_and_conditions"
              className="form-control"
              value={formData.terms_and_conditions}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Saving Changes...' : 'Save Lodge Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
