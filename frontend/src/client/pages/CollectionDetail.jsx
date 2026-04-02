import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Clock, Share2, Utensils } from 'lucide-react'
import { apiGetCollectionById } from '../../services/api'

const getRatingColor = (r) => {
  if (r >= 4.5) return 'bg-[#267E3E]'
  if (r >= 4.0) return 'bg-[#3F8F46]'
  if (r >= 3.5) return 'bg-[#CDD614]'
  return 'bg-[#DB7C38]'
}

const CollectionDetail = () => {
  const { id } = useParams()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setError(null)
    apiGetCollectionById(id)
      .then((data) => setCollection(data))
      .catch(() => setError('Collection not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] md:pt-26 pt-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#EF4F5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#696969] text-sm">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white md:pt-26 pt-10">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-2">Collection not found</h1>
        <Link to="/collections" className="mt-4 px-6 py-3 bg-[#EF4F5F] text-white rounded-xl font-medium hover:bg-[#e23744] transition-colors">
          Back to Collections
        </Link>
      </div>
    )
  }

  const restaurants = collection.Restaurants || collection.restaurants || []

  return (
    <div className="bg-[#F8F8F8] min-h-screen md:pt-26 pt-10">
      {/* Hero */}
      <div className="relative h-[200px] sm:h-[260px] md:h-[320px] overflow-hidden">
        {collection.image ? (
          <img src={collection.image} alt={collection.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#EF4F5F]/30 to-[#FF8A94]/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 main-container">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{collection.title}</h1>
          {collection.description && (
            <p className="text-white/80 mt-2 text-sm sm:text-base">{collection.description}</p>
          )}
          <p className="text-white/60 mt-1 text-sm">{restaurants.length} places</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="main-container flex items-center justify-between py-4">
          <Link to="/collections" className="flex items-center gap-1.5 text-sm text-[#696969] hover:text-[#EF4F5F] transition-colors">
            <ArrowLeft size={16} /> All Collections
          </Link>
          <button className="flex items-center gap-1.5 text-sm text-[#696969] hover:text-[#EF4F5F] transition-colors">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      {/* Restaurants */}
      <div className="main-container py-8">
        {restaurants.length === 0 ? (
          <div className="text-center py-20">
            <Utensils size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-[#696969]">No restaurants in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r) => {
              const rating = Number(r.avgRating || r.rating || 0)
              return (
                <Link
                  key={r.id}
                  to={`/restaurant/${r.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)] transition-all duration-300 group"
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
                      <h3 className="text-[16px] font-semibold text-[#1C1C1C] truncate group-hover:text-[#EF4F5F] transition-colors">{r.name}</h3>
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
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionDetail
