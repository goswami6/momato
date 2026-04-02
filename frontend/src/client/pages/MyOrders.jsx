import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Clock, ChevronRight, ShoppingBag, ArrowRight, Store, Bike, UtensilsCrossed, BadgeCheck, PartyPopper, RotateCcw } from 'lucide-react'
import { apiGetMyOrders, apiReorder } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const statusConfig = {
  placed: { label: 'Order Placed', color: 'text-yellow-600 bg-yellow-50', icon: Package },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50', icon: BadgeCheck },
  preparing: { label: 'Being Prepared', color: 'text-orange-600 bg-orange-50', icon: UtensilsCrossed },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-600 bg-purple-50', icon: Bike },
  delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50', icon: PartyPopper },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: Package },
}

const stepKeys = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

const MyOrders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | active | past
  const [reorderingId, setReorderingId] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    apiGetMyOrders()
      .then((d) => {
        const list = Array.isArray(d) ? d : []
        setOrders(list.map(o => ({
          ...o,
          items: Array.isArray(o.items) ? o.items : (() => { try { return JSON.parse(o.items) } catch { return [] } })()
        })))
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleReorder = async (e, orderId) => {
    e.preventDefault()
    e.stopPropagation()
    setReorderingId(orderId)
    try {
      await apiReorder(orderId)
      navigate('/cart')
    } catch (err) {
      alert(err.message || 'Failed to reorder')
      setReorderingId(null)
    }
  }

  const activeStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery']
  const filtered = filter === 'all' ? orders
    : filter === 'active' ? orders.filter(o => activeStatuses.includes(o.status))
      : orders.filter(o => ['delivered', 'cancelled'].includes(o.status))

  const activeCount = orders.filter(o => activeStatuses.includes(o.status)).length

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#EF4F5F] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-[#1C1C1C] flex items-center gap-2">
            <ShoppingBag size={24} /> My Orders
          </h1>
          {activeCount > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EF4F5F] text-white">
              {activeCount} active
            </span>
          )}
        </div>

        {/* Filter tabs */}
        {orders.length > 0 && (
          <div className="flex gap-2 mb-5">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'past', label: 'Past Orders' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${filter === t.key
                  ? 'bg-[#1C1C1C] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-bold text-gray-600 mb-2">No orders yet</h2>
            <p className="text-sm text-gray-400 mb-6">Your order history will appear here</p>
            <Link to="/" className="px-6 py-3 bg-[#EF4F5F] text-white font-semibold rounded-xl hover:bg-[#D43D4D] transition-colors inline-block">
              Browse Restaurants
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No {filter === 'active' ? 'active' : 'past'} orders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order, idx) => {
              const config = statusConfig[order.status] || statusConfig.placed
              const StatusIcon = config.icon
              const isActive = activeStatuses.includes(order.status)
              const stepIdx = stepKeys.indexOf(order.status)
              const progress = order.status === 'cancelled' ? 0 : ((stepIdx) / (stepKeys.length - 1)) * 100

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link
                    to={`/orders/${order.id}`}
                    className="bg-white rounded-2xl border border-gray-100 block hover:shadow-md transition-all group overflow-hidden"
                  >
                    {/* Progress bar for active orders */}
                    {isActive && (
                      <div className="h-1 bg-gray-100">
                        <motion.div
                          className="h-full bg-[#EF4F5F]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        {order.restaurant?.image ? (
                          <img src={order.restaurant.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Store size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-bold text-[#1C1C1C] truncate">{order.restaurant?.name || 'Restaurant'}</h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Order #{order.id} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${config.color}`}>
                                {config.label}
                              </span>
                              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#EF4F5F] transition-colors" />
                            </div>
                          </div>

                          {/* Items summary */}
                          <p className="text-xs text-gray-500 mt-2 truncate">
                            {order.items?.map(i => i.name).join(', ')}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-semibold text-[#1C1C1C]">
                              ₹{order.totalAmount?.toFixed(2)}
                              <span className="text-xs text-gray-400 font-normal ml-1">· {order.items?.length || 0} items</span>
                            </span>
                            {isActive ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-[#EF4F5F]">
                                <Clock size={12} /> Track order <ArrowRight size={12} />
                              </span>
                            ) : (
                              <button
                                onClick={(e) => handleReorder(e, order.id)}
                                disabled={reorderingId === order.id}
                                className="flex items-center gap-1 text-xs font-semibold text-[#EF4F5F] hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <RotateCcw size={12} className={reorderingId === order.id ? 'animate-spin' : ''} />
                                {reorderingId === order.id ? 'Adding...' : 'Reorder'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders
