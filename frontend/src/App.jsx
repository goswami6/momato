import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './client/pages/Home'
import RestaurantDetail from './client/pages/RestaurantDetail'
import Login from './client/pages/Login'
import Signup from './client/pages/Signup'
import ForgotPassword from './client/pages/ForgotPassword'
import ResetPassword from './client/pages/ResetPassword'
import SearchResults from './client/pages/SearchResults'
import CollectionsPage from './client/pages/CollectionsPage'
import CollectionDetail from './client/pages/CollectionDetail'
import AddRestaurant from './client/pages/AddRestaurant'
import SavedRestaurants from './client/pages/SavedRestaurants'
import Cart from './client/pages/Cart'
import MyOrders from './client/pages/MyOrders'
import OrderTracking from './client/pages/OrderTracking'
import NearMe from './client/pages/NearMe'
import MyReservations from './client/pages/MyReservations'
import Account from './client/pages/Account'
import SavedAddresses from './client/pages/SavedAddresses'
import Delivery from './client/pages/Delivery'
import DiningOut from './client/pages/DiningOut'
import Nightlife from './client/pages/Nightlife'
import Header from './client/components/Header'
import Footer from './client/components/Footer'
import MobileBottomNav from './client/components/MobileBottomNav'

// Admin imports
import AdminLayout from './admin/pages/AdminLayout'
import Dashboard from './admin/pages/Dashboard'
import AdminRestaurants from './admin/pages/AdminRestaurants'
import AdminUsers from './admin/pages/AdminUsers'
import AdminReviews from './admin/pages/AdminReviews'
import AdminCollections from './admin/pages/AdminCollections'
import AdminSettings from './admin/pages/AdminSettings'
import AdminModeration from './admin/pages/AdminModeration'
import ProtectedRoute from './admin/components/ProtectedRoute'

// Owner imports
import OwnerLayout from './owner/pages/OwnerLayout'
import OwnerDashboard from './owner/pages/OwnerDashboard'
import OwnerRestaurants from './owner/pages/OwnerRestaurants'
import OwnerMenu from './owner/pages/OwnerMenu'
import OwnerOrders from './owner/pages/OwnerOrders'
import OwnerReservations from './owner/pages/OwnerReservations'
import OwnerOffers from './owner/pages/OwnerOffers'

const App = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isAdmin = location.pathname.startsWith('/admin')
  const isOwner = location.pathname.startsWith('/owner')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="restaurants" element={<AdminRestaurants />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="collections" element={<AdminCollections />} />
          <Route path="moderation" element={<AdminModeration />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    )
  }

  if (isOwner) {
    return (
      <Routes>
        <Route path="/owner" element={
          <ProtectedRoute requiredRole="owner">
            <OwnerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<OwnerDashboard />} />
          <Route path="restaurants" element={<OwnerRestaurants />} />
          <Route path="menu" element={<OwnerMenu />} />
          <Route path="orders" element={<OwnerOrders />} />
          <Route path="reservations" element={<OwnerReservations />} />
          <Route path="offers" element={<OwnerOffers />} />
        </Route>
      </Routes>
    )
  }

  return (
    <>
      <Header transparent={isHome} />
      <div className="pb-14 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/add-restaurant" element={<AddRestaurant />} />
          <Route path="/saved-restaurants" element={<SavedRestaurants />} />
          <Route path="/near-me" element={<NearMe />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="/reservations" element={<MyReservations />} />
          <Route path="/account" element={<Account />} />
          <Route path="/addresses" element={<SavedAddresses />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/dining" element={<DiningOut />} />
          <Route path="/nightlife" element={<Nightlife />} />
        </Routes>
        <Footer />
      </div>
      <MobileBottomNav />
    </>
  )
}

export default App
