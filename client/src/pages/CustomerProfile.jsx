import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Phone, MapPin, Droplets, Edit2, IndianRupee, Clock, ShoppingBag, X, Check, User as UserIcon } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { API_URL } from '../config';
import { format } from 'date-fns';

const MILK_TYPE_OPTIONS = [
  { value: 'cow', label: 'Cow Milk', color: '#D97706', bg: '#FFFBEB' },
  { value: 'buffalo', label: 'Buffalo Milk', color: '#7C3AED', bg: '#F5F3FF' },
  { value: 'full_cream', label: 'Full Cream Milk', color: '#0891B2', bg: '#ECFEFF' },
];

const milkLabel = { full_cream: 'Full Cream', cow: 'Cow', buffalo: 'Buffalo' };
const milkColorMap = { full_cream: '#0891B2', cow: '#D97706', buffalo: '#7C3AED' };

function CustomerProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [distributors, setDistributors] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/customers/${id}`).then(r => r.json()),
      fetch(`${API_URL}/api/reports/customer-ledger/${id}`).then(r => r.json())
    ]).then(([cust, ledgerData]) => {
      setCustomer(cust);
      setLedger(ledgerData.ledger || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    fetch(`${API_URL}/api/distributors`).then(r => r.json()).then(setDistributors);
  }, []);

  const startEdit = () => {
    setEditForm({
      name: customer.name || '',
      primaryPhone: customer.primaryPhone || customer.phone || '',
      secondaryPhone: customer.secondaryPhone || '',
      address: customer.address || '',
      milkType: customer.milkType || 'cow',
      defaultQuantityLitres: customer.defaultQuantityLitres || 1,
      notes: customer.notes || '',
      assignedDistributorId: customer.assignedDistributorId?._id || customer.assignedDistributorId || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...editForm };
    if (!data.assignedDistributorId) delete data.assignedDistributorId;
    try {
      const res = await fetch(`${API_URL}/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setEditing(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handlePaymentSuccess = (newBalance) => {
    setShowPayment(false);
    setCustomer(prev => ({ ...prev, outstandingBalance: newBalance }));
    fetchData(); // refresh ledger
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '80px' }}><div className="loader" /></div>;
  if (!customer) return <div style={{ textAlign: 'center', marginTop: '80px', color: 'var(--text-light)' }}>Customer not found.</div>;

  const mc = milkColorMap[customer.milkType] || '#D97706';

  return (
    <div>
      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)}
          style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', display: 'flex' }}>
          <ArrowLeft size={20} color="var(--text-color)" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-color)' }}>{customer.name}</h2>
            <span style={{ background: '#EFF6FF', color: '#1E40AF', fontSize: '12px', padding: '3px 10px', borderRadius: '10px', fontWeight: '700', fontFamily: 'monospace' }}>
              {customer.customerNumber}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span style={{
              background: customer.type === 'delivery' ? '#DBEAFE' : '#FEF3C7',
              color: customer.type === 'delivery' ? '#1E3A8A' : '#92400E',
              fontSize: '11px', padding: '2px 10px', borderRadius: '8px', fontWeight: '600', display: 'inline-block'
            }}>
              {customer.type === 'delivery' ? '🏠 Home Delivery' : '🏪 Shop Pickup'}
            </span>
            {customer.type === 'delivery' && customer.assignedDistributorId && (
              <span style={{
                background: '#F0FDF4', color: '#166534',
                fontSize: '11px', padding: '2px 10px', borderRadius: '8px', fontWeight: '600', display: 'inline-block'
              }}>
                🚴 {customer.assignedDistributorId.name || customer.assignedDistributorId}
              </span>
            )}
          </div>
        </div>
        {/* Edit button */}
        <button
          onClick={editing ? () => setEditing(false) : startEdit}
          style={{
            background: editing ? '#FEE2E2' : '#EFF6FF', border: 'none', borderRadius: '50%',
            padding: '10px', cursor: 'pointer', display: 'flex', flexShrink: 0
          }}
          title={editing ? 'Cancel Edit' : 'Edit Customer'}
        >
          {editing ? <X size={18} color="#DC2626" /> : <Edit2 size={18} color="var(--primary)" />}
        </button>
      </div>

      {/* Edit Panel */}
      {editing && (
        <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--primary)', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px' }}>✏️ Edit Customer Details</h3>

          <div className="form-group">
            <label>Name</label>
            <input className="form-control" value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Primary Phone</label>
              <input className="form-control" value={editForm.primaryPhone}
                onChange={e => setEditForm({ ...editForm, primaryPhone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Secondary Phone</label>
              <input className="form-control" value={editForm.secondaryPhone}
                onChange={e => setEditForm({ ...editForm, secondaryPhone: e.target.value })} />
            </div>
          </div>

          {customer.type === 'delivery' && (
            <div className="form-group">
              <label>Address</label>
              <input className="form-control" value={editForm.address}
                onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
            </div>
          )}

          <div className="form-group">
            <label>Milk Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {MILK_TYPE_OPTIONS.map(opt => (
                <div key={opt.value}
                  onClick={() => setEditForm({ ...editForm, milkType: opt.value })}
                  style={{
                    border: `2px solid ${editForm.milkType === opt.value ? opt.color : 'var(--border)'}`,
                    borderRadius: '10px', padding: '10px 6px', cursor: 'pointer', textAlign: 'center',
                    background: editForm.milkType === opt.value ? opt.bg : 'white',
                    fontWeight: '600', fontSize: '12px',
                    color: editForm.milkType === opt.value ? opt.color : 'var(--text-light)',
                    transition: 'all 0.2s'
                  }}>
                  <Droplets size={15} style={{ display: 'block', margin: '0 auto 3px' }} />
                  {opt.label.replace(' Milk', '')}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Daily Qty (L)</label>
              <input type="number" step="0.5" min="0.5" className="form-control"
                value={editForm.defaultQuantityLitres}
                onChange={e => setEditForm({ ...editForm, defaultQuantityLitres: e.target.value })} />
            </div>
            {customer.type === 'delivery' && (
              <div className="form-group">
                <label>Assigned Distributor</label>
                <select className="form-control" value={editForm.assignedDistributorId}
                  onChange={e => setEditForm({ ...editForm, assignedDistributorId: e.target.value })}>
                  <option value="">— Unassigned —</option>
                  {distributors.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Notes</label>
            <input className="form-control" value={editForm.notes}
              onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
              placeholder="Special instructions..." />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn" onClick={handleSave} disabled={saving}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditing(false)}
              style={{
                background: '#F1F5F9', border: 'none', borderRadius: '12px', padding: '13px 20px',
                cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: 'var(--text-light)', fontFamily: 'inherit'
              }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Outstanding Balance Banner */}
      {customer.outstandingBalance > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #DC2626, #EF4444)', borderRadius: '16px',
          padding: '16px 20px', marginBottom: '20px', color: 'white', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>{t('Outstanding Balance')}</div>
            <div style={{ fontSize: '28px', fontWeight: '800' }}>₹{customer.outstandingBalance.toFixed(2)}</div>
          </div>
          <button className="btn"
            onClick={() => setShowPayment(true)}
            style={{ background: 'rgba(255,255,255,0.2)', width: 'auto', padding: '10px 16px', fontSize: '14px', backdropFilter: 'blur(4px)' }}>
            {t('Record Payment')}
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Phones */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Primary Phone</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-color)' }}>
              <Phone size={14} color="var(--primary)" /> {customer.primaryPhone || customer.phone || '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Secondary Phone</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-color)' }}>
              <Phone size={14} color="#64748B" /> {customer.secondaryPhone || '—'}
            </div>
          </div>
          {/* Milk Type */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>{t('Milk Type')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Droplets size={14} color={mc} />
              <span style={{ fontWeight: '700', color: mc }}>{milkLabel[customer.milkType] || 'Cow'} Milk</span>
            </div>
          </div>
          {/* Daily Quantity */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Daily Qty</div>
            <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-color)' }}>
              {customer.defaultQuantityLitres}<span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-light)' }}> L</span>
            </div>
          </div>
        </div>
        {/* Address */}
        {customer.type === 'delivery' && customer.address && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>{t('Address')}</div>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--text-color)', fontSize: '14px' }}>
              <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{customer.address}</span>
            </div>
          </div>
        )}
        {/* Notes */}
        {customer.notes && (
          <div style={{ marginTop: '12px', background: '#FFFBEB', borderLeft: '3px solid #FCD34D', borderRadius: '0 8px 8px 0', padding: '10px 14px', fontSize: '13px', color: '#92400E' }}>
            <strong>Note: </strong>{customer.notes}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['overview', 'ledger'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', fontFamily: 'inherit',
              background: activeTab === tab ? 'var(--primary)' : '#F1F5F9',
              color: activeTab === tab ? 'white' : 'var(--text-light)',
              transition: 'all 0.2s'
            }}>
            {tab === 'overview' ? '📊 Overview' : '📖 Ledger'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'Total Sales', val: ledger.filter(l => l.type === 'sale').length, icon: ShoppingBag, color: '#2563EB', bg: '#EFF6FF' },
              { label: 'Payments Made', val: ledger.filter(l => l.type === 'payment').length, icon: IndianRupee, color: '#059669', bg: '#D1FAE5' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '16px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: s.bg, padding: '10px', borderRadius: '50%' }}>
                  <s.icon size={18} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-color)' }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          {customer.outstandingBalance === 0 && (
            <div style={{ background: '#D1FAE5', borderRadius: '14px', padding: '16px', textAlign: 'center', color: '#065F46', fontWeight: '600' }}>
              ✅ No outstanding balance — fully paid up!
            </div>
          )}
        </div>
      )}

      {activeTab === 'ledger' && (
        <div>
          {ledger.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px 0' }}>
              <Clock size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <p>No transactions yet.</p>
            </div>
          ) : (
            ledger.map((entry, idx) => (
              <div key={idx} className="card" style={{ padding: '14px 16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      background: entry.type === 'sale' ? '#FEF3C7' : '#D1FAE5',
                      padding: '8px', borderRadius: '10px'
                    }}>
                      {entry.type === 'sale' ? <ShoppingBag size={16} color="#D97706" /> : <IndianRupee size={16} color="#059669" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-color)' }}>
                        {entry.type === 'sale' ? `Bill — ₹${entry.amount.toFixed(2)}` : `Payment — ₹${entry.amount.toFixed(2)}`}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '3px' }}>
                        {format(new Date(entry.date), 'dd MMM yyyy')}
                        {entry.type === 'sale' && entry.paymentMode && ` • ${entry.paymentMode}`}
                        {entry.notes && ` • ${entry.notes}`}
                      </div>
                      {entry.type === 'sale' && entry.details && (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {entry.details.map((item, i) => (
                            <span key={i} style={{ background: '#F1F5F9', fontSize: '11px', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-light)' }}>
                              {item.productName} ×{item.quantity}{item.unit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {entry.type === 'sale' && entry.balance > 0 && (
                      <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '12px', padding: '2px 8px', borderRadius: '8px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Due ₹{entry.balance.toFixed(2)}
                      </span>
                    )}
                    {entry.type === 'payment' && (
                      <span style={{ color: '#059669', fontWeight: '700', fontSize: '14px' }}>+₹{entry.amount.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal customer={customer} onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} />
      )}
    </div>
  );
}

export default CustomerProfile;
