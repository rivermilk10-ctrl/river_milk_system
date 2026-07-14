import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserPlus, User as UserIcon, Phone, MapPin, Droplets, ChevronRight, Search, X, Hash } from 'lucide-react';
import { API_URL } from '../config';

const MILK_TYPE_OPTIONS = [
  { value: 'cow', label: 'Cow Milk', color: '#D97706', bg: '#FFFBEB' },
  { value: 'buffalo', label: 'Buffalo Milk', color: '#7C3AED', bg: '#F5F3FF' },
  { value: 'full_cream', label: 'Full Cream Milk', color: '#0891B2', bg: '#ECFEFF' },
];

const milkLabel = (type) => MILK_TYPE_OPTIONS.find(m => m.value === type)?.label || 'Cow Milk';
const milkColor = (type) => MILK_TYPE_OPTIONS.find(m => m.value === type)?.color || '#D97706';
const milkBg = (type) => MILK_TYPE_OPTIONS.find(m => m.value === type)?.bg || '#FFFBEB';

function Customers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', primaryPhone: '', secondaryPhone: '', address: '',
    type: 'delivery', milkType: 'cow', defaultQuantityLitres: 1,
    assignedDistributorId: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetch(`${API_URL}/api/distributors`).then(r => r.json()).then(setDistributors);
  }, []);

  const fetchCustomers = () => {
    setLoading(true);
    fetch(`${API_URL}/api/customers`)
      .then(r => r.json())
      .then(data => { setCustomers(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const dataToSend = { ...formData };
    if (dataToSend.type === 'pickup') { delete dataToSend.assignedDistributorId; delete dataToSend.address; }
    if (!dataToSend.assignedDistributorId) delete dataToSend.assignedDistributorId;

    await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
    setShowAdd(false);
    setSubmitting(false);
    setFormData({ name: '', primaryPhone: '', secondaryPhone: '', address: '', type: 'delivery', milkType: 'cow', defaultQuantityLitres: 1, assignedDistributorId: '', notes: '' });
    fetchCustomers();
  };

  // Filter customers
  const filtered = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || [c.customerNumber, c.name, c.primaryPhone, c.secondaryPhone, c.phone]
      .some(v => v?.toLowerCase().includes(q));
    const matchType = filterType === 'all' || c.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-color)' }}>{t('Customers')}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>{customers.length} total</p>
        </div>
        <button className="btn" style={{ width: 'auto', padding: '10px 20px', borderRadius: '20px', fontSize: '14px' }}
          onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <><X size={16} /> {t('Cancel')}</> : <><UserPlus size={16} /> {t('Add')}</>}
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text" className="form-control"
            style={{ paddingLeft: '42px', borderRadius: '24px', fontSize: '14px' }}
            placeholder={t('Search by name, number or phone')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: 'auto', borderRadius: '20px', fontSize: '14px', padding: '10px 14px' }}
          value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All</option>
          <option value="delivery">Delivery</option>
          <option value="pickup">Pickup</option>
        </select>
      </div>

      {/* Add Customer Form */}
      {showAdd && (
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--primary)' }}>
            {t('Add Customer')}
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Customer Number - auto-generated display */}
            <div className="form-group">
              <label>{t('Customer Number')}</label>
              <div style={{ background: '#F1F5F9', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                🔢 Auto-generated (e.g. RM{String(customers.length + 1).padStart(3,'0')})
              </div>
            </div>
            <div className="form-group">
              <label>{t('Name')}</label>
              <input type="text" className="form-control" required value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>{t('Primary Phone')}</label>
                <input type="text" className="form-control" value={formData.primaryPhone}
                  onChange={e => setFormData({...formData, primaryPhone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>{t('Secondary Phone')}</label>
                <input type="text" className="form-control" value={formData.secondaryPhone}
                  onChange={e => setFormData({...formData, secondaryPhone: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>{t('Customer Type')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[{ value: 'delivery', label: '🏠 Home Delivery' }, { value: 'pickup', label: '🏪 Shop Pickup' }].map(opt => (
                  <div key={opt.value}
                    onClick={() => setFormData({...formData, type: opt.value})}
                    style={{
                      border: `2px solid ${formData.type === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: '12px', padding: '12px', cursor: 'pointer', textAlign: 'center',
                      background: formData.type === opt.value ? '#EFF6FF' : 'white',
                      fontWeight: '600', fontSize: '14px', color: formData.type === opt.value ? 'var(--primary)' : 'var(--text-light)',
                      transition: 'all 0.2s'
                    }}>
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
            {formData.type === 'delivery' && (
              <>
                <div className="form-group">
                  <label>{t('Address')}</label>
                  <input type="text" className="form-control" required value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>{t('Distributors')}</label>
                  <select className="form-control" value={formData.assignedDistributorId}
                    onChange={e => setFormData({...formData, assignedDistributorId: e.target.value})}>
                    <option value="">Select Distributor</option>
                    {distributors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label>{t('Milk Type')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {MILK_TYPE_OPTIONS.map(opt => (
                  <div key={opt.value}
                    onClick={() => setFormData({...formData, milkType: opt.value})}
                    style={{
                      border: `2px solid ${formData.milkType === opt.value ? opt.color : 'var(--border)'}`,
                      borderRadius: '10px', padding: '10px 6px', cursor: 'pointer', textAlign: 'center',
                      background: formData.milkType === opt.value ? opt.bg : 'white',
                      fontWeight: '600', fontSize: '12px', color: formData.milkType === opt.value ? opt.color : 'var(--text-light)',
                      transition: 'all 0.2s'
                    }}>
                    <Droplets size={16} style={{ display: 'block', margin: '0 auto 4px' }} />
                    {opt.label.replace(' Milk', '')}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>{t('Quantity')} (L/day)</label>
              <input type="number" step="0.5" min="0.5" className="form-control" required
                value={formData.defaultQuantityLitres}
                onChange={e => setFormData({...formData, defaultQuantityLitres: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label>{t('Notes')}</label>
              <input type="text" className="form-control" value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any special instructions..." />
            </div>
            <button type="submit" className="btn" disabled={submitting} style={{ marginTop: '10px' }}>
              {submitting ? 'Saving...' : t('Save')}
            </button>
          </form>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: '🏠 Delivery', count: customers.filter(c => c.type === 'delivery').length, color: '#2563EB', bg: '#EFF6FF' },
          { label: '🏪 Pickup', count: customers.filter(c => c.type === 'pickup').length, color: '#D97706', bg: '#FFFBEB' },
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: stat.color }}>{stat.label}</span>
            <span style={{ fontSize: '22px', fontWeight: '800', color: stat.color }}>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}><div className="loader" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '60px' }}>
          <UserIcon size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>No customers found.</p>
        </div>
      ) : (
        filtered.map(c => (
          <div key={c._id} className="card"
            style={{ padding: '16px', cursor: 'pointer', marginBottom: '14px' }}
            onClick={() => navigate(`/customers/${c._id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Left: Avatar + Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                <div style={{
                  background: c.type === 'delivery' ? '#EFF6FF' : '#FFFBEB',
                  padding: '12px', borderRadius: '14px', flexShrink: 0,
                  color: c.type === 'delivery' ? 'var(--primary)' : '#D97706'
                }}>
                  <UserIcon size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name + Number */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-color)' }}>{c.name}</span>
                    <span style={{
                      background: '#EFF6FF', color: '#1E40AF', fontSize: '11px',
                      padding: '2px 8px', borderRadius: '10px', fontWeight: '700', fontFamily: 'monospace'
                    }}>{c.customerNumber}</span>
                  </div>
                  {/* Type badge + Distributor badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: c.type === 'delivery' ? '#DBEAFE' : '#FEF3C7',
                      color: c.type === 'delivery' ? '#1E3A8A' : '#92400E',
                      fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '600'
                    }}>
                      {c.type === 'delivery' ? '🏠 Home Delivery' : '🏪 Shop Pickup'}
                    </span>
                    {c.type === 'delivery' && c.assignedDistributorId && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                        background: '#F0FDF4', color: '#166534',
                        fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '600'
                      }}>
                        🚴 {c.assignedDistributorId.name || c.assignedDistributorId}
                      </span>
                    )}
                  </div>
                  {/* Phones */}
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(c.primaryPhone || c.phone) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '13px' }}>
                        <Phone size={12} /> <span>{c.primaryPhone || c.phone}</span>
                      </div>
                    )}
                    {c.secondaryPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '12px' }}>
                        <Phone size={11} /> <span style={{ opacity: 0.7 }}>{c.secondaryPhone}</span>
                      </div>
                    )}
                  </div>
                  {/* Address */}
                  {c.type === 'delivery' && c.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--text-light)', fontSize: '12px', marginTop: '6px' }}>
                      <MapPin size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ lineHeight: '1.4' }}>{c.address}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Right: Quantity + Milk + Balance + Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginLeft: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-color)' }}>{c.defaultQuantityLitres}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>L</span>
                </div>
                <span style={{ background: milkBg(c.milkType), color: milkColor(c.milkType), fontSize: '11px', padding: '3px 8px', borderRadius: '8px', fontWeight: '600' }}>
                  {milkLabel(c.milkType)}
                </span>
                {c.outstandingBalance > 0 && (
                  <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '12px', padding: '3px 8px', borderRadius: '8px', fontWeight: '700' }}>
                    ₹{c.outstandingBalance}
                  </span>
                )}
                <ChevronRight size={16} color="var(--text-light)" style={{ marginTop: '4px' }} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Customers;
