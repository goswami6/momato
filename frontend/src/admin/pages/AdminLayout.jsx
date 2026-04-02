import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminHeader from '../components/AdminHeader'

const pageTitles = {
  '/admin': { title: 'Dashboard', subtitle: 'Welcome back, Admin' },
  '/admin/restaurants': { title: 'Restaurants', subtitle: 'Manage all restaurant listings' },
  '/admin/users': { title: 'Users', subtitle: 'Manage users and access' },
  '/admin/reviews': { title: 'Reviews', subtitle: 'Monitor and moderate reviews' },
  '/admin/collections': { title: 'Collections', subtitle: 'Curate restaurant collections' },
  '/admin/settings': { title: 'Settings', subtitle: 'Configure admin preferences' },
}

const AdminLayout = () => {
  const pathname = window.location.pathname
  const pageInfo = pageTitles[pathname] || { title: 'Admin', subtitle: '' }

  return (
    <div className="min-h-screen bg-[#F5F5FA]">
      <AdminSidebar />
      <div className="ml-[250px] transition-all duration-300">
        <AdminHeader title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
