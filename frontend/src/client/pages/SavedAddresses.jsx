import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Home, Briefcase, MapPinned, Plus, Pencil, Trash2,
  Star, Check, X, ArrowLeft,
} from 'lucide-react'
import { apiGetAddresses, apiAddAddress, apiUpdateAddress, apiDeleteAddress } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const labelIcons = {
  Home: { icon: Home, color: 'text-[#EF4F5F]', bg: 'bg-red-50' },
  Work: { icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
  Other: { icon: MapPinned, color: 'text-gray-500', bg: 'bg-gray-100' },
}

const emptyForm = { label: 'Home', address: '', landmark: '', isDefault: false }

const SavedAddresses = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadAddresses()
  }, [user, navigate])

  const loadAddresses = async () => {
    try {
      const data = await apiGetAddresses()
      setAddresses(Array.isArray(data) ? data : [])
    } catch { setAddresses([]) }
    finally { setLoading(false) }
  }

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (addr) => {
    setEditingId(addr.id)
    setForm({ label: addr.label, address: addr.address, landmark: addr.landmark || '', isDefault: addr.isDefault })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async () => {
    if (!form.address.trim()) { toast.error('Address is required'); return }
    setSaving(true)
    try {
      if (editingId) {
        const updated = await apiUpdateAddress(editingId, form)
        if (form.isDefault) {
          setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === editingId })))
        }
        setAddresses(prev => prev.map(a => a.id === editingId ? { ...a, ...updated } : a))
        toast.success('Address updated')
      } else {
        const newAddr = await apiAddAddress(form)
        if (form.isDefault) {
          setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })))
        }
        setAddresses(prev => [newAddr, ...prev])
        toast.success('Address added')
      }
      closeForm()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    setDeletingId(id)
    try {
      await apiDeleteAddress(id)
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast.success('Address deleted')
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    }
    setDeletingId(null)
  }

  const handleSetDefault = async (id) => {
    try {
      await apiUpdateAddress(id, { isDefault: true })
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
      toast.success('Default address updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#EF4F5F] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1C1C1C] flex items-center gap-2">
              <MapPin size={22} className="text-[#EF4F5F]" /> Saved Addresses
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#EF4F5F] text-white text-sm font-semibold rounded-xl hover:bg-[#D43D4D] transition-colors"
          >
            <Plus size={16} /> Add New
          </button>
        </div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#1C1C1C] text-sm">
                    {editingId ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>

                {/* Label selector */}
                <div className="flex gap-2 mb-4">
                  {['Home', 'Work', 'Other'].map(lbl => {
                    const cfg = labelIcons[lbl]
                    const Icon = cfg.icon
                    return (
                      <button
                        key={lbl}
                        onClick={() => setForm(p => ({ ...p, label: lbl }))}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${form.label === lbl
                          ? 'border-[#EF4F5F] bg-red-50 text-[#EF4F5F]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        <Icon size={14} /> {lbl}
                      </button>
                    )
                  })}
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Full Address *</label>
                  <textarea
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="House/Flat No., Building, Street, Area..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#EF4F5F] resize-none"
                  />
                </div>

                {/* Landmark */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={e => setForm(p => ({ ...p, landmark: e.target.value }))}
                    placeholder="Near park, temple, etc."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#EF4F5F]"
                  />
                </div>

                {/* Default toggle */}
                <label className="flex items-center gap-2 mb-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))}
                    className="accent-[#EF4F5F] w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">Set as default address</span>
                </label>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.address.trim()}
                    className="flex-1 py-2.5 bg-[#EF4F5F] text-white text-sm font-bold rounded-xl hover:bg-[#D43D4D] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    onClick={closeForm}
                    className="px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address List */}
        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-bold text-gray-600 mb-2">No saved addresses</h2>
            <p className="text-sm text-gray-400 mb-6">Add an address so you can quickly order food</p>
            <button
              onClick={openAdd}
              className="px-6 py-3 bg-[#EF4F5F] text-white font-semibold rounded-xl hover:bg-[#D43D4D] transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} /> Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr, idx) => {
              const cfg = labelIcons[addr.label] || labelIcons.Other
              const Icon = cfg.icon
              return (
                <motion.div
                  key={addr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all ${addr.isDefault ? 'border-[#EF4F5F] ring-1 ring-red-100' : 'border-gray-100 hover:border-gray-200'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-[#1C1C1C]">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                            <Star size={9} fill="currentColor" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{addr.address}</p>
                      {addr.landmark && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPinned size={11} /> Near: {addr.landmark}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => openEdit(addr)}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#EF4F5F] transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-green-600 transition-colors"
                          >
                            <Check size={12} /> Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(addr.id)}
                          disabled={deletingId === addr.id}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={12} /> {deletingId === addr.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedAddresses
