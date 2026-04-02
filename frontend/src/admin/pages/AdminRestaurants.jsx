import React, { useState, useEffect } from 'react'
import { Plus, Eye, Trash2, MapPin, Star } from 'lucide-react'
import DataTable from '../components/DataTable'
import { apiGetRestaurants, apiDeleteRestaurant } from '../../services/api'

const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'bg-green-600'
  if (rating >= 4.0) return 'bg-green-500'
  if (rating >= 3.5) return 'bg-yellow-500'
  return 'bg-orange-500'
}

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setLoading(true)
    apiGetRestaurants({ limit: 100 })
      .then((data) => {
        setRestaurants(data.restaurants || [])
        setTotal(data.total || 0)
      })
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.name}"?`)) return
    try {
      await apiDeleteRestaurant(row.id)
      setRestaurants((prev) => prev.filter((r) => r.id !== row.id))
    } catch (err) {
      alert(err.message || 'Failed to delete restaurant')
    }
  }

  const avgRating = restaurants.length > 0
    ? (restaurants.reduce((a, r) => a + Number(r.avgRating || r.rating || 0), 0) / restaurants.length).toFixed(1)
    : '0.0'

  const columns = [
    {
      header: 'Restaurant',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={row.name} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg">🍽️</div>
          )}
          <div>
            <p className="font-semibold text-[#1C1C1C]">{row.name}</p>
            <p className="text-[11px] text-gray-400">{row.cuisine || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'address',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin size={13} className="text-gray-400" />
          <span>{row.area || row.address || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Rating',
      accessor: 'avgRating',
      render: (row) => {
        const r = Number(row.avgRating || row.rating || 0)
        return (
          <div className="flex items-center gap-2">
            <span className={`${getRatingColor(r)} text-white text-xs font-bold px-2 py-0.5 rounded`}>
              {r.toFixed(1)}
            </span>
            {row.reviewCount > 0 && <span className="text-xs text-gray-400">({row.reviewCount})</span>}
          </div>
        )
      },
    },
    {
      header: 'Cost for Two',
      accessor: 'costForTwo',
      render: (row) => <span className="text-gray-700">{row.costForTwo ? `Rs.${row.costForTwo}` : '-'}</span>,
    },
    {
      header: 'Open',
      accessor: 'isOpen',
      render: (row) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${row.isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {row.isOpen ? 'Open' : 'Closed'}
        </span>
      ),
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1C1C1C]">All Restaurants</h2>
          <p className="text-sm text-gray-500">Manage all restaurant listings</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-[#1C1C1C]">{loading ? '...' : total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{loading ? '...' : restaurants.filter(r => r.isOpen).length}</p>
          <p className="text-xs text-gray-500">Open Now</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{loading ? '...' : restaurants.filter(r => r.isVeg).length}</p>
          <p className="text-xs text-gray-500">Pure Veg</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{loading ? '...' : avgRating}</p>
          <p className="text-xs text-gray-500">Avg Rating</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading restaurants...</div>
      ) : (
        <DataTable
          columns={columns}
          data={restaurants}
          searchPlaceholder="Search restaurants..."
        />
      )}
    </div>
  )
}

export default AdminRestaurants
