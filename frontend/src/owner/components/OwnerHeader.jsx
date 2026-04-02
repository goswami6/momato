import React, { useState } from 'react'
import { Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const OwnerHeader = ({ title, subtitle }) => {
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold text-[#1C1C1C]">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 -mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-600" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 bg-[#EF4F5F] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {(user?.name || 'O')[0].toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-[#1C1C1C]">{user?.name || 'Owner'}</p>
              <p className="text-[10px] text-gray-500 -mt-0.5">Restaurant Owner</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-sm text-[#EF4F5F] hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default OwnerHeader
