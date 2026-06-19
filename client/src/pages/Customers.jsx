import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, User as UserIcon, Phone } from 'lucide-react';

function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', type: 'delivery', defaultQuantityLitres: 1, assignedDistributorId: ''
  });

  useEffect(() => {
    fetchCustomers();
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/distributors`)
      .then(res => res.json())
      .then(data => setDistributors(data));
  }, []);

  const fetchCustomers = () => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customers`)
      .then(res => res.json())
      .then(data => setCustomers(data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    if (dataToSend.type === 'pickup') delete dataToSend.assignedDistributorId;
    if (!dataToSend.assignedDistributorId) delete dataToSend.assignedDistributorId;

    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
    setShowAdd(false);
    fetchCustomers();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{t('Customers')}</h2>
        <button className="btn" style={{ width: 'auto', padding: '10px 20px', borderRadius: '20px', fontSize: '14px' }} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? t('Cancel') : <><UserPlus size={18} /> {t('Add')}</>}
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('Name')}</label>
              <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{t('Phone Number')}</label>
              <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{t('Customer Type')}</label>
              <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="delivery">{t('Delivery')}</option>
                <option value="pickup">{t('Shop Pickup')}</option>
              </select>
            </div>
            {formData.type === 'delivery' && (
              <>
                <div className="form-group">
                  <label>{t('Address')}</label>
                  <input type="text" className="form-control" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>{t('Distributors')}</label>
                  <select className="form-control" value={formData.assignedDistributorId} onChange={e => setFormData({...formData, assignedDistributorId: e.target.value})}>
                    <option value="">Select Distributor</option>
                    {distributors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label>{t('Quantity')} (L)</label>
              <input type="number" step="0.5" className="form-control" required value={formData.defaultQuantityLitres} onChange={e => setFormData({...formData, defaultQuantityLitres: e.target.value})} />
            </div>
            <button type="submit" className="btn" style={{marginTop: '10px'}}>{t('Save')}</button>
          </form>
        </div>
      )}

      {customers.map(c => (
        <div key={c._id} className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: c.type === 'delivery' ? '#EFF6FF' : '#FFFBEB', padding: '12px', borderRadius: '50%', color: c.type === 'delivery' ? 'var(--primary)' : '#D97706' }}>
                <UserIcon size={22} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '17px', color: 'var(--text-color)' }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '13px', marginTop: '6px' }}>
                  <Phone size={12} /> {c.phone || 'N/A'}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-color)' }}>
                {c.defaultQuantityLitres} <span style={{fontSize: '14px', color: 'var(--text-light)'}}>L</span>
              </div>
              <span className={`badge ${c.type === 'delivery' ? 'badge-delivery' : 'badge-pickup'}`} style={{ marginTop: '8px', display: 'inline-block', fontSize: '11px', padding: '4px 10px' }}>
                {c.type === 'delivery' ? t('Delivery') : t('Shop Pickup')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Customers;
