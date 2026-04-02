import React, { useState } from 'react';
import { X, MapPin, Navigation, Search, Check } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

const cityIcons = {
  'Delhi': 'https://b.zmtcdn.com/data/city_assets/city_icons/delhi_ncr-bg.png',
  'Mumbai': 'https://b.zmtcdn.com/data/city_assets/city_icons/mumbai-bg.png',
  'Bangalore': 'https://b.zmtcdn.com/data/city_assets/city_icons/bangalore-bg.png',
  'Hyderabad': 'https://b.zmtcdn.com/data/city_assets/city_icons/hyderabad-bg.png',
  'Pune': 'https://b.zmtcdn.com/data/city_assets/city_icons/pune-bg.png',
  'Kolkata': 'https://b.zmtcdn.com/data/city_assets/city_icons/kolkata-bg.png',
  'Chennai': 'https://b.zmtcdn.com/data/city_assets/city_icons/chennai-bg.png',
  'Jaipur': 'https://b.zmtcdn.com/data/city_assets/city_icons/jaipur-bg.png',
  'Lucknow': 'https://b.zmtcdn.com/data/city_assets/city_icons/lucknow-bg.png',
  'Chandigarh': 'https://b.zmtcdn.com/data/city_assets/city_icons/chandigarh-bg.png',
};

const CityPicker = ({ open, onClose }) => {
  const { city, selectCity, detectLocation, geoStatus, popularCities } = useLocation();
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filtered = search
    ? popularCities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : popularCities;

  const handleSelect = (cityName) => {
    selectCity(cityName);
    onClose();
  };

  const handleDetect = () => {
    detectLocation();
    // Close after short delay for geo detection
    setTimeout(() => onClose(), 1500);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-0 top-0 md:top-[10vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-[2001] w-full md:max-w-[520px] md:rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[100dvh] md:max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1C1C1C]">Select your city</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for your city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#EF4F5F] transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Detect Location */}
        <div className="px-5 py-3">
          <button
            onClick={handleDetect}
            disabled={geoStatus === 'loading'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-[#EF4F5F]/30 bg-[#EF4F5F]/5 hover:bg-[#EF4F5F]/10 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#EF4F5F]/10 flex items-center justify-center flex-shrink-0">
              {geoStatus === 'loading' ? (
                <div className="w-4 h-4 border-2 border-[#EF4F5F]/30 border-t-[#EF4F5F] rounded-full animate-spin" />
              ) : (
                <Navigation size={18} className="text-[#EF4F5F]" />
              )}
            </div>
            <div className="text-left">
              <span className="text-sm font-semibold text-[#EF4F5F]">
                {geoStatus === 'loading' ? 'Detecting location...' : 'Detect my location'}
              </span>
              <p className="text-xs text-gray-400">Using GPS</p>
            </div>
          </button>
        </div>

        {/* Popular Cities */}
        <div className="px-5 pb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular Cities</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filtered.map((c) => {
              const isActive = c.name === city;
              return (
                <button
                  key={c.name}
                  onClick={() => handleSelect(c.name)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:shadow-sm ${isActive
                      ? 'border-[#EF4F5F] bg-red-50/60'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                >
                  {cityIcons[c.name] ? (
                    <img
                      src={cityIcons[c.name]}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 rounded-full bg-gray-100 items-center justify-center ${cityIcons[c.name] ? 'hidden' : 'flex'}`}>
                    <MapPin size={18} className="text-[#EF4F5F]" />
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${isActive ? 'text-[#EF4F5F]' : 'text-[#1C1C1C]'}`}>
                    {c.name}
                  </span>
                  {isActive && <Check size={14} className="text-[#EF4F5F]" />}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No cities found for "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CityPicker;
