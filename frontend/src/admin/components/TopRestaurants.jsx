import React from 'react'

const TopRestaurants = ({ restaurants = [] }) => {
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-600'
    if (rating >= 4.0) return 'bg-green-500'
    if (rating >= 3.5) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-base font-bold text-[#1C1C1C] mb-4">Top Rated Restaurants</h3>
      <div className="space-y-3">
        {restaurants.map((r, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
            <img
              src={r.image}
              alt={r.name}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1C1C1C] truncate">{r.name}</p>
              <p className="text-[11px] text-gray-400">{r.cuisine}</p>
            </div>
            <div className={`${getRatingColor(r.rating)} text-white text-xs font-bold px-2 py-0.5 rounded`}>
              {r.rating}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopRestaurants
