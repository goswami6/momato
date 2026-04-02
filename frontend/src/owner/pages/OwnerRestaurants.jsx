import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Edit2, MapPin, X, Check, Upload, Crosshair } from 'lucide-react'
import { apiGetOwnerRestaurants, apiCreateRestaurant, apiCreateRestaurantWithImage, apiUpdateRestaurant, apiUpdateRestaurantWithImage, apiDeleteRestaurant } from '../../services/api'

const CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Japanese', 'Thai', 'Continental', 'Street Food', 'Mughlai', 'Bengali', 'Desserts', 'Beverages', 'Fast Food', 'Biryani', 'Pizza', 'Bakery', 'Seafood', 'Kebab', 'Healthy Food']

const emptyForm = {
  name: '', cuisine: '', address: '', area: '', city: 'Varanasi', phone: '',
  description: '', image: '', costForTwo: '', openingTime: '10:00', closingTime: '23:00',
  isVeg: false, hasAlcohol: false, petFriendly: false, hasOutdoorSeating: false, isOpen: true,
  latitude: '', longitude: '', deliveryRadius: 5,
}

const OwnerRestaurants = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  const load = () => {
    setLoading(true)
    apiGetOwnerRestaurants()
      .then(d => setRestaurants(d.restaurants || []))
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setErrors({})
    setImageFile(null)
    setImagePreview('')
    setShowForm(true)
  }

  const openEdit = (r) => {
    setEditId(r.id)
    setForm({
      name: r.name || '', cuisine: r.cuisine || '', address: r.address || '',
      area: r.area || '', city: r.city || 'Varanasi', phone: r.phone || '',
      description: r.description || '', image: r.image || '',
      costForTwo: r.costForTwo || '', openingTime: r.openingTime || '10:00',
      closingTime: r.closingTime || '23:00', isVeg: !!r.isVeg,
      hasAlcohol: !!r.hasAlcohol, petFriendly: !!r.petFriendly,
      hasOutdoorSeating: !!r.hasOutdoorSeating, isOpen: r.isOpen !== false,
      latitude: r.latitude || '', longitude: r.longitude || '', deliveryRadius: r.deliveryRadius || 5,
    })
    setErrors({})
    setImageFile(null)
    setImagePreview(r.image || '')
    setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.cuisine.trim()) e.cuisine = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    return e
  }

  const handleSave = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = { ...form, costForTwo: form.costForTwo ? Number(form.costForTwo) : null }
      if (imageFile) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => { if (v != null) fd.append(k, v) })
        fd.append('image', imageFile)
        if (editId) {
          await apiUpdateRestaurantWithImage(editId, fd)
        } else {
          await apiCreateRestaurantWithImage(fd)
        }
      } else {
        if (editId) {
          await apiUpdateRestaurant(editId, payload)
        } else {
          await apiCreateRestaurant(payload)
        }
      }
      setShowForm(false)
      load()
    } catch (err) {
      alert(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete "${r.name}"?`)) return
    try {
      await apiDeleteRestaurant(r.id)
      setRestaurants(prev => prev.filter(x => x.id !== r.id))
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{restaurants.length} restaurant(s) listed</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#EF4F5F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e23744] transition-colors"
        >
          <Plus size={16} /> Register Restaurant
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="font-semibold text-gray-600 mb-1">No restaurants yet</p>
          <p className="text-sm text-gray-400 mb-4">Click "Register Restaurant" to add your first one</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {restaurants.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              {r.image ? (
                <img src={r.image} alt={r.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">🍽️</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1C1C1C]">{r.name}</p>
                <p className="text-sm text-gray-500">{r.cuisine}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <MapPin size={11} />{r.area || r.address}
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {r.isOpen ? 'Open' : 'Closed'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(r)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={16} className="text-blue-500" />
                </button>
                <button onClick={() => handleDelete(r)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1C1C1C]">{editId ? 'Edit Restaurant' : 'Register Restaurant'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#EF4F5F] ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="e.g. Spice Garden" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Cuisine */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine *</label>
                  <select value={form.cuisine} onChange={e => set('cuisine', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#EF4F5F] ${errors.cuisine ? 'border-red-400' : 'border-gray-200'}`}>
                    <option value="">Select cuisine</option>
                    {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.cuisine && <p className="text-xs text-red-500 mt-1">{errors.cuisine}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder="10-digit number" />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input value={form.address} onChange={e => set('address', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#EF4F5F] ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="Full address" />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                {/* Area / City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
                  <input value={form.area} onChange={e => set('area', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder="e.g. Assi Ghat" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder="City" />
                </div>

                {/* Cost + Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost for Two (Rs.)</label>
                  <input type="number" value={form.costForTwo} onChange={e => set('costForTwo', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder="e.g. 600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <div className="space-y-2">
                    {(imagePreview || form.image) && (
                      <img src={imageFile ? URL.createObjectURL(imageFile) : (form.image || imagePreview)} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    )}
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#EF4F5F] hover:text-[#EF4F5F] transition-colors">
                      <Upload size={15} /> {imageFile ? 'Change image' : 'Upload image'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) { setImageFile(file); setImagePreview('') }
                      e.target.value = ''
                    }} />
                    <p className="text-[11px] text-gray-400">Or paste an image URL below:</p>
                    <input value={form.image} onChange={e => set('image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                      placeholder="https://..." />
                  </div>
                </div>

                {/* Location — GPS + Delivery Radius */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Coordinates</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => {
                      if (!navigator.geolocation) return alert('Geolocation not supported')
                      navigator.geolocation.getCurrentPosition(
                        pos => { set('latitude', pos.coords.latitude); set('longitude', pos.coords.longitude) },
                        () => alert('Unable to get location'),
                        { enableHighAccuracy: true }
                      )
                    }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#EF4F5F] hover:text-[#EF4F5F] transition-colors">
                      <Crosshair size={14} /> Use my location
                    </button>
                    {form.latitude && form.longitude && (
                      <span className="text-xs text-green-600 font-medium">✓ {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
                  <input type="number" min="1" max="50" value={form.deliveryRadius} onChange={e => set('deliveryRadius', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder="e.g. 5" />
                </div>

                {/* Opening / Closing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                  <input type="time" value={form.openingTime} onChange={e => set('openingTime', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <input type="time" value={form.closingTime} onChange={e => set('closingTime', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]" />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F] resize-none"
                    placeholder="Tell customers about your restaurant..." />
                </div>

                {/* Toggles */}
                <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'isOpen', label: 'Open Now' },
                    { key: 'isVeg', label: 'Pure Veg' },
                    { key: 'hasAlcohol', label: 'Serves Alcohol' },
                    { key: 'petFriendly', label: 'Pet Friendly' },
                    { key: 'hasOutdoorSeating', label: 'Outdoor Seating' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        onClick={() => set(key, !form[key])}
                        className={`w-10 h-5 rounded-full transition-colors flex items-center ${form[key] ? 'bg-[#EF4F5F]' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-xs text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#EF4F5F] text-white rounded-lg text-sm font-semibold hover:bg-[#e23744] disabled:opacity-60">
                  {saving ? 'Saving...' : <><Check size={15} /> {editId ? 'Update' : 'Register'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerRestaurants
