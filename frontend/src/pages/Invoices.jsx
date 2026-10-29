import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import PrintableBill from '../components/PrintableBill';
import InvoiceFormModal from '../components/InvoiceFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  FileText,
  Search,
  Printer,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Receipt,
  IndianRupee,
  Clock,
  Building,
} from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [paymentStatus, setPaymentStatus] = useState('All');

  // Modals state
  const [viewInvoice, setViewInvoice] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Notification / Toast
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [iData, sData, rData] = await Promise.all([
        api.getInvoices(),
        api.getSettings(),
        api.getRooms(),
      ]);
      setInvoices(iData);
      setSettings(sData);
      setRooms(rData);
    } catch (err) {
      console.error('Failed to load invoices:', err);
      showNotification('Failed to load archive data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered list
  const filteredInvoices = invoices.filter((inv) => {
    if (paymentMethod !== 'All' && inv.payment_method?.toLowerCase() !== paymentMethod.toLowerCase()) {
      return false;
    }
    if (paymentStatus !== 'All' && inv.payment_status?.toLowerCase() !== paymentStatus.toLowerCase()) {
      return false;
    }
    if (search) {
      const s = search.toLowerCase().trim();
      return (
        inv.invoice_number?.toLowerCase().includes(s) ||
        inv.guest?.name?.toLowerCase().includes(s) ||
        inv.guest?.phone?.includes(s) ||
        inv.room_number?.toString().includes(s)
      );
    }
    return true;
  });

  // Calculate quick archive stats
  const totalInvoicesCount = invoices.length;
  const totalRevenue = invoices.reduce((acc, curr) => acc + (parseFloat(curr.grand_total) || 0), 0);
  const totalTax = invoices.reduce((acc, curr) => acc + (parseFloat(curr.total_tax) || 0), 0);
  const pendingCount = invoices.filter(
    (inv) => inv.payment_status && inv.payment_status.toLowerCase() !== 'paid'
  ).length;

  // Open Create Form
  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingInvoice(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (inv) => {
    setFormMode('edit');
    setEditingInvoice(inv);
    setIsFormModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (inv) => {
    setDeletingInvoice(inv);
    setIsDeleteModalOpen(true);
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (arg1, arg2) => {
    setActionLoading(true);
    try {
      if (formMode === 'edit') {
        const invoiceId = arg1;
        const updateData = arg2;
        const updated = await api.updateInvoice(invoiceId, updateData);
        setInvoices((prev) => prev.map((item) => (item.id === invoiceId ? updated : item)));
        setIsFormModalOpen(false);
        showNotification(`Invoice #${updated.invoice_number} successfully updated!`, 'success');
      } else {
        const createData = arg1;
        const created = await api.createInvoice(createData);
        setInvoices((prev) => [created, ...prev]);
        setIsFormModalOpen(false);
        showNotification(`New Bill & Invoice #${created.invoice_number} created successfully!`, 'success');
      }
    } catch (err) {
      console.error('Invoice action failed:', err);
      showNotification(err.message || 'Action failed. Please verify input data.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async (id) => {
    setActionLoading(true);
    try {
      await api.deleteInvoice(id);
      setInvoices((prev) => prev.filter((item) => item.id !== id));
      setIsDeleteModalOpen(false);
      showNotification('Invoice record deleted successfully from archive.', 'success');
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      showNotification(err.message || 'Failed to delete invoice.', 'error');
    } finally {
      setActionLoading(false);
      setDeletingInvoice(null);
    }
  };

  return (
    <div>
      {/* Archive Header and List (Hidden during print) */}
      <div className="no-print">
        {/* Toast / Notification Banner */}
        {notification && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              background:
                notification.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${notification.type === 'error' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                }`,
              color: notification.type === 'error' ? 'var(--status-occupied)' : 'var(--status-available)',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Top Header & Action Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0 }}>Bills & Invoices Archive</h2>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Comprehensive GST billing records with Add, Edit, View & Reprint, and Safe Deletion
            </span>
          </div>

          <div className="invoice-header-actions">
            <button
              className="btn btn-primary invoice-create-btn"
              onClick={handleOpenCreate}
            >
              <Plus size={17} strokeWidth={2.4} />
              <span>Create Bill / Invoice</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="metric-cards-container" style={{ marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Total Invoices
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {totalInvoicesCount}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Receipt size={22} />
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Total Revenue Billed
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--status-available)' }}>
                  ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--status-available)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IndianRupee size={22} />
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  GST Tax Collected
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--primary)' }}>
                  ₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(124, 58, 237, 0.15)',
                  color: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building size={22} />
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Pending Settlements
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginTop: '0.2rem',
                    color: pendingCount > 0 ? 'var(--status-cleaning)' : 'var(--text-muted)',
                  }}
                >
                  {pendingCount} Bills
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--status-cleaning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-card" style={{ padding: '0.9rem 1rem', marginBottom: '1.25rem' }}>
          <div className="invoices-filter-row">
            <div className="invoices-search-wrapper">
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.4rem', paddingRight: search ? '2rem' : '0.85rem' }}
                placeholder="Search invoice #, guest, phone, room..."
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

            <div className="invoices-filter-dropdowns">
              <select
                className="form-control"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="All">All Modes</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>

              <select
                className="form-control"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <Sparkles className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
            <span>Loading bills and invoices archive...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <Receipt size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No bills or invoices found</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
              {search || paymentMethod !== 'All' || paymentStatus !== 'All'
                ? 'No invoices match your current search filters. Try clearing search terms.'
                : 'Create your first invoice manually or complete a guest check-out to generate bills.'}
            </p>
            <button className="btn btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} strokeWidth={2.4} />
              <span>Create New Bill / Invoice</span>
            </button>
          </div>
        ) : (
          <div className="invoices-content-container">
            {/* Desktop Table View */}
            <div className="glass-card Invoices_Archive desktop-invoices-table">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Guest Information</th>
                    <th>Room</th>
                    <th>Stay Duration</th>
                    <th>Subtotal & GST</th>
                    <th>Grand Total</th>
                    <th>Payment</th>
                    <th style={{ textAlign: 'center', minWidth: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const isPaid = (inv.payment_status || 'Paid').toLowerCase() === 'paid';
                    return (
                      <tr key={inv.id}>
                        <td>
                          <strong style={{ color: 'var(--primary)' }}>#{inv.invoice_number}</strong>
                        </td>
                        <td style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {inv.created_at}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{inv.guest?.name || 'Walk-in Guest'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {inv.guest?.phone || 'No phone'}
                            {inv.guest?.id_number ? ` • ${inv.guest?.id_type}` : ''}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-available">Room {inv.room_number}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {inv.room_category}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{inv.stay_days} Night(s)</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            @ ₹{inv.rate_per_day}/day
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>Gross: ₹{inv.subtotal}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Incl. GST: ₹{inv.total_tax}
                          </div>
                        </td>
                        <td>
                          <strong style={{ fontSize: '1rem', color: 'var(--status-available)' }}>
                            ₹{inv.grand_total}
                          </strong>
                          {inv.advance_paid > 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Adv: ₹{inv.advance_paid}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                display: 'inline-block',
                                textAlign: 'center',
                                background: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: isPaid ? 'var(--status-available)' : 'var(--status-cleaning)',
                                fontWeight: 600,
                              }}
                            >
                              {inv.payment_status || 'Paid'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              via {inv.payment_method || 'Cash'}
                            </span>
                          </div>
                        </td>
                        <td>
                          {/* Enhanced Modern Action Buttons */}
                          <div className="table-actions-group">
                            <button
                              type="button"
                              className="table-action-btn action-view"
                              title="View and Print Invoice"
                              onClick={() => setViewInvoice(inv)}
                            >
                              <Printer size={13} />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              className="table-action-btn action-edit"
                              title="Edit Invoice Details"
                              onClick={() => handleOpenEdit(inv)}
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              className="table-action-btn action-delete"
                              title="Delete Invoice Archive"
                              onClick={() => handleOpenDelete(inv)}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Native Invoice Cards */}
            <div className="mobile-invoice-cards">
              {filteredInvoices.map((inv) => {
                const isPaid = (inv.payment_status || 'Paid').toLowerCase() === 'paid';
                return (
                  <div key={inv.id} className="mobile-invoice-card">
                    {/* Header Row: Left Icon + (Number on top, Date on bottom), Right Status Pill */}
                    <div className="mobile-inv-header">
                      <div className="mobile-inv-title-group">
                        <div className="mobile-inv-icon-box">
                          <Receipt size={18} strokeWidth={2.2} />
                        </div>
                        <div className="mobile-inv-meta">
                          <span className="mobile-inv-number">#{inv.invoice_number}</span>
                          <span className="mobile-inv-date">
                            <Clock size={11} /> {inv.created_at}
                          </span>
                        </div>
                      </div>

                      <div className="mobile-inv-status-group">
                        <span className={`mobile-inv-status ${isPaid ? 'paid' : 'pending'}`}>
                          {inv.payment_status || 'Paid'}
                        </span>
                        <span className="mobile-inv-method">
                          via {inv.payment_method || 'Cash'}
                        </span>
                      </div>
                    </div>

                    {/* Guest & Room Details */}
                    <div className="mobile-inv-body">
                      <div className="mobile-inv-guest">
                        <span className="guest-name">{inv.guest?.name || 'Walk-in Guest'}</span>
                        <span className="guest-phone">
                          {inv.guest?.phone ? `Ph: ${inv.guest.phone}` : 'No phone recorded'}
                          {inv.guest?.id_type ? ` • ${inv.guest.id_type}` : ''}
                        </span>
                      </div>
                      <div className="mobile-inv-room">
                        <span className="room-badge">Room {inv.room_number} • {inv.room_category}</span>
                        <span className="stay-duration">{inv.stay_days} Night(s) @ ₹{inv.rate_per_day}</span>
                      </div>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="mobile-inv-financials">
                      <div className="financials-left">
                        <div className="fin-line">
                          <span>Gross Tariff:</span>
                          <strong>₹{inv.subtotal}</strong>
                        </div>
                        <div className="fin-line">
                          <span>GST Tax:</span>
                          <strong>₹{inv.total_tax}</strong>
                        </div>
                        {inv.advance_paid > 0 && (
                          <div className="fin-line advance-paid">
                            <span>Advance Paid:</span>
                            <strong>-₹{inv.advance_paid}</strong>
                          </div>
                        )}
                      </div>
                      <div className="financials-right">
                        <span className="total-label">Grand Total</span>
                        <strong className="total-amount">₹{inv.grand_total}</strong>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="mobile-inv-actions">
                      <button
                        type="button"
                        className="mobile-action-btn action-view"
                        onClick={() => setViewInvoice(inv)}
                      >
                        <Printer size={15} />
                        <span>View & Print</span>
                      </button>

                      <button
                        type="button"
                        className="mobile-action-btn action-edit"
                        onClick={() => handleOpenEdit(inv)}
                      >
                        <Pencil size={15} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="mobile-action-btn action-delete"
                        onClick={() => handleOpenDelete(inv)}
                      >
                        <Trash2 size={15} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 1. VIEW / PRINT INVOICE MODAL */}
      {viewInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Invoice #{viewInvoice.invoice_number}
              </h3>
              <button className="close-btn" onClick={() => setViewInvoice(null)}>
                ✕
              </button>
            </div>
            <PrintableBill invoice={viewInvoice} settings={settings} />
          </div>
        </div>
      )}

      {/* 2. ADD & EDIT INVOICE MODAL */}
      <InvoiceFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        invoice={editingInvoice}
        rooms={rooms}
        settings={settings}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
      />

      {/* 3. DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        invoice={deletingInvoice}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingInvoice(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </div>
  );
}
