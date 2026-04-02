import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, UtensilsCrossed, Users, Star, FolderOpen, ClipboardCheck,
  ChevronLeft, ChevronRight, LogOut, Settings, ShieldCheck
} from 'lucide-react'

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/restaurants', icon: UtensilsCrossed, label: 'Restaurants' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/reviews', icon: Star, label: 'Reviews' },
  { path: '/admin/collections', icon: FolderOpen, label: 'Collections' },
  { path: '/admin/moderation', icon: ClipboardCheck, label: 'Moderation' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
]

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-[#1C1C2E] text-white z-50 transition-all duration-300 flex flex-col ${collapsed ? 'w-[72px]' : 'w-[250px]'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="w-9 h-9 bg-[#EF4F5F] rounded-lg flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={20} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold tracking-tight">Momato</h1>
            <p className="text-[10px] text-gray-400 -mt-1">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive(item.path)
                ? 'bg-[#EF4F5F] text-white shadow-lg shadow-[#EF4F5F]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
