import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, CheckCircle2, ChefHat, Truck, MapPin, Phone,
  Clock, ArrowLeft, XCircle, CreditCard, MessageSquare,
  CircleDot, BadgeCheck, UtensilsCrossed, Bike, PartyPopper,
  Receipt, HelpCircle, Store, RotateCcw
} from 'lucide-react'
import { apiGetOrderById, apiCancelOrder, apiReorder } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const steps = [
  {
    key: 'placed',
    label: 'Order Placed',
    icon: Package,
    desc: 'We\'ve received your order',
    activeDesc: 'Your order has been placed successfully!',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: BadgeCheck,
    desc: 'Restaurant accepted your order',
    activeDesc: 'The restaurant has confirmed your order and will begin preparing it shortly.',
  },
  {
    key: 'preparing',
    label: 'Preparing',
    icon: UtensilsCrossed,
    desc: 'Your food is being prepared',
    activeDesc: 'The kitchen is preparing your food with care. Almost there!',
  },
  {
    key: 'out_for_delivery',
    label: 'On the Way',
    icon: Bike,
    desc: 'Delivery partner is heading to you',
    activeDesc: 'Your delivery partner has picked up your order and is on the way!',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    icon: PartyPopper,
    desc: 'Order delivered',
    activeDesc: 'Your order has been delivered. Enjoy your meal!',
  },
]

const OrderTracking = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    apiGetOrderById(id)
      .then(setOrder)
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false))
  }, [id, user, navigate])

  // Poll for status updates on active orders
  useEffect(() => {
    if (!order || ['delivered', 'cancelled'].includes(order.status)) return
    const interval = setInterval(async () => {
      try {
        const updated = await apiGetOrderById(id)
        setOrder(updated)
      } catch { /* ignore */ }
    }, 15000)
    return () => clearInterval(interval)
  }, [order, id])

  // Tick every minute for ETA countdown
  useEffect(() => {
    if (!order || ['delivered', 'cancelled'].includes(order.status)) return
    const tick = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(tick)
  }, [order])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const updated = await apiCancelOrder(id)
      setOrder(updated)
    } catch (err) {
      alert(err.message || 'Cannot cancel')
    }
    setCancelling(false)
  }

  const handleReorder = async () => {
    setReordering(true)
    try {
      await apiReorder(id)
      navigate('/cart')
    } catch (err) {
      alert(err.message || 'Failed to reorder')
      setReordering(false)
    }
  }

  // Compute ETA
  const eta = useMemo(() => {
    if (!order) return null
    const deliveryMin = order.restaurant?.deliveryTime || 35
    const placedAt = new Date(order.createdAt).getTime()
    const etaTime = placedAt + deliveryMin * 60 * 1000
    const minsLeft = Math.max(0, Math.round((etaTime - now) / 60000))
    return { etaTime, minsLeft, deliveryMin }
  }, [order, now])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#EF4F5F] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!order) return null

  const currentIdx = order.status === 'cancelled' ? -1 : steps.findIndex((s) => s.key === order.status)
  const isActive = !['delivered', 'cancelled'].includes(order.status)
  const currentStep = currentIdx >= 0 ? steps[currentIdx] : null

  const parsedItems = Array.isArray(order.items) ? order.items : (() => { try { return JSON.parse(order.items) } catch { return [] } })()
  const itemSubtotal = parsedItems.reduce((s, i) => s + i.price * i.quantity, 0) || 0
  const deliveryFee = order.totalAmount > itemSubtotal ? +(order.totalAmount - itemSubtotal).toFixed(2) : 0

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back */}
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#EF4F5F] mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        {/* ─── Status Hero ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden"
        >
          {/* Top accent bar */}
          <div className={`h-1.5 ${order.status === 'cancelled' ? 'bg-red-500' : order.status === 'delivered' ? 'bg-green-500' : 'bg-[#EF4F5F]'}`} />

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 font-medium">ORDER #{order.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              {order.status === 'cancelled' ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-600">Cancelled</span>
              ) : order.status === 'delivered' ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-600">Delivered</span>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#EF4F5F]">
                  <span className="w-2 h-2 bg-[#EF4F5F] rounded-full animate-pulse" /> Live Tracking
                </div>
              )}
            </div>

            {/* Current status message */}
            {currentStep && (
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  key={currentStep.key}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-[#EF4F5F]'
                    }`}
                >
                  <currentStep.icon size={24} />
                </motion.div>
                <div>
                  <h2 className="font-bold text-[#1C1C1C] text-lg leading-tight">{currentStep.label}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{currentStep.activeDesc}</p>
                </div>
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <XCircle size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-[#1C1C1C] text-lg">Order Cancelled</h2>
                  <p className="text-sm text-gray-500 mt-0.5">This order has been cancelled.</p>
                </div>
              </div>
            )}

            {/* ETA Banner */}
            {isActive && eta && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#EF4F5F]" />
                  <span className="text-sm text-gray-600">Estimated delivery</span>
                </div>
                <span className="font-bold text-[#1C1C1C]">
                  {eta.minsLeft > 0 ? `${eta.minsLeft} min` : 'Any moment now!'}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ─── Vertical Timeline ─── */}
        {order.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-4"
          >
            <h3 className="font-bold text-[#1C1C1C] text-sm mb-5">Order Status</h3>
            <div className="relative">
              {steps.map((step, i) => {
                const done = i <= currentIdx
                const active = i === currentIdx
                const isLast = i === steps.length - 1
                const StepIcon = step.icon

                return (
                  <div key={step.key} className="flex gap-4 relative">
                    {/* Vertical line */}
                    {!isLast && (
                      <div className="absolute left-[15px] top-[32px] w-0.5 bottom-0 z-0">
                        <div className="w-full h-full bg-gray-200" />
                        {done && !active && (
                          <motion.div
                            className="absolute inset-0 bg-green-500"
                            initial={{ height: 0 }}
                            animate={{ height: '100%' }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                          />
                        )}
                        {active && (
                          <motion.div
                            className="absolute top-0 left-0 w-full bg-[#EF4F5F]"
                            initial={{ height: 0 }}
                            animate={{ height: '40%' }}
                            transition={{ duration: 0.4 }}
                          />
                        )}
                      </div>
                    )}

                    {/* Icon circle */}
                    <div className="relative z-10 shrink-0">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className={`w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all duration-300 ${done
                          ? active
                            ? 'bg-[#EF4F5F] text-white ring-4 ring-red-100 shadow-sm'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                          }`}
                      >
                        {done && !active ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <StepIcon size={14} />
                        )}
                      </motion.div>
                    </div>

                    {/* Label & description */}
                    <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                      <p className={`text-sm font-semibold leading-tight ${done ? 'text-[#1C1C1C]' : 'text-gray-400'
                        }`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${done ? 'text-gray-500' : 'text-gray-300'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Delivery Partner (when out for delivery) ─── */}
        <AnimatePresence>
          {order.status === 'out_for_delivery' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Bike size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1C1C1C]">Delivery Partner</p>
                  <p className="text-xs text-gray-400">Is on the way to your location</p>
                </div>
                <a
                  href={`tel:${order.restaurant?.phone || ''}`}
                  className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors"
                >
                  <Phone size={14} className="text-green-600" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Restaurant Info ─── */}
        {order.restaurant && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 mb-4"
          >
            <div className="flex items-center gap-3">
              {order.restaurant.image ? (
                <img src={order.restaurant.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Store size={20} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-[#1C1C1C] truncate">{order.restaurant.name}</h3>
                <p className="text-xs text-gray-400 truncate">{order.restaurant.address}</p>
              </div>
              {order.restaurant.phone && (
                <a
                  href={`tel:${order.restaurant.phone}`}
                  className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
                >
                  <Phone size={14} className="text-gray-500" />
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── Order Items ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Receipt size={16} className="text-gray-400" />
            <h3 className="font-bold text-sm text-[#1C1C1C]">Your Order</h3>
            <span className="text-xs text-gray-400 ml-auto">{parsedItems.length} items</span>
          </div>
          <div className="space-y-3">
            {parsedItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt="" className="w-11 h-11 rounded-lg object-cover" />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center">
                    <UtensilsCrossed size={14} className="text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1C1C] truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">×{item.quantity} · ₹{item.price} each</p>
                </div>
                <span className="text-sm font-semibold text-[#1C1C1C] shrink-0">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Bill breakdown */}
          <div className="border-t border-dashed border-gray-200 mt-4 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Item Total</span>
              <span>₹{itemSubtotal.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[#1C1C1C] pt-2 border-t border-gray-100">
              <span>Grand Total</span>
              <span>₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Order Details ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 space-y-4 text-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <MapPin size={14} className="text-[#EF4F5F]" />
            </div>
            <div>
              <p className="font-semibold text-[#1C1C1C]">Delivery Address</p>
              <p className="text-gray-500 mt-0.5 leading-relaxed">{order.deliveryAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <CreditCard size={14} className="text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-[#1C1C1C]">Payment</p>
              <p className="text-gray-500 mt-0.5 capitalize">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'upi' ? 'UPI' : 'Card Payment'}
                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                  }`}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
          {order.note && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <MessageSquare size={14} className="text-purple-500" />
              </div>
              <div>
                <p className="font-semibold text-[#1C1C1C]">Special Instructions</p>
                <p className="text-gray-500 mt-0.5">{order.note}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ─── Cancel / Help ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {['placed', 'confirmed'].includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-3.5 border-2 border-red-200 text-red-600 font-semibold rounded-2xl hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <XCircle size={18} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          {['delivered', 'cancelled'].includes(order.status) && (
            <button
              onClick={handleReorder}
              disabled={reordering}
              className="w-full py-3.5 bg-[#EF4F5F] text-white font-semibold rounded-2xl hover:bg-[#D43D4D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} className={reordering ? 'animate-spin' : ''} />
              {reordering ? 'Adding to cart...' : 'Reorder'}
            </button>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
              <HelpCircle size={16} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1C1C1C]">Need help with your order?</p>
              <p className="text-xs text-gray-400">Contact the restaurant for assistance</p>
            </div>
            {order.restaurant?.phone && (
              <a
                href={`tel:${order.restaurant.phone}`}
                className="text-xs font-semibold text-[#EF4F5F] hover:underline"
              >
                Call
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OrderTracking
