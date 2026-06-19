import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../App';

function Login() {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data.user, data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="card" style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>{t('Login')}</h2>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('Phone Number')}</label>
          <input 
            type="text" 
            className="form-control" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>{t('Password')}</label>
          <input 
            type="password" 
            className="form-control" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn">{t('Login')}</button>
      </form>
    </div>
  );
}

export default Login;
