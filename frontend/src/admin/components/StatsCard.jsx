import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  const isPositive = changeType === 'positive'

  const colorMap = {
    red: { bg: 'bg-red-50', text: 'text-[#EF4F5F]', icon: 'bg-[#EF4F5F]/10' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'bg-green-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
  }

  const c = colorMap[color] || colorMap.red

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-[#1C1C1C] mt-1">{value}</h3>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{change}</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-11 h-11 ${c.icon} rounded-xl flex items-center justify-center`}>
          <Icon size={22} className={c.text} />
        </div>
      </div>
    </div>
  )
}

export default StatsCard
