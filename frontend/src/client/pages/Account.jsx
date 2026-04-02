import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, ChevronRight, LogOut, ShoppingBag, CalendarDays, Bookmark, MapPin, Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { apiUpdateProfile, apiChangePassword } from '../../services/api'

const Account = () => {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' })

  if (!user) { navigate('/login'); return null }

  const handleProfileSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setProfileMsg('')
    try {
      const updated = await apiUpdateProfile({ name: name.trim(), phone: phone.trim() || null })
      updateUser(updated)
      setProfileMsg('Profile updated successfully')
      setTimeout(() => setProfileMsg(''), 3000)
    } catch (err) {
      setProfileMsg(err.message || 'Failed to update')
    }
    setSaving(false)
  }

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { setPwMsg({ type: 'error', text: 'New password must be at least 6 characters' }); return }
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'error', text: 'Passwords do not match' }); return }
    setPwSaving(true)
    setPwMsg({ type: '', text: '' })
    try {
      await apiChangePassword(currentPassword, newPassword)
      setPwMsg({ type: 'success', text: 'Password changed successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to change password' })
    }
    setPwSaving(false)
  }

  const handleLogout = () => { logout(); navigate('/') }

  const quickLinks = [
    { to: '/orders', label: 'My Orders', desc: 'View order history & track orders', icon: ShoppingBag },
    { to: '/reservations', label: 'My Reservations', desc: 'Manage table bookings', icon: CalendarDays },
    { to: '/saved-restaurants', label: 'Saved Restaurants', desc: 'Your bookmarked places', icon: Bookmark },
    { to: '/addresses', label: 'Saved Addresses', desc: 'Manage delivery addresses', icon: MapPin },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EF4F5F] to-[#FF6B6B] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1C1C1C]">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500 capitalize">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 mb-5 divide-y divide-gray-50">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#EF4F5F]">
                <link.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#1C1C1C]">{link.label}</h3>
                <p className="text-xs text-gray-400">{link.desc}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </Link>
          ))}
        </div>

        {/* Edit Profile */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-5">
          <h2 className="text-lg font-bold text-[#1C1C1C] mb-4">Edit Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" value={user.email} disabled
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                />
              </div>
            </div>
            {profileMsg && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check size={16} /> {profileMsg}
              </div>
            )}
            <button
              onClick={handleProfileSave} disabled={saving || !name.trim()}
              className="px-6 py-2.5 bg-[#EF4F5F] text-white text-sm font-bold rounded-xl hover:bg-[#D43D4D] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-5">
          <h2 className="text-lg font-bold text-[#1C1C1C] mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Current Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrent ? 'text' : 'password'} value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNew ? 'text' : 'password'} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Confirm New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                />
              </div>
            </div>
            {pwMsg.text && (
              <p className={`text-sm ${pwMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{pwMsg.text}</p>
            )}
            <button
              onClick={handlePasswordChange}
              disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
              className="px-6 py-2.5 bg-[#EF4F5F] text-white text-sm font-bold rounded-xl hover:bg-[#D43D4D] transition-colors disabled:opacity-50"
            >
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-600 bg-white rounded-2xl border border-gray-100 hover:bg-red-50 transition-colors font-medium">
          <LogOut size={18} /> Log Out
        </button>
      </div>
    </div>
  )
}

export default Account
