import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Clock, MapPin, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGetRestaurants } from '../../services/api';
import { useLocation as useLocationCtx } from '../../context/LocationContext';

const tabs = [
  { id: 'dining', label: 'Dining Out', icon: 'https://b.zmtcdn.com/data/o2_assets/30fa0a844f3ba82073e5f78c65c18b371616149662.png', inactiveIcon: 'https://b.zmtcdn.com/data/o2_assets/78d25215ff4c1299578ed36eefd5f39d1616149985.png', color: '#E5F3F3' },
  { id: 'delivery', label: 'Delivery', icon: 'https://b.zmtcdn.com/data/o2_assets/246bbd71fbba420d5996452be3024d351616150055.png', inactiveIcon: 'https://b.zmtcdn.com/data/o2_assets/c10544c8739d6f06a8820df36541334c1616146114.png', color: '#FCEEC0' },
  { id: 'nightlife', label: 'Nightlife', icon: 'https://b.zmtcdn.com/data/o2_assets/01040767e4943c398e38e3592bb1ba8a1616150142.png', inactiveIcon: 'https://b.zmtcdn.com/data/o2_assets/ed73373f2e005d524694cf604f7614ad1616150392.png', color: '#EDF4FF' },
];

const tabMeta = {
  dining: { title: 'Best Dining Restaurants', desc: 'Explore top-rated restaurants for dining out' },
  delivery: { title: 'Order Food Online', desc: 'Get your favourite food delivered to your doorstep' },
  nightlife: { title: 'Nightlife & Bars', desc: 'Popular bars, pubs and clubs near you' },
};

const priceLabel = (costForTwo, priceRange) => {
  if (costForTwo) return `₹${costForTwo}`;
  const map = { low: '₹300', medium: '₹600', high: '₹1200', premium: '₹2000' };
  return map[priceRange] || '₹500';
};

const getRatingColor = (r) => {
  if (r >= 4.5) return 'bg-[#24963F]';
  if (r >= 4.0) return 'bg-[#489454]';
  return 'bg-[#CDD614]';
};

const tabRoutes = { dining: '/dining', delivery: '/delivery', nightlife: '/nightlife' };

const ModernTabSection = () => {
  const [activeTab, setActiveTab] = useState('dining');
  const [tabData, setTabData] = useState({ dining: [], delivery: [], nightlife: [] });
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { city } = useLocationCtx();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const data = await apiGetRestaurants({ limit: 50, location: city });
        const restaurants = data.restaurants || [];
        setTabData({
          dining: restaurants.filter((r) => r.hasDineIn),
          delivery: restaurants.filter((r) => r.hasDelivery),
          nightlife: restaurants.filter((r) => r.hasNightlife || r.hasAlcohol),
        });
      } catch (err) {
        console.error('Failed to fetch restaurants for tabs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [city]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' });
  };

  const current = tabData[activeTab] || [];

  return (
    <div className="bg-[#FCFCFC] min-h-screen">
      {/* ── STICKY MODERN TAB BAR ── */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto flex items-center gap-4 sm:gap-8 md:gap-12 px-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 sm:gap-4 py-4 sm:py-5 group outline-none shrink-0"
              >
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100`}
                  style={{ backgroundColor: isActive ? tab.color : '#F8F8F8' }}
                >
                  <img src={isActive ? tab.icon : tab.inactiveIcon} alt="" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                </div>
                <span className={`text-sm sm:text-base md:text-xl font-medium transition-colors ${isActive ? 'text-[#EF4F5F]' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 w-full h-[3px] bg-[#EF4F5F] rounded-t-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── CONTENT SECTION ── */}
      <main className="max-w-[1100px] mx-auto px-4 py-8 md:py-12">
        <header className="mb-6 md:mb-10">
          <motion.h2
            key={activeTab + 'title'}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1C1C1C]"
          >
            {tabMeta[activeTab].title}
          </motion.h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base md:text-lg font-light">{tabMeta[activeTab].desc}</p>
          <button
            onClick={() => navigate(tabRoutes[activeTab])}
            className="mt-4 inline-flex items-center gap-1.5 text-[#EF4F5F] font-semibold text-sm hover:underline"
          >
            See all restaurants <ArrowRight size={16} />
          </button>
        </header>

        {/* ── RESTAURANT SLIDER ── */}
        <div className="relative group/slider">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-xl border border-gray-100 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-gray-50"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-8"
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[280px] sm:w-[300px] md:w-[330px] bg-white rounded-[20px] overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-[220px] bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3 mt-4" />
                  </div>
                </div>
              ))
            ) : current.length === 0 ? (
              <div className="w-full text-center py-16 text-gray-400">
                <p className="text-lg">No restaurants found for this category</p>
              </div>
            ) : (
              <AnimatePresence mode='wait'>
                {current.map((res, index) => (
                  <motion.div
                    key={res.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="shrink-0 w-[280px] sm:w-[300px] md:w-[330px] bg-white rounded-[20px] overflow-hidden border border-gray-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer group"
                  >
                    <Link to={`/restaurant/${res.id}`} className="block">
                      {/* Image wrapper */}
                      <div className="relative h-[220px] overflow-hidden">
                        <img
                          src={res.image ? (res.image.startsWith('http') ? res.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${res.image}`) : 'https://via.placeholder.com/330x220?text=Restaurant'}
                          alt={res.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {res.deliveryTime && activeTab === 'delivery' && (
                          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 text-xs font-bold text-gray-800">
                            <Clock size={14} className="text-blue-500" /> {res.deliveryTime}
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-800 truncate pr-2 group-hover:text-[#EF4F5F] transition-colors">
                            {res.name}
                          </h3>
                          {res.rating > 0 && (
                            <div className={`${getRatingColor(res.rating)} text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 text-sm font-bold shadow-sm`}>
                              {res.rating} <Star size={12} fill="white" stroke="none" />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between text-sm text-gray-500 font-medium">
                          <span className="truncate w-2/3">{res.cuisine}</span>
                          <span className="text-gray-800">{priceLabel(res.costForTwo, res.priceRange)} for two</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={12} /> {res.address || res.city}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-xl border border-gray-100 opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-gray-50"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </main>

      {/* ── CUSTOM STYLES ── */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ModernTabSection;