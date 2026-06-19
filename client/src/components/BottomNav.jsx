import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, Truck, CheckSquare, FileText } from 'lucide-react';
import './BottomNav.css';

function BottomNav({ role }) {
  const { t } = useTranslation();

  return (
    <div className="bottom-nav">
      {role === 'admin' && (
        <>
          <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={24} />
            <span>{t('Dashboard')}</span>
          </NavLink>
          <NavLink to="/customers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={24} />
            <span>{t('Customers')}</span>
          </NavLink>
          <NavLink to="/distributors" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Truck size={24} />
            <span>{t('Distributors')}</span>
          </NavLink>
          <NavLink to="/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <FileText size={24} />
            <span>{t('Reports')}</span>
          </NavLink>
        </>
      )}
      <NavLink to="/deliveries" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
        <CheckSquare size={24} />
        <span>{t('Delivery')}</span>
      </NavLink>
    </div>
  );
}

export default BottomNav;
