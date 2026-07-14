import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Package, Edit2, Trash2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, AlertTriangle, Droplets } from 'lucide-react';
import { API_URL } from '../config';

function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'dairy', milkTypeKey: '', unit: 'KG', price: '', isActive: true, currentStock: 0, lowStockThreshold: 5 });
  const [filterCat, setFilterCat] = useState('all');

  const fetchProducts = () => {
    setLoading(true);
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    setShowAdd(false); setEditingId(null);
    setFormData({ name: '', category: 'dairy', milkTypeKey: '', unit: 'KG', price: '', isActive: true, currentStock: 0, lowStockThreshold: 5 });
    fetchProducts();
  };

  const toggleActive = async (product) => {
    await fetch(`${API_URL}/api/products/${product._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !product.isActive })
    });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setFormData({ name: product.name, category: product.category, milkTypeKey: product.milkTypeKey || '', unit: product.unit, price: product.price, isActive: product.isActive, currentStock: product.currentStock, lowStockThreshold: product.lowStockThreshold });
    setShowAdd(true);
  };

  const adjustStock = async (product, delta) => {
    await fetch(`${API_URL}/api/products/${product._id}/stock`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment: delta })
    });
    fetchProducts();
  };

  const filtered = products.filter(p => filterCat === 'all' || p.category === filterCat);
  const milkProducts = filtered.filter(p => p.category === 'milk');
  const dairyProducts = filtered.filter(p => p.category === 'dairy');

  const milkTypeKeyMap = { full_cream: 'Full Cream', cow: 'Cow', buffalo: 'Buffalo' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{t('Products')}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>Manage pricing & inventory</p>
        </div>
        <button className="btn" style={{ width: 'auto', padding: '10px 20px', borderRadius: '20px', fontSize: '14px' }}
          onClick={() => { setShowAdd(!showAdd); setEditingId(null); }}>
          <Plus size={16} /> {showAdd && !editingId ? t('Cancel') : t('Add Product')}
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'milk', 'dairy'].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{
              padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'inherit',
              background: filterCat === cat ? 'var(--primary)' : '#F1F5F9',
              color: filterCat === cat ? 'white' : 'var(--text-light)', transition: 'all 0.2s'
            }}>
            {cat === 'all' ? 'All' : cat === 'milk' ? '🥛 Milk' : '🧀 Dairy'}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <div className="card" style={{ borderLeft: '4px solid var(--primary)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--primary)' }}>
            {editingId ? 'Edit Product' : t('Add Product')}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('Name')}</label>
              <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>{t('Category')}</label>
                <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="milk">Milk</option>
                  <option value="dairy">Dairy Product</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('Unit')}</label>
                <select className="form-control" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                  <option value="L">Litre (L)</option>
                  <option value="KG">Kilogram (KG)</option>
                  <option value="Glass">Glass</option>
                  <option value="Packet">Packet</option>
                </select>
              </div>
            </div>
            {formData.category === 'milk' && (
              <div className="form-group">
                <label>Milk Type Key</label>
                <select className="form-control" value={formData.milkTypeKey} onChange={e => setFormData({...formData, milkTypeKey: e.target.value})}>
                  <option value="">None</option>
                  <option value="full_cream">Full Cream</option>
                  <option value="cow">Cow</option>
                  <option value="buffalo">Buffalo</option>
                </select>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>{t('Price')} (₹)</label>
                <input type="number" step="0.01" min="0" className="form-control" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Low Stock Alert</label>
                <input type="number" min="0" className="form-control" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})} />
              </div>
            </div>
            {formData.category === 'dairy' && (
              <div className="form-group">
                <label>Initial Stock ({formData.unit})</label>
                <input type="number" step="0.1" min="0" className="form-control" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})} />
              </div>
            )}
            <button type="submit" className="btn">{editingId ? 'Update' : t('Save')}</button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}><div className="loader" /></div>
      ) : (
        <>
          {/* Milk Products */}
          {(filterCat === 'all' || filterCat === 'milk') && milkProducts.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Droplets size={18} color="#2563EB" />
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-color)' }}>Milk Types</h3>
              </div>
              {milkProducts.map(p => (
                <div key={p._id} className="card" style={{ padding: '14px 16px', marginBottom: '10px', opacity: p.isActive ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '15px' }}>{p.name}</span>
                        {!p.isActive && <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '600' }}>Inactive</span>}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
                        ₹{p.price}<span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-light)' }}>/{p.unit}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(p)} style={{ background: '#EFF6FF', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                        <Edit2 size={16} color="#2563EB" />
                      </button>
                      <button onClick={() => toggleActive(p)} style={{ background: p.isActive ? '#D1FAE5' : '#F1F5F9', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                        {p.isActive ? <ToggleRight size={16} color="#059669" /> : <ToggleLeft size={16} color="#64748B" />}
                      </button>
                      <button onClick={() => deleteProduct(p._id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                        <Trash2 size={16} color="#DC2626" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dairy Products */}
          {(filterCat === 'all' || filterCat === 'dairy') && dairyProducts.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Package size={18} color="#D97706" />
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-color)' }}>Dairy Products</h3>
              </div>
              {dairyProducts.map(p => (
                <div key={p._id} className="card" style={{ padding: '14px 16px', marginBottom: '10px', opacity: p.isActive ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '15px' }}>{p.name}</span>
                        {!p.isActive && <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '600' }}>Inactive</span>}
                        {p.currentStock <= p.lowStockThreshold && p.currentStock > 0 && (
                          <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <AlertTriangle size={11} /> Low Stock
                          </span>
                        )}
                        {p.currentStock === 0 && (
                          <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '600' }}>Out of Stock</span>
                        )}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#D97706', marginTop: '4px' }}>
                        ₹{p.price}<span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-light)' }}>/{p.unit}</span>
                      </div>
                      {/* Stock control */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Stock:</span>
                        <button onClick={() => adjustStock(p, -1)} style={{ background: '#FEE2E2', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex' }}>
                          <ChevronDown size={14} color="#DC2626" />
                        </button>
                        <span style={{ fontWeight: '700', fontSize: '15px', minWidth: '40px', textAlign: 'center' }}>{p.currentStock} {p.unit}</span>
                        <button onClick={() => adjustStock(p, 1)} style={{ background: '#D1FAE5', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex' }}>
                          <ChevronUp size={14} color="#059669" />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '12px' }}>
                      <button onClick={() => startEdit(p)} style={{ background: '#EFF6FF', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                        <Edit2 size={16} color="#2563EB" />
                      </button>
                      <button onClick={() => toggleActive(p)} style={{ background: p.isActive ? '#D1FAE5' : '#F1F5F9', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                        {p.isActive ? <ToggleRight size={16} color="#059669" /> : <ToggleLeft size={16} color="#64748B" />}
                      </button>
                      <button onClick={() => deleteProduct(p._id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                        <Trash2 size={16} color="#DC2626" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;
