import React from 'react';
import { Printer, CheckCircle } from 'lucide-react';

export default function PrintableBill({ invoice, settings }) {
  if (!invoice) return null;

  const lodge = settings || {
    lodge_name: 'Grand Horizon Lodge & Suites',
    tag_line: 'Premium Comfort & Hospitality',
    address: '123 Heritage Main Road, Station Circle',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    phone: '+91 98765 43210',
    email: 'contact@grandhorizonlodge.com',
    gstin: '29ABCDE1234F1Z5',
    terms_and_conditions: '1. Check-out time is 12:00 PM.\n2. Management is not responsible for valuables left in rooms.',
  };

  const handlePrint = () => {
    const billElement = document.getElementById('printable-bill-area');
    if (!billElement) {
      window.print();
      return;
    }

    // Create an invisible iframe for dedicated clean printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.setAttribute('title', 'Invoice Print Preview');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice #${invoice.invoice_number} - ${lodge.lodge_name}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 18mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #111827;
              background: #ffffff;
              padding: 10mm 8mm;
              line-height: 1.5;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .printable-bill-wrapper {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              padding: 5mm;
            }
            .bill-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 1.25rem;
              margin-bottom: 1.25rem;
            }
            .bill-title {
              color: #4f46e5;
              font-size: 1.65rem;
              font-weight: 700;
              margin-bottom: 0.25rem;
            }
            .bill-table {
              width: 100%;
              border-collapse: collapse;
              margin: 1.25rem 0;
            }
            .bill-table th {
              background: #f3f4f6;
              color: #374151;
              padding: 0.6rem 0.75rem;
              font-size: 0.85rem;
              text-align: left;
              border-bottom: 1px solid #d1d5db;
              font-weight: 600;
            }
            .bill-table td {
              padding: 0.6rem 0.75rem;
              font-size: 0.88rem;
              border-bottom: 1px solid #e5e7eb;
              color: #1f2937;
            }
            .bill-totals {
              width: 320px;
              margin-left: auto;
              border-top: 2px solid #e5e7eb;
              padding-top: 0.75rem;
            }
            .bill-total-row {
              display: flex;
              justify-content: space-between;
              padding: 0.3rem 0;
              font-size: 0.88rem;
            }
            .bill-grand-total {
              font-weight: 700;
              font-size: 1.1rem;
              color: #4f46e5;
              border-top: 1px solid #e5e7eb;
              padding-top: 0.4rem;
              margin-top: 0.4rem;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="printable-bill-wrapper">
            ${billElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print iframe error:', err);
        window.print();
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {}
      }, 2000);
    }, 250);
  };

  return (
    <div>
      {/* Print Trigger Button */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={18} />
          <span>Print / Export PDF Invoice</span>
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div id="printable-bill-area" className="printable-bill-wrapper">
        {/* Invoice Header */}
        <div className="bill-header" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src="/logo.png"
              alt="Lodge Logo"
              style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px' }}
            />
            <div>
              <h1 className="bill-title">{lodge.lodge_name}</h1>
              <div style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 500 }}>{lodge.tag_line}</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.4rem' }}>
                {lodge.address}, {lodge.city}, {lodge.state} - {lodge.pincode}<br />
                Ph: {lodge.phone} | Email: {lodge.email}<br />
                {lodge.gstin && <strong>GSTIN: {lodge.gstin}</strong>}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, display: 'inline-block', marginBottom: '0.5rem' }}>
              TAX INVOICE
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>#{invoice.invoice_number}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Date: {invoice.created_at}</div>
            <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
              Status: PAID ({invoice.payment_method})
            </div>
          </div>
        </div>

        {/* Guest & Stay Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>GUEST DETAILS</h4>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{invoice.guest?.name}</div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>Ph: {invoice.guest?.phone}</div>
            {invoice.guest?.id_number && (
              <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                ID: {invoice.guest?.id_type} - {invoice.guest?.id_number}
              </div>
            )}
            {invoice.guest?.address && (
              <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>Addr: {invoice.guest?.address}</div>
            )}
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>STAY DETAILS</h4>
            <div style={{ fontSize: '0.9rem', color: '#111827' }}>
              <strong>Room No:</strong> Room {invoice.room_number} ({invoice.room_category})
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}><strong>Check-In:</strong> {invoice.check_in}</div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}><strong>Check-Out:</strong> {invoice.check_out}</div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
              <strong>Duration:</strong> {invoice.stay_days} Day(s) @ ₹{invoice.rate_per_day} / night
            </div>
          </div>
        </div>

        {/* Particulars Table */}
        <table className="bill-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description / Particulars</th>
              <th style={{ textAlign: 'center' }}>Qty / Days</th>
              <th style={{ textAlign: 'right' }}>Rate (₹)</th>
              <th style={{ textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Room Charges (Room {invoice.room_number} - {invoice.room_category}) <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>(Incl. GST)</span></td>
              <td style={{ textAlign: 'center' }}>{invoice.stay_days} Night(s)</td>
              <td style={{ textAlign: 'right' }}>₹{invoice.rate_per_day}</td>
              <td style={{ textAlign: 'right' }}>₹{invoice.base_room_charges}</td>
            </tr>

            {invoice.extra_bed_charges > 0 && (
              <tr>
                <td>2</td>
                <td>Extra Bed Charges</td>
                <td style={{ textAlign: 'center' }}>{invoice.stay_days} Night(s)</td>
                <td style={{ textAlign: 'right' }}>-</td>
                <td style={{ textAlign: 'right' }}>₹{invoice.extra_bed_charges}</td>
              </tr>
            )}

            {invoice.services_summary && invoice.services_summary.map((srv, idx) => (
              <tr key={srv.id || idx}>
                <td>{idx + (invoice.extra_bed_charges > 0 ? 3 : 2)}</td>
                <td>{srv.title} ({srv.category})</td>
                <td style={{ textAlign: 'center' }}>1</td>
                <td style={{ textAlign: 'right' }}>₹{srv.amount}</td>
                <td style={{ textAlign: 'right' }}>₹{srv.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invoice Summary & Tax Calculation */}
        <div className="bill-totals">
          <div className="bill-total-row">
            <span>Gross Total (GST Inclusive):</span>
            <span>₹{invoice.subtotal}</span>
          </div>

          <div className="bill-total-row" style={{ color: '#4b5563', fontSize: '0.85rem' }}>
            <span>Taxable Base Value:</span>
            <span>₹{invoice.taxable_amount}</span>
          </div>

          <div className="bill-total-row" style={{ color: '#4b5563', fontSize: '0.85rem' }}>
            <span>Includes CGST ({invoice.cgst_rate}%):</span>
            <span>₹{invoice.cgst_amount}</span>
          </div>

          <div className="bill-total-row" style={{ color: '#4b5563', fontSize: '0.85rem' }}>
            <span>Includes SGST ({invoice.sgst_rate}%):</span>
            <span>₹{invoice.sgst_amount}</span>
          </div>

          {invoice.discount_amount > 0 && (
            <div className="bill-total-row" style={{ color: '#dc2626' }}>
              <span>Less: Discount Allowed:</span>
              <span>- ₹{invoice.discount_amount}</span>
            </div>
          )}

          <div className="bill-total-row" style={{ fontWeight: 600 }}>
            <span>Total Invoice Amount:</span>
            <span>₹{invoice.grand_total}</span>
          </div>

          {invoice.advance_paid > 0 && (
            <div className="bill-total-row" style={{ color: '#059669' }}>
              <span>Less: Advance Paid:</span>
              <span>- ₹{invoice.advance_paid}</span>
            </div>
          )}

          <div className="bill-total-row bill-grand-total">
            <span>Net Payable Balance:</span>
            <span>₹{invoice.net_payable}</span>
          </div>
        </div>

        {/* Footer & Signature */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ maxWidth: '400px' }}>
            <h5 style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.25rem' }}>TERMS & CONDITIONS</h5>
            <p style={{ fontSize: '0.75rem', color: '#4b5563', whiteSpace: 'pre-line' }}>{lodge.terms_and_conditions}</p>
          </div>

          <div style={{ textAlign: 'center', minWidth: '180px' }}>
            <div style={{ height: '40px', borderBottom: '1px solid #9ca3af', marginBottom: '0.35rem' }}></div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Authorized Signatory</div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>For {lodge.lodge_name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
