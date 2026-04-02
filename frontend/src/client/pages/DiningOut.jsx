import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Search, SlidersHorizontal, ChevronDown, Users, Bookmark } from 'lucide-react'
import { apiGetRestaurants } from '../../services/api'
import { useLocation as useLocationCtx } from '../../context/LocationContext'

const cuisineFilters = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Continental', 'Mughlai', 'Thai', 'Japanese', 'Mexican', 'Cafe', 'Fine Dining', 'Street Food']

const sortOptions = [
  { value: '', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'costLow', label: 'Cost: Low to High' },
  { value: 'costHigh', label: 'Cost: High to Low' },
]

const getRatingColor = (r) => {
  if (r >= 4.5) return 'bg-[#267E3E]'
  if (r >= 4.0) return 'bg-[#3F8F46]'
  if (r >= 3.5) return 'bg-[#CDD614]'
  return 'bg-[#DB7C38]'
}

const DiningOut = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [sort, setSort] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [ratingFilter, setRatingFilter] = useState(0)
  const [outdoorOnly, setOutdoorOnly] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const { city } = useLocationCtx()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { hasDineIn: true, limit: 50, location: city }
      if (search) params.search = search
      if (cuisine) params.cuisine = cuisine
      if (vegOnly) params.isVeg = true
      if (outdoorOnly) params.hasOutdoorSeating = true
      if (ratingFilter) params.minRating = ratingFilter
      if (sort) params.sort = sort
      const data = await apiGetRestaurants(params)
      setRestaurants(data.restaurants || [])
    } catch {
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }, [search, cuisine, sort, vegOnly, ratingFilter, outdoorOnly, city])

  useEffect(() => { fetchData() }, [fetchData])

  const activeCount = (cuisine ? 1 : 0) + (vegOnly ? 1 : 0) + (ratingFilter ? 1 : 0) + (outdoorOnly ? 1 : 0)

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-16 md:pt-24">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#1C1C1C] to-[#3D3D3D] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-[1100px] mx-auto px-4 py-8 md:py-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Dining Out</h1>
          <p className="text-white/70 text-sm md:text-base">Explore top-rated restaurants for dining out near you</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for restaurant, cuisine..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EF4F5F] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300"
            >
              <SlidersHorizontal size={14} /> Sort <ChevronDown size={14} />
            </button>
            {showSort && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[200px]">
                {sortOptions.map(o => (
                  <button
                    key={o.value}
                    onClick={() => { setSort(o.value); setShowSort(false) }}
                    className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${sort === o.value ? 'text-[#EF4F5F] font-semibold' : 'text-gray-700'}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${vegOnly ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
          >
            Pure Veg
          </button>

          <button
            onClick={() => setOutdoorOnly(!outdoorOnly)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${outdoorOnly ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
          >
            Outdoor Seating
          </button>

          {[3.5, 4.0, 4.5].map(r => (
            <button
              key={r}
              onClick={() => setRatingFilter(ratingFilter === r ? 0 : r)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${ratingFilter === r ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
            >
              Rating {r}+
            </button>
          ))}

          {activeCount > 0 && (
            <button
              onClick={() => { setCuisine(''); setVegOnly(false); setRatingFilter(0); setOutdoorOnly(false) }}
              className="shrink-0 px-3 py-2 text-sm text-[#EF4F5F] font-medium hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Cuisine Chips */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {cuisineFilters.map(c => (
            <button
              key={c}
              onClick={() => setCuisine(cuisine === c ? '' : c)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${cuisine === c ? 'bg-[#EF4F5F] text-white border-[#EF4F5F]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No restaurants found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{restaurants.length} restaurants for dining out</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(res => (
                <Link key={res.id} to={`/restaurant/${res.id}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={res.image ? (res.image.startsWith('http') ? res.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${res.image}`) : 'https://via.placeholder.com/400x200?text=Restaurant'}
                        alt={res.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        {res.hasOutdoorSeating && (
                          <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full">
                            🌿 Outdoor Seating
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1.5">
                        <h3 className="text-lg font-bold text-[#1C1C1C] truncate pr-2 group-hover:text-[#EF4F5F] transition-colors">
                          {res.name}
                        </h3>
                        {res.rating > 0 && (
                          <div className={`${getRatingColor(res.rating)} text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 text-sm font-bold shrink-0`}>
                            {res.rating} <Star size={11} fill="white" stroke="none" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{res.cuisine}</p>
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} /> {res.area || res.address}
                        </span>
                        <span className="font-medium text-gray-600 shrink-0">₹{res.costForTwo || 500} for two</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex items-center gap-3 text-xs text-gray-400">
                        <span>{res.openingTime || '11:00'} - {res.closingTime || '23:00'}</span>
                        {res.petFriendly && <span>🐾 Pet Friendly</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DiningOut
