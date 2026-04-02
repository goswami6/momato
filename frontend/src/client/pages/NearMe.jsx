import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  Navigation, MapPin, Star, Clock, Utensils, Locate,
  ChevronRight, AlertCircle, Loader2, Bike,
} from 'lucide-react'
import { apiGetNearbyRestaurants } from '../../services/api'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const userIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `<div style="width:18px;height:18px;background:#EF4F5F;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(239,79,95,0.5);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const restaurantIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const getRatingColor = (r) => {
  if (r >= 4.5) return 'bg-[#267E3E]'
  if (r >= 4.0) return 'bg-[#3F8F46]'
  if (r >= 3.5) return 'bg-[#CDD614]'
  return 'bg-[#DB7C38]'
}

const RecenterMap = ({ center, radius }) => {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, getZoomForRadius(radius))
    }
  }, [center, radius, map])
  return null
}

const getZoomForRadius = (radiusKm) => {
  if (radiusKm <= 1) return 16
  if (radiusKm <= 2) return 15
  if (radiusKm <= 5) return 13
  if (radiusKm <= 10) return 12
  if (radiusKm <= 20) return 11
  return 10
}

const NearMe = () => {
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [locating, setLocating] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [radius, setRadius] = useState(5)
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        const messages = {
          1: 'Location access denied. Please enable location in your browser settings.',
          2: 'Location unavailable. Try again.',
          3: 'Location request timed out. Try again.',
        }
        setLocationError(messages[err.code] || 'Failed to get location')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const fetchNearby = useCallback(async () => {
    if (!userLocation) return
    setLoading(true)
    try {
      const data = await apiGetNearbyRestaurants(userLocation.lat, userLocation.lng, radius)
      setRestaurants(data.restaurants || [])
    } catch {
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }, [userLocation, radius])

  useEffect(() => {
    fetchNearby()
  }, [fetchNearby])

  // No location yet — show prompt
  if (!userLocation && !locationError) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] md:pt-26 pt-16 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Locate size={36} className="text-[#EF4F5F]" />
          </div>
          <h2 className="text-xl font-bold text-[#1C1C1C] mb-2">Finding your location...</h2>
          <p className="text-sm text-[#696969]">Please allow location access in your browser</p>
        </div>
      </div>
    )
  }

  if (locationError && !userLocation) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] md:pt-26 pt-16 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={36} className="text-[#EF4F5F]" />
          </div>
          <h2 className="text-xl font-bold text-[#1C1C1C] mb-2">Location unavailable</h2>
          <p className="text-sm text-[#696969] mb-6">{locationError}</p>
          <button
            onClick={requestLocation}
            className="px-6 py-3 bg-[#EF4F5F] text-white rounded-xl text-sm font-semibold hover:bg-[#e23744] transition-colors"
          >
            {locating ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] md:pt-26 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-5">
        <div className="main-container">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Navigation size={20} className="text-[#EF4F5F]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1C1C1C]">Restaurants Near You</h1>
              <p className="text-sm text-[#696969]">
                Discover places within {radius} km of your location
              </p>
            </div>
          </div>

          {/* Radius slider */}
          <div className="flex items-center gap-4 bg-[#F8F8F8] rounded-xl p-4">
            <MapPin size={18} className="text-[#EF4F5F] shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1C1C1C]">Search radius</span>
                <span className="text-sm font-bold text-[#EF4F5F]">{radius} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#EF4F5F]"
              />
              <div className="flex justify-between text-[10px] text-[#9C9C9C] mt-1">
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm order-2 lg:order-1">
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={getZoomForRadius(radius)}
              style={{ height: '600px', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap center={[userLocation.lat, userLocation.lng]} radius={radius} />

              {/* User location marker */}
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#1C1C1C]">You are here</p>
                  </div>
                </Popup>
              </Marker>

              {/* Radius circle */}
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radius * 1000}
                pathOptions={{
                  color: '#EF4F5F',
                  fillColor: '#EF4F5F',
                  fillOpacity: 0.06,
                  weight: 2,
                  dashArray: '8 4',
                }}
              />

              {/* Restaurant markers */}
              {restaurants.map((r) => {
                if (!r.latitude || !r.longitude) return null
                const rating = Number(r.avgRating || r.rating || 0)
                const isHovered = hoveredId === r.id
                return (
                  <Marker
                    key={r.id}
                    position={[r.latitude, r.longitude]}
                    icon={isHovered ? new L.Icon({
                      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                      iconSize: [30, 49],
                      iconAnchor: [15, 49],
                      popupAnchor: [1, -40],
                      shadowSize: [49, 49],
                    }) : restaurantIcon}
                    eventHandlers={{
                      mouseover: () => setHoveredId(r.id),
                      mouseout: () => setHoveredId(null),
                      click: () => setSelectedRestaurant(r.id),
                    }}
                  >
                    <Popup maxWidth={260} minWidth={200}>
                      <Link to={`/restaurant/${r.id}`} className="block no-underline">
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {r.image ? (
                              <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Utensils size={18} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-[#1C1C1C] truncate">{r.name}</h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${getRatingColor(rating)}`}>
                                {rating.toFixed(1)} <Star size={8} fill="white" stroke="none" />
                              </span>
                              {r.distance != null && (
                                <span className="text-[11px] text-[#696969]">· {Number(r.distance).toFixed(1)} km</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>

          {/* Restaurant list sidebar */}
          <div className="order-1 lg:order-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1C1C1C]">
                {loading ? 'Searching...' : `${restaurants.length} restaurant${restaurants.length !== 1 ? 's' : ''} nearby`}
              </h2>
              <button
                onClick={requestLocation}
                className="flex items-center gap-1.5 text-sm text-[#EF4F5F] font-medium hover:underline"
              >
                <Locate size={14} /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="text-[#EF4F5F] animate-spin" />
              </div>
            ) : restaurants.length > 0 ? (
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {restaurants.map((r) => {
                  const rating = Number(r.avgRating || r.rating || 0)
                  const isSelected = selectedRestaurant === r.id
                  return (
                    <Link
                      key={r.id}
                      to={`/restaurant/${r.id}`}
                      className={`block rounded-xl bg-white border p-3.5 hover:shadow-md transition-all group ${isSelected ? 'border-[#EF4F5F] shadow-md' : 'border-gray-100'}`}
                      onMouseEnter={() => setHoveredId(r.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {r.image ? (
                            <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Utensils size={20} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-[#1C1C1C] truncate group-hover:text-[#EF4F5F] transition-colors">{r.name}</h3>
                            <span className={`shrink-0 flex items-center gap-0.5 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ${getRatingColor(rating)}`}>
                              {rating.toFixed(1)} <Star size={8} fill="white" stroke="none" />
                            </span>
                          </div>
                          {r.cuisine && <p className="text-[12px] text-[#696969] truncate mt-0.5">{r.cuisine}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            {r.distance != null && (
                              <span className="text-[11px] text-[#9C9C9C] flex items-center gap-0.5">
                                <MapPin size={10} /> {Number(r.distance).toFixed(1)} km
                              </span>
                            )}
                            <span className="text-[11px] text-[#9C9C9C] flex items-center gap-0.5">
                              <Clock size={10} /> {r.deliveryTime || '30 min'}
                            </span>
                            {r.hasDelivery && (
                              <span className="text-[11px] text-[#267E3E] flex items-center gap-0.5">
                                <Bike size={10} /> Delivery
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-[#9C9C9C] self-center shrink-0" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin size={28} className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-[#1C1C1C] mb-1">No restaurants found nearby</h3>
                <p className="text-sm text-[#696969] mb-4">Try increasing the search radius</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NearMe
