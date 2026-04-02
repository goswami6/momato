import React, { useState } from 'react'
import { Search, Bell, ChevronDown, User } from 'lucide-react'

const AdminHeader = ({ title, subtitle }) => {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left - Title */}
      <div>
        <h1 className="text-xl font-bold text-[#1C1C1C]">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 -mt-0.5">{subtitle}</p>}
      </div>

      {/* Right - Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-64">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4F5F] rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 bg-[#EF4F5F] rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-[#1C1C1C]">Admin</p>
              <p className="text-[10px] text-gray-500 -mt-0.5">Super Admin</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</a>
              <hr className="my-1 border-gray-100" />
              <a href="#" className="block px-4 py-2 text-sm text-[#EF4F5F] hover:bg-red-50">Logout</a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
