import React from 'react'

const RecentActivity = ({ activities = [] }) => {
  const getStatusColor = (type) => {
    const colors = {
      new: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      review: 'bg-yellow-100 text-yellow-700',
      signup: 'bg-purple-100 text-purple-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-base font-bold text-[#1C1C1C] mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase mt-0.5 flex-shrink-0 ${getStatusColor(activity.type)}`}>
              {activity.type}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 truncate">{activity.message}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentActivity
