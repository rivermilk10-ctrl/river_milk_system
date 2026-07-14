import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../App';
import { Check, MapPin, User as UserIcon, ChevronLeft, ChevronRight, Calendar, Phone, Droplets, Hash } from 'lucide-react';
import { format, addDays, subDays, startOfDay } from 'date-fns';
import { API_URL } from '../config';

const MILK_TYPES = [
  { value: 'cow', label: 'Cow', color: '#D97706' },
  { value: 'full_cream', label: 'Full Cream', color: '#0891B2' },
  { value: 'buffalo', label: 'Buffalo', color: '#7C3AED' },
];

function Deliveries() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [overrides, setOverrides] = useState({});
  const [milkTypeOverrides, setMilkTypeOverrides] = useState({});

  const fetchDeliveries = (date) => {
    const url = user.role === 'distributor'
      ? `${API_URL}/api/deliveries/today?distributorId=${user.id}&date=${date.toISOString()}`
      : `${API_URL}/api/deliveries/today?date=${date.toISOString()}`;
    fetch(url).then(res => res.json()).then(data => setDeliveries(data));
  };

  useEffect(() => {
    // Distributor portal: pass distributorId so server returns only their assigned delivery customers
    // Admin: fetch all customers without restriction
    const customersUrl = user.role === 'distributor'
      ? `${API_URL}/api/customers?distributorId=${user.id}`
      : `${API_URL}/api/customers`;

    fetch(customersUrl)
      .then(res => res.json())
      .then(data => {
        if (user.role === 'distributor') {
          // Client-side safety net: ensure only assigned delivery customers are shown
          // (shop pickups are admin-only and will not be returned by the server)
          setCustomers(data.filter(c => c.type === 'delivery' && c.assignedDistributorId?._id === user.id));
        } else {
          setCustomers(data);
        }
      });
  }, [user]);

  useEffect(() => {
    fetchDeliveries(selectedDate);
    setOverrides({});
    setMilkTypeOverrides({});
  }, [user, selectedDate]);

  const getEffectiveMilkType = (customer) => milkTypeOverrides[customer._id] || customer.milkType || 'cow';

  const markDelivered = async (customer) => {
    const finalQuantity = overrides[customer._id] ? parseFloat(overrides[customer._id]) : customer.defaultQuantityLitres;
    const milkType = getEffectiveMilkType(customer);

    const newDelivery = {
      customerId: customer._id,
      distributorId: user.role === 'distributor' ? user.id : customer.assignedDistributorId?._id,
      date: selectedDate.toISOString(),
      quantityLitres: finalQuantity,
      milkType,
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

  const isMarked = (customerId) => deliveries.some(d => d.customerId === customerId || d.customerId?._id === customerId);

  const getMilkTypeColor = (type) => MILK_TYPES.find(m => m.value === type)?.color || '#D97706';
  const getMilkTypeLabel = (type) => MILK_TYPES.find(m => m.value === type)?.label || 'Cow';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{t('Delivery')}</h2>
        <span style={{ background: 'var(--primary-gradient)', color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
          {customers.length}
        </span>
      </div>

      {/* Date Navigator */}
      <div className="card" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="btn btn-outline" style={{ width: 'auto', padding: '8px', borderRadius: '50%' }} onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '16px' }}>
          <Calendar size={18} color="var(--primary)" />
          <input type="date" style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: '600', color: 'var(--text-color)', outline: 'none', fontFamily: 'inherit' }}
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={e => { if(e.target.value) { const [y,m,d] = e.target.value.split('-'); setSelectedDate(new Date(y,m-1,d)); } }} />
        </div>
        <button className="btn btn-outline" style={{ width: 'auto', padding: '8px', borderRadius: '50%' }} onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Customer Delivery Cards */}
      {customers.map(c => {
        const marked = isMarked(c._id);
        const effectiveMilkType = getEffectiveMilkType(c);
        const milkColor = getMilkTypeColor(effectiveMilkType);

        return (
          <div key={c._id} className="card" style={{ padding: '18px', position: 'relative', overflow: 'hidden', marginBottom: '14px' }}>
            {marked && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--success-gradient)' }} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ background: '#F1F5F9', padding: '10px', borderRadius: '12px', color: 'var(--text-light)', flexShrink: 0 }}>
                  <UserIcon size={20} />
                </div>
                <div>
                  {/* Name + Customer Number */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-color)' }}>{c.name}</span>
                    <span style={{ background: '#EFF6FF', color: '#1E40AF', fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '700', fontFamily: 'monospace' }}>
                      {c.customerNumber}
                    </span>
                  </div>
                  {/* Address or Pickup */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)', fontSize: '13px', marginTop: '4px' }}>
                    <MapPin size={12} />
                    {c.type === 'delivery' ? c.address : t('Shop Pickup')}
                  </div>
                  {/* Phones */}
                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {(c.primaryPhone || c.phone) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '12px' }}>
                        <Phone size={11} /> {c.primaryPhone || c.phone}
                      </div>
                    )}
                    {c.secondaryPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '12px', opacity: 0.7 }}>
                        <Phone size={11} /> {c.secondaryPhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Quantity */}
              <div>
                {!marked ? (
                  <input type="number" step="0.5"
                    style={{ width: '60px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}
                    value={overrides[c._id] !== undefined ? overrides[c._id] : c.defaultQuantityLitres}
                    onChange={e => setOverrides(prev => ({...prev, [c._id]: e.target.value}))} />
                ) : (
                  <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                      {deliveries.find(d => d.customerId === c._id || d.customerId?._id === c._id)?.quantityLitres || c.defaultQuantityLitres}
                      <span style={{fontSize: '13px'}}>L</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Milk Type Selector (only when not yet marked) */}
            {!marked && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {MILK_TYPES.map(mt => (
                  <button key={mt.value}
                    onClick={() => setMilkTypeOverrides(prev => ({...prev, [c._id]: mt.value}))}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '8px', border: `2px solid ${effectiveMilkType === mt.value ? mt.color : 'var(--border)'}`,
                      background: effectiveMilkType === mt.value ? `${mt.color}15` : 'white', cursor: 'pointer',
                      fontWeight: '600', fontSize: '11px', color: effectiveMilkType === mt.value ? mt.color : 'var(--text-light)',
                      transition: 'all 0.15s', fontFamily: 'inherit'
                    }}>
                    <Droplets size={12} style={{ display: 'block', margin: '0 auto 2px' }} />
                    {mt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Marked milk type */}
            {marked && (
              <div style={{ marginBottom: '10px' }}>
                <span style={{ background: `${getMilkTypeColor(deliveries.find(d => d.customerId === c._id || d.customerId?._id === c._id)?.milkType || c.milkType)}15`, color: getMilkTypeColor(deliveries.find(d => d.customerId === c._id || d.customerId?._id === c._id)?.milkType || c.milkType), fontSize: '12px', padding: '3px 10px', borderRadius: '8px', fontWeight: '600' }}>
                  <Droplets size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  {getMilkTypeLabel(deliveries.find(d => d.customerId === c._id || d.customerId?._id === c._id)?.milkType || c.milkType)} Milk
                </span>
              </div>
            )}

            {/* Notes */}
            {c.notes && (
              <div style={{ background: '#FFFBEB', color: '#92400E', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', borderLeft: '3px solid #FCD34D' }}>
                <strong>Note: </strong>{c.notes}
              </div>
            )}

            <button
              className={`btn ${marked ? 'btn-success' : ''}`}
              onClick={() => markDelivered(c)}
              disabled={marked}
              style={{ padding: '13px', fontSize: '14px' }}>
              {marked ? <><Check size={16} /> {t('Marked')}</> : t('Mark as Delivered')}
            </button>
          </div>
        );
      })}

      {customers.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '60px' }}>
          <Check size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>No customers available.</p>
        </div>
      )}
    </div>
  );
}

export default Deliveries;
