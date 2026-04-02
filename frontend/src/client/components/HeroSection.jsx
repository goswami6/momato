import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, ChevronDown, Sparkles, Navigation, X, Building2 } from 'lucide-react'
import { apiGetRestaurants } from '../../services/api'
import { useLocation as useLocationCtx } from '../../context/LocationContext'

// City → popular localities map (like Zomato shows per city)
const CITY_AREAS = {
  Varanasi: ['Assi Ghat', 'Lanka', 'Dashashwamedh', 'Sigra', 'Cantt', 'Godowlia', 'Sarnath', 'BHU', 'Maldahiya', 'Nadesar', 'Mahmoorganj', 'Luxa', 'Bhelupur', 'Kabir Chaura', 'Chowk'],
  Delhi: ['Connaught Place', 'Hauz Khas', 'Saket', 'Lajpat Nagar', 'Karol Bagh', 'Chandni Chowk', 'Rajouri Garden', 'Dwarka', 'Rohini', 'Pitampura', 'Vasant Kunj', 'Greater Kailash', 'Defence Colony', 'Khan Market', 'Nehru Place'],
  Mumbai: ['Bandra', 'Andheri', 'Juhu', 'Powai', 'Lower Parel', 'Colaba', 'Fort', 'Dadar', 'Malad', 'Goregaon', 'Borivali', 'Thane', 'Worli', 'Churchgate', 'Marine Lines'],
  Bangalore: ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'JP Nagar', 'MG Road', 'Electronic City', 'Marathahalli', 'Bannerghatta Road', 'BTM Layout', 'Bellandur', 'Hebbal', 'Malleshwaram', 'Basavanagudi'],
  Hyderabad: ['Jubilee Hills', 'Banjara Hills', 'Madhapur', 'Hitech City', 'Gachibowli', 'Kukatpally', 'Secunderabad', 'Ameerpet', 'Kondapur', 'Begumpet', 'Miyapur', 'Dilsukhnagar', 'Charminar', 'Manikonda', 'Tolichowki'],
  Chennai: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Nungambakkam', 'Mylapore', 'Besant Nagar', 'OMR', 'ECR', 'Porur', 'Guindy', 'Alwarpet', 'Kilpauk', 'Vadapalani', 'Thiruvanmiyur'],
  Kolkata: ['Park Street', 'Salt Lake', 'New Town', 'Ballygunge', 'Gariahat', 'Esplanade', 'Howrah', 'Alipore', 'Lake Town', 'Jadavpur', 'Tollygunge', 'Dumdum', 'Bhawanipur', 'Rajarhat', 'Shyambazar'],
  Pune: ['Koregaon Park', 'Viman Nagar', 'Hinjewadi', 'Kothrud', 'Baner', 'Aundh', 'Kalyani Nagar', 'Camp', 'Deccan', 'Wakad', 'Hadapsar', 'Kharadi', 'Shivajinagar', 'Magarpatta', 'FC Road'],
  Jaipur: ['MI Road', 'Vaishali Nagar', 'C Scheme', 'Malviya Nagar', 'Mansarovar', 'Raja Park', 'Tonk Road', 'Sindhi Camp', 'Bani Park', 'Jagatpura', 'Bapu Nagar', 'Pratap Nagar', 'Sanganer', 'Ajmer Road', 'Lal Kothi'],
  Lucknow: ['Hazratganj', 'Gomti Nagar', 'Aminabad', 'Aliganj', 'Indira Nagar', 'Alambagh', 'Charbagh', 'Mahanagar', 'Rajajipuram', 'Chowk', 'Kapoorthala', 'Vikas Nagar', 'Husainganj', 'Lalbagh', 'Jankipuram'],
  Ahmedabad: ['Navrangpura', 'CG Road', 'SG Highway', 'Satellite', 'Prahlad Nagar', 'Maninagar', 'Vastrapur', 'Bodakdev', 'Ellis Bridge', 'Paldi', 'Thaltej', 'Law Garden', 'Ashram Road', 'Chandkheda', 'Bopal'],
  Chandigarh: ['Sector 17', 'Sector 22', 'Sector 35', 'Sector 26', 'Sector 43', 'Sector 7', 'Sector 9', 'Sector 34', 'Industrial Area Phase 1', 'Elante Mall Area', 'Sector 8', 'Sector 15', 'Sector 11', 'Sector 44', 'Sector 32'],
}

const HeroSection = () => {
  const navigate = useNavigate()
  const { city, displayLocation, detectLocation, geoStatus, selectCity, popularCities, locality } = useLocationCtx()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState(city)
  const [restaurants, setRestaurants] = useState([])
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const locationRef = useRef(null)
  const locationInputRef = useRef(null)

  // Sync with context location (city + locality from geolocation)
  useEffect(() => {
    if (locality) {
      setSelectedLocation(`${locality}, ${city}`)
    } else {
      setSelectedLocation(city)
    }
  }, [city, locality])

  useEffect(() => {
    apiGetRestaurants({ limit: 24, location: city })
      .then((data) => setRestaurants(data.restaurants || []))
      .catch(() => setRestaurants([]))
  }, [city])

  const locationOptions = useMemo(() => {
    // Get unique areas from restaurants matching current city
    const areas = restaurants
      .filter((r) => !r.city || r.city.toLowerCase() === city.toLowerCase())
      .map((r) => r.area)
      .filter(Boolean)
      .map((a) => a.trim())
      .filter(Boolean)

    const uniqueAreas = [...new Set(areas)].sort()

    // Use city-specific fallback if no API areas
    if (uniqueAreas.length > 0) return uniqueAreas
    return CITY_AREAS[city] || []
  }, [restaurants, city])

  // Filtered items based on search — search across both areas & cities
  const filteredLocations = useMemo(() => {
    const q = locationSearch.toLowerCase().trim()
    if (!q) return { areas: locationOptions, cities: [] }
    const matchedAreas = locationOptions.filter((a) => a.toLowerCase().includes(q))
    const matchedCities = popularCities.filter((c) => c.name.toLowerCase().includes(q) && c.name !== city)
    return { areas: matchedAreas, cities: matchedCities }
  }, [locationOptions, locationSearch, popularCities, city])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationOpen(false)
        setLocationSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (locationOpen && locationInputRef.current) {
      locationInputRef.current.focus()
    }
  }, [locationOpen])

  const selectedLocationLabel = selectedLocation || city

  const popularSearches = useMemo(() => {
    const values = restaurants
      .flatMap((restaurant) => String(restaurant.cuisine || '').split(','))
      .map((item) => item.trim())
      .filter(Boolean)

    return [...new Set(values)].slice(0, 4)
  }, [restaurants])

  const quickStats = useMemo(() => {
    const openNow = restaurants.filter((restaurant) => restaurant.isOpen).length
    const pureVeg = restaurants.filter((restaurant) => restaurant.isVeg).length
    return [
      { label: 'Places live', value: restaurants.length || '24+' },
      { label: 'Open now', value: openNow || '12+' },
      { label: 'Pure veg', value: pureVeg || '8+' },
    ]
  }, [restaurants])

  const handleSearch = (e) => {
    e.preventDefault()
    const qs = new URLSearchParams()
    if (searchQuery.trim()) qs.set('q', searchQuery.trim())
    if (selectedLocation.trim()) qs.set('location', selectedLocation.trim())
    navigate(`/search${qs.toString() ? `?${qs.toString()}` : ''}`)
  }

  const quickSearch = (value) => {
    const qs = new URLSearchParams()
    qs.set('q', value)
    if (selectedLocation.trim()) qs.set('location', selectedLocation.trim())
    navigate(`/search?${qs.toString()}`)
  }

  return (
    <section className="relative w-full h-[480px] sm:h-[550px] md:h-[650px] flex items-center justify-center overflow-x-hidden z-20">
      {/* 1. Background Image with High-End Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074&auto=format&fit=crop"
          alt="Premium Dining"
          className="w-full h-full object-cover"
        />
        {/* Zomato style dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* 2. Centered Content Container */}
      <div className="main-container relative z-10 flex flex-col items-center text-center">

        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-white text-xs font-bold tracking-[0.2em] uppercase">Premium Dining</span>
        </div>

        {/* Brand Logo - Centered */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
          <h1 className="text-white text-7xl sm:text-8xl md:text-9xl font-black italic tracking-tighter drop-shadow-2xl">
            momato
          </h1>
        </div>

        {/* Tagline */}
        <h2 className="text-white/90 text-xl sm:text-2xl md:text-[32px] font-medium mb-10 max-w-3xl leading-snug drop-shadow-md">
          Discover the best food & drinks in <span className="font-bold border-b-4 border-[#EF4F5F]">{selectedLocationLabel}</span>
        </h2>

        {/* Premium Search Bar - The Modern Look */}
        <div className="w-full max-w-[850px] mx-4 sm:mx-0 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col p-2 md:p-2 transition-all duration-300 z-10">

          {/* Top Row: Location + Search Input */}
          <div className="flex flex-col md:flex-row items-center w-full">
            {/* Location Picker Section — Zomato-style dropdown */}
            <div className="relative w-full md:w-[32%]" ref={locationRef}>
              <button
                type="button"
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex items-center w-full px-4 py-2 group text-left"
              >
                <MapPin className="text-[#EF4F5F] w-5 h-5 shrink-0" />
                <div className="flex-1 ml-3">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none mb-1">
                    Location
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-[#1C1C1C] font-bold text-[15px] truncate max-w-[180px]">
                      {selectedLocationLabel}
                    </span>
                    <ChevronDown className={`text-gray-400 w-4 h-4 shrink-0 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {selectedLocation !== city && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedLocation(city); setLocationOpen(false); }}
                    className="ml-1 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0"
                  >
                    <X size={12} className="text-gray-500" />
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {locationOpen && (
                <div className="absolute top-full left-0 right-0 md:w-[380px] mt-1 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-gray-100 z-[100] overflow-hidden">
                  {/* Search input */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        ref={locationInputRef}
                        type="text"
                        placeholder="Search for area or city..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#EF4F5F] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Detect my location */}
                  <button
                    type="button"
                    onClick={() => { detectLocation(); setTimeout(() => setLocationOpen(false), 1200); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EF4F5F]/10 flex items-center justify-center shrink-0">
                      {geoStatus === 'loading' ? (
                        <div className="w-4 h-4 border-2 border-[#EF4F5F]/30 border-t-[#EF4F5F] rounded-full animate-spin" />
                      ) : (
                        <Navigation size={16} className="text-[#EF4F5F]" />
                      )}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-[#EF4F5F]">
                        {geoStatus === 'loading' ? 'Detecting...' : 'Detect my location'}
                      </span>
                      <p className="text-[11px] text-gray-400">Using GPS</p>
                    </div>
                  </button>

                  <div className="max-h-[280px] overflow-y-auto overscroll-contain">
                    {/* Cities that match search */}
                    {filteredLocations.cities.length > 0 && (
                      <>
                        <div className="px-4 pt-3 pb-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cities</span>
                        </div>
                        {filteredLocations.cities.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => { selectCity(c.name); setSelectedLocation(c.name); setLocationOpen(false); setLocationSearch(''); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                          >
                            <Building2 size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-[#1C1C1C]">{c.name}</span>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Current city areas header */}
                    <div className="px-4 pt-3 pb-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {locationSearch ? 'Areas' : `Popular areas in ${city}`}
                      </span>
                    </div>

                    {/* "All of City" option */}
                    {!locationSearch && (
                      <button
                        type="button"
                        onClick={() => { setSelectedLocation(city); setLocationOpen(false); setLocationSearch(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${selectedLocation === city ? 'bg-red-50/60' : ''}`}
                      >
                        <MapPin size={16} className={selectedLocation === city ? 'text-[#EF4F5F]' : 'text-gray-400'} />
                        <span className={`text-sm font-semibold ${selectedLocation === city ? 'text-[#EF4F5F]' : 'text-[#1C1C1C]'}`}>
                          All of {city}
                        </span>
                      </button>
                    )}

                    {/* Area list */}
                    {filteredLocations.areas.length > 0 ? filteredLocations.areas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => { setSelectedLocation(area); setLocationOpen(false); setLocationSearch(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${selectedLocation === area ? 'bg-red-50/60' : ''}`}
                      >
                        <MapPin size={16} className={selectedLocation === area ? 'text-[#EF4F5F]' : 'text-gray-300'} />
                        <div>
                          <span className={`text-sm font-medium ${selectedLocation === area ? 'text-[#EF4F5F] font-semibold' : 'text-[#1C1C1C]'}`}>
                            {area}
                          </span>
                          <span className="text-[11px] text-gray-400 ml-1.5">{city}</span>
                        </div>
                      </button>
                    )) : (
                      <div className="px-4 py-4 text-center text-sm text-gray-400">No areas found</div>
                    )}

                    {/* Other cities section (when not searching) */}
                    {!locationSearch && (
                      <>
                        <div className="px-4 pt-4 pb-1.5 border-t border-gray-100 mt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Other Cities</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 px-3 pb-3">
                          {popularCities.filter((c) => c.name !== city).map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => { selectCity(c.name); setSelectedLocation(c.name); setLocationOpen(false); }}
                              className="text-xs font-medium text-gray-600 hover:text-[#EF4F5F] hover:bg-red-50/50 rounded-lg py-2 px-2 text-center transition-colors"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal Divider on mobile, Vertical on desktop */}
            <div className="block md:hidden w-[90%] h-[1px] bg-gray-200 my-1 mx-auto" />
            <div className="hidden md:block h-8 w-[1px] bg-gray-200 mx-2" />

            {/* Food Search Section */}
            <div className="flex items-center w-full md:flex-1 px-4 py-2 group">
              <Search className="text-gray-400 w-5 h-5 shrink-0" />

              <div className="flex-1 ml-3 text-left">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none mb-1">
                  Search
                </p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder="Search for restaurant, cuisine or a dish..."
                  className="w-full bg-transparent text-[#1C1C1C] text-[13px] sm:text-[15px] outline-none border-none p-0 focus:ring-0 placeholder:text-gray-300 font-medium"
                />
              </div>

              {/* Find button - hidden on mobile, shown on desktop */}
              <button
                onClick={handleSearch}
                className="hidden md:block bg-[#EF4F5F] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#d83a49] transition-all ml-2"
              >
                Find
              </button>
            </div>
          </div>

          {/* Full-width Find button on mobile */}
          <button
            onClick={handleSearch}
            className="md:hidden bg-[#EF4F5F] text-white w-full py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#d83a49] transition-all mt-1"
          >
            Find
          </button>
        </div>

        <div className="w-full max-w-[850px] mt-5 px-4 sm:px-0">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-white/75 text-xs uppercase tracking-[0.2em] font-bold">Popular</span>
            {popularSearches.length > 0 ? popularSearches.map((item) => (
              <button
                key={item}
                onClick={() => quickSearch(item)}
                className="px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-sm font-medium backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                {item}
              </button>
            )) : ['Biryani', 'Cafe', 'Pizza', 'Street Food'].map((item) => (
              <button
                key={item}
                onClick={() => quickSearch(item)}
                className="px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-sm font-medium backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Tags */}
        <div className="hidden md:flex items-center gap-8 mt-12 text-white/80">
          {quickStats.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <span className="text-lg font-bold text-white">{item.value}</span>
              <span className="text-sm font-semibold tracking-wide uppercase">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent opacity-50" />
      </div>
    </section>
  )
}

export default HeroSection