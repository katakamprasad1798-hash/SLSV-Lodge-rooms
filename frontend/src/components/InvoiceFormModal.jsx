import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Calendar, User, Home, CreditCard, ShieldCheck } from 'lucide-react';

export default function InvoiceFormModal({
  isOpen,
  mode = 'create',
  invoice = null,
  rooms = [],
  settings = null,
  onClose,
  onSubmit,
  loading = false,
}) {
  const isEdit = mode === 'edit';

  const defaultCheckIn = () => {
    const d = new Date();
    return d.toISOString().slice(0, 16).replace('T', ' ');
  };

  const defaultCheckOut = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16).replace('T', ' ');
  };

  const [formData, setFormData] = useState({
    invoice_number: '',
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    guest_id_type: 'Aadhaar',
    guest_id_number: '',
    guest_address: '',
    room_number: '',
    room_category: 'Standard',
    check_in: defaultCheckIn(),
    check_out: defaultCheckOut(),
    stay_days: 1,
    rate_per_day: 1200,
    extra_bed_charges: 0,
    discount_amount: 0,
    advance_paid: 0,
    payment_method: 'Cash',
    payment_status: 'Paid',
    services_summary: [],
  });

  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceAmount, setServiceAmount] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Food');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && invoice) {
      setFormData({
        invoice_number: invoice.invoice_number || '',
        guest_name: invoice.guest?.name || '',
        guest_phone: invoice.guest?.phone || '',
        guest_email: invoice.guest?.email || '',
        guest_id_type: invoice.guest?.id_type || 'Aadhaar',
        guest_id_number: invoice.guest?.id_number || '',
        guest_address: invoice.guest?.address || '',
        room_number: invoice.room_number || '',
        room_category: invoice.room_category || 'Standard',
        check_in: invoice.check_in || defaultCheckIn(),
        check_out: invoice.check_out || defaultCheckOut(),
        stay_days: invoice.stay_days || 1,
        rate_per_day: invoice.rate_per_day || 0,
        extra_bed_charges: invoice.extra_bed_charges || 0,
        discount_amount: invoice.discount_amount || 0,
        advance_paid: invoice.advance_paid || 0,
        payment_method: invoice.payment_method || 'Cash',
        payment_status: invoice.payment_status || 'Paid',
        services_summary: invoice.services_summary ? [...invoice.services_summary] : [],
      });
    } else if (!isEdit) {
      // Pick first room if available
      const firstRoom = rooms && rooms.length > 0 ? rooms[0] : null;
      setFormData({
        invoice_number: '',
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        guest_id_type: 'Aadhaar',
        guest_id_number: '',
        guest_address: '',
        room_number: firstRoom ? firstRoom.room_number : '101',
        room_category: firstRoom ? firstRoom.category : 'Standard',
        check_in: defaultCheckIn(),
        check_out: defaultCheckOut(),
        stay_days: 1,
        rate_per_day: firstRoom ? firstRoom.rate_per_day : 1200,
        extra_bed_charges: 0,
        discount_amount: 0,
        advance_paid: 0,
        payment_method: 'Cash',
        payment_status: 'Paid',
        services_summary: [],
      });
    }
    setError('');
  }, [isOpen, isEdit, invoice, rooms]);

  if (!isOpen) return null;

  // Handle room selection change
  const handleRoomSelect = (e) => {
    const selectedNum = e.target.value;
    const found = rooms.find((r) => r.room_number === selectedNum);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        room_number: found.room_number,
        room_category: found.category,
        rate_per_day: found.rate_per_day,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        room_number: selectedNum,
      }));
    }
  };

  // Service item addition
  const handleAddService = () => {
    if (!serviceTitle.trim()) {
      setError('Please enter a service or item description.');
      return;
    }
    const amt = parseFloat(serviceAmount);
    if (isNaN(amt) || amt < 0) {
      setError('Please enter a valid non-negative amount for the service.');
      return;
    }
    setError('');
    const newService = {
      id: 'srv_' + Date.now().toString(36),
      title: serviceTitle.trim(),
      amount: amt,
      category: serviceCategory,
      created_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setFormData((prev) => ({
      ...prev,
      services_summary: [...prev.services_summary, newService],
    }));
    setServiceTitle('');
    setServiceAmount('');
  };

  const handleRemoveService = (idx) => {
    setFormData((prev) => ({
      ...prev,
      services_summary: prev.services_summary.filter((_, i) => i !== idx),
    }));
  };

  // Calculations for live preview
  const stayDays = Math.max(1, parseInt(formData.stay_days, 10) || 1);
  const ratePerDay = Math.max(0, parseFloat(formData.rate_per_day) || 0);
  const baseRoomCharges = stayDays * ratePerDay;
  const extraBedCharges = Math.max(0, parseFloat(formData.extra_bed_charges) || 0);
  const serviceCharges = (formData.services_summary || []).reduce(
    (acc, s) => acc + (parseFloat(s.amount) || 0),
    0
  );
  const grossSubtotal = baseRoomCharges + extraBedCharges + serviceCharges;
  const subtotal = grossSubtotal;
  const discountAmount = Math.max(0, parseFloat(formData.discount_amount) || 0);

  const cgstRate = parseFloat(settings?.cgst_rate ?? 6.0);
  const sgstRate = parseFloat(settings?.sgst_rate ?? 6.0);
  const totalTaxRate = cgstRate + sgstRate;

  const taxableAmount = totalTaxRate > 0 ? grossSubtotal / (1 + totalTaxRate / 100) : grossSubtotal;
  const totalTax = grossSubtotal - taxableAmount;
  const cgstAmount = totalTaxRate > 0 ? (totalTax * (cgstRate / totalTaxRate)) : 0;
  const sgstAmount = totalTax - cgstAmount;

  const grandTotal = Math.max(0, grossSubtotal - discountAmount);
  const advancePaid = Math.max(0, parseFloat(formData.advance_paid) || 0);
  const netPayable = Math.max(0, grandTotal - advancePaid);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.guest_name.trim()) {
      setError('Guest Name is required.');
      return;
    }
    if (!formData.guest_phone.trim()) {
      setError('Guest Phone is required.');
      return;
    }
    if (!formData.room_number) {
      setError('Room Number is required.');
      return;
    }
    if (ratePerDay < 0) {
      setError('Room rate cannot be negative.');
      return;
    }

    const payload = {
      guest: {
        name: formData.guest_name.trim(),
        phone: formData.guest_phone.trim(),
        email: formData.guest_email.trim(),
        id_type: formData.guest_id_type,
        id_number: formData.guest_id_number.trim(),
        address: formData.guest_address.trim(),
      },
      room_number: String(formData.room_number).trim(),
      room_category: formData.room_category,
      check_in: formData.check_in,
      check_out: formData.check_out,
      stay_days: stayDays,
      rate_per_day: ratePerDay,
      extra_bed_charges: extraBedCharges,
      service_charges: serviceCharges,
      discount_amount: discountAmount,
      advance_paid: advancePaid,
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      services_summary: formData.services_summary,
    };

    if (isEdit && invoice) {
      onSubmit(invoice.id, payload);
    } else {
      onSubmit(payload);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1050 }}>
      <div className="modal-content invoice-form-modal-content">
        {/* Modal Header */}
        <div className="modal-header" style={{ paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: isEdit ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: isEdit ? 'var(--status-cleaning)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calculator size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {isEdit ? `Edit Invoice #${invoice?.invoice_number}` : 'Create New Bill & Invoice'}
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {isEdit ? 'Update guest details, charges, dates or payment status' : 'Generate an official GST compliant lodge invoice'}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scrollable">
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#f43f5e',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>{error}</span>
            </div>
          )}

          <form id="invoice-form" onSubmit={handleSubmit}>
            <div className="invoice-form-grid">
              {/* Left Column: Form Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Guest Details Section */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <User size={16} color="var(--primary)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Guest Information</h4>
                  </div>

                  <div className="invoice-modal-row-2col">
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Guest Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.guest_name}
                        onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. +91 9876543210"
                        value={formData.guest_phone}
                        onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="invoice-modal-row-2col">
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="guest@example.com"
                        value={formData.guest_email}
                        onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        ID Proof Type
                      </label>
                      <select
                        className="form-control"
                        value={formData.guest_id_type}
                        onChange={(e) => setFormData({ ...formData, guest_id_type: e.target.value })}
                      >
                        <option value="Aadhaar">Aadhaar Card</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                      </select>
                    </div>
                  </div>

                  <div className="invoice-modal-row-id">
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        ID Proof Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 1234-5678-9012"
                        value={formData.guest_id_number}
                        onChange={(e) => setFormData({ ...formData, guest_id_number: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Address / City
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Bangalore, Karnataka"
                        value={formData.guest_address}
                        onChange={(e) => setFormData({ ...formData, guest_address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Room & Stay Details Section */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <Home size={16} color="var(--primary)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Room & Stay Information</h4>
                  </div>

                  <div className="invoice-modal-row-2col">
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Room Number *
                      </label>
                      {rooms && rooms.length > 0 ? (
                        <select
                          className="form-control"
                          value={formData.room_number}
                          onChange={handleRoomSelect}
                        >
                          {rooms.map((r) => (
                            <option key={r.id} value={r.room_number}>
                              Room {r.room_number} ({r.category} - ₹{r.rate_per_day}/day)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          className="form-control"
                          placeholder="e.g. 101"
                          value={formData.room_number}
                          onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                        />
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Room Category
                      </label>
                      <select
                        className="form-control"
                        value={formData.room_category}
                        onChange={(e) => setFormData({ ...formData, room_category: e.target.value })}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Executive">Executive</option>
                        <option value="Suite">Suite</option>
                      </select>
                    </div>
                  </div>

                  <div className="invoice-modal-row-2col">
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Check-In Date & Time
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="YYYY-MM-DD HH:MM"
                        value={formData.check_in}
                        onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Check-Out Date & Time
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="YYYY-MM-DD HH:MM"
                        value={formData.check_out}
                        onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="invoice-modal-row-2col">
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Stay Duration (Nights) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-control"
                        value={formData.stay_days}
                        onChange={(e) => setFormData({ ...formData, stay_days: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Daily Tariff Rate (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        className="form-control"
                        value={formData.rate_per_day}
                        onChange={(e) => setFormData({ ...formData, rate_per_day: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Additional Services and Items */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} color="var(--primary)" />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Itemized Services & Extra Charges</h4>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Total Services: ₹{serviceCharges.toFixed(2)}
                    </span>
                  </div>

                  {/* Add service mini-form */}
                  <div className="services-add-grid">
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      placeholder="Service name (e.g. Lunch)"
                      value={serviceTitle}
                      onChange={(e) => setServiceTitle(e.target.value)}
                    />
                    <select
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                    >
                      <option value="Food">Food / Beverage</option>
                      <option value="Laundry">Laundry</option>
                      <option value="Extra Bed">Extra Bed</option>
                      <option value="Transport">Transport</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      placeholder="Amount (₹)"
                      value={serviceAmount}
                      onChange={(e) => setServiceAmount(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm services-add-btn"
                      onClick={handleAddService}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  {/* Service items list */}
                  {formData.services_summary.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '120px', overflowY: 'auto' }}>
                      {formData.services_summary.map((srv, idx) => (
                        <div
                          key={srv.id || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--bg-subtle-hover)',
                            padding: '0.4rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                          }}
                        >
                          <div>
                            <strong>{srv.title}</strong>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem', fontSize: '0.75rem' }}>
                              ({srv.category})
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <strong style={{ color: 'var(--primary)' }}>₹{srv.amount}</strong>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(idx)}
                              style={{ background: 'none', border: 'none', color: 'var(--status-occupied)', cursor: 'pointer', padding: 0 }}
                              title="Remove item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.25rem 0' }}>
                      No extra services added. Use the input row above if guest ordered food, laundry, etc.
                    </div>
                  )}

                  {/* Direct extra bed & discount charges */}
                  <div className="invoice-modal-row-2col" style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Extra Bed Direct Tariff (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.extra_bed_charges}
                        onChange={(e) => setFormData({ ...formData, extra_bed_charges: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Discount Allowed (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.discount_amount}
                        onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Payment & Settlement Section */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                    <CreditCard size={16} color="var(--primary)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Payment & Settlement</h4>
                  </div>

                  <div className="invoice-modal-row-3col">
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Advance Paid (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.advance_paid}
                        onChange={(e) => setFormData({ ...formData, advance_paid: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Payment Method
                      </label>
                      <select
                        className="form-control"
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Credit / Debit Card</option>
                        <option value="Net Banking">Net Banking</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Payment Status
                      </label>
                      <select
                        className="form-control"
                        value={formData.payment_status}
                        onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                      >
                        <option value="Paid">Paid (Settled)</option>
                        <option value="Pending">Pending (Unpaid)</option>
                        <option value="Partial">Partial</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Recalculated Bill Preview */}
              <div className="invoice-modal-summary-col">
                <div className="invoice-modal-summary-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
                    <ShieldCheck size={18} color="var(--status-available)" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>GST Bill Summary</h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Room Tariff ({stayDays} Nights @ ₹{ratePerDay}):</span>
                      <span>₹{baseRoomCharges.toFixed(2)}</span>
                    </div>

                    {extraBedCharges > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Extra Bed:</span>
                        <span>₹{extraBedCharges.toFixed(2)}</span>
                      </div>
                    )}

                    {serviceCharges > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Services ({formData.services_summary.length} items):</span>
                        <span>₹{serviceCharges.toFixed(2)}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', fontWeight: 600 }}>
                      <span>Gross Total (GST Inclusive):</span>
                      <span>₹{grossSubtotal.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Taxable Base Value:</span>
                      <span>₹{taxableAmount.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Includes CGST ({cgstRate}%):</span>
                      <span>₹{cgstAmount.toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Includes SGST ({sgstRate}%):</span>
                      <span>₹{sgstAmount.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f43f5e' }}>
                        <span>Discount Allowed:</span>
                        <span>- ₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: '0.2rem', fontSize: '1rem', fontWeight: 700 }}>
                      <span>Total Invoice Amount:</span>
                      <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</span>
                    </div>

                    {advancePaid > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-available)', fontSize: '0.85rem' }}>
                        <span>Less: Advance Paid:</span>
                        <span>- ₹{advancePaid.toFixed(2)}</span>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      marginTop: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--status-available)',
                    }}>
                      <span>Net Payable:</span>
                      <span>₹{netPayable.toFixed(2)}</span>
                    </div>

                    <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      Invoice totals and taxes are calculated according to current lodge tax settings (CGST: {cgstRate}%, SGST: {sgstRate}%).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-responsive">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="invoice-form"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span>Saving...</span>
            ) : isEdit ? (
              <span>Save & Update Invoice</span>
            ) : (
              <span>Generate & Save Invoice</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
