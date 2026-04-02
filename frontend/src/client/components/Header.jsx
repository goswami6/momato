import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Search, ChevronDown, Menu, X, LogOut, User, ShoppingCart, ShoppingBag, Navigation, CalendarDays, Bookmark, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { apiGetCart } from '../../services/api';
import CityPicker from './CityPicker';

const Header = ({ transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const { user, logout } = useAuth();
  const { displayLocation } = useLocationCtx();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (!user) { setCartCount(0); return; }
    try {
      const items = await apiGetCart();
      setCartCount(Array.isArray(items) ? items.reduce((sum, i) => sum + i.quantity, 0) : 0);
    } catch { setCartCount(0); }
  }, [user]);

  useEffect(() => { fetchCartCount(); }, [fetchCartCount, location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerTheme = transparent && !isScrolled ? 'transparent' : 'white';

  return (
    <>
      {/* --- DESKTOP HEADER (Hidden on mobile) --- */}
      <header
        className={`hidden md:flex fixed top-0 left-0 w-full z-[1000] transition-all duration-300 h-[72px] items-center ${headerTheme === 'transparent'
          ? 'bg-transparent'
          : 'bg-white shadow-sm border-b border-gray-100'
          }`}
      >
        <div className="max-w-[1100px] mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo + Location */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <span className={`text-3xl font-black italic tracking-tighter transition-colors ${headerTheme === 'transparent' ? 'text-white' : 'text-[#EF4F5F]'
                }`}>
                momato
              </span>
            </Link>
            {/* City Picker Trigger */}
            <button
              onClick={() => setCityPickerOpen(true)}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${headerTheme === 'transparent'
                ? 'border-white/20 text-white/80 hover:bg-white/10'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <MapPin size={14} className={headerTheme === 'transparent' ? 'text-white/70' : 'text-[#EF4F5F]'} />
              <span className="text-sm font-medium max-w-[140px] truncate">{displayLocation}</span>
              <ChevronDown size={14} className="opacity-50" />
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-8">
            <Link
              to="/add-restaurant"
              className={`text-base font-medium ${headerTheme === 'transparent'
                ? 'text-white/90 hover:text-white'
                : 'text-gray-700 hover:text-[#EF4F5F]'
                } transition-colors`}
            >
              Add restaurant
            </Link>
            <Link
              to="/near-me"
              className={`text-base font-medium flex items-center gap-1 ${headerTheme === 'transparent'
                ? 'text-white/90 hover:text-white'
                : 'text-gray-700 hover:text-[#EF4F5F]'
                } transition-colors`}
            >
              <Navigation size={16} /> Near Me
            </Link>

            {user ? (
              <div className="flex items-center gap-5">
                <Link
                  to="/cart"
                  className={`text-sm font-medium flex items-center gap-1 ${headerTheme === 'transparent'
                    ? 'text-white/90 hover:text-white'
                    : 'text-gray-700 hover:text-[#EF4F5F]'
                    } transition-colors`}
                >
                  <ShoppingCart size={16} /> Cart
                  {cartCount > 0 && (
                    <span className="ml-0.5 w-5 h-5 flex items-center justify-center bg-[#EF4F5F] text-white text-[10px] font-bold rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EF4F5F] flex items-center justify-center text-white text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm font-medium ${headerTheme === 'transparent' ? 'text-white' : 'text-gray-700'
                      }`}>
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${userDropdownOpen ? 'rotate-180' : ''} ${headerTheme === 'transparent' ? 'text-white/70' : 'text-gray-400'}`} />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-[#1C1C1C]">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        {/* Links */}
                        <div className="py-1">
                          {[
                            { to: '/account', label: 'Profile', icon: User },
                            { to: '/orders', label: 'Orders', icon: ShoppingBag },
                            { to: '/reservations', label: 'Table Reservations', icon: CalendarDays },
                            { to: '/saved-restaurants', label: 'Bookmarks', icon: Bookmark },
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <item.icon size={16} className="text-gray-400" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut size={16} />
                            Log out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className={`text-base font-medium ${headerTheme === 'transparent'
                    ? 'text-white/90 hover:text-white'
                    : 'text-gray-700 hover:text-[#EF4F5F]'
                    } transition-colors`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${headerTheme === 'transparent'
                    ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                    : 'bg-[#EF4F5F] text-white hover:bg-[#d83a49] shadow-sm'
                    }`}
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* --- MOBILE HEADER (Optimized) --- */}
      <header className="md:hidden fixed top-0 left-0 w-full bg-white h-14 flex items-center justify-between px-4 z-[1000] shadow-sm">
        {/* Left: Hamburger Menu */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X size={22} className="text-gray-700" />
          ) : (
            <Menu size={22} className="text-gray-700" />
          )}
        </button>

        {/* Center: Logo + City */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1.5">
          <Link to="/">
            <span className="text-[#EF4F5F] text-2xl font-black italic tracking-tighter">
              momato
            </span>
          </Link>
          <button
            onClick={() => setCityPickerOpen(true)}
            className="flex items-center gap-0.5 text-gray-500"
          >
            <MapPin size={12} className="text-[#EF4F5F]" />
            <span className="text-[11px] font-medium max-w-[80px] truncate">{displayLocation}</span>
            <ChevronDown size={10} />
          </button>
        </div>

        {/* Right: User Icon / Login */}
        <div className="w-10 flex items-center justify-end">
          {user ? (
            <div className="w-8 h-8 rounded-full bg-[#EF4F5F] flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Link
              to="/login"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 hover:border-[#EF4F5F] hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="#EF4F5F" width="16" height="16" viewBox="0 0 20 20">
                <circle cx="10" cy="4.5" r="4.5"></circle>
                <path d="M18.18,14.73c-2.35-4.6-6.49-4.48-8.15-4.48s-5.86-.12-8.21,4.48C.59,17.14,1.29,20,4.54,20H15.46C18.71,20,19.41,17.14,18.18,14.73Z"></path>
              </svg>
            </Link>
          )}
        </div>

        {/* Mobile Menu Dropdown - Improved */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className="fixed top-14 left-0 w-[280px] h-[calc(100vh-56px)] bg-white shadow-xl z-50 animate-slide-right overflow-y-auto">
              <div className="flex flex-col p-5">
                {/* User Info Section */}
                {user && (
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-[#EF4F5F] flex items-center justify-center text-white text-base font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium truncate">{user.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                <div className="flex flex-col gap-1">
                  {/* Add Restaurant - Always visible */}
                  <Link
                    to="/add-restaurant"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#EF4F5F]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <span className="text-base font-medium">Add restaurant</span>
                  </Link>

                  <Link
                    to="/near-me"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#EF4F5F]">
                      <Navigation size={18} />
                    </div>
                    <span className="text-base font-medium">Near Me</span>
                  </Link>

                  {!user ? (
                    <>
                      {/* Login Option */}
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#EF4F5F]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                          </svg>
                        </div>
                        <span className="text-base font-medium">Log in</span>
                      </Link>

                      {/* Sign Up Option - Highlighted */}
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 bg-[#EF4F5F]/5 text-[#EF4F5F] rounded-xl transition-colors mt-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#EF4F5F]/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21v-2a4 4 0 0 0-3-3.85M17 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-base font-semibold">Sign up</span>
                          <p className="text-xs text-[#EF4F5F]/70">Create a new account</p>
                        </div>
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* My Account */}
                      <Link
                        to="/saved-restaurants"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors mt-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#EF4F5F]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <span className="text-base font-medium">Saved Restaurants</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#EF4F5F]">
                          <ShoppingBag size={18} />
                        </div>
                        <span className="text-base font-medium">My Orders</span>
                      </Link>

                      <Link
                        to="/reservations"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#EF4F5F]">
                          <CalendarDays size={18} />
                        </div>
                        <span className="text-base font-medium">My Reservations</span>
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="relative w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#EF4F5F]">
                          <ShoppingCart size={18} />
                          {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-[#EF4F5F] text-white text-[8px] font-bold rounded-full">
                              {cartCount}
                            </span>
                          )}
                        </div>
                        <span className="text-base font-medium">Cart</span>
                      </Link>

                      <Link
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors mt-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#EF4F5F]">
                          <User size={18} />
                        </div>
                        <span className="text-base font-medium">My Account</span>
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                          <LogOut size={18} className="text-red-600" />
                        </div>
                        <span className="text-base font-medium">Logout</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-6 text-xs text-gray-400 border-t border-gray-100">
                  <p>© 2024 momato</p>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Spacer for fixed header on mobile */}
      <div className="md:hidden h-14" />

      {/* City Picker Modal */}
      <CityPicker open={cityPickerOpen} onClose={() => setCityPickerOpen(false)} />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide-right {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-right {
          animation: slide-right 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;