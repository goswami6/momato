import React, { useState, useEffect } from 'react'
import { Trash2, Star } from 'lucide-react'
import DataTable from '../components/DataTable'
import { apiAdminReviews, apiAdminDeleteReview } from '../../services/api'

const getRatingStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={12}
      className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
    />
  ))
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiAdminReviews()
      .then((data) => setReviews(Array.isArray(data) ? data : data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await apiAdminDeleteReview(row.id)
      setReviews((prev) => prev.filter((r) => r.id !== row.id))
    } catch (err) {
      alert(err.message || 'Failed to delete review')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0'

  const columns = [
    {
      header: 'User',
      accessor: 'user',
      render: (row) => {
        const name = row.user?.name || row.User?.name || 'Unknown'
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E23744] to-[#f06b74] flex items-center justify-center text-white font-bold text-xs">
              {name[0].toUpperCase()}
            </div>
            <span className="font-medium text-[#1C1C1C]">{name}</span>
          </div>
        )
      },
    },
    {
      header: 'Restaurant',
      accessor: 'restaurant',
      render: (row) => (
        <span className="text-gray-700">{row.Restaurant?.name || row.restaurant?.name || '-'}</span>
      ),
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">{getRatingStars(row.rating)}</div>
          <span className="text-sm font-semibold text-gray-600">{Number(row.rating || 0).toFixed(1)}</span>
        </div>
      ),
    },
    {
      header: 'Review',
      accessor: 'comment',
      render: (row) => (
        <p className="text-sm text-gray-600 max-w-[200px] truncate">{row.comment || '-'}</p>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (row) => <span className="text-sm text-gray-500">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete" onClick={() => handleDelete(row)}>
            <Trash2 size={15} className="text-red-500" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1C1C1C]">All Reviews</h2>
        <p className="text-sm text-gray-500">Manage all customer reviews</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-[#1C1C1C]">{loading ? '...' : reviews.length}</p>
          <p className="text-xs text-gray-500">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">{loading ? '...' : avgRating}</p>
          <p className="text-xs text-gray-500">Avg Rating</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{loading ? '...' : reviews.filter(r => Number(r.rating) >= 4).length}</p>
          <p className="text-xs text-gray-500">Positive (4+)</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading reviews...</div>
      ) : (
        <DataTable
          columns={columns}
          data={reviews}
          searchPlaceholder="Search reviews..."
        />
      )}
    </div>
  )
}

export default AdminReviews
