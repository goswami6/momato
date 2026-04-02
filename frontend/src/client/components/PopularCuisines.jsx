import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGetRestaurants } from '../../services/api'

const cuisineIcons = {
  'Biryani': '🍚', 'Pizza': '🍕', 'Burger': '🍔', 'Chinese': '🥡', 'North Indian': '🍛',
  'South Indian': '🫓', 'Italian': '🍝', 'Mexican': '🌮', 'Thai': '🍜', 'Japanese': '🍣',
  'Continental': '🥘', 'Mughlai': '🫕', 'Desserts': '🍰', 'Street Food': '🌯',
  'Rolls': '🌯', 'Momos': '🥟', 'Cakes': '🎂', 'Ice Cream': '🍦', 'Sandwich': '🥪',
  'Coffee': '☕', 'Chaat': '🥗', 'Dosa': '🫓', 'Paneer': '🧀', 'Chicken': '🍗',
  'Kebab': '🍢', 'Thali': '🍽️', 'Paratha': '🫓', 'Shake': '🥤', 'Juice': '🧃',
  'Pasta': '🍝', 'Noodles': '🍜', 'Seafood': '🦐', 'Pure Veg': '🥬', 'BBQ': '🔥',
}

const defaultIcon = '🍴'

const PopularCuisines = () => {
  const [restaurants, setRestaurants] = useState([])

  useEffect(() => {
    apiGetRestaurants({ limit: 100 })
      .then((data) => setRestaurants(data.restaurants || []))
      .catch(() => { })
  }, [])

  const cuisines = useMemo(() => {
    const counts = {}
    restaurants.forEach((r) => {
      String(r.cuisine || '').split(',').map(c => c.trim()).filter(Boolean).forEach((c) => {
        counts[c] = (counts[c] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count, icon: cuisineIcons[name] || defaultIcon }))
  }, [restaurants])

  if (cuisines.length === 0) return null

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-[1100px] mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#1C1C1C] mb-2">
          Best Food Near You
        </h2>
        <p className="text-gray-400 text-sm mb-6">Discover dishes people love in your area</p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {cuisines.map((cuisine) => (
            <Link
              key={cuisine.name}
              to={`/search?q=${encodeURIComponent(cuisine.name)}`}
              className="group flex flex-col items-center p-4 rounded-2xl border border-gray-100 hover:border-[#EF4F5F]/30 hover:shadow-md transition-all duration-200 bg-white"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center text-2xl md:text-3xl mb-2 group-hover:scale-110 transition-transform">
                {cuisine.icon}
              </div>
              <span className="text-sm font-semibold text-[#1C1C1C] text-center leading-tight">{cuisine.name}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{cuisine.count} places</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularCuisines
