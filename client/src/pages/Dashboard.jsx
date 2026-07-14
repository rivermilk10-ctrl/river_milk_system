import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Truck, CheckCircle, Droplets, AlertCircle, Package, IndianRupee, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <div style={{textAlign: 'center', marginTop: '60px'}}><div className="loader"></div></div>;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ marginBottom: '20px', padding: '24px 20px', background: 'var(--primary-gradient)', borderRadius: '20px', color: 'white', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '24px', marginBottom: '4px', fontWeight: '700' }}>{greeting}! 👋</h2>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>Here's what's happening today.</p>
        </div>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
          <Droplets size={120} />
        </div>
      </div>

      {/* Pending Payments Widget */}
      {stats.pendingPaymentsTotal > 0 && (
        <div onClick={() => navigate('/reports?tab=pending')}
          style={{
            background: 'linear-gradient(135deg, #DC2626, #EF4444)', borderRadius: '18px',
            padding: '18px 20px', marginBottom: '20px', color: 'white', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 8px 24px rgba(220,38,38,0.3)', transition: 'transform 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <div>
            <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              ⚠️ {t('Pending Payments')}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '2px' }}>
              ₹{stats.pendingPaymentsTotal.toFixed(2)}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              from {stats.pendingPaymentsCount} customer{stats.pendingPaymentsCount !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <IndianRupee size={36} style={{ opacity: 0.3 }} />
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
              {t('View Pending Customers')} <ArrowRight size={12} />
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {stats.lowStockProducts?.length > 0 && (
        <div onClick={() => navigate('/inventory')}
          style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: '16px',
            padding: '14px 18px', marginBottom: '20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1px solid #FCD34D'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={22} color="#D97706" />
            <div>
              <div style={{ fontWeight: '700', color: '#92400E', fontSize: '14px' }}>{t('Low Stock Alert')}</div>
              <div style={{ fontSize: '12px', color: '#B45309' }}>
                {stats.lowStockProducts.map(p => `${p.name} (${p.currentStock}${p.unit})`).join(', ')}
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="#D97706" />
        </div>
      )}

      {/* Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        {/* Total Customers */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 14px' }}>
          <div style={{ background: '#E0E7FF', padding: '14px', borderRadius: '50%', color: '#3730A3', marginBottom: '12px' }}>
            <Users size={26} />
          </div>
          <h3 style={{ color: 'var(--text-light)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{t('Total Customers')}</h3>
          <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-color)' }}>{stats.totalCustomers}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '6px' }}>
            {stats.deliveryCustomers}🏠 · {stats.pickupCustomers}🏪
          </div>
        </div>

        {/* Total Litres Today */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 14px' }}>
          <div style={{ background: '#DBEAFE', padding: '14px', borderRadius: '50%', color: '#1E3A8A', marginBottom: '12px' }}>
            <Droplets size={26} />
          </div>
          <h3 style={{ color: 'var(--text-light)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{t('Total Litres')}</h3>
          <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--primary)' }}>
            {stats.todayStats.totalQuantityLitres}<span style={{fontSize: '18px'}}>L</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '6px' }}>Today</div>
        </div>

        {/* Today's Deliveries */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 14px' }}>
          <div style={{ background: '#D1FAE5', padding: '14px', borderRadius: '50%', color: '#065F46', marginBottom: '12px' }}>
            <CheckCircle size={26} />
          </div>
          <h3 style={{ color: 'var(--text-light)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{t("Today's Deliveries")}</h3>
          <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--success)' }}>{stats.todayStats.deliveriesDone}</div>
          <div style={{ fontSize: '11px', background: '#FEE2E2', color: 'var(--danger)', padding: '3px 10px', borderRadius: '10px', marginTop: '6px', fontWeight: '600' }}>
            {stats.todayStats.deliveriesPending} {t('Pending')}
          </div>
        </div>

        {/* Pickups */}
        <div className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 14px' }}>
          <div style={{ background: '#FEF3C7', padding: '14px', borderRadius: '50%', color: '#92400E', marginBottom: '12px' }}>
            <Truck size={26} />
          </div>
          <h3 style={{ color: 'var(--text-light)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{t('Pickups Collected')}</h3>
          <div style={{ fontSize: '30px', fontWeight: '800', color: '#B45309' }}>{stats.todayStats.pickupsCollected}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '6px' }}>Today</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
