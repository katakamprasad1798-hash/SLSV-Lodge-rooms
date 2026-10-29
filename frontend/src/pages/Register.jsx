import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Shield, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Receptionist',
    password: '',
    confirm_password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      setSuccess('Account created successfully! Logging you in...');
      setTimeout(() => {
        loginUser(res.user, res.token);
        navigate('/');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsLoading(false);
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
          <h1 className="auth-title">Create Staff Account</h1>
          <p className="auth-subtitle">Register receptionist, manager or admin access</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="auth-alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Sign up form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              Full Name *
            </label>
            <div className="auth-input-wrapper">
              <User className="auth-input-icon" size={18} />
              <input
                id="reg-name"
                type="text"
                name="name"
                className="form-control auth-input"
                placeholder="Ramesh Kumar"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email Address *
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={18} />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className="form-control auth-input"
                  placeholder="ramesh@lodge.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                Phone Number
              </label>
              <div className="auth-input-wrapper">
                <Phone className="auth-input-icon" size={18} />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  className="form-control auth-input"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">
              Designation / Role *
            </label>
            <div className="auth-input-wrapper">
              <Shield className="auth-input-icon" size={18} />
              <select
                id="reg-role"
                name="role"
                className="form-control auth-input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Receptionist">Receptionist (Front Desk)</option>
                <option value="Manager">Manager</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password (min 8 chars) *
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  className="form-control auth-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm-password">
                Confirm Password *
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  id="reg-confirm-password"
                  type="password"
                  name="confirm_password"
                  className="form-control auth-input"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-btn-loader">Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Bottom Switch Link */}
        <div className="auth-footer-link">
          <span>Already registered? </span>
          <Link to="/login" className="auth-accent-link">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
