import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import Distributors from './pages/Distributors';
import Deliveries from './pages/Deliveries';
import Reports from './pages/Reports';
import Products from './pages/Products';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import LanguageToggle from './components/LanguageToggle';
import BottomNav from './components/BottomNav';
import GlobalSearch from './components/GlobalSearch';
import './App.css';

export const AuthContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setAuthLoaded(true);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Don't render routes until we know if user is logged in (prevents redirect flicker on reload)
  if (!authLoaded) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="app-header">
          <h2 style={{ flexShrink: 0 }}>River Milk</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
            {/* Global Search — always visible when logged in */}
            {user && <GlobalSearch />}
            <LanguageToggle />
            {user && (
              <button
                onClick={logout}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '50%', flexShrink: 0, backdropFilter: 'blur(4px)' }}
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="container">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

            <Route path="/" element={
              user ? (user.role === 'admin' ? <Dashboard /> : <Navigate to="/deliveries" />) : <Navigate to="/login" />
            } />

            {/* Customer routes */}
            <Route path="/customers" element={user && user.role === 'admin' ? <Customers /> : <Navigate to="/login" />} />
            <Route path="/customers/:id" element={user ? <CustomerProfile /> : <Navigate to="/login" />} />

            {/* Admin-only routes */}
            <Route path="/distributors" element={user && user.role === 'admin' ? <Distributors /> : <Navigate to="/login" />} />
            <Route path="/reports" element={user && user.role === 'admin' ? <Reports /> : <Navigate to="/login" />} />
            <Route path="/products" element={user && user.role === 'admin' ? <Products /> : <Navigate to="/login" />} />
            <Route path="/billing" element={user && user.role === 'admin' ? <Billing /> : <Navigate to="/login" />} />
            <Route path="/inventory" element={user && user.role === 'admin' ? <Inventory /> : <Navigate to="/login" />} />

            {/* Shared */}
            <Route path="/deliveries" element={user ? <Deliveries /> : <Navigate to="/login" />} />
          </Routes>
        </div>

        {user && <BottomNav role={user.role} />}
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
