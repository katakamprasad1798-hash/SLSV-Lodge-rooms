import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please provide both email address and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      loginUser(res.user, res.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigureServer = () => {
    const current = api.getApiBase ? api.getApiBase() : (localStorage.getItem('slsv_custom_api_url') || 'https://equal-bears-kruger-identified.trycloudflare.com/api');
    const input = window.prompt(
      'Cloud Server Endpoint URL:\nEnter your 24/7 cloud server API URL (e.g. Render / Cloudflare / Cloud host):',
      current
    );
    if (input !== null) {
      if (input.trim()) {
        localStorage.setItem('slsv_custom_api_url', input.trim().replace(/\/$/, ''));
      } else {
        localStorage.removeItem('slsv_custom_api_url');
      }
      window.location.reload();
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <img
              src="/logo.png"
              alt="SLSV Lodge"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage rooms, bookings, and GST billing</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="auth-alert-error" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{error}</span>
            </div>
            {(error.includes('Cannot connect') || error.includes('fetch') || error.includes('backend') || error.includes('failed')) && (
              <button
                type="button"
                onClick={handleConfigureServer}
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: 'inherit',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ⚙️ Configure Server URL
              </button>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-control auth-input"
                placeholder="reception@lodge.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>
                Password
              </label>
            </div>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={18} />
              <input
                id="login-password"
                type="password"
                name="password"
                className="form-control auth-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-btn-loader">Verifying Credentials...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials helper */}
        <div className="auth-demo-box">
          <div className="auth-demo-title">
            <Sparkles size={14} color="var(--primary)" />
            <span>Quick Demo Credentials</span>
          </div>
          <div className="auth-demo-badges">
            <button
              type="button"
              className="auth-demo-badge-btn"
              onClick={() => handleQuickFill('admin@lodge.com', 'adminpassword123')}
            >
              <strong>Admin:</strong> admin@lodge.com
            </button>
          </div>
        </div>

        {/* Bottom Switch Link */}
        <div className="auth-footer-link">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="auth-accent-link">
            Create an Account
          </Link>
        </div>

        {/* Server IP Config for Mobile App */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleConfigureServer}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ⚙️ Server URL: {api.getApiBase ? api.getApiBase() : (localStorage.getItem('slsv_custom_api_url') || 'https://equal-bears-kruger-identified.trycloudflare.com/api')}
          </button>
        </div>
      </div>
    </div>
  );
}
