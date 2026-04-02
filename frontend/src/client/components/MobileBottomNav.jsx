import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiGetCart } from '../../services/api';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/cart', label: 'Cart', icon: ShoppingBag },
  { path: '/orders', label: 'Orders', icon: ClipboardList },
  { path: '/account', label: 'Account', icon: User },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (!user) { setCartCount(0); return; }
    try {
      const items = await apiGetCart();
      setCartCount(Array.isArray(items) ? items.reduce((sum, i) => sum + i.quantity, 0) : 0);
    } catch { setCartCount(0); }
  }, [user]);

  useEffect(() => { fetchCartCount(); }, [fetchCartCount, location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          const needsAuth = path !== '/' && path !== '/search';
          const href = needsAuth && !user ? '/login' : path;

          return (
            <Link
              key={path}
              to={href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative ${active ? 'text-[#EF4F5F]' : 'text-gray-400'
                }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {path === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 flex items-center justify-center bg-[#EF4F5F] text-white text-[8px] font-bold rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
      `}</style>
    </nav>
  );
};

export default MobileBottomNav;
