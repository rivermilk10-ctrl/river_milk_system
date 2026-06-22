import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Truck, CheckCircle, Droplets } from 'lucide-react';
import { API_URL } from '../config';

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <div style={{textAlign: 'center', marginTop: '60px'}}><div className="loader"></div></div>;

  return (
    <div>
      <div style={{ marginBottom: '24px', padding: '24px 20px', background: 'var(--primary-gradient)', borderRadius: '20px', color: 'white', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '26px', marginBottom: '6px', fontWeight: '700' }}>Welcome Back!</h2>
          <p style={{ opacity: 0.9, fontSize: '15px', fontWeight: '400' }}>Here's what's happening today.</p>
        </div>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
          <Droplets size={120} />
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ background: '#E0E7FF', padding: '14px', borderRadius: '50%', color: '#3730A3', marginBottom: '16px' }}>
            <Users size={28} />
          </div>
          <h3 style={{ color: 'var(--text-light)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{t('Total Customers')}</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-color)' }}>{stats.totalCustomers}</div>
        </div>

        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ background: '#DBEAFE', padding: '14px', borderRadius: '50%', color: '#1E3A8A', marginBottom: '16px' }}>
            <Droplets size={28} />
          </div>
          <h3 style={{ color: 'var(--text-light)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{t('Total Litres')}</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>{stats.todayStats.totalQuantityLitres}<span style={{fontSize: '20px'}}>L</span></div>
        </div>

        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ background: '#D1FAE5', padding: '14px', borderRadius: '50%', color: '#065F46', marginBottom: '16px' }}>
            <CheckCircle size={28} />
          </div>
          <h3 style={{ color: 'var(--text-light)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{t("Today's Deliveries")}</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--success)' }}>{stats.todayStats.deliveriesDone}</div>
          <div style={{ fontSize: '13px', color: 'var(--danger)', marginTop: '6px', fontWeight: '600', background: '#FEE2E2', padding: '4px 10px', borderRadius: '12px' }}>{stats.todayStats.deliveriesPending} {t('Pending')}</div>
        </div>

        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ background: '#FEF3C7', padding: '14px', borderRadius: '50%', color: '#92400E', marginBottom: '16px' }}>
            <Truck size={28} />
          </div>
          <h3 style={{ color: 'var(--text-light)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{t('Pickups Collected')}</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#B45309' }}>{stats.todayStats.pickupsCollected}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
