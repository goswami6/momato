import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, Star, MapPin, Clock, ChevronDown, X } from 'lucide-react';
import { apiGetRestaurants } from '../../services/api';

const filterDefs = [
  { id: 'isVeg', label: 'Pure Veg', param: 'isVeg' },
  { id: 'hasAlcohol', label: 'Serves Alcohol', param: 'hasAlcohol' },
  { id: 'petFriendly', label: 'Pet Friendly', param: 'petFriendly' },
  { id: 'hasOutdoorSeating', label: 'Outdoor Seating', param: 'hasOutdoorSeating' },
  { id: 'isOpen', label: 'Open Now', param: 'isOpen' },
];

const getRatingColor = (r) => {
  if (r >= 4.5) return 'bg-[#267E3E]';
  if (r >= 4.0) return 'bg-[#3F8F46]';
  if (r >= 3.5) return 'bg-[#CDD614]';
  return 'bg-[#DB7C38]';
};

const FilterSection = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOpen, setSortOpen] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      activeFilters.forEach((fId) => { params[fId] = true; });
      if (sortBy !== 'relevance') params.sort = sortBy;
      params.limit = 12;
      const data = await apiGetRestaurants(params);
      setRestaurants(data.restaurants || []);
      setTotal(data.total || 0);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, sortBy]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  };

  const clearAll = () => {
    setActiveFilters([]);
    setSortBy('relevance');
  };

  return (
    <section className="bg-white py-8">
      <div className="main-container">
        <h2 className="text-xl sm:text-2xl md:text-[26px] font-semibold text-[#1C1C1C] mb-6">
          Best Restaurants Near You
        </h2>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-[#1C1C1C] text-sm font-medium hover:bg-gray-50 transition-colors shrink-0">
            <SlidersHorizontal size={16} className="text-[#9C9C9C]" />
            Filters
            {activeFilters.length > 0 && (
              <span className="bg-[#EF4F5F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>

          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#1C1C1C] hover:bg-gray-50 transition-colors"
            >
              Sort
              <ChevronDown size={14} className={`text-[#9C9C9C] transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 z-50 py-1 overflow-hidden">
                  {[
                    { value: 'relevance', label: 'Relevance' },
                    { value: 'rating', label: 'Rating: High to Low' },
                    { value: 'costLow', label: 'Cost: Low to High' },
                    { value: 'costHigh', label: 'Cost: High to Low' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === opt.value ? 'text-[#EF4F5F] bg-red-50 font-medium' : 'text-[#1C1C1C] hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-7 bg-gray-200 shrink-0" />

          {filterDefs.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#EF4F5F] text-white border-[#EF4F5F] shadow-sm'
                    : 'bg-white text-[#1C1C1C] border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter.label}
                {isActive && <X size={14} />}
              </button>
            );
          })}

          {activeFilters.length > 0 && (
            <button onClick={clearAll} className="text-[#EF4F5F] text-sm font-medium whitespace-nowrap hover:underline shrink-0 ml-1">
              Clear all
            </button>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mt-5 mb-6">
          <p className="text-sm text-[#696969]">
            {loading ? 'Loading...' : `${total} restaurant${total !== 1 ? 's' : ''} found`}
            {activeFilters.length > 0 && <span> matching your filters</span>}
          </p>
          {sortBy !== 'relevance' && (
            <p className="text-sm text-[#696969]">
              Sorted by:{' '}
              <span className="font-medium text-[#1C1C1C]">
                {sortBy === 'rating' && 'Rating'}
                {sortBy === 'costLow' && 'Cost: Low to High'}
                {sortBy === 'costHigh' && 'Cost: High to Low'}
              </span>
            </p>
          )}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse">
                <div className="h-[200px] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r) => {
              const rating = Number(r.avgRating || r.rating || 0);
              return (
                <Link
                  key={r.id}
                  to={`/restaurant/${r.id}`}
                  className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)] transition-all duration-300 group"
                >
                  <div className="relative h-[200px] overflow-hidden bg-gray-100">
                    {r.image ? (
                      <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#1C1C1C] text-xs font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                      <Clock size={12} /> 30 min
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[16px] font-semibold text-[#1C1C1C] leading-snug truncate group-hover:text-[#EF4F5F] transition-colors">
                        {r.name}
                      </h3>
                      <span className={`shrink-0 flex items-center gap-0.5 text-white text-xs font-bold px-1.5 py-0.5 rounded ${getRatingColor(rating)}`}>
                        {rating.toFixed(1)} <Star size={10} fill="white" stroke="none" />
                      </span>
                    </div>
                    {r.cuisine && <p className="text-[13px] text-[#696969] mt-1 truncate">{r.cuisine}</p>}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-[12px] text-[#9c9c9c] flex items-center gap-1">
                        <MapPin size={11} /> {r.area || 'Varanasi'}
                      </span>
                      {r.costForTwo && (
                        <span className="text-[12px] font-medium text-[#696969]">Rs.{r.costForTwo} for two</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {r.isOpen && (
                        <span className="text-[10px] font-medium text-[#267E3E] bg-green-50 px-2 py-0.5 rounded-full">Open Now</span>
                      )}
                      {r.petFriendly && (
                        <span className="text-[10px] font-medium text-[#7B61FF] bg-purple-50 px-2 py-0.5 rounded-full">Pet Friendly</span>
                      )}
                      {r.hasOutdoorSeating && (
                        <span className="text-[10px] font-medium text-[#2B59AB] bg-blue-50 px-2 py-0.5 rounded-full">Outdoor</span>
                      )}
                      {r.hasAlcohol && (
                        <span className="text-[10px] font-medium text-[#C2185B] bg-pink-50 px-2 py-0.5 rounded-full">Alcohol</span>
                      )}
                      {r.isVeg && (
                        <span className="text-[10px] font-medium text-[#267E3E] bg-green-50 px-2 py-0.5 rounded-full">Pure Veg</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <SlidersHorizontal size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#1C1C1C] mb-1">No restaurants found</h3>
            <p className="text-sm text-[#696969] mb-4">Try adjusting your filters to see more results</p>
            <button
              onClick={clearAll}
              className="px-5 py-2 bg-[#EF4F5F] text-white rounded-lg text-sm font-medium hover:bg-[#e23744] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FilterSection;
