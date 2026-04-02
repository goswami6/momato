import React, { useState, useEffect, useCallback } from 'react'
import {
  CalendarDays, Clock, Users, Phone, User, RefreshCw,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import { apiGetOwnerReservations, apiOwnerUpdateReservationStatus } from '../../services/api'

const statusLabel = {
  pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled',
  completed: 'Completed', 'no-show': 'No Show',
}
const statusColor = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  'no-show': 'bg-gray-50 text-gray-600 border-gray-200',
}

const OwnerReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [busy, setBusy] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    apiGetOwnerReservations(filter || undefined, dateFilter || undefined)
      .then(d => setReservations(Array.isArray(d) ? d : []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false))
  }, [filter, dateFilter])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, status) => {
    setBusy(id)
    try {
      await apiOwnerUpdateReservationStatus(id, status)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch (err) {
      alert(err.message || 'Failed to update')
    } finally {
      setBusy(null)
    }
  }

  const filters = ['', 'pending', 'confirmed', 'cancelled', 'completed', 'no-show']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? 'bg-[#EF4F5F] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {f ? statusLabel[f] : 'All'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
          />
          <button onClick={load} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <CalendarDays size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600 mb-1">No reservations found</p>
          <p className="text-sm text-gray-400">Reservations from customers will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[r.status] || ''}`}>
                      {statusLabel[r.status] || r.status}
                    </span>
                    {r.restaurant && (
                      <span className="text-xs text-gray-500 font-medium">{r.restaurant.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1"><CalendarDays size={14} /> {r.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {r.time}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {r.partySize} guests</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User size={14} /> {r.guestName || r.user?.name || 'Guest'}
                    </span>
                    {(r.guestPhone || r.user?.phone) && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {r.guestPhone || r.user?.phone}
                      </span>
                    )}
                  </div>
                  {r.specialRequests && (
                    <p className="text-xs text-gray-400 italic">"{r.specialRequests}"</p>
                  )}
                </div>

                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      disabled={busy === r.id}
                      onClick={() => updateStatus(r.id, 'confirmed')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 disabled:opacity-50"
                    >
                      <CheckCircle size={13} /> Confirm
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => updateStatus(r.id, 'cancelled')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle size={13} /> Decline
                    </button>
                  </div>
                )}
                {r.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <button
                      disabled={busy === r.id}
                      onClick={() => updateStatus(r.id, 'completed')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 disabled:opacity-50"
                    >
                      <CheckCircle size={13} /> Complete
                    </button>
                    <button
                      disabled={busy === r.id}
                      onClick={() => updateStatus(r.id, 'no-show')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 disabled:opacity-50"
                    >
                      <AlertCircle size={13} /> No Show
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OwnerReservations
