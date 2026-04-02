import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Edit2, X, Check, Leaf, Drumstick, Upload } from 'lucide-react'
import { apiGetOwnerRestaurants, apiGetMenuItems, apiAddMenuItem, apiAddMenuItemWithImage, apiUpdateMenuItem, apiUpdateMenuItemWithImage, apiDeleteMenuItem } from '../../services/api'

const emptyItem = { name: '', description: '', price: '', category: '', image: '', isVeg: true, isAvailable: true }

const CATEGORIES = ['Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Desserts', 'Beverages', 'Soups', 'Salads', 'Snacks', 'Special']

const OwnerMenu = () => {
  const [restaurants, setRestaurants] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [loadingMenus, setLoadingMenus] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editItemId, setEditItemId] = useState(null)
  const [form, setForm] = useState(emptyItem)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    apiGetOwnerRestaurants()
      .then(d => {
        const list = d.restaurants || []
        setRestaurants(list)
        if (list.length > 0) setSelectedId(String(list[0].id))
      })
      .catch(() => { })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoadingMenus(true)
    apiGetMenuItems(selectedId)
      .then(d => setMenuItems(Array.isArray(d) ? d : []))
      .catch(() => setMenuItems([]))
      .finally(() => setLoadingMenus(false))
  }, [selectedId])

  const openAdd = () => {
    setEditItemId(null)
    setForm(emptyItem)
    setErrors({})
    setImageFile(null)
    setImagePreview('')
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditItemId(item.id)
    setForm({
      name: item.name || '', description: item.description || '',
      price: item.price || '', category: item.category || '',
      image: item.image || '', isVeg: item.isVeg !== false, isAvailable: item.isAvailable !== false,
    })
    setErrors({})
    setImageFile(null)
    setImagePreview(item.image || '')
    setShowForm(true)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter valid price'
    return e
  }

  const handleSave = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (imageFile) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => { if (v != null) fd.append(k, v) })
        fd.append('image', imageFile)
        if (editItemId) {
          const updated = await apiUpdateMenuItemWithImage(editItemId, fd)
          setMenuItems(prev => prev.map(i => i.id === editItemId ? updated : i))
        } else {
          const created = await apiAddMenuItemWithImage(selectedId, fd)
          setMenuItems(prev => [...prev, created])
        }
      } else {
        if (editItemId) {
          const updated = await apiUpdateMenuItem(editItemId, payload)
          setMenuItems(prev => prev.map(i => i.id === editItemId ? updated : i))
        } else {
          const created = await apiAddMenuItem(selectedId, payload)
          setMenuItems(prev => [...prev, created])
        }
      }
      setShowForm(false)
    } catch (err) {
      alert(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return
    try {
      await apiDeleteMenuItem(item.id)
      setMenuItems(prev => prev.filter(i => i.id !== item.id))
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })) }

  const grouped = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Restaurant Selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
        <label className="text-sm font-semibold text-gray-700 flex-shrink-0">Select Restaurant:</label>
        {restaurants.length === 0 ? (
          <p className="text-sm text-gray-400">No restaurants found. Register one first.</p>
        ) : (
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="flex-1 max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
          >
            {restaurants.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}
        {selectedId && (
          <button
            onClick={openAdd}
            className="ml-auto flex items-center gap-2 bg-[#EF4F5F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e23744] transition-colors"
          >
            <Plus size={15} /> Add Item
          </button>
        )}
      </div>

      {/* Menu Items */}
      {loadingMenus ? (
        <div className="text-center py-10 text-gray-400">Loading menu...</div>
      ) : menuItems.length === 0 && selectedId ? (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-100">
          <div className="text-4xl mb-3">🍜</div>
          <p className="font-semibold text-gray-600 mb-1">No items yet</p>
          <p className="text-sm text-gray-400 mb-4">Add your first menu item</p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-[#EF4F5F] text-white px-4 py-2 rounded-lg text-sm font-semibold">
            <Plus size={15} /> Add Item
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-[#1C1C1C] text-sm">{cat} <span className="text-gray-400 font-normal">({items.length})</span></h3>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🍴</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {item.isVeg ? (
                        <span className="w-4 h-4 border border-green-600 flex items-center justify-center rounded-sm flex-shrink-0">
                          <span className="w-2 h-2 bg-green-600 rounded-full block" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 border border-red-600 flex items-center justify-center rounded-sm flex-shrink-0">
                          <span className="w-2 h-2 bg-red-600 rounded-full block" />
                        </span>
                      )}
                      <p className="font-semibold text-[#1C1C1C] text-sm truncate">{item.name}</p>
                      {!item.isAvailable && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Unavailable</span>
                      )}
                    </div>
                    {item.description && <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>}
                    <p className="text-sm font-bold text-[#EF4F5F] mt-0.5">Rs. {item.price}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={15} className="text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(item)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#1C1C1C]">{editItemId ? 'Edit Item' : 'Add Menu Item'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#EF4F5F] ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="e.g. Paneer Tikka" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#EF4F5F] ${errors.price ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="e.g. 250" />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]">
                    <option value="">Select</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F] resize-none"
                  placeholder="Describe this dish..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                <div className="space-y-2">
                  {(imagePreview || form.image || imageFile) && (
                    <img src={imageFile ? URL.createObjectURL(imageFile) : (form.image || imagePreview)} alt="Preview" className="w-full h-28 object-cover rounded-lg" />
                  )}
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#EF4F5F] hover:text-[#EF4F5F] transition-colors">
                    <Upload size={14} /> {imageFile ? 'Change image' : 'Upload image'}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) { setImageFile(file); setImagePreview('') }
                    e.target.value = ''
                  }} />
                  <p className="text-[11px] text-gray-400">Or paste URL:</p>
                  <input value={form.image} onChange={e => set('image', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder="https://..." />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => set('isVeg', !form.isVeg)}
                    className={`w-10 h-5 rounded-full transition-colors flex items-center ${form.isVeg ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isVeg ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-gray-600">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => set('isAvailable', !form.isAvailable)}
                    className={`w-10 h-5 rounded-full transition-colors flex items-center ${form.isAvailable ? 'bg-[#EF4F5F]' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isAvailable ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-gray-600">Available</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#EF4F5F] text-white rounded-lg text-sm font-semibold hover:bg-[#e23744] disabled:opacity-60">
                  {saving ? 'Saving...' : <><Check size={14} /> {editItemId ? 'Update' : 'Add Item'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerMenu
