import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Minus, ShoppingCart, CheckCircle, X, Droplets, Package } from 'lucide-react';
import { API_URL } from '../config';
import { format } from 'date-fns';

function Billing() {
  const { t } = useTranslation();
  const [step, setStep] = useState('customer'); // 'customer' | 'items' | 'payment' | 'success'
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [lastBill, setLastBill] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products?activeOnly=true`)
      .then(r => r.json()).then(setProducts);
  }, []);

  // Debounced customer search
  useEffect(() => {
    if (!customerSearch.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`${API_URL}/api/customers/search?q=${encodeURIComponent(customerSearch)}`)
        .then(r => r.json()).then(data => setSearchResults(Array.isArray(data) ? data : []));
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  const selectCustomer = (c) => {
    setSelectedCustomer(c);
    setCustomerSearch('');
    setSearchResults([]);
    setStep('items');
  };

  const addItem = (product) => {
    setBillItems(prev => {
      const existing = prev.find(i => i.productId === product._id);
      if (existing) return prev.map(i => i.productId === product._id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, { productId: product._id, productName: product.name, quantity: 1, unit: product.unit, pricePerUnit: product.price }];
    });
  };

  const updateQty = (productId, delta) => {
    setBillItems(prev => prev.map(i => i.productId === productId
      ? {...i, quantity: Math.max(0.5, i.quantity + delta)}
      : i).filter(i => i.quantity > 0));
  };

  const removeItem = (productId) => setBillItems(prev => prev.filter(i => i.productId !== productId));

  const totalAmount = billItems.reduce((sum, i) => sum + i.quantity * i.pricePerUnit, 0);

  const submitBill = async () => {
    if (billItems.length === 0) return;
    setLoading(true);
    const paid = paymentMode === 'cash' ? totalAmount : paymentMode === 'credit' ? 0 : (parseFloat(paidAmount) || 0);
    const res = await fetch(`${API_URL}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomer._id,
        items: billItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMode, paidAmount: paid, notes, date: billDate
      })
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setLastBill({ ...data, customer: selectedCustomer }); setStep('success'); }
  };

  const resetBill = () => {
    setStep('customer'); setSelectedCustomer(null); setBillItems([]);
    setPaymentMode('cash'); setPaidAmount(''); setNotes(''); setLastBill(null);
  };

  const milkProducts = products.filter(p => p.category === 'milk');
  const dairyProducts = products.filter(p => p.category === 'dairy');

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{t('Billing')}</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>Create combined milk + dairy bills</p>
      </div>

      {/* Step Indicator */}
      {step !== 'success' && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
          {['customer', 'items', 'payment'].map((s, idx) => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: ['customer', 'items', 'payment'].indexOf(step) >= idx ? 'var(--primary)' : '#E2E8F0', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}

      {/* Step 1: Select Customer */}
      {step === 'customer' && (
        <div>
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Select Customer</h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input type="text" className="form-control" style={{ paddingLeft: '42px' }}
                placeholder={t('Search by name, number or phone')}
                value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
            </div>
            {searchResults.length > 0 && (
              <div style={{ marginTop: '12px', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                {searchResults.map(c => (
                  <div key={c._id} onClick={() => selectCustomer(c)}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{c.name}</span>
                        <span style={{ background: '#EFF6FF', color: '#1E40AF', fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '600', marginLeft: '8px' }}>{c.customerNumber}</span>
                        <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>{c.primaryPhone || c.phone}</div>
                      </div>
                      {c.outstandingBalance > 0 && (
                        <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '12px', padding: '3px 10px', borderRadius: '10px', fontWeight: '700' }}>
                          Due ₹{c.outstandingBalance}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Add Items */}
      {step === 'items' && selectedCustomer && (
        <div>
          {/* Selected Customer Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', background: '#EFF6FF', borderRadius: '14px', padding: '12px 16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', color: '#1E3A8A' }}>{selectedCustomer.name} <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedCustomer.customerNumber}</span></div>
              <div style={{ fontSize: '12px', color: '#3B82F6', marginTop: '2px' }}>{selectedCustomer.primaryPhone || selectedCustomer.phone}</div>
            </div>
            <button onClick={() => { setStep('customer'); setSelectedCustomer(null); }}
              style={{ background: 'rgba(37,99,235,0.1)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex' }}>
              <X size={14} color="#2563EB" />
            </button>
          </div>

          {/* Bill Date */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Bill Date</label>
            <input type="date" className="form-control" value={billDate} onChange={e => setBillDate(e.target.value)} />
          </div>

          {/* Milk Products */}
          {milkProducts.length > 0 && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Droplets size={18} color="#2563EB" />
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Milk</h3>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {milkProducts.map(p => {
                  const item = billItems.find(i => i.productId === p._id);
                  return (
                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>₹{p.price}/{p.unit}</div>
                      </div>
                      {item ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => updateQty(p._id, -0.5)} style={{ background: '#FEE2E2', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                            <Minus size={14} color="#DC2626" />
                          </button>
                          <span style={{ fontWeight: '700', fontSize: '15px', minWidth: '36px', textAlign: 'center' }}>{item.quantity}{p.unit}</span>
                          <button onClick={() => updateQty(p._id, 0.5)} style={{ background: '#D1FAE5', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                            <Plus size={14} color="#059669" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addItem(p)} style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '8px 16px', color: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dairy Products */}
          {dairyProducts.length > 0 && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Package size={18} color="#D97706" />
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Dairy Products</h3>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {dairyProducts.map(p => {
                  const item = billItems.find(i => i.productId === p._id);
                  return (
                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>₹{p.price}/{p.unit} • Stock: {p.currentStock}</div>
                      </div>
                      {item ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => updateQty(p._id, -0.5)} style={{ background: '#FEE2E2', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                            <Minus size={14} color="#DC2626" />
                          </button>
                          <span style={{ fontWeight: '700', fontSize: '15px', minWidth: '36px', textAlign: 'center' }}>{item.quantity}{p.unit}</span>
                          <button onClick={() => updateQty(p._id, 0.5)} style={{ background: '#D1FAE5', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                            <Plus size={14} color="#059669" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addItem(p)} disabled={p.currentStock === 0}
                          style={{ background: p.currentStock === 0 ? '#F1F5F9' : 'var(--primary)', border: 'none', borderRadius: '10px', padding: '8px 16px', color: p.currentStock === 0 ? 'var(--text-light)' : 'white', fontWeight: '600', fontSize: '13px', cursor: p.currentStock === 0 ? 'not-allowed' : 'pointer' }}>
                          {p.currentStock === 0 ? 'Out' : '+ Add'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bill Summary */}
          {billItems.length > 0 && (
            <div style={{ position: 'sticky', bottom: '90px', background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '12px' }}>
                {billItems.map(item => (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', color: 'var(--text-light)' }}>
                    <span>{item.productName} × {item.quantity}{item.unit}</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>₹{(item.quantity * item.pricePerUnit).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '700', fontSize: '16px' }}>Total: ₹{totalAmount.toFixed(2)}</span>
                <button onClick={() => setStep('payment')} className="btn" style={{ width: 'auto', padding: '12px 24px' }}>
                  <ShoppingCart size={16} /> Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 'payment' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), #60A5FA)', borderRadius: '16px', padding: '20px', marginBottom: '20px', color: 'white' }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Bill for {selectedCustomer.name}</div>
            <div style={{ fontSize: '32px', fontWeight: '800' }}>₹{totalAmount.toFixed(2)}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{billItems.length} items</div>
          </div>

          <div className="card">
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '13px', color: 'var(--text-light)', textTransform: 'uppercase' }}>{t('Payment Mode')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { value: 'cash', label: '💵 Cash', desc: 'Full payment' },
                  { value: 'credit', label: '📋 Credit', desc: 'Pay later' },
                  { value: 'partial', label: '🔄 Partial', desc: 'Split' },
                ].map(mode => (
                  <div key={mode.value} onClick={() => setPaymentMode(mode.value)}
                    style={{
                      border: `2px solid ${paymentMode === mode.value ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: '12px', padding: '12px', cursor: 'pointer', textAlign: 'center',
                      background: paymentMode === mode.value ? '#EFF6FF' : 'white', transition: 'all 0.2s'
                    }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: paymentMode === mode.value ? 'var(--primary)' : 'var(--text-color)' }}>{mode.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{mode.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {paymentMode === 'partial' && (
              <div className="form-group">
                <label>{t('Amount Paid')} (₹)</label>
                <input type="number" className="form-control" min="0" max={totalAmount} step="0.01"
                  value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder={`Max ₹${totalAmount.toFixed(2)}`} />
                {paidAmount && <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '8px' }}>
                  Balance due: ₹{Math.max(0, totalAmount - parseFloat(paidAmount || 0)).toFixed(2)}
                </div>}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>{t('Notes')}</label>
              <input type="text" className="form-control" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional bill note" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="btn btn-outline" style={{ background: '#F1F5F9', color: 'var(--text-color)', boxShadow: 'none', border: 'none' }}
                onClick={() => setStep('items')}>← Back</button>
              <button className="btn" onClick={submitBill} disabled={loading || (paymentMode === 'partial' && !paidAmount)}>
                {loading ? 'Creating...' : t('Create Bill')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {step === 'success' && lastBill && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '8px' }}>Bill Created!</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
            ₹{lastBill.totalAmount?.toFixed(2)} for {lastBill.customer?.name}
          </p>
          {lastBill.balanceDue > 0 && (
            <div style={{ background: '#FEE2E2', borderRadius: '12px', padding: '14px', marginBottom: '20px', color: '#DC2626', fontWeight: '600' }}>
              ₹{lastBill.balanceDue.toFixed(2)} added to outstanding balance
            </div>
          )}
          <button className="btn" onClick={resetBill}>Create Another Bill</button>
        </div>
      )}
    </div>
  );
}

export default Billing;
