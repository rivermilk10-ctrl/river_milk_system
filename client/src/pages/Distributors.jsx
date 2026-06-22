import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Truck, MapPin, Phone } from 'lucide-react';
import { API_URL } from '../config';


function Distributors() {
  const { t } = useTranslation();
  const [distributors, setDistributors] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', assignedArea: '' });

  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = () => {
    fetch(`${API_URL}/api/distributors`)
      .then(res => res.json())
      .then(data => setDistributors(data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/distributors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowAdd(false);
    fetchDistributors();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{t('Distributors')}</h2>
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
              <input type="text" className="form-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{t('Password')}</label>
              <input type="password" className="form-control" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="form-group">
              <label>{t('Assigned Area')}</label>
              <input type="text" className="form-control" value={formData.assignedArea} onChange={e => setFormData({...formData, assignedArea: e.target.value})} />
            </div>
            <button type="submit" className="btn" style={{marginTop: '10px'}}>{t('Save')}</button>
          </form>
        </div>
      )}

      {distributors.map(d => (
        <div key={d._id} className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#FEF3C7', padding: '14px', borderRadius: '50%', color: '#92400E' }}>
              <Truck size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-color)' }}>{d.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '14px', marginTop: '4px' }}>
                <Phone size={14} /> {d.phone}
              </div>
              {d.assignedArea && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '13px', marginTop: '8px', background: '#EFF6FF', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', fontWeight: '500' }}>
                  <MapPin size={12} /> {d.assignedArea}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Distributors;
