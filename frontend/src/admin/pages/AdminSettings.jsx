import React, { useState } from 'react'
import { Save, Globe, Bell, Shield, Palette, Database, Mail } from 'lucide-react'

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1.5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-[#EF4F5F] text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h3 className="text-base font-bold text-[#1C1C1C]">General Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Name</label>
              <input type="text" defaultValue="Momato" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#EF4F5F] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
              <input type="text" defaultValue="Food Delivery & Dining" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#EF4F5F] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Default City</label>
              <input type="text" defaultValue="Varanasi" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#EF4F5F] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
              <input type="email" defaultValue="admin@momato.in" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#EF4F5F] transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Description</label>
              <textarea rows={3} defaultValue="Momato is a food discovery platform connecting food lovers with the best restaurants in Varanasi." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#EF4F5F] transition-colors resize-none" />
            </div>
          </div>

          <button className="flex items-center gap-2 bg-[#EF4F5F] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#d9404f] transition-colors">
            <Save size={16} /> Save Changes
          </button>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h3 className="text-base font-bold text-[#1C1C1C]">Notification Preferences</h3>

          {[
            { label: 'New restaurant registrations', desc: 'Get notified when a new restaurant is listed', checked: true },
            { label: 'New user signups', desc: 'Notification for every new user registration', checked: false },
            { label: 'New reviews', desc: 'Get notified when users post reviews', checked: true },
            { label: 'Flagged reviews', desc: 'Alerts when reviews are flagged by the system', checked: true },
            { label: 'Weekly reports', desc: 'Receive weekly analytics summary via email', checked: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-[#1C1C1C]">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#EF4F5F]"></div>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h3 className="text-base font-bold text-[#1C1C1C]">Security Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input type="password" className="w-full max-w-md border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#EF4F5F] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input type="password" className="w-full max-w-md border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#EF4F5F] transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input type="password" className="w-full max-w-md border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#EF4F5F] transition-colors" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-[#1C1C1C] mb-3">Two-Factor Authentication</h4>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-[#1C1C1C]">2FA is currently disabled</p>
                <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
              </div>
              <button className="text-sm font-semibold text-[#EF4F5F] hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                Enable
              </button>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-[#EF4F5F] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#d9404f] transition-colors">
            <Save size={16} /> Update Password
          </button>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
          <h3 className="text-base font-bold text-[#1C1C1C]">Appearance Settings</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Brand Color</label>
            <div className="flex items-center gap-3">
              {['#EF4F5F', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((color) => (
                <button
                  key={color}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Admin Theme</label>
            <div className="flex gap-4">
              <button className="flex-1 border-2 border-[#EF4F5F] rounded-xl p-4 text-center bg-white">
                <div className="w-full h-8 bg-white border border-gray-200 rounded mb-2"></div>
                <span className="text-xs font-medium text-[#1C1C1C]">Light</span>
              </button>
              <button className="flex-1 border-2 border-gray-200 rounded-xl p-4 text-center bg-gray-50">
                <div className="w-full h-8 bg-[#1C1C2E] rounded mb-2"></div>
                <span className="text-xs font-medium text-gray-500">Dark</span>
              </button>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-[#EF4F5F] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#d9404f] transition-colors">
            <Save size={16} /> Save Appearance
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminSettings
