import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, AlertTriangle, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { API_URL } from '../config';

function Inventory() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState(null);
  const [adjustValue, setAdjustValue] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    fetch(`${API_URL}/api/reports/inventory`)
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, []);

  const dairyProducts = products.filter(p => p.category === 'dairy');

  const adjustStock = async (product, delta) => {
    await fetch(`${API_URL}/api/products/${product._id}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment: delta })
    });
    fetchProducts();
  };

  const setStockExact = async (product) => {
    const val = parseFloat(adjustValue);
    if (isNaN(val) || val < 0) return;
    const delta = val - product.currentStock;
    await adjustStock(product, delta);
    setAdjustingId(null);
    setAdjustValue('');
  };

  const stockStatus = (p) => {
    if (p.currentStock === 0) return { label: 'Out of Stock', color: '#DC2626', bg: '#FEE2E2' };
    if (p.currentStock <= p.lowStockThreshold) return { label: 'Low Stock', color: '#D97706', bg: '#FEF3C7' };
    return { label: 'In Stock', color: '#059669', bg: '#D1FAE5' };
  };

  const stockPercent = (p) => {
    const max = Math.max(p.lowStockThreshold * 3, p.currentStock, 10);
    return Math.min(100, (p.currentStock / max) * 100);
  };

  const lowStockCount = dairyProducts.filter(p => p.currentStock <= p.lowStockThreshold).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{t('Inventory')}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>Track dairy product stock levels</p>
        </div>
        <button onClick={fetchProducts} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer', display: 'flex' }}>
          <RefreshCw size={18} color="var(--text-light)" />
        </button>
      </div>

      {/* Alert Banner */}
      {lowStockCount > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={22} color="#D97706" />
          <div>
            <div style={{ fontWeight: '700', color: '#92400E' }}>{t('Low Stock Alert')}</div>
            <div style={{ fontSize: '13px', color: '#B45309' }}>{lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low or out of stock</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}><div className="loader" /></div>
      ) : (
        dairyProducts.map(p => {
          const status = stockStatus(p);
          const pct = stockPercent(p);
          const isAdjusting = adjustingId === p._id;

          return (
            <div key={p._id} className="card" style={{ padding: '18px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ background: status.bg, padding: '12px', borderRadius: '12px' }}>
                    <Package size={22} color={status.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '17px', color: 'var(--text-color)' }}>{p.name}</div>
                    <span style={{ background: status.bg, color: status.color, fontSize: '11px', padding: '2px 10px', borderRadius: '10px', fontWeight: '700', marginTop: '4px', display: 'inline-block' }}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: status.color }}>{p.currentStock}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{p.unit} in stock</div>
                </div>
              </div>

              {/* Stock Bar */}
              <div style={{ background: '#F1F5F9', borderRadius: '4px', height: '8px', marginBottom: '12px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: status.color, borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', marginBottom: '14px' }}>
                <span>Alert at: {p.lowStockThreshold} {p.unit}</span>
                <span>₹{p.price}/{p.unit}</span>
              </div>

              {/* Stock Controls */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => adjustStock(p, -1)} style={{ flex: 1, background: '#FEE2E2', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#DC2626', fontSize: '13px', fontFamily: 'inherit' }}>
                  <Minus size={14} /> 1 {p.unit}
                </button>
                <button
                  onClick={() => { setAdjustingId(isAdjusting ? null : p._id); setAdjustValue(String(p.currentStock)); }}
                  style={{ background: '#EFF6FF', border: 'none', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', fontWeight: '600', color: '#2563EB', fontSize: '13px', fontFamily: 'inherit' }}>
                  Set
                </button>
                <button onClick={() => adjustStock(p, 1)} style={{ flex: 1, background: '#D1FAE5', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#059669', fontSize: '13px', fontFamily: 'inherit' }}>
                  <Plus size={14} /> 1 {p.unit}
                </button>
              </div>

              {isAdjusting && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input type="number" step="0.5" min="0" className="form-control"
                    value={adjustValue} onChange={e => setAdjustValue(e.target.value)}
                    placeholder={`New stock in ${p.unit}`} style={{ flex: 1 }} />
                  <button onClick={() => setStockExact(p)} className="btn" style={{ width: 'auto', padding: '0 20px' }}>Set</button>
                </div>
              )}
            </div>
          );
        })
      )}

      {!loading && dairyProducts.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '60px' }}>
          <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>No dairy products yet.</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Add products in the Products page first.</p>
        </div>
      )}
    </div>
  );
}

// Missing imports
function Minus({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function Plus({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }

export default Inventory;
