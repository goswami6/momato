import React, { useState, useEffect, useCallback } from 'react'
import {
  Package, Clock, CheckCircle, ChefHat, Truck, MapPin,
  Phone, User, RefreshCw
} from 'lucide-react'
import { apiGetOwnerOrders, apiUpdateOrderStatus } from '../../services/api'

const statusFlow = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']
const statusLabel = {
  placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
}
const statusColor = {
  placed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  preparing: 'bg-orange-50 text-orange-700 border-orange-200',
  out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const OwnerOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState(null)

  const loadOrders = useCallback(() => {
    setLoading(true)
    apiGetOwnerOrders(filter)
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { loadOrders() }, [loadOrders])

  const advanceStatus = async (order) => {
    const currentIdx = statusFlow.indexOf(order.status)
    if (currentIdx < 0 || currentIdx >= statusFlow.length - 1) return
    const nextStatus = statusFlow[currentIdx + 1]
    setBusy(order.id)
    try {
      const updated = await apiUpdateOrderStatus(order.id, nextStatus)
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: updated.status } : o))
    } catch (err) {
      alert(err.message || 'Failed to update')
    }
    setBusy(null)
  }

  const cancelOrder = async (order) => {
    if (!confirm('Cancel this order?')) return
    setBusy(order.id)
    try {
      const updated = await apiUpdateOrderStatus(order.id, 'cancelled')
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: updated.status } : o))
    } catch (err) {
      alert(err.message || 'Failed to cancel')
    }
    setBusy(null)
  }

  const activeCount = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1C1C1C]">Orders</h2>
          <p className="text-sm text-gray-500">{activeCount} active orders</p>
        </div>
        <button onClick={loadOrders} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: '', label: 'All' },
          { value: 'placed', label: 'New' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'preparing', label: 'Preparing' },
          { value: 'out_for_delivery', label: 'Out for Delivery' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'cancelled', label: 'Cancelled' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.value
              ? 'bg-[#EF4F5F] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-[#EF4F5F]'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-100">
          <Package size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div key={order.id} layout className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1C1C1C]">Order #{order.id}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <span className="text-lg font-bold text-[#1C1C1C]">₹{order.totalAmount?.toFixed(2)}</span>
              </div>

              {/* Customer */}
              {order.user && (
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><User size={12} /> {order.user.name}</span>
                  {order.user.phone && <span className="flex items-center gap-1"><Phone size={12} /> {order.user.phone}</span>}
                </div>
              )}

              {/* Items */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-gray-700">{item.name} × {item.quantity}</span>
                    <span className="text-gray-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Delivery + Payment */}
              <div className="text-xs text-gray-500 mb-3 space-y-1">
                <div className="flex items-start gap-1">
                  <MapPin size={12} className="mt-0.5 shrink-0" />
                  <span>{order.deliveryAddress}</span>
                </div>
                <div>Payment: <span className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</span> • {order.paymentStatus}</div>
                {order.note && <div>Note: {order.note}</div>}
              </div>

              {/* Actions */}
              {!['delivered', 'cancelled'].includes(order.status) && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => advanceStatus(order)}
                    disabled={busy === order.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4F5F] text-white text-xs font-semibold rounded-lg hover:bg-[#D43D4D] transition-colors disabled:opacity-50"
                  >
                    {order.status === 'placed' && <><CheckCircle size={13} /> Confirm</>}
                    {order.status === 'confirmed' && <><ChefHat size={13} /> Start Preparing</>}
                    {order.status === 'preparing' && <><Truck size={13} /> Out for Delivery</>}
                    {order.status === 'out_for_delivery' && <><MapPin size={13} /> Mark Delivered</>}
                  </button>
                  <button
                    onClick={() => cancelOrder(order)}
                    disabled={busy === order.id}
                    className="px-3 py-1.5 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OwnerOrders
