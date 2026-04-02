import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Star, Clock, MapPin, Utensils, ChevronRight, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const getRatingColor = (r) => {
  if (r >= 4.5) return '#267E3E'
  if (r >= 4.0) return '#3F8F46'
  if (r >= 3.5) return '#CDD614'
  return '#DB7C38'
}

const getRatingBgClass = (r) => {
  if (r >= 4.5) return 'bg-[#267E3E]'
  if (r >= 4.0) return 'bg-[#3F8F46]'
  if (r >= 3.5) return 'bg-[#CDD614]'
  return 'bg-[#DB7C38]'
}

// Custom rating marker icon
const createRatingIcon = (rating, isActive) => {
  const color = getRatingColor(rating)
  const size = isActive ? 40 : 32
  const fontSize = isActive ? 12 : 10
  const border = isActive ? '3px solid #EF4F5F' : '2px solid white'
  const shadow = isActive ? '0 2px 12px rgba(239,79,95,0.5)' : '0 2px 8px rgba(0,0,0,0.25)'

  return new L.DivIcon({
    className: 'custom-rating-marker',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};color:white;
      border-radius:50%;border:${border};
      display:flex;align-items:center;justify-content:center;
      font-size:${fontSize}px;font-weight:700;
      box-shadow:${shadow};
      transition:all 0.2s;
      cursor:pointer;
    ">${rating > 0 ? rating.toFixed(1) : '–'}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

const FitBounds = ({ restaurants }) => {
  const map = useMap()
  const bounds = useMemo(() => {
    const pts = restaurants
      .filter((r) => r.latitude && r.longitude)
      .map((r) => [r.latitude, r.longitude])
    return pts.length > 0 ? L.latLngBounds(pts) : null
  }, [restaurants])

  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }, [bounds, map])

  return null
}

// Fly to a restaurant when selected
const FlyToSelected = ({ restaurant }) => {
  const map = useMap()
  useEffect(() => {
    if (restaurant?.latitude && restaurant?.longitude) {
      map.flyTo([restaurant.latitude, restaurant.longitude], 16, { duration: 0.8 })
    }
  }, [restaurant, map])
  return null
}

/* ─── Compact restaurant card for the side list ─── */
const RestaurantListCard = ({ restaurant, isHovered, isSelected, onHover, onSelect }) => {
  const ref = useRef(null)
  const rating = Number(restaurant.avgRating || restaurant.rating || 0)

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isSelected])

  return (
    <div
      ref={ref}
      onMouseEnter={() => onHover(restaurant.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(restaurant.id)}
      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected
          ? 'bg-red-50 border-[#EF4F5F]/30 shadow-sm'
          : isHovered
            ? 'bg-gray-50 border-gray-200'
            : 'bg-white border-transparent hover:bg-gray-50'
        }`}
    >
      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {restaurant.image ? (
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils size={20} className="text-gray-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1.5">
          <h4 className="text-sm font-semibold text-[#1C1C1C] truncate leading-tight">{restaurant.name}</h4>
          <span className={`shrink-0 flex items-center gap-0.5 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ${getRatingBgClass(rating)}`}>
            {rating.toFixed(1)} <Star size={8} fill="white" stroke="none" />
          </span>
        </div>
        {restaurant.cuisine && (
          <p className="text-xs text-[#696969] mt-0.5 truncate">{restaurant.cuisine}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          {restaurant.costForTwo && (
            <span className="text-xs text-[#696969]">₹{restaurant.costForTwo} for two</span>
          )}
          <span className="text-xs text-[#9C9C9C] flex items-center gap-0.5">
            <Clock size={10} /> {restaurant.deliveryTime || '30'} min
          </span>
        </div>
        <Link
          to={`/restaurant/${restaurant.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#EF4F5F] mt-1.5 hover:underline"
        >
          View Menu <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  )
}

/* ─── Main MapView ─── */
const MapView = ({ restaurants, hoveredId, onHoverRestaurant, selectedId, onSelectRestaurant, compact = false }) => {
  const mappable = restaurants.filter((r) => r.latitude && r.longitude)
  const selectedRestaurant = useMemo(
    () => mappable.find((r) => r.id === selectedId) || null,
    [mappable, selectedId]
  )

  const defaultCenter = [25.3176, 83.0068] // Varanasi
  const center = mappable.length > 0
    ? [mappable[0].latitude, mappable[0].longitude]
    : defaultCenter

  if (mappable.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-2xl border border-gray-100">
        <MapPin size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-[#1C1C1C] mb-1">No restaurants with location data</h3>
        <p className="text-sm text-[#696969]">Try the "Near Me" feature to discover restaurants around you</p>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-100 shadow-sm ${compact ? '' : ''}`}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: compact ? '100%' : '600px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds restaurants={mappable} />
        {selectedRestaurant && <FlyToSelected restaurant={selectedRestaurant} />}
        {mappable.map((r) => {
          const rating = Number(r.avgRating || r.rating || 0)
          const isHovered = hoveredId === r.id
          const isSelected = selectedId === r.id
          return (
            <Marker
              key={r.id}
              position={[r.latitude, r.longitude]}
              icon={createRatingIcon(rating, isHovered || isSelected)}
              eventHandlers={{
                mouseover: () => onHoverRestaurant?.(r.id),
                mouseout: () => onHoverRestaurant?.(null),
                click: () => onSelectRestaurant?.(r.id),
              }}
            >
              <Popup maxWidth={280} minWidth={220}>
                <Link to={`/restaurant/${r.id}`} className="block no-underline">
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
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#1C1C1C] truncate mb-0.5">{r.name}</h4>
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`flex items-center gap-0.5 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ${getRatingBgClass(rating)}`}>
                          {rating.toFixed(1)} <Star size={8} fill="white" stroke="none" />
                        </span>
                        {r.costForTwo && <span className="text-[11px] text-[#696969]">· ₹{r.costForTwo} for two</span>}
                      </div>
                      {r.cuisine && <p className="text-[11px] text-[#696969] truncate">{r.cuisine}</p>}
                      <p className="text-[10px] text-[#9C9C9C] flex items-center gap-0.5 mt-1">
                        <Clock size={9} /> {r.deliveryTime || '30 min'}
                      </p>
                    </div>
                  </div>
                </Link>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

// Export sub-component for split view usage
MapView.RestaurantListCard = RestaurantListCard

export default MapView
