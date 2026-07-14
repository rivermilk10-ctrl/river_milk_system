import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Phone, Search, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { API_URL } from '../config';

const TABS = ['Milk Sales', 'Dairy Sales', 'Pending Payments', 'Inventory', 'Customer Ledger'];

function Reports() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Milk Sales');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [billingData, setBillingData] = useState([]);
  const [dairySalesData, setDairySalesData] = useState({ sales: [], productSummary: [] });
  const [pendingData, setPendingData] = useState({ customers: [], total: 0 });
  const [inventoryData, setInventoryData] = useState([]);
  const [ledgerData, setLedgerData] = useState(null);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerResults, setLedgerResults] = useState([]);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  const months = Array.from({length: 12}, (_, i) => ({ value: i, label: format(new Date(2000, i, 1), 'MMMM') }));

  useEffect(() => {
    if (activeTab === 'Milk Sales') fetchBilling();
    if (activeTab === 'Dairy Sales') fetchDairySales();
    if (activeTab === 'Pending Payments') fetchPending();
    if (activeTab === 'Inventory') fetchInventory();
  }, [activeTab, month, year]);

  const fetchBilling = () => {
    setLoading(true);
    fetch(`${API_URL}/api/reports/billing?month=${month}&year=${year}`)
      .then(r => r.json()).then(data => { setBillingData(Array.isArray(data) ? data : []); setLoading(false); });
  };

  const fetchDairySales = () => {
    setLoading(true);
    fetch(`${API_URL}/api/reports/dairy-sales?month=${month}&year=${year}`)
      .then(r => r.json()).then(data => { setDairySalesData(data || {}); setLoading(false); });
  };

  const fetchPending = () => {
    setLoading(true);
    fetch(`${API_URL}/api/reports/pending-payments`)
      .then(r => r.json()).then(data => { setPendingData(data || {}); setLoading(false); });
  };

  const fetchInventory = () => {
    setLoading(true);
    fetch(`${API_URL}/api/reports/inventory`)
      .then(r => r.json()).then(data => { setInventoryData(data?.products || []); setLoading(false); });
  };

  const fetchLedger = async (customerId) => {
    setLoading(true);
    const data = await fetch(`${API_URL}/api/reports/customer-ledger/${customerId}`).then(r => r.json());
    setLedgerData(data);
    setLoading(false);
  };

  // Ledger customer search
  useEffect(() => {
    if (!ledgerSearch.trim()) { setLedgerResults([]); return; }
    const t = setTimeout(() => {
      fetch(`${API_URL}/api/customers/search?q=${encodeURIComponent(ledgerSearch)}`)
        .then(r => r.json()).then(data => setLedgerResults(Array.isArray(data) ? data : []));
    }, 300);
    return () => clearTimeout(t);
  }, [ledgerSearch]);

  const monthName = format(new Date(year, month, 1), 'MMMM yyyy');

  // ─── PDF Export ─────────────────────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`River Milk — ${activeTab} (${monthName})`, 14, 22);

    if (activeTab === 'Milk Sales') {
      autoTable(doc, {
        startY: 32,
        head: [['#', 'Customer', 'Customer No.', 'Phone', 'Type', 'Deliveries', 'Total L', 'Total Due']],
        body: billingData.map((r, i) => [
          i+1, r.customer.name, r.customer.customerNumber || '—',
          r.customer.primaryPhone || r.customer.phone || '—',
          r.customer.type, r.deliveryCount,
          `${r.totalLitres}L`, `₹${r.totalAmount.toFixed(2)}`
        ]),
        theme: 'grid', headStyles: { fillColor: [37, 99, 235] }
      });
    } else if (activeTab === 'Dairy Sales') {
      autoTable(doc, {
        startY: 32,
        head: [['Product', 'Qty Sold', 'Revenue']],
        body: (dairySalesData.productSummary || []).map(p => [p.productName, `${p.totalQty}${p.unit}`, `₹${p.totalRevenue.toFixed(2)}`]),
        theme: 'grid', headStyles: { fillColor: [217, 119, 6] }
      });
    } else if (activeTab === 'Pending Payments') {
      autoTable(doc, {
        startY: 32,
        head: [['Customer No.', 'Name', 'Phone', 'Outstanding']],
        body: (pendingData.customers || []).map(c => [c.customerNumber, c.name, c.primaryPhone || c.phone || '—', `₹${c.outstandingBalance.toFixed(2)}`]),
        theme: 'grid', headStyles: { fillColor: [220, 38, 38] }
      });
    } else if (activeTab === 'Inventory') {
      autoTable(doc, {
        startY: 32,
        head: [['Product', 'Category', 'Stock', 'Unit', 'Alert At', 'Status']],
        body: inventoryData.filter(p => p.category === 'dairy').map(p => [
          p.name, p.category, p.currentStock, p.unit, p.lowStockThreshold,
          p.currentStock === 0 ? 'Out of Stock' : p.currentStock <= p.lowStockThreshold ? 'Low Stock' : 'OK'
        ]),
        theme: 'grid', headStyles: { fillColor: [5, 150, 105] }
      });
    }

    doc.save(`RiverMilk_${activeTab.replace(' ','_')}_${monthName.replace(' ','_')}.pdf`);
  };

  // ─── Excel Export ────────────────────────────────────────────────────────────
  const exportExcel = () => {
    let rows = [], sheetName = activeTab;

    if (activeTab === 'Milk Sales') {
      rows = billingData.map((r, i) => ({
        '#': i+1, 'Customer No.': r.customer.customerNumber || '—', 'Name': r.customer.name,
        'Phone': r.customer.primaryPhone || r.customer.phone || '—',
        'Type': r.customer.type, 'Deliveries': r.deliveryCount,
        'Total Litres': r.totalLitres, 'Total Due (₹)': r.totalAmount
      }));
    } else if (activeTab === 'Dairy Sales') {
      rows = (dairySalesData.productSummary || []).map(p => ({
        'Product': p.productName, 'Total Qty': p.totalQty, 'Unit': p.unit, 'Revenue (₹)': p.totalRevenue
      }));
    } else if (activeTab === 'Pending Payments') {
      rows = (pendingData.customers || []).map(c => ({
        'Customer No.': c.customerNumber, 'Name': c.name,
        'Primary Phone': c.primaryPhone || c.phone || '—', 'Secondary Phone': c.secondaryPhone || '—',
        'Outstanding (₹)': c.outstandingBalance
      }));
    } else if (activeTab === 'Inventory') {
      rows = inventoryData.filter(p => p.category === 'dairy').map(p => ({
        'Product': p.name, 'Stock': p.currentStock, 'Unit': p.unit, 'Alert At': p.lowStockThreshold,
        'Price': p.price, 'Status': p.currentStock === 0 ? 'Out of Stock' : p.currentStock <= p.lowStockThreshold ? 'Low Stock' : 'OK'
      }));
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
    XLSX.writeFile(wb, `RiverMilk_${sheetName.replace(' ','_')}_${monthName.replace(' ','_')}.xlsx`);
  };

  const sendWhatsApp = (row) => {
    const qrLink = `${window.location.origin}/payment-qr.webp`;
    const msg = `Hello ${row.customer.name},\n\nYour River Milk bill for *${monthName}* is *₹${row.totalAmount.toFixed(2)}* for ${row.totalLitres}L of milk.\n\nPlease pay at your earliest convenience using this QR code: ${qrLink}\n\nThank you,\nRiver Milk`;
    window.open(`https://wa.me/91${row.customer.primaryPhone || row.customer.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{t('Reports')}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportExcel} className="btn btn-outline" style={{ width: 'auto', padding: '8px 14px', fontSize: '13px', background: '#D1FAE5', color: '#059669', border: 'none', boxShadow: 'none' }}>
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={exportPDF} className="btn btn-outline" style={{ width: 'auto', padding: '8px 14px', fontSize: '13px', background: '#EFF6FF', color: 'var(--primary)', border: 'none', boxShadow: 'none' }}>
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Month/Year Selector (for time-based reports) */}
      {['Milk Sales', 'Dairy Sales'].includes(activeTab) && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <select className="form-control" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select className="form-control" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '12px', fontFamily: 'inherit', whiteSpace: 'nowrap',
              background: activeTab === tab ? 'var(--primary)' : '#F1F5F9',
              color: activeTab === tab ? 'white' : 'var(--text-light)', transition: 'all 0.2s'
            }}>
            {tab}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', marginTop: '40px' }}><div className="loader" /></div>}

      {/* ─ Milk Sales ─ */}
      {!loading && activeTab === 'Milk Sales' && (
        <div>
          {billingData.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '60px' }}>
              <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>No deliveries for {monthName}.</p>
            </div>
          ) : billingData.map((row, idx) => (
            <div key={idx} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>{row.customer.name}</span>
                    <span style={{ background: '#EFF6FF', color: '#1E40AF', fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '600', fontFamily: 'monospace' }}>{row.customer.customerNumber}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
                    {row.deliveryCount} deliveries · {row.totalLitres}L
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--success)' }}>₹{row.totalAmount.toFixed(2)}</div>
              </div>
              {(row.customer.primaryPhone || row.customer.phone) && (
                <button className="btn btn-outline" style={{ padding: '8px', fontSize: '13px', width: '100%', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', boxShadow: 'none' }}
                  onClick={() => sendWhatsApp(row)}>
                  📱 Send Bill to WhatsApp
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─ Dairy Sales ─ */}
      {!loading && activeTab === 'Dairy Sales' && (
        <div>
          {(dairySalesData.productSummary || []).length > 0 && (
            <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
              {dairySalesData.productSummary.map((p, i) => (
                <div key={i} className="card" style={{ padding: '14px 16px', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{p.productName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{p.totalQty} {p.unit} sold</div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#D97706' }}>₹{p.totalRevenue.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
          {(dairySalesData.productSummary || []).length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '60px' }}>
              <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>No dairy sales for {monthName}.</p>
            </div>
          )}
        </div>
      )}

      {/* ─ Pending Payments ─ */}
      {!loading && activeTab === 'Pending Payments' && (
        <div>
          {pendingData.total > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', borderRadius: '16px', padding: '16px 20px', marginBottom: '16px', color: 'white' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Outstanding</div>
              <div style={{ fontSize: '32px', fontWeight: '800' }}>₹{pendingData.total.toFixed(2)}</div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>{pendingData.count} customers pending</div>
            </div>
          )}
          {(pendingData.customers || []).length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
              <p style={{ fontWeight: '600' }}>{t('No pending payments')}</p>
            </div>
          ) : pendingData.customers.map((c, i) => (
            <div key={i} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>{c.name}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '8px' }}>{c.customerNumber}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '3px' }}>
                    {c.primaryPhone || c.phone || '—'}
                    {c.secondaryPhone && ` · ${c.secondaryPhone}`}
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#DC2626' }}>₹{c.outstandingBalance.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─ Inventory ─ */}
      {!loading && activeTab === 'Inventory' && (
        <div>
          {inventoryData.filter(p => p.category === 'dairy').map((p, i) => (
            <div key={i} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{p.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>Alert at {p.lowStockThreshold} {p.unit}</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: p.currentStock === 0 ? '#DC2626' : p.currentStock <= p.lowStockThreshold ? '#D97706' : '#059669', textAlign: 'right' }}>
                    {p.currentStock} {p.unit}
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '8px', fontWeight: '600',
                    background: p.currentStock === 0 ? '#FEE2E2' : p.currentStock <= p.lowStockThreshold ? '#FEF3C7' : '#D1FAE5',
                    color: p.currentStock === 0 ? '#DC2626' : p.currentStock <= p.lowStockThreshold ? '#D97706' : '#059669'
                  }}>
                    {p.currentStock === 0 ? 'Out of Stock' : p.currentStock <= p.lowStockThreshold ? 'Low Stock' : 'OK'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─ Customer Ledger ─ */}
      {activeTab === 'Customer Ledger' && (
        <div>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" className="form-control" style={{ paddingLeft: '42px' }}
              placeholder={t('Search customers')}
              value={ledgerSearch} onChange={e => { setLedgerSearch(e.target.value); setSelectedLedgerCustomer(null); setLedgerData(null); }} />
          </div>
          {ledgerResults.length > 0 && !selectedLedgerCustomer && (
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
              {ledgerResults.map(c => (
                <div key={c._id} onClick={() => { setSelectedLedgerCustomer(c); setLedgerSearch(''); setLedgerResults([]); fetchLedger(c._id); }}
                  style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', fontWeight: '600' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {c.name} <span style={{ color: 'var(--text-light)', fontFamily: 'monospace', fontSize: '12px' }}>{c.customerNumber}</span>
                </div>
              ))}
            </div>
          )}
          {loading && <div style={{ textAlign: 'center', marginTop: '40px' }}><div className="loader" /></div>}
          {ledgerData && (
            <div>
              <div style={{ background: '#EFF6FF', borderRadius: '14px', padding: '14px 18px', marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '16px', color: '#1E3A8A' }}>{ledgerData.customer.name}</div>
                <div style={{ fontSize: '13px', color: '#3B82F6', marginTop: '2px' }}>Balance: <strong>₹{ledgerData.outstandingBalance?.toFixed(2)}</strong></div>
              </div>
              {(ledgerData.ledger || []).map((entry, idx) => (
                <div key={idx} className="card" style={{ padding: '12px 14px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {entry.type === 'sale' ? `🧾 Bill ₹${entry.amount.toFixed(2)}` : `💰 Payment ₹${entry.amount.toFixed(2)}`}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                        {format(new Date(entry.date), 'dd MMM yyyy')}
                        {entry.type === 'sale' && ` · ${entry.paymentMode}`}
                      </div>
                    </div>
                    {entry.type === 'sale' && entry.balance > 0 && (
                      <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '12px', padding: '2px 8px', borderRadius: '8px', fontWeight: '700' }}>Due ₹{entry.balance.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;
