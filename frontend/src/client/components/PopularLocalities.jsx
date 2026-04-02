import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGetRestaurants } from '../../services/api'
import { useLocation as useLocationCtx } from '../../context/LocationContext'

const PopularLocalities = () => {
  const [restaurants, setRestaurants] = useState([])
  const { city } = useLocationCtx()

  useEffect(() => {
    apiGetRestaurants({ limit: 100, location: city })
      .then((data) => setRestaurants(data.restaurants || []))
      .catch(() => setRestaurants([]))
  }, [city])

  const localities = useMemo(() => {
    const counts = restaurants.reduce((acc, restaurant) => {
      const locality = (restaurant.area || restaurant.city || 'Varanasi').trim()
      acc[locality] = (acc[locality] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, places: `${count} place${count === 1 ? '' : 's'}` }))
  }, [restaurants])

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-10 md:py-14">
      <h2 className="text-[24px] md:text-[28px] font-bold text-[#1c1c1c] mb-8">
        Popular localities in and around <span className="text-[#1c1c1c]">{city}</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {localities.map((loc) => (
          <Link
            key={loc.name}
            to={`/search?q=&location=${encodeURIComponent(loc.name)}`}
            className="group flex items-center justify-between p-5 rounded-xl border border-[#e8e8e8] bg-white hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:border-[#d4d5d9] transition-all duration-200"
          >
            <div>
              <h3 className="text-base font-semibold text-[#1c1c1c] group-hover:text-[#e23744] transition-colors">{loc.name}</h3>
              <p className="text-sm text-[#9c9c9c] mt-1">{loc.places}</p>
            </div>
            <svg className="w-5 h-5 text-[#d4d5d9] group-hover:text-[#e23744] group-hover:translate-x-1 transition-all duration-200 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
        <Link
          to="/search"
          className="flex items-center justify-center p-5 rounded-xl border border-[#e8e8e8] bg-white hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all duration-200 text-[#e23744] text-[15px] font-medium gap-1"
        >
          explore all restaurants
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

export default PopularLocalities
