import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, IndianRupee, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

function PaymentModal({ customer, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Please enter a valid amount'); return; }
    if (amt > customer.outstandingBalance) { setError(`Amount cannot exceed outstanding balance ₹${customer.outstandingBalance}`); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customer._id, amount: amt, date, notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.updatedBalance);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px 24px 0 0', padding: '28px 24px 36px',
        width: '100%', maxWidth: '600px', animation: 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)'
      }}>
        {/* Handle */}
        <div style={{ width: '40px', height: '4px', background: '#E2E8F0', borderRadius: '2px', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>{t('Record Payment')}</h3>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}>
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Customer Info */}
        <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: '14px', padding: '14px 16px', marginBottom: '20px' }}>
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#92400E' }}>{customer.name}</div>
          <div style={{ fontSize: '13px', color: '#B45309', marginTop: '2px' }}>{customer.customerNumber}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
            <AlertCircle size={16} color="#DC2626" />
            <span style={{ fontWeight: '800', fontSize: '18px', color: '#DC2626' }}>
              ₹{customer.outstandingBalance?.toFixed(2)}
            </span>
            <span style={{ color: '#64748B', fontSize: '13px' }}>{t('Outstanding Balance')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('Payment Amount')} (₹)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                <IndianRupee size={16} color="#64748B" />
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={customer.outstandingBalance}
                className="form-control"
                style={{ paddingLeft: '36px' }}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Max ₹${customer.outstandingBalance?.toFixed(2)}`}
                required
              />
            </div>
            {/* Quick amount buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              {[100, 200, 500, customer.outstandingBalance].filter(Boolean).map(amt => (
                <button key={amt} type="button"
                  onClick={() => setAmount(String(amt))}
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '4px 12px', fontSize: '13px', cursor: 'pointer', color: '#374151', fontWeight: '600' }}>
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('Payment Date')}
            </label>
            <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('Notes')} (optional)
            </label>
            <input type="text" className="form-control" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Cash payment" />
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn" disabled={loading} style={{ fontSize: '15px' }}>
            {loading ? 'Recording...' : `✓ ${t('Record Payment')}`}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default PaymentModal;
