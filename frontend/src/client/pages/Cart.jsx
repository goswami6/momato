import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ShoppingCart, Trash2, Plus, Minus, MapPin, CreditCard, Banknote,
  Smartphone, ChevronRight, Package, AlertCircle, Tag, X, CheckCircle,
  Home, Briefcase, MapPinned, Edit3, Clock, Heart, MessageSquare
} from 'lucide-react'
import {
  apiGetCart, apiUpdateCartItem, apiRemoveFromCart, apiClearCart, apiPlaceOrder, apiValidateCoupon,
  apiGetAddresses, apiAddAddress, apiDeleteAddress, apiGetOffers
} from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const DELIVERY_INSTRUCTIONS = [
  { id: 'contactless', label: 'Contactless delivery', icon: '📦' },
  { id: 'doorbell', label: 'Ring the doorbell', icon: '🔔' },
  { id: 'door', label: 'Leave at the door', icon: '🚪' },
  { id: 'guard', label: 'Leave with guard', icon: '💂' },
  { id: 'call', label: 'Call when arriving', icon: '📞' },
]

const TIP_OPTIONS = [0, 20, 30, 50]

const Cart = () => {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [step, setStep] = useState('cart') // cart | checkout | success
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [note, setNote] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  // New checkout fields
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddr, setNewAddr] = useState({ label: 'Home', address: '', landmark: '' })
  const [tip, setTip] = useState(0)
  const [customTip, setCustomTip] = useState('')
  const [showCustomTip, setShowCustomTip] = useState(false)
  const [selectedInstructions, setSelectedInstructions] = useState([])
  const [availableOffers, setAvailableOffers] = useState([])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    loadCart()
    loadAddresses()
  }, [user, navigate])

  const loadCart = async () => {
    try {
      const data = await apiGetCart()
      setCartItems(Array.isArray(data) ? data : [])
    } catch { setCartItems([]) }
    finally { setLoading(false) }
  }

  const loadAddresses = async () => {
    try {
      const data = await apiGetAddresses()
      setSavedAddresses(Array.isArray(data) ? data : [])
      const def = data.find(a => a.isDefault)
      if (def) setSelectedAddressId(def.id)
      else if (data.length > 0) setSelectedAddressId(data[0].id)
    } catch { /* no addresses */ }
  }

  const restaurant = cartItems[0]?.restaurant || null
  const subtotal = cartItems.reduce((s, c) => s + (c.menuItem?.price || 0) * c.quantity, 0)
  const couponDiscount = couponApplied ? couponApplied.discount : 0
  const deliveryFee = subtotal > 150 ? 0 : subtotal > 0 ? 40 : 0
  const tax = Math.round((subtotal - couponDiscount) * 0.05 * 100) / 100
  const currentTip = showCustomTip ? (parseFloat(customTip) || 0) : tip
  const total = subtotal - couponDiscount + deliveryFee + tax + currentTip

  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await apiValidateCoupon(couponCode.trim(), restaurant?.id, subtotal)
      setCouponApplied({ code: couponCode.trim().toUpperCase(), discount: res.discount, title: res.title || 'Coupon applied' })
      setCouponCode('')
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code')
      setCouponApplied(null)
    }
    setCouponLoading(false)
  }

  const removeCoupon = () => {
    setCouponApplied(null)
    setCouponError('')
  }

  const loadOffers = async (restaurantId) => {
    try {
      const data = await apiGetOffers(restaurantId)
      setAvailableOffers(Array.isArray(data) ? data : [])
    } catch { setAvailableOffers([]) }
  }

  const applyOfferCode = (code) => {
    setCouponCode(code)
    setCouponError('')
  }

  const updateQty = async (id, qty) => {
    setBusy(id)
    try {
      if (qty < 1) {
        await apiRemoveFromCart(id)
        setCartItems((p) => p.filter((c) => c.id !== id))
      } else {
        await apiUpdateCartItem(id, qty)
        setCartItems((p) => p.map((c) => c.id === id ? { ...c, quantity: qty } : c))
      }
    } catch { /* load error */ }
    setBusy(null)
  }

  const handleClear = async () => {
    await apiClearCart()
    setCartItems([])
  }

  const handleSaveAddress = async () => {
    if (!newAddr.address.trim()) return
    try {
      const saved = await apiAddAddress({
        label: newAddr.label,
        address: newAddr.address,
        landmark: newAddr.landmark,
        isDefault: savedAddresses.length === 0,
      })
      setSavedAddresses(prev => [...prev, saved])
      setSelectedAddressId(saved.id)
      setShowAddAddress(false)
      setNewAddr({ label: 'Home', address: '', landmark: '' })
      toast.success('Address saved')
    } catch (err) {
      toast.error(err.message || 'Failed to save address')
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await apiDeleteAddress(id)
      setSavedAddresses(prev => prev.filter(a => a.id !== id))
      if (selectedAddressId === id) {
        const remaining = savedAddresses.filter(a => a.id !== id)
        setSelectedAddressId(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch { /* ignore */ }
  }

  const toggleInstruction = (id) => {
    setSelectedInstructions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }
    setPlacingOrder(true)
    try {
      const deliveryAddr = selectedAddress.address + (selectedAddress.landmark ? `, ${selectedAddress.landmark}` : '')
      const instructionText = selectedInstructions
        .map(id => DELIVERY_INSTRUCTIONS.find(d => d.id === id)?.label)
        .filter(Boolean)
        .join(', ')

      const order = await apiPlaceOrder({
        deliveryAddress: deliveryAddr,
        paymentMethod,
        note,
        tip: currentTip,
        deliveryInstructions: instructionText || null,
        couponCode: couponApplied?.code || null,
        couponDiscount: couponDiscount || 0,
      })
      setOrderId(order.id)
      setStep('success')
      setCartItems([])
    } catch (err) {
      toast.error(err.message || 'Failed to place order')
    }
    setPlacingOrder(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-[#EF4F5F] border-t-transparent rounded-full" />
      </div>
    )
  }

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[#1C1C1C] mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-6">Your order #{orderId} has been placed successfully. You can track it from your orders page.</p>
          <div className="flex gap-3 justify-center">
            <Link to={`/orders/${orderId}`} className="px-6 py-3 bg-[#EF4F5F] text-white font-semibold rounded-xl hover:bg-[#D43D4D] transition-colors">
              Track Order
            </Link>
            <Link to="/" className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Checkout step
  if (step === 'checkout') {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => setStep('cart')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#EF4F5F] mb-6">
            ← Back to cart
          </button>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left Column – Address, Instructions, Payment */}
            <div className="lg:col-span-3 space-y-5">

              {/* Restaurant Info */}
              {restaurant && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                  {restaurant.image && <img src={restaurant.image} alt="" className="w-12 h-12 rounded-xl object-cover" />}
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1C1C]">{restaurant.name}</h3>
                    <p className="text-xs text-gray-400">{restaurant.address}</p>
                    {restaurant.deliveryTime && <p className="text-xs text-gray-500 mt-0.5"><Clock size={11} className="inline mr-1" />{restaurant.deliveryTime}</p>}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#EF4F5F]" />
                    <h3 className="font-bold text-[#1C1C1C]">Delivery Address</h3>
                  </div>
                  <button onClick={() => setShowAddAddress(!showAddAddress)} className="text-xs font-semibold text-[#EF4F5F] hover:underline">
                    + Add New
                  </button>
                </div>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {savedAddresses.map(addr => (
                      <label key={addr.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[#EF4F5F] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="addr" checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)} className="hidden" />
                        <div className="mt-0.5">
                          {addr.label === 'Home' ? <Home size={16} className="text-[#EF4F5F]" /> :
                            addr.label === 'Work' ? <Briefcase size={16} className="text-blue-500" /> :
                              <MapPinned size={16} className="text-gray-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#1C1C1C]">{addr.label}</span>
                            {addr.isDefault && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Default</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{addr.address}</p>
                          {addr.landmark && <p className="text-[11px] text-gray-400">Near: {addr.landmark}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          {selectedAddressId === addr.id && <div className="w-4 h-4 bg-[#EF4F5F] rounded-full flex items-center justify-center"><CheckCircle size={12} className="text-white" /></div>}
                          <button onClick={(e) => { e.preventDefault(); handleDeleteAddress(addr.id) }} className="text-gray-300 hover:text-red-500 p-1">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : !showAddAddress ? (
                  <p className="text-sm text-gray-400 mb-3">No saved addresses. Add one below.</p>
                ) : null}

                {/* Add Address Form */}
                {showAddAddress && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Other'].map(lbl => (
                        <button key={lbl} onClick={() => setNewAddr(p => ({ ...p, label: lbl }))}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${newAddr.label === lbl ? 'border-[#EF4F5F] bg-red-50 text-[#EF4F5F]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={newAddr.address}
                      onChange={(e) => setNewAddr(p => ({ ...p, address: e.target.value }))}
                      placeholder="Enter complete address..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#EF4F5F] resize-none"
                    />
                    <input
                      value={newAddr.landmark}
                      onChange={(e) => setNewAddr(p => ({ ...p, landmark: e.target.value }))}
                      placeholder="Nearby landmark (optional)"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#EF4F5F]"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveAddress} disabled={!newAddr.address.trim()}
                        className="px-5 py-2 bg-[#EF4F5F] text-white text-sm font-bold rounded-xl hover:bg-[#D43D4D] disabled:opacity-50">
                        Save Address
                      </button>
                      <button onClick={() => setShowAddAddress(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Delivery Instructions */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={18} className="text-[#EF4F5F]" />
                  <h3 className="font-bold text-[#1C1C1C]">Delivery Instructions</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DELIVERY_INSTRUCTIONS.map(di => (
                    <button key={di.id} onClick={() => toggleInstruction(di.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${selectedInstructions.includes(di.id) ? 'border-[#EF4F5F] bg-red-50 text-[#EF4F5F]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      <span>{di.icon}</span> {di.label}
                    </button>
                  ))}
                </div>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any other instructions for the restaurant? (optional)"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#EF4F5F]"
                />
              </div>

              {/* Tip for delivery partner */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={18} className="text-[#EF4F5F]" />
                  <h3 className="font-bold text-[#1C1C1C]">Tip your delivery partner</h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">Your kindness means a lot! 100% of the tip goes to your delivery partner.</p>
                <div className="flex flex-wrap gap-2">
                  {TIP_OPTIONS.map(amt => (
                    <button key={amt} onClick={() => { setTip(amt); setShowCustomTip(false); setCustomTip('') }}
                      className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors ${!showCustomTip && tip === amt ? 'border-[#EF4F5F] bg-red-50 text-[#EF4F5F]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {amt === 0 ? 'Not now' : `₹${amt}`}
                    </button>
                  ))}
                  <button onClick={() => { setShowCustomTip(true); setTip(0) }}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-colors ${showCustomTip ? 'border-[#EF4F5F] bg-red-50 text-[#EF4F5F]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    Custom
                  </button>
                </div>
                {showCustomTip && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      placeholder="Enter amount"
                      className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#EF4F5F]"
                    />
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-[#1C1C1C] mb-3">Payment Method</h3>
                <div className="space-y-2">
                  {[
                    { value: 'cod', label: 'Cash on Delivery', icon: Banknote, color: 'text-green-600', desc: 'Pay when your order arrives' },
                    { value: 'upi', label: 'UPI', icon: Smartphone, color: 'text-purple-600', desc: 'Google Pay, PhonePe, Paytm' },
                    { value: 'card', label: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-600', desc: 'Visa, Mastercard, RuPay' },
                  ].map((pm) => (
                    <label key={pm.value}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === pm.value ? 'border-[#EF4F5F] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="pm" value={pm.value} checked={paymentMethod === pm.value}
                        onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                      <pm.icon size={20} className={pm.color} />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{pm.label}</span>
                        <p className="text-[11px] text-gray-400">{pm.desc}</p>
                      </div>
                      {paymentMethod === pm.value && <div className="w-4 h-4 bg-[#EF4F5F] rounded-full" />}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column – Summary & Place Order */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24 space-y-5">

                {/* Apply Coupon */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={16} className="text-[#EF4F5F]" />
                    <h3 className="font-bold text-sm text-[#1C1C1C]">Apply Coupon</h3>
                  </div>
                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <div>
                          <span className="text-xs font-bold text-green-700">{couponApplied.code}</span>
                          <p className="text-[10px] text-green-600">You save ₹{couponApplied.discount.toFixed(2)}</p>
                        </div>
                      </div>
                      <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 p-1"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                          placeholder="Coupon code"
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#EF4F5F] uppercase tracking-wider font-medium"
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        />
                        <button onClick={handleApplyCoupon} disabled={!couponCode.trim() || couponLoading}
                          className="px-4 py-2 bg-[#EF4F5F] text-white text-xs font-bold rounded-xl hover:bg-[#D43D4D] disabled:opacity-50">
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && <p className="text-[10px] text-red-500 mt-1.5">{couponError}</p>}
                    </>
                  )}
                </div>

                {/* Available Coupons */}
                {!couponApplied && availableOffers.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Available Coupons</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableOffers.map(offer => (
                        <div key={offer.id} className="flex items-center justify-between border border-dashed border-gray-200 rounded-xl px-3 py-2.5 hover:border-[#EF4F5F] hover:bg-red-50/30 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#EF4F5F] tracking-wider">{offer.code}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 truncate">{offer.title}</p>
                            {offer.minOrderValue > 0 && <p className="text-[9px] text-gray-400">Min order: ₹{offer.minOrderValue}</p>}
                          </div>
                          <button
                            onClick={() => applyOfferCode(offer.code)}
                            className="text-[10px] font-bold text-[#EF4F5F] hover:underline shrink-0 ml-2"
                          >
                            TAP TO APPLY
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-sm text-[#1C1C1C] mb-3">Your Order</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cartItems.map((c) => (
                      <div key={c.id} className="flex justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-sm border ${c.menuItem?.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                            <span className={`block w-1 h-1 rounded-full m-[2px] ${c.menuItem?.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                          </span>
                          <span className="truncate max-w-[140px]">{c.menuItem?.name}</span>
                          <span className="text-gray-400">×{c.quantity}</span>
                        </div>
                        <span className="font-medium">₹{(c.menuItem?.price * c.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-500"><span>Item Total</span><span>₹{subtotal.toFixed(2)}</span></div>
                  {couponApplied && (
                    <div className="flex justify-between text-green-600"><span>Coupon ({couponApplied.code})</span><span>-₹{couponDiscount.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span>₹{deliveryFee.toFixed(2)}</span>}
                  </div>
                  <div className="flex justify-between text-gray-500"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                  {currentTip > 0 && (
                    <div className="flex justify-between text-gray-500"><span>Delivery Tip</span><span>₹{currentTip.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-[#1C1C1C] text-sm pt-2 border-t border-gray-100">
                    <span>To Pay</span><span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                {selectedAddress && (
                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin size={12} className="text-[#EF4F5F]" />
                      <span className="font-semibold text-gray-700">Delivering to: {selectedAddress.label}</span>
                    </div>
                    <p className="truncate">{selectedAddress.address}</p>
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || placingOrder}
                  className="w-full py-4 bg-[#EF4F5F] text-white font-bold text-base rounded-2xl hover:bg-[#D43D4D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : `Place Order  •  ₹${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Cart view
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1C1C1C] flex items-center gap-2">
            <ShoppingCart size={24} /> Your Cart
          </h1>
          {cartItems.length > 0 && (
            <button onClick={handleClear} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-bold text-gray-600 mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-400 mb-6">Add items from a restaurant to get started</p>
            <Link to="/" className="px-6 py-3 bg-[#EF4F5F] text-white font-semibold rounded-xl hover:bg-[#D43D4D] transition-colors inline-block">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {restaurant && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                  {restaurant.image && <img src={restaurant.image} alt="" className="w-12 h-12 rounded-xl object-cover" />}
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1C1C]">{restaurant.name}</h3>
                    <p className="text-xs text-gray-400">{restaurant.address}</p>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div key={item.id} layout exit={{ opacity: 0, x: -50 }}
                    className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-4">
                    {item.menuItem?.image ? (
                      <img src={item.menuItem.image} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shrink-0">🍽️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-3 h-3 rounded-sm border ${item.menuItem?.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                              <span className={`block w-1.5 h-1.5 rounded-full m-[2px] ${item.menuItem?.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                            </span>
                            <h3 className="font-bold text-sm text-[#1C1C1C]">{item.menuItem?.name}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">₹{item.menuItem?.price}</p>
                        </div>
                        <button onClick={() => updateQty(item.id, 0)} disabled={busy === item.id}
                          className="text-gray-400 hover:text-red-500 p-1">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={busy === item.id}
                            className="p-1.5 hover:bg-gray-50 disabled:opacity-50">
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={busy === item.id}
                            className="p-1.5 hover:bg-gray-50 disabled:opacity-50">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-bold text-sm text-[#1C1C1C]">₹{(item.menuItem?.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
                <h3 className="font-bold text-[#1C1C1C] mb-4">Bill Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Item Total</span><span>₹{subtotal.toFixed(2)}</span></div>
                  {couponApplied && (
                    <div className="flex justify-between text-green-600"><span>Coupon ({couponApplied.code})</span><span>-₹{couponDiscount.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between text-gray-600"><span>Delivery Fee</span>{deliveryFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span>₹{deliveryFee.toFixed(2)}</span>}</div>
                  <div className="flex justify-between text-gray-600"><span>Taxes (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-[#1C1C1C] text-base">
                    <span>To Pay</span><span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={() => { setStep('checkout'); if (restaurant?.id) loadOffers(restaurant.id) }}
                  className="w-full mt-5 py-3 bg-[#EF4F5F] text-white font-bold rounded-xl hover:bg-[#D43D4D] transition-colors flex items-center justify-center gap-2">
                  Proceed to Checkout <ChevronRight size={18} />
                </button>
                {subtotal < 150 && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                    <AlertCircle size={14} /> Add ₹{(150 - subtotal).toFixed(0)} more for free delivery
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart;
