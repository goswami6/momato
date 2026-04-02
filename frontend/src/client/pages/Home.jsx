import React from 'react'
import HeroSection from '../components/HeroSection'
import Collections from '../components/Collections'
import FilterSection from '../components/FilterSection'
import TabSection from '../components/TabSection'
import ExploreSection from '../components/ExploreSection'
import AppBanner from '../components/AppBanner'
import PopularLocalities from '../components/PopularLocalities'
import PopularCuisines from '../components/PopularCuisines'
import RecentlyViewed from '../components/RecentlyViewed'

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Banner */}
      <HeroSection />
      <TabSection />
      {/* Collections */}
      <Collections />
      <RecentlyViewed />
      <PopularCuisines />
      <PopularLocalities />
      <AppBanner />

      {/* Filter & Restaurants */}
      <FilterSection />
      <ExploreSection />
    </div>
  )
}

export default Home
