import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, MapPin, User, AlertTriangle } from 'lucide-react'
import {
  apiAdminAllRestaurants,
  apiAdminApproveRestaurant, apiAdminRejectRestaurant,
} from '../../services/api'

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

const AdminModeration = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [rejectModal, setRejectModal] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(null)

  const loadData = useCallback(() => {
    setLoading(true)
    const fetcher = filter === 'all'
      ? apiAdminAllRestaurants()
      : apiAdminAllRestaurants(filter)
    fetcher
      .then((data) => setRestaurants(Array.isArray(data) ? data : []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { loadData() }, [loadData])

  const handleApprove = async (id) => {
    setBusy(id)
    try {
      await apiAdminApproveRestaurant(id)
      setRestaurants((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved', rejectionReason: null } : r))
    } catch (err) {
      alert(err.message || 'Approve failed')
    } finally {
      setBusy(null)
    }
  }

  const openReject = (r) => {
    setRejectModal(r)
    setReason('')
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setBusy(rejectModal.id)
    try {
      await apiAdminRejectRestaurant(rejectModal.id, reason)
      setRestaurants((prev) => prev.map((r) => r.id === rejectModal.id ? { ...r, status: 'rejected', rejectionReason: reason } : r))
      setRejectModal(null)
    } catch (err) {
      alert(err.message || 'Reject failed')
    } finally {
      setBusy(null)
    }
  }

  const pendingCount = restaurants.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1C1C1C]">Restaurant Moderation</h2>
        <p className="text-sm text-gray-500">Review and approve restaurant listings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f
              ? 'bg-[#EF4F5F] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-[#EF4F5F] hover:text-[#EF4F5F]'
              }`}
          >
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-600 mb-1">
            <Clock size={16} />
            <span className="text-2xl font-bold">{restaurants.filter((r) => r.status === 'pending').length}</span>
          </div>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
            <CheckCircle size={16} />
            <span className="text-2xl font-bold">{restaurants.filter((r) => r.status === 'approved').length}</span>
          </div>
          <p className="text-xs text-gray-500">Approved</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
            <XCircle size={16} />
            <span className="text-2xl font-bold">{restaurants.filter((r) => r.status === 'rejected').length}</span>
          </div>
          <p className="text-xs text-gray-500">Rejected</p>
        </div>
      </div>

      {/* Restaurant List */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-100">
          <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
          <p className="font-semibold text-gray-600">No restaurants to display</p>
          <p className="text-sm text-gray-400 mt-1">All clear for this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                {r.image ? (
                  <img src={r.image} alt={r.name} className="w-full sm:w-28 h-24 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-full sm:w-28 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-3xl shrink-0">🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#1C1C1C]">{r.name}</h3>
                      <p className="text-sm text-gray-500">{r.cuisine}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColors[r.status] || statusColors.pending}`}>
                      {r.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1"><MapPin size={11} />{r.area || r.address}</span>
                    {r.owner && <span className="flex items-center gap-1"><User size={11} />{r.owner.name} ({r.owner.email})</span>}
                  </div>
                  {r.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{r.description}</p>}
                  {r.rejectionReason && r.status === 'rejected' && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                      <AlertTriangle size={12} /> {r.rejectionReason}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(r.id)}
                        disabled={busy === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => openReject(r)}
                        disabled={busy === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#1C1C1C]">Reject "{rejectModal.name}"</h3>
              <p className="text-sm text-gray-500 mt-1">Provide a reason for rejection</p>
            </div>
            <div className="p-5 space-y-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#EF4F5F] resize-none"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setRejectModal(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={busy === rejectModal?.id}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Restaurant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminModeration
