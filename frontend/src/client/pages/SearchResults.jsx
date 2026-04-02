import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Search, MapPin, SlidersHorizontal, Star, Clock, ChevronDown, X, Utensils, ArrowLeft, Filter, Sparkles, Map, List } from 'lucide-react'
import { apiGetRestaurants } from '../../services/api'
import MapView from '../components/MapView'

const quickSuggestions = ['Pizza', 'Biryani', 'Chinese', 'North Indian', 'Cafe', 'Street Food', 'Italian', 'South Indian', 'Kebab', 'Continental']

const filterDefs = [
  { id: 'isVeg', label: 'Pure Veg' },
  { id: 'hasDelivery', label: 'Delivery' },
  { id: 'hasDineIn', label: 'Dine In' },
  { id: 'hasNightlife', label: 'Nightlife' },
  { id: 'hasAlcohol', label: 'Serves Alcohol' },
  { id: 'petFriendly', label: 'Pet Friendly' },
  { id: 'hasOutdoorSeating', label: 'Outdoor Seating' },
  { id: 'isOpen', label: 'Open Now' },
]

const budgetOptions = [
  { value: '', label: 'Any budget' },
  { value: 'budget', label: 'Under Rs.400', minCost: '', maxCost: 400 },
  { value: 'casual', label: 'Rs.400 - Rs.800', minCost: 400, maxCost: 800 },
  { value: 'premium', label: 'Rs.800 - Rs.1500', minCost: 800, maxCost: 1500 },
  { value: 'luxury', label: 'Above Rs.1500', minCost: 1500, maxCost: '' },
]

const ratingOptions = [
  { value: 0, label: 'All ratings' },
  { value: 3.5, label: '3.5+' },
  { value: 4.0, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
]

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating: High to Low' },
  { value: 'costLow', label: 'Cost: Low to High' },
  { value: 'costHigh', label: 'Cost: High to Low' },
]

const getRatingColor = (r) => {
  if (r >= 4.5) return 'bg-[#267E3E]'
  if (r >= 4.0) return 'bg-[#3F8F46]'
  if (r >= 3.5) return 'bg-[#CDD614]'
  return 'bg-[#DB7C38]'
}

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const queryFromUrl = searchParams.get('q') || ''
  const locationFromUrl = searchParams.get('location') || ''

  const [searchInput, setSearchInput] = useState(queryFromUrl)
  const [locationInput, setLocationInput] = useState(locationFromUrl)
  const [activeFilters, setActiveFilters] = useState([])
  const [sortBy, setSortBy] = useState('relevance')
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [selectedBudget, setSelectedBudget] = useState('')
  const [selectedRating, setSelectedRating] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    setSearchInput(queryFromUrl)
    setLocationInput(locationFromUrl)
  }, [queryFromUrl, locationFromUrl])

  const cuisineOptions = useMemo(() => {
    const values = restaurants
      .flatMap((restaurant) => String(restaurant.cuisine || '').split(','))
      .map((item) => item.trim())
      .filter(Boolean)

    return [...new Set([...quickSuggestions, ...values])].slice(0, 16)
  }, [restaurants])

  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const params = { search: queryFromUrl, location: locationFromUrl, limit: 20 }
      activeFilters.forEach((fId) => { params[fId] = true })
      if (selectedCuisine) params.cuisine = selectedCuisine
      if (selectedRating > 0) params.minRating = selectedRating
      const budgetConfig = budgetOptions.find((option) => option.value === selectedBudget)
      if (budgetConfig?.minCost !== '') params.minCost = budgetConfig.minCost
      if (budgetConfig?.maxCost !== '') params.maxCost = budgetConfig.maxCost
      if (sortBy !== 'relevance') params.sort = sortBy
      const data = await apiGetRestaurants(params)
      setRestaurants(data.restaurants || [])
      setTotal(data.total || 0)
    } catch {
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }, [queryFromUrl, locationFromUrl, activeFilters, selectedCuisine, selectedBudget, selectedRating, sortBy])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const handleSearch = (e) => {
    e.preventDefault()
    const nextQuery = searchInput.trim()
    const nextLocation = locationInput.trim()
    const qs = new URLSearchParams()
    if (nextQuery) qs.set('q', nextQuery)
    if (nextLocation) qs.set('location', nextLocation)
    navigate(`/search${qs.toString() ? `?${qs.toString()}` : ''}`)
  }

  const toggleFilter = (filterId) => {
    setActiveFilters((prev) => prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId])
  }

  const clearAll = () => {
    setActiveFilters([])
    setSortBy('relevance')
    setSelectedCuisine('')
    setSelectedBudget('')
    setSelectedRating(0)
  }

  const activeFilterCount = activeFilters.length + (selectedCuisine ? 1 : 0) + (selectedBudget ? 1 : 0) + (selectedRating > 0 ? 1 : 0)

  const FiltersPanel = ({ mobile = false }) => (
    <div className={`bg-white border border-gray-100 rounded-2xl ${mobile ? '' : 'sticky top-28'} p-5`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#EF4F5F]" />
          <h3 className="text-base font-bold text-[#1C1C1C]">Filters</h3>
        </div>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-sm font-medium text-[#EF4F5F] hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-[#1C1C1C] mb-3">Cuisine</p>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map((cuisine) => {
              const isActive = selectedCuisine === cuisine
              return (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(isActive ? '' : cuisine)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${isActive ? 'bg-[#EF4F5F] text-white border-[#EF4F5F]' : 'bg-white text-[#696969] border-gray-200 hover:border-gray-300'}`}
                >
                  {cuisine}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#1C1C1C] mb-3">Minimum rating</p>
          <div className="grid grid-cols-2 gap-2">
            {ratingOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setSelectedRating(option.value)}
                className={`px-3 py-2 rounded-xl text-sm border transition-colors ${selectedRating === option.value ? 'bg-[#EF4F5F] text-white border-[#EF4F5F]' : 'bg-white text-[#696969] border-gray-200 hover:border-gray-300'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#1C1C1C] mb-3">Budget for two</p>
          <div className="space-y-2">
            {budgetOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setSelectedBudget(option.value)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-colors ${selectedBudget === option.value ? 'bg-[#EF4F5F] text-white border-[#EF4F5F]' : 'bg-white text-[#696969] border-gray-200 hover:border-gray-300'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#1C1C1C] mb-3">More options</p>
          <div className="flex flex-wrap gap-2">
            {filterDefs.map((filter) => {
              const isActive = activeFilters.includes(filter.id)
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${isActive ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-[#696969] border-gray-200 hover:border-gray-300'}`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F8F8] md:pt-26 pt-16">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 py-5">
        <div className="main-container">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#696969] hover:text-[#EF4F5F] transition-colors mb-4">
            <ArrowLeft size={16} /> Back
          </button>
          <form onSubmit={handleSearch} className="relative">
            <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.8fr_auto] gap-3">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C9C9C]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search restaurants, cuisines or dishes..."
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F8F8F8] border border-gray-200 rounded-xl text-sm text-[#1C1C1C] placeholder-[#9C9C9C] focus:outline-none focus:border-[#EF4F5F] transition-colors"
                />
              </div>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#EF4F5F]" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Location, area or city"
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F8F8F8] border border-gray-200 rounded-xl text-sm text-[#1C1C1C] placeholder-[#9C9C9C] focus:outline-none focus:border-[#EF4F5F] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3.5 rounded-xl bg-[#EF4F5F] text-white text-sm font-semibold hover:bg-[#e23744] transition-colors"
              >
                Search
              </button>
            </div>
          </form>
          {!queryFromUrl && (
            <div className="flex flex-wrap gap-2 mt-3">
              {quickSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-sm text-[#696969] hover:bg-[#EF4F5F] hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="main-container py-6">
        {queryFromUrl && (
          <div className="mb-4">
            <h1 className="text-xl font-bold text-[#1C1C1C]">
              {loading ? 'Searching...' : `${total} result${total !== 1 ? 's' : ''} for "${queryFromUrl}"`}
            </h1>
            {locationFromUrl && (
              <p className="text-sm text-[#696969] mt-1">Showing matches in {locationFromUrl}</p>
            )}
          </div>
        )}

        {!queryFromUrl && locationFromUrl && (
          <div className="mb-4">
            <h1 className="text-xl font-bold text-[#1C1C1C]">
              {loading ? 'Searching...' : `${total} restaurant${total !== 1 ? 's' : ''} in ${locationFromUrl}`}
            </h1>
          </div>
        )}

        {/* Filter & Sort Bar */}
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100 overflow-x-auto scrollbar-hide mb-6">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#1C1C1C] bg-white shrink-0"
          >
            <Filter size={15} className="text-[#9C9C9C]" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#EF4F5F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>

          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-[#1C1C1C] hover:bg-gray-50 bg-white transition-colors"
            >
              <SlidersHorizontal size={15} className="text-[#9C9C9C]" />
              Sort
              <ChevronDown size={14} className={`text-[#9C9C9C] transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 z-50 py-1 overflow-hidden">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === opt.value ? 'text-[#EF4F5F] bg-red-50 font-medium' : 'text-[#1C1C1C] hover:bg-gray-50'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-7 bg-gray-200 shrink-0" />

          {[
            selectedCuisine && { id: 'cuisine', label: selectedCuisine, clear: () => setSelectedCuisine('') },
            selectedRating > 0 && { id: 'rating', label: `${selectedRating}+ rating`, clear: () => setSelectedRating(0) },
            selectedBudget && { id: 'budget', label: budgetOptions.find((option) => option.value === selectedBudget)?.label, clear: () => setSelectedBudget('') },
            ...filterDefs.filter((filter) => activeFilters.includes(filter.id)).map((filter) => ({
              id: filter.id,
              label: filter.label,
              clear: () => toggleFilter(filter.id),
            })),
          ].filter(Boolean).map((filter) => {
            return (
              <button
                key={filter.id}
                onClick={filter.clear}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all shrink-0 bg-[#EF4F5F] text-white border-[#EF4F5F]"
              >
                {filter.label}
                <X size={14} />
              </button>
            )
          })}

          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="text-[#EF4F5F] text-sm font-medium whitespace-nowrap hover:underline shrink-0">
              Clear all
            </button>
          )}

          <div className="ml-auto shrink-0 flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-[#1C1C1C] shadow-sm' : 'text-[#696969] hover:text-[#1C1C1C]'}`}
            >
              <List size={14} /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white text-[#1C1C1C] shadow-sm' : 'text-[#696969] hover:text-[#1C1C1C]'}`}
            >
              <Map size={14} /> Map
            </button>
          </div>
        </div>

        <div className={viewMode === 'map' ? '' : 'grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6'}>
          {viewMode !== 'map' && (
            <aside className="hidden lg:block">
              <FiltersPanel />
            </aside>
          )}

          <div>
            {viewMode !== 'map' && (
              <div className="flex items-center justify-between mt-1 mb-6">
                <p className="text-sm text-[#696969]">
                  {loading ? 'Loading...' : `${total} restaurant${total !== 1 ? 's' : ''} found`}
                  {activeFilterCount > 0 && <span> matching your filters</span>}
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
            )}

            {/* ─── Map Split View ─── */}
            {viewMode === 'map' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-[#696969]">
                    {loading ? 'Loading...' : `${restaurants.filter(r => r.latitude && r.longitude).length} of ${total} restaurants on the map`}
                  </p>
                </div>

                {/* Mobile: stacked — map above, list below */}
                <div className="lg:hidden space-y-4">
                  <MapView
                    restaurants={restaurants}
                    hoveredId={hoveredId}
                    onHoverRestaurant={setHoveredId}
                    selectedId={selectedId}
                    onSelectRestaurant={setSelectedId}
                  />
                  <div className="space-y-1">
                    {restaurants.map((r) => (
                      <MapView.RestaurantListCard
                        key={r.id}
                        restaurant={r}
                        isHovered={hoveredId === r.id}
                        isSelected={selectedId === r.id}
                        onHover={setHoveredId}
                        onSelect={setSelectedId}
                      />
                    ))}
                  </div>
                </div>

                {/* Desktop: side-by-side split */}
                <div className="hidden lg:grid lg:grid-cols-[380px_minmax(0,1fr)] gap-4" style={{ height: '75vh' }}>
                  {/* Restaurant list panel */}
                  <div className="bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                      <h3 className="text-sm font-bold text-[#1C1C1C]">Restaurants</h3>
                      <span className="text-xs text-[#696969]">{restaurants.length} places</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-hide">
                      {restaurants.map((r) => (
                        <MapView.RestaurantListCard
                          key={r.id}
                          restaurant={r}
                          isHovered={hoveredId === r.id}
                          isSelected={selectedId === r.id}
                          onHover={setHoveredId}
                          onSelect={setSelectedId}
                        />
                      ))}
                      {restaurants.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <MapPin size={32} className="text-gray-300 mb-2" />
                          <p className="text-sm text-[#696969]">No restaurants found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map panel */}
                  <div className="rounded-2xl overflow-hidden border border-gray-100" style={{ height: '100%' }}>
                    <MapView
                      restaurants={restaurants}
                      hoveredId={hoveredId}
                      onHoverRestaurant={setHoveredId}
                      selectedId={selectedId}
                      onSelectRestaurant={setSelectedId}
                      compact
                    />
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {restaurants.map((r) => {
                  const rating = Number(r.avgRating || r.rating || 0)
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
                          <div className="w-full h-full flex items-center justify-center">
                            <Utensils size={40} className="text-gray-300" />
                          </div>
                        )}
                        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[#1C1C1C] text-xs font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                          <Clock size={12} /> 30 min
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-[16px] font-semibold text-[#1C1C1C] leading-snug truncate group-hover:text-[#EF4F5F] transition-colors">{r.name}</h3>
                          <span className={`shrink-0 flex items-center gap-0.5 text-white text-xs font-bold px-1.5 py-0.5 rounded ${getRatingColor(rating)}`}>
                            {rating.toFixed(1)} <Star size={10} fill="white" stroke="none" />
                          </span>
                        </div>
                        {r.cuisine && <p className="text-[13px] text-[#696969] mt-1 truncate">{r.cuisine}</p>}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                          <span className="text-[12px] text-[#9c9c9c] flex items-center gap-1">
                            <MapPin size={11} /> {r.area || 'Varanasi'}
                          </span>
                          {r.costForTwo && <span className="text-[12px] font-medium text-[#696969]">Rs.{r.costForTwo} for two</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {r.isOpen && <span className="text-[10px] font-medium text-[#267E3E] bg-green-50 px-2 py-0.5 rounded-full">Open Now</span>}
                          {r.petFriendly && <span className="text-[10px] font-medium text-[#7B61FF] bg-purple-50 px-2 py-0.5 rounded-full">Pet Friendly</span>}
                          {r.hasOutdoorSeating && <span className="text-[10px] font-medium text-[#2B59AB] bg-blue-50 px-2 py-0.5 rounded-full">Outdoor</span>}
                          {r.hasAlcohol && <span className="text-[10px] font-medium text-[#C2185B] bg-pink-50 px-2 py-0.5 rounded-full">Alcohol</span>}
                          {r.isVeg && <span className="text-[10px] font-medium text-[#267E3E] bg-green-50 px-2 py-0.5 rounded-full">Pure Veg</span>}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#1C1C1C] mb-1">
                  {queryFromUrl ? `No results for "${queryFromUrl}"` : 'Search for restaurants'}
                </h3>
                <p className="text-sm text-[#696969] mb-4 max-w-md">
                  {queryFromUrl ? 'Try another cuisine, nearby area, or reduce a few filters to discover more places.' : 'Start with a restaurant name, cuisine, dish, or locality.'}
                </p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll} className="px-5 py-2 bg-[#EF4F5F] text-white rounded-lg text-sm font-medium hover:bg-[#e23744] transition-colors">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/45 p-4">
          <div className="absolute inset-0" onClick={() => setShowMobileFilters(false)} />
          <div className="relative bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1C1C1C]">Filter restaurants</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <FiltersPanel mobile />
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={clearAll} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-[#1C1C1C]">
                Clear
              </button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 px-4 py-3 rounded-xl bg-[#EF4F5F] text-white text-sm font-semibold">
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchResults
