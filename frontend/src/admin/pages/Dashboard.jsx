import React, { useState, useEffect } from 'react'
import { UtensilsCrossed, Users, Star, FolderOpen, TrendingUp } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import RecentActivity from '../components/RecentActivity'
import TopRestaurants from '../components/TopRestaurants'
import { apiAdminStats } from '../../services/api'

const orderChartData = [
  { day: 'Mon', orders: 120 },
  { day: 'Tue', orders: 185 },
  { day: 'Wed', orders: 150 },
  { day: 'Thu', orders: 210 },
  { day: 'Fri', orders: 280 },
  { day: 'Sat', orders: 340 },
  { day: 'Sun', orders: 295 },
]

const Dashboard = () => {
  const [statsData, setStatsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const maxOrders = Math.max(...orderChartData.map(d => d.orders))

  useEffect(() => {
    apiAdminStats()
      .then((data) => setStatsData(data))
      .catch(() => setStatsData(null))
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      title: 'Total Restaurants',
      value: loading ? '...' : String(statsData?.restaurants ?? 0),
      change: null,
      changeType: 'positive',
      icon: UtensilsCrossed,
      color: 'red',
    },
    {
      title: 'Total Users',
      value: loading ? '...' : String(statsData?.users ?? 0),
      change: null,
      changeType: 'positive',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Total Reviews',
      value: loading ? '...' : String(statsData?.reviews ?? 0),
      change: null,
      changeType: 'positive',
      icon: Star,
      color: 'orange',
    },
    {
      title: 'Collections',
      value: loading ? '...' : String(statsData?.collections ?? 0),
      change: null,
      changeType: 'positive',
      icon: FolderOpen,
      color: 'purple',
    },
    {
      title: 'Avg Rating',
      value: loading ? '...' : (statsData?.avgRating ? Number(statsData.avgRating).toFixed(1) : '0.0'),
      change: null,
      changeType: 'positive',
      icon: TrendingUp,
      color: 'green',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#1C1C1C]">Weekly Orders</h3>
            <select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="flex items-end gap-3 h-48">
            {orderChartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500">{d.orders}</span>
                <div
                  className="w-full bg-gradient-to-t from-[#EF4F5F] to-[#FF8A95] rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{ height: `${(d.orders / maxOrders) * 100}%` }}
                />
                <span className="text-[11px] text-gray-400 font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <RecentActivity />
      </div>

      <TopRestaurants />
    </div>
  )
}

export default Dashboard
