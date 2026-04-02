import React, { useState, useEffect } from 'react'
import { Trash2, Mail, Phone, Shield, Users } from 'lucide-react'
import DataTable from '../components/DataTable'
import { apiAdminUsers, apiAdminDeleteUser } from '../../services/api'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiAdminUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete user "${row.name}"?`)) return
    try {
      await apiAdminDeleteUser(row.id)
      setUsers((prev) => prev.filter((u) => u.id !== row.id))
    } catch (err) {
      alert(err.message || 'Failed to delete user')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const adminCount = users.filter(u => u.role === 'admin').length
  const ownerCount = users.filter(u => u.role === 'owner').length

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E23744] to-[#f06b74] flex items-center justify-center text-white font-bold text-sm">
            {(row.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[#1C1C1C]">{row.name}</p>
            <p className="text-[11px] text-gray-400">Joined {formatDate(row.createdAt)}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Mail size={13} className="text-gray-400" />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Phone size={13} className="text-gray-400" />
          <span>{row.phone || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => {
        const roleConfig = {
          admin: { label: 'Admin', icon: 'text-purple-500', bg: 'bg-purple-50 text-purple-700' },
          owner: { label: 'Owner', icon: 'text-blue-500', bg: 'bg-blue-50 text-blue-700' },
          user: { label: 'User', icon: 'text-gray-400', bg: 'bg-gray-50 text-gray-600' },
        }
        const config = roleConfig[row.role] || roleConfig.user
        return (
          <div className="flex items-center gap-1.5">
            <Shield size={13} className={config.icon} />
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg}`}>
              {config.label}
            </span>
          </div>
        )
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
            onClick={() => handleDelete(row)}
            disabled={row.role === 'admin'}
          >
            <Trash2 size={15} className={row.role === 'admin' ? 'text-gray-300' : 'text-red-500'} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1C1C1C]">All Users</h2>
        <p className="text-sm text-gray-500">Manage all registered users</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-[#1C1C1C]">{loading ? '...' : users.length}</p>
          <p className="text-xs text-gray-500">Total Users</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{loading ? '...' : adminCount}</p>
          <p className="text-xs text-gray-500">Admins</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{loading ? '...' : ownerCount}</p>
          <p className="text-xs text-gray-500">Owners</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{loading ? '...' : users.length - adminCount - ownerCount}</p>
          <p className="text-xs text-gray-500">Regular Users</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading users...</div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Search users by name or email..."
        />
      )}
    </div>
  )
}

export default AdminUsers
