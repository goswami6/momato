import React from 'react'
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Bike } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const restaurantPin = new L.DivIcon({
  className: 'restaurant-pin',
  html: `<div style="width:16px;height:16px;background:#EF4F5F;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(239,79,95,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const getZoomForRadius = (radiusKm) => {
  if (radiusKm <= 2) return 15
  if (radiusKm <= 5) return 13
  if (radiusKm <= 10) return 12
  return 11
}

const DeliveryRadiusMap = ({ latitude, longitude, deliveryRadius = 5, restaurantName }) => {
  if (!latitude || !longitude) return null

  const center = [latitude, longitude]
  const zoom = getZoomForRadius(deliveryRadius)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4 pb-3 border-b border-gray-50">
        <h3 className="text-sm font-bold text-[#1C1C1C] flex items-center gap-2">
          <Bike size={15} className="text-[#EF4F5F]" /> Delivery Area
        </h3>
        <p className="text-[12px] text-[#696969] mt-1">
          Delivers within <span className="font-semibold text-[#1C1C1C]">{deliveryRadius} km</span> radius
        </p>
      </div>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '200px', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={restaurantPin}>
          <Popup>{restaurantName}</Popup>
        </Marker>
        <Circle
          center={center}
          radius={deliveryRadius * 1000}
          pathOptions={{
            color: '#EF4F5F',
            fillColor: '#EF4F5F',
            fillOpacity: 0.08,
            weight: 2,
          }}
        />
      </MapContainer>
    </div>
  )
}

export default DeliveryRadiusMap
