import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../App';
import { Check, MapPin, User as UserIcon, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, subDays, startOfDay, isSameDay } from 'date-fns';
import { API_URL } from '../config';


function Deliveries() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [overrides, setOverrides] = useState({});

  const fetchDeliveries = (date) => {
    const url = user.role === 'distributor' 
      ? `${API_URL}/api/deliveries/today?distributorId=${user.id}&date=${date.toISOString()}`
      : `${API_URL}/api/deliveries/today?date=${date.toISOString()}`;
      
    fetch(url)
      .then(res => res.json())
      .then(data => setDeliveries(data));
  };

  useEffect(() => {
    fetch(`${API_URL}/api/customers`)
      .then(res => res.json())
      .then(data => {
        if (user.role === 'distributor') {
          setCustomers(data.filter(c => c.type === 'delivery' && c.assignedDistributorId?._id === user.id));
        } else {
          setCustomers(data);
        }
      });
  }, [user]);

  useEffect(() => {
    fetchDeliveries(selectedDate);
    setOverrides({});
  }, [user, selectedDate]);

  const handleQuantityChange = (customerId, value) => {
    setOverrides(prev => ({ ...prev, [customerId]: value }));
  };

  const markDelivered = async (customer) => {
    const finalQuantity = overrides[customer._id] ? parseFloat(overrides[customer._id]) : customer.defaultQuantityLitres;
    
    const newDelivery = {
      customerId: customer._id,
      distributorId: user.role === 'distributor' ? user.id : customer.assignedDistributorId?._id,
      date: selectedDate.toISOString(),
      quantityLitres: finalQuantity,
      status: customer.type === 'delivery' ? 'delivered' : 'collected',
      markedBy: user.id
    };

    setDeliveries(prev => [...prev, newDelivery]);

    try {
      await fetch(`${API_URL}/api/deliveries/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDelivery)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isMarked = (customerId) => {
    return deliveries.some(d => d.customerId === customerId || d.customerId?._id === customerId);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{t('Delivery')}</h2>
        <span style={{ background: 'var(--primary-gradient)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
          {customers.length}
        </span>
      </div>

      <div className="card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn btn-outline" style={{ width: 'auto', padding: '8px', borderRadius: '50%' }} onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '16px', color: 'var(--text-color)' }}>
          <Calendar size={18} color="var(--primary)" />
          <input 
            type="date" 
            style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: '600', color: 'var(--text-color)', outline: 'none', fontFamily: 'inherit' }}
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              if(e.target.value) {
                const [year, month, day] = e.target.value.split('-');
                setSelectedDate(new Date(year, month - 1, day));
              }
            }}
          />
        </div>
        <button className="btn btn-outline" style={{ width: 'auto', padding: '8px', borderRadius: '50%' }} onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          <ChevronRight size={20} />
        </button>
      </div>
      
      {customers.map(c => (
        <div key={c._id} className="card" style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
          {isMarked(c._id) && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--success-gradient)' }} />
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: '#F1F5F9', padding: '12px', borderRadius: '50%', color: 'var(--text-light)' }}>
                <UserIcon size={22} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '17px', color: 'var(--text-color)' }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)', fontSize: '13px', marginTop: '6px' }}>
                  <MapPin size={12} />
                  {c.type === 'delivery' ? c.address : t('Shop Pickup')}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isMarked(c._id) ? (
                <input 
                  type="number" 
                  step="0.5" 
                  style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', fontWeight: 'bold' }}
                  value={overrides[c._id] !== undefined ? overrides[c._id] : c.defaultQuantityLitres}
                  onChange={(e) => handleQuantityChange(c._id, e.target.value)}
                />
              ) : (
                <div style={{ background: '#EFF6FF', padding: '10px 16px', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                    {deliveries.find(d => d.customerId === c._id || d.customerId?._id === c._id)?.quantityLitres || c.defaultQuantityLitres}
                    <span style={{fontSize: '14px'}}>L</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {c.notes && (
            <div style={{ background: '#FFFBEB', color: '#92400E', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', borderLeft: '3px solid #FCD34D' }}>
              <strong style={{marginRight: '6px'}}>Note:</strong> {c.notes}
            </div>
          )}
          
          <button 
            className={`btn ${isMarked(c._id) ? 'btn-success' : ''}`}
            onClick={() => markDelivered(c)}
            disabled={isMarked(c._id)}
            style={{ padding: '14px', fontSize: '15px' }}
          >
            {isMarked(c._id) ? <><Check size={18} /> {t('Marked')}</> : t('Mark as Delivered')}
          </button>
        </div>
      ))}

      {customers.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '60px' }}>
          <Check size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p style={{ fontSize: '18px', fontWeight: '500' }}>No customers available.</p>
        </div>
      )}
    </div>
  );
}

export default Deliveries;
