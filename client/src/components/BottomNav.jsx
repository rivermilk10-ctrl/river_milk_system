import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, Truck, CheckSquare,
  FileText, Package, Receipt, Archive,
  MoreHorizontal, X
} from 'lucide-react';
import './BottomNav.css';

// Items shown in the persistent bottom bar for admin
const PRIMARY_ITEMS = [
  { to: '/',            end: true,  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers',   end: false, icon: Users,           label: 'Customers' },
  { to: '/billing',     end: false, icon: Receipt,         label: 'Billing'   },
  { to: '/deliveries',  end: false, icon: CheckSquare,     label: 'Delivery'  },
];

// Items hidden in the "More" drawer for admin
const MORE_ITEMS = [
  { to: '/products',     icon: Package,  label: 'Products'     },
  { to: '/distributors', icon: Truck,    label: 'Distributors' },
  { to: '/inventory',    icon: Archive,  label: 'Inventory'    },
  { to: '/reports',      icon: FileText, label: 'Reports'      },
];

function BottomNav({ role }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  // Check if any "More" item is currently active
  const isMoreActive = MORE_ITEMS.some(item => location.pathname.startsWith(item.to));

  if (role === 'distributor') {
    return (
      <div className="bottom-nav">
        <NavLink to="/deliveries" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon-wrap">
            <CheckSquare size={22} />
          </div>
          <span>{t('Delivery')}</span>
        </NavLink>
      </div>
    );
  }

  return (
    <>
      {/* More Drawer Backdrop */}
      {moreOpen && (
        <div className="more-backdrop" onClick={() => setMoreOpen(false)} />
      )}

      {/* More Drawer */}
      <div className={`more-drawer ${moreOpen ? 'open' : ''}`}>
        <div className="more-drawer-handle" onClick={() => setMoreOpen(false)}>
          <div className="more-drawer-pill" />
        </div>
        <p className="more-drawer-title">More</p>
        <div className="more-drawer-grid">
          {MORE_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMoreOpen(false)}
                className={active ? 'drawer-item active' : 'drawer-item'}
              >
                <div className="drawer-icon-wrap">
                  <Icon size={24} />
                </div>
                <span>{t(label)}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="bottom-nav">
        {PRIMARY_ITEMS.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <div className="nav-icon-wrap">
              <Icon size={22} />
            </div>
            <span>{t(label)}</span>
          </NavLink>
        ))}

        {/* More button */}
        <button
          className={`nav-item nav-more-btn ${isMoreActive || moreOpen ? 'active' : ''}`}
          onClick={() => setMoreOpen(prev => !prev)}
          aria-label="More options"
        >
          <div className="nav-icon-wrap">
            {moreOpen ? <X size={22} /> : <MoreHorizontal size={22} />}
          </div>
          <span>{t('More')}</span>
        </button>
      </div>
    </>
  );
}

export default BottomNav;
