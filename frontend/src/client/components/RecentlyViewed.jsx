import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, History, X } from 'lucide-react'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'

const getRatingColor = (r) => {
  if (r >= 4.5) return 'bg-[#267E3E]'
  if (r >= 4.0) return 'bg-[#3F8F46]'
  if (r >= 3.5) return 'bg-[#CDD614]'
  return 'bg-[#DB7C38]'
}

const RecentlyViewed = () => {
  const { recentlyViewed, clear } = useRecentlyViewed()

  if (!recentlyViewed.length) return null

  return (
    <section className="py-8 md:py-10">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-bold text-[#1C1C1C] flex items-center gap-2">
            <History size={22} className="text-[#EF4F5F]" />
            Recently Viewed
          </h2>
          <button
            onClick={clear}
            className="text-xs text-gray-400 hover:text-[#EF4F5F] flex items-center gap-1 transition-colors"
          >
            <X size={14} /> Clear
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
          {recentlyViewed.map((res) => (
            <Link
              key={res.id}
              to={`/restaurant/${res.id}`}
              className="group shrink-0 w-[220px] sm:w-[250px]"
            >
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={
                      res.image
                        ? res.image.startsWith('http')
                          ? res.image
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${res.image}`
                        : 'https://via.placeholder.com/300x150?text=Restaurant'
                    }
                    alt={res.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {res.deliveryTime && (
                    <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-[11px] font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                      <Clock size={11} className="text-[#EF4F5F]" /> {res.deliveryTime}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-bold text-[#1C1C1C] truncate pr-2 group-hover:text-[#EF4F5F] transition-colors">
                      {res.name}
                    </h3>
                    {res.rating > 0 && (
                      <div className={`${getRatingColor(res.rating)} text-white px-1 py-0.5 rounded text-[11px] font-bold flex items-center gap-0.5 shrink-0`}>
                        {res.rating} <Star size={9} fill="white" stroke="none" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{res.cuisine}</p>
                  <p className="text-xs text-gray-400 truncate mt-1">{res.area}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecentlyViewed
