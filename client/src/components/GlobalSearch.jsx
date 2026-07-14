import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User as UserIcon, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';

function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const search = useCallback((q) => {
    if (!q.trim()) { setResults([]); setIsOpen(false); return; }
    setLoading(true);
    fetch(`${API_URL}/api/customers/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => {
        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (customer) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    navigate(`/customers/${customer._id}`);
  };

  const milkTypeLabel = { full_cream: 'Full Cream', cow: 'Cow', buffalo: 'Buffalo' };

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '24px', padding: '8px 16px',
        transition: 'all 0.2s ease'
      }}>
        {loading ? (
          <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <Search size={16} color="rgba(255,255,255,0.8)" />
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={t('Search by name, number or phone')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            color: 'white', fontSize: '14px', width: '100%',
            fontFamily: 'inherit'
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <X size={14} color="rgba(255,255,255,0.7)" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div ref={dropdownRef} style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out'
        }}>
          {results.map(c => (
            <div key={c._id}
              onClick={() => handleSelect(c)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ background: c.type === 'delivery' ? '#EFF6FF' : '#FFFBEB', padding: '8px', borderRadius: '50%' }}>
                <UserIcon size={16} color={c.type === 'delivery' ? '#2563EB' : '#D97706'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>{c.name}</span>
                  <span style={{ background: '#EFF6FF', color: '#1E40AF', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                    {c.customerNumber}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  {c.primaryPhone || c.phone || 'No phone'} {c.secondaryPhone && `• ${c.secondaryPhone}`}
                  {' • '}{milkTypeLabel[c.milkType] || 'Cow'} Milk • {c.defaultQuantityLitres}L/day
                </div>
              </div>
              {c.outstandingBalance > 0 && (
                <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                  ₹{c.outstandingBalance}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && !loading && (
        <div ref={dropdownRef} style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid #E2E8F0', zIndex: 1000, padding: '20px', textAlign: 'center',
          color: '#64748B', fontSize: '14px'
        }}>
          {t('No results')} for "<strong>{query}</strong>"
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
