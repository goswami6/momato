import React, { useState, useEffect } from 'react'
import { UtensilsCrossed, ChefHat, Star, TrendingUp, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiOwnerStats, apiGetOwnerRestaurants } from '../../services/api'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-[#1C1C1C]">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
)

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiOwnerStats(), apiGetOwnerRestaurants()])
      .then(([s, r]) => {
        setStats(s)
        setRestaurants(r.restaurants || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UtensilsCrossed} label="My Restaurants" value={loading ? '...' : stats?.restaurants ?? 0} color="bg-[#EF4F5F]" />
        <StatCard icon={ChefHat} label="Menu Items" value={loading ? '...' : stats?.menuItems ?? 0} color="bg-orange-500" />
        <StatCard icon={Star} label="Total Reviews" value={loading ? '...' : stats?.reviews ?? 0} color="bg-yellow-500" />
        <StatCard icon={TrendingUp} label="Avg Rating" value={loading ? '...' : stats?.avgRating ?? '0.0'} color="bg-green-500" />
      </div>

      {/* My Restaurants quick view */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#1C1C1C]">My Restaurants</h3>
          <Link
            to="/owner/restaurants"
            className="text-sm text-[#EF4F5F] font-medium hover:underline flex items-center gap-1"
          >
            <Plus size={14} /> Add New
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-6 text-gray-400 text-sm">Loading...</div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-10">
            <UtensilsCrossed size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No restaurants yet</p>
            <p className="text-sm text-gray-400 mb-4">Register your first restaurant to get started</p>
            <Link
              to="/owner/restaurants"
              className="inline-flex items-center gap-2 bg-[#EF4F5F] text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <Plus size={15} /> Register Restaurant
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {restaurants.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                {r.image ? (
                  <img src={r.image} alt={r.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1C1C1C] truncate">{r.name}</p>
                  <p className="text-xs text-gray-400 truncate">{r.cuisine} • {r.area || r.address}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${r.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {r.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OwnerDashboard
