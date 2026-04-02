import React, { useState, useEffect, useCallback } from 'react'
import {
  Tag, Plus, Edit2, Trash2, X, Check, RefreshCw, Percent, DollarSign
} from 'lucide-react'
import { apiGetOwnerOffers, apiCreateOffer, apiUpdateOffer, apiDeleteOffer } from '../../services/api'
import { apiGetOwnerRestaurants } from '../../services/api'

const emptyForm = {
  restaurantId: '', code: '', title: '', description: '',
  discountType: 'percentage', discountValue: '', minOrderValue: '',
  maxDiscount: '', validFrom: '', validTo: '', usageLimit: '', isActive: true,
}

const OwnerOffers = () => {
  const [offers, setOffers] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([apiGetOwnerOffers(), apiGetOwnerRestaurants()])
      .then(([o, r]) => {
        setOffers(Array.isArray(o) ? o : [])
        setRestaurants(r.restaurants || [])
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => {
    setEditId(null)
    setForm({ ...emptyForm, restaurantId: restaurants[0]?.id || '' })
    setShowForm(true)
  }

  const openEdit = (o) => {
    setEditId(o.id)
    setForm({
      restaurantId: o.restaurantId, code: o.code, title: o.title, description: o.description || '',
      discountType: o.discountType, discountValue: o.discountValue, minOrderValue: o.minOrderValue || '',
      maxDiscount: o.maxDiscount || '', validFrom: o.validFrom ? o.validFrom.slice(0, 10) : '',
      validTo: o.validTo ? o.validTo.slice(0, 10) : '', usageLimit: o.usageLimit || '', isActive: o.isActive,
    })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.restaurantId || !form.code || !form.title || !form.discountValue) {
      alert('Please fill required fields: restaurant, code, title, discount value')
      return
    }
    setSaving(true)
    try {
      if (editId) {
        const updated = await apiUpdateOffer(editId, form)
        setOffers(prev => prev.map(o => o.id === editId ? { ...o, ...updated } : o))
      } else {
        const created = await apiCreateOffer(form)
        setOffers(prev => [created, ...prev])
      }
      setShowForm(false)
    } catch (err) {
      alert(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (o) => {
    if (!window.confirm(`Delete offer "${o.code}"?`)) return
    try {
      await apiDeleteOffer(o.id)
      setOffers(prev => prev.filter(x => x.id !== o.id))
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

  const toggleActive = async (o) => {
    try {
      await apiUpdateOffer(o.id, { isActive: !o.isActive })
      setOffers(prev => prev.map(x => x.id === o.id ? { ...x, isActive: !x.isActive } : x))
    } catch (err) {
      alert(err.message || 'Update failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{offers.length} offer(s)</p>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-[#EF4F5F] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e23744] transition-colors">
            <Plus size={16} /> Create Offer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Tag size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600 mb-1">No offers yet</p>
          <p className="text-sm text-gray-400">Create a coupon code to attract more customers</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {offers.map(o => (
            <div key={o.id} className={`bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 ${!o.isActive ? 'opacity-60' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EF4F5F] to-[#FF8A94] flex items-center justify-center flex-shrink-0">
                {o.discountType === 'percentage' ? <Percent size={20} className="text-white" /> : <DollarSign size={20} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-[#1C1C1C] text-sm">{o.code}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${o.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {o.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{o.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {o.discountType === 'percentage' ? `${o.discountValue}% off` : `Rs.${o.discountValue} off`}
                  {o.minOrderValue > 0 && ` · Min Rs.${o.minOrderValue}`}
                  {o.maxDiscount && ` · Max Rs.${o.maxDiscount}`}
                  {o.usageCount != null && ` · Used ${o.usageCount}${o.usageLimit ? `/${o.usageLimit}` : ''} times`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(o)} className="p-2 hover:bg-gray-50 rounded-lg transition-colors" title={o.isActive ? 'Deactivate' : 'Activate'}>
                  <Check size={16} className={o.isActive ? 'text-green-500' : 'text-gray-400'} />
                </button>
                <button onClick={() => openEdit(o)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={16} className="text-blue-500" />
                </button>
                <button onClick={() => handleDelete(o)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1C1C1C]">{editId ? 'Edit Offer' : 'Create Offer'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant *</label>
                <select value={form.restaurantId} onChange={e => set('restaurantId', Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                  disabled={!!editId}>
                  <option value="">Select restaurant</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F] uppercase"
                    placeholder="e.g. FLAT50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select value={form.discountType} onChange={e => set('discountType', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (Rs.)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                  placeholder="e.g. Flat 50% OFF on orders above Rs.399" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={form.description} onChange={e => set('description', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                  placeholder="Optional details" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                  <input type="number" value={form.discountValue} onChange={e => set('discountValue', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder={form.discountType === 'percentage' ? '50' : '100'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (Rs.)</label>
                  <input type="number" value={form.minOrderValue} onChange={e => set('minOrderValue', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
                  <input type="number" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder="150" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input type="date" value={form.validFrom} onChange={e => set('validFrom', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
                  <input type="date" value={form.validTo} onChange={e => set('validTo', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
                    placeholder="Unlimited" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => set('isActive', !form.isActive)}
                      className={`w-10 h-5 rounded-full transition-colors flex items-center ${form.isActive ? 'bg-[#EF4F5F]' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm text-gray-600">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#EF4F5F] text-white rounded-lg text-sm font-semibold hover:bg-[#e23744] disabled:opacity-60">
                  {saving ? 'Saving...' : <><Check size={15} /> {editId ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerOffers
