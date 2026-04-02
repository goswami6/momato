import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import OwnerSidebar from '../components/OwnerSidebar'
import OwnerHeader from '../components/OwnerHeader'

const pageTitles = {
  '/owner': { title: 'Dashboard', subtitle: 'Welcome to your owner panel' },
  '/owner/restaurants': { title: 'My Restaurants', subtitle: 'Manage your listed restaurants' },
  '/owner/menu': { title: 'Manage Menu', subtitle: 'Add and update food items' },
  '/owner/reservations': { title: 'Reservations', subtitle: 'Manage table bookings' },
  '/owner/offers': { title: 'Offers & Coupons', subtitle: 'Create and manage discount offers' },
}

const OwnerLayout = () => {
  const location = useLocation()
  const pageInfo = pageTitles[location.pathname] || { title: 'Owner Panel', subtitle: '' }

  return (
    <div className="min-h-screen bg-[#F5F5FA]">
      <OwnerSidebar />
      <div className="ml-[250px] transition-all duration-300">
        <OwnerHeader title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default OwnerLayout
