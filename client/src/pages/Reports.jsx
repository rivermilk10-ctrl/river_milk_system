import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Calculator, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { API_URL } from '../config';


function Reports() {
  const { t } = useTranslation();
  const [billingData, setBillingData] = useState([]);
  const [pricePerLitre, setPricePerLitre] = useState(70);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchBilling();
    fetchPrice();
  }, [month, year]);

  const fetchBilling = () => {
    fetch(`${API_URL}/api/reports/billing?month=${month}&year=${year}`)
      .then(res => res.json())
      .then(data => setBillingData(data));
  };

  const fetchPrice = () => {
    fetch(`${API_URL}/api/settings/pricePerLitre`)
      .then(res => res.json())
      .then(data => setPricePerLitre(data?.value || 70));
  };

  const savePrice = async () => {
    await fetch(`${API_URL}/api/settings/pricePerLitre`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: pricePerLitre })
    });
    fetchBilling();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const monthName = format(new Date(year, month, 1), 'MMMM yyyy');
    
    doc.setFontSize(20);
    doc.text(`River Milk - Billing Report (${monthName})`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Price per Litre: Rs. ${pricePerLitre}`, 14, 32);

    const tableData = billingData.map(row => [
      row.customer.name,
      row.customer.phone || '-',
      row.customer.type,
      `${row.totalLitres} L`,
      `Rs. ${row.totalAmount}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Customer', 'Phone', 'Type', 'Total Litres', 'Total Due']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`River_Milk_Report_${monthName}.pdf`);
  };

  const sendWhatsApp = (row) => {
    const monthName = format(new Date(year, month, 1), 'MMMM yyyy');
    const msg = `Hello ${row.customer.name},\n\nYour River Milk bill for *${monthName}* is *Rs. ${row.totalAmount}* for ${row.totalLitres} Litres of milk.\n\nPlease pay at your earliest convenience.\n\nThank you,\nRiver Milk`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/91${row.customer.phone}?text=${encoded}`, '_blank');
  };

  const months = Array.from({length: 12}, (_, i) => ({
    value: i, label: format(new Date(2000, i, 1), 'MMMM')
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>{t('Reports')}</h2>
      </div>

      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', padding: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-light)' }}>Month</label>
          <select className="form-control" value={month} onChange={e => setMonth(e.target.value)}>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-light)' }}>Price / Litre (Rs)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" className="form-control" value={pricePerLitre} onChange={e => setPricePerLitre(e.target.value)} />
            <button className="btn btn-outline" style={{ padding: '0 16px', width: 'auto' }} onClick={savePrice}>
              <Calculator size={20} />
            </button>
          </div>
        </div>
      </div>

      <button className="btn" onClick={exportPDF} style={{ marginBottom: '20px' }}>
        <Download size={20} /> Export to PDF
      </button>

      {billingData.map((row, idx) => (
        <div key={idx} className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '18px' }}>{row.customer.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>{row.deliveryCount} Deliveries • {row.totalLitres} L</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)' }}>₹{row.totalAmount}</div>
            </div>
          </div>
          
          {row.customer.phone && (
            <button className="btn btn-outline" style={{ padding: '8px', fontSize: '14px', width: '100%', marginTop: '8px' }} onClick={() => sendWhatsApp(row)}>
              Send Bill to WhatsApp
            </button>
          )}
        </div>
      ))}

      {billingData.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '60px' }}>
          <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p style={{ fontSize: '18px', fontWeight: '500' }}>No deliveries for this month.</p>
        </div>
      )}
    </div>
  );
}

export default Reports;
