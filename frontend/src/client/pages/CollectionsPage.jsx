import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, ArrowLeft, Search, MapPin, X } from 'lucide-react'

const allCollections = [
  {
    id: 1,
    title: 'Pure Veg Places',
    desc: 'The best vegetarian restaurants in the city with authentic flavors and fresh ingredients.',
    places: 24,
    img: 'https://b.zmtcdn.com/data/collections/9328351d5015beb55abcf5e5cf1b2b9d_1711630587.jpg',
    tag: 'Trending',
    restaurants: [
      { id: 4, name: 'Pizzeria Vaatika Cafe', rating: 4.6 },
      { id: 5, name: 'Shree Cafe', rating: 4.0 },
      { id: 7, name: 'Dosa Factory', rating: 4.2 },
      { id: 8, name: 'Kashi Chat Bhandar', rating: 4.4 },
    ]
  },
  {
    id: 2,
    title: 'Must-Visit Places',
    desc: 'Top-rated restaurants that every foodie in Varanasi must try at least once.',
    places: 17,
    img: 'https://b.zmtcdn.com/data/collections/c43a23a4f0890b3e2996e7bf34febb87_1528867270.jpg',
    tag: 'Popular',
    restaurants: [
      { id: 1, name: 'Baati Chokha', rating: 4.3 },
      { id: 2, name: 'The Great Kabab Factory', rating: 4.5 },
      { id: 10, name: 'Mangi Ferra', rating: 4.7 },
      { id: 4, name: 'Pizzeria Vaatika Cafe', rating: 4.6 },
    ]
  },
  {
    id: 3,
    title: 'Blissful Breakfast',
    desc: 'Start your morning right with the best breakfast spots serving everything from parathas to pancakes.',
    places: 17,
    img: 'https://b.zmtcdn.com/data/collections/d34beb284ecf96c437819e0d3e9ed105_1711630363.jpg',
    tag: 'Morning',
    restaurants: [
      { id: 7, name: 'Dosa Factory', rating: 4.2 },
      { id: 5, name: 'Shree Cafe', rating: 4.0 },
      { id: 4, name: 'Pizzeria Vaatika Cafe', rating: 4.6 },
    ]
  },
  {
    id: 4,
    title: 'Great Cafes',
    desc: 'Cozy cafes with amazing coffee, desserts, and a chill vibe perfect for work or hangouts.',
    places: 23,
    img: 'https://b.zmtcdn.com/data/collections/92bf1f87ad0a90b94007e79b13eb592c_1744268271.png',
    tag: 'Chill',
    restaurants: [
      { id: 5, name: 'Shree Cafe', rating: 4.0 },
      { id: 4, name: 'Pizzeria Vaatika Cafe', rating: 4.6 },
      { id: 10, name: 'Mangi Ferra', rating: 4.7 },
    ]
  },
  {
    id: 5,
    title: 'Romantic Dining',
    desc: 'The most romantic restaurants for a special date night with candlelit ambiance and exquisite food.',
    places: 12,
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop',
    tag: 'Date Night',
    restaurants: [
      { id: 2, name: 'The Great Kabab Factory', rating: 4.5 },
      { id: 10, name: 'Mangi Ferra', rating: 4.7 },
      { id: 9, name: 'The Brew Room', rating: 4.5 },
    ]
  },
  {
    id: 6,
    title: 'Street Food Trail',
    desc: 'Explore the vibrant street food culture of Varanasi — chaat, kachori, lassi and more.',
    places: 30,
    img: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=600&auto=format&fit=crop',
    tag: 'Must Try',
    restaurants: [
      { id: 8, name: 'Kashi Chat Bhandar', rating: 4.4 },
      { id: 1, name: 'Baati Chokha', rating: 4.3 },
      { id: 6, name: 'Tadka Restaurant', rating: 3.9 },
    ]
  },
  {
    id: 7,
    title: 'Best Bars & Pubs',
    desc: 'Unwind at the best bars and pubs in town with craft cocktails, live music, and great vibes.',
    places: 8,
    img: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&auto=format&fit=crop',
    tag: 'Nightlife',
    restaurants: [
      { id: 9, name: 'The Brew Room', rating: 4.5 },
      { id: 10, name: 'Mangi Ferra', rating: 4.7 },
    ]
  },
  {
    id: 8,
    title: 'Budget Eats',
    desc: 'Delicious meals that won\'t break the bank — top affordable restaurants under ₹400.',
    places: 20,
    img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop',
    tag: 'Value',
    restaurants: [
      { id: 1, name: 'Baati Chokha', rating: 4.3 },
      { id: 6, name: 'Tadka Restaurant', rating: 3.9 },
      { id: 7, name: 'Dosa Factory', rating: 4.2 },
      { id: 8, name: 'Kashi Chat Bhandar', rating: 4.4 },
    ]
  },
  {
    id: 9,
    title: 'Newly Opened',
    desc: 'Fresh spots that just opened — be the first to try these new restaurants in Varanasi.',
    places: 9,
    img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop',
    tag: 'New',
    restaurants: [
      { id: 3, name: 'Canton Royale', rating: 4.1 },
      { id: 12, name: 'Pind Balluchi', rating: 4.1 },
    ]
  },
  {
    id: 10,
    title: 'Best of Chinese',
    desc: 'Craving noodles or manchurian? These are the top Chinese restaurants in the city.',
    places: 11,
    img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop',
    tag: 'Cuisine',
    restaurants: [
      { id: 3, name: 'Canton Royale', rating: 4.1 },
      { id: 6, name: 'Tadka Restaurant', rating: 3.9 },
    ]
  },
  {
    id: 11,
    title: 'Pet-Friendly Spots',
    desc: 'Bring your furry friends along to these pet-friendly restaurants with outdoor seating.',
    places: 7,
    img: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&auto=format&fit=crop',
    tag: 'Pet Love',
    restaurants: [
      { id: 4, name: 'Pizzeria Vaatika Cafe', rating: 4.6 },
      { id: 5, name: 'Shree Cafe', rating: 4.0 },
      { id: 10, name: 'Mangi Ferra', rating: 4.7 },
    ]
  },
  {
    id: 12,
    title: 'Family Dining',
    desc: 'Spacious restaurants perfect for family gatherings with diverse menus for all ages.',
    places: 15,
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop',
    tag: 'Family',
    restaurants: [
      { id: 2, name: 'The Great Kabab Factory', rating: 4.5 },
      { id: 1, name: 'Baati Chokha', rating: 4.3 },
      { id: 12, name: 'Pind Balluchi', rating: 4.1 },
      { id: 11, name: "Domino's Pizza", rating: 4.1 },
    ]
  },
]

const tagColors = {
  'Trending': 'bg-[#EF4F5F] text-white',
  'Popular': 'bg-amber-500 text-white',
  'Morning': 'bg-orange-400 text-white',
  'Chill': 'bg-sky-500 text-white',
  'Date Night': 'bg-pink-500 text-white',
  'Must Try': 'bg-emerald-500 text-white',
  'Nightlife': 'bg-purple-500 text-white',
  'Value': 'bg-lime-600 text-white',
  'New': 'bg-blue-500 text-white',
  'Cuisine': 'bg-teal-500 text-white',
  'Pet Love': 'bg-rose-400 text-white',
  'Family': 'bg-indigo-500 text-white',
}

const CollectionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('All')

  const tags = ['All', ...new Set(allCollections.map(c => c.tag))]

  const filtered = allCollections.filter(c => {
    const matchesSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === 'All' || c.tag === selectedTag
    return matchesSearch && matchesTag
  })

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-0 md:pt-[72px]">
      {/* Hero Banner */}
      <div className="relative bg-[#1C1C1C] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&auto=format&fit=crop"
            alt="Collections"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-[#1C1C1C]/60 to-transparent" />
        </div>

        <div className="relative z-10 pt-10 pb-12 md:pt-14 md:pb-16 px-4 sm:px-8 lg:px-16">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-[#EF4F5F]" />
            <span className="text-white/70 text-sm font-medium">Varanasi</span>
          </div>

          <h1 className="text-white text-3xl md:text-[42px] font-bold mb-3 leading-tight">Collections</h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mb-8">
            Explore curated lists of top restaurants, cafes, pubs, and bars in Varanasi, based on trends
          </p>

          {/* Search */}
          <div className="max-w-lg">
            <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 focus-within:bg-white/15 focus-within:border-white/30 transition-all">
              <Search className="w-4 h-4 text-white/50 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections..."
                className="flex-1 ml-3 bg-transparent text-white text-sm outline-none border-none placeholder:text-white/40 font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white/70">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 px-4 sm:px-8 lg:px-16">
        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-8">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedTag === tag
                ? 'bg-[#EF4F5F] text-white border-[#EF4F5F]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">
          {filtered.length} collection{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Collections Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-[220px] overflow-hidden">
                  <img
                    src={collection.img}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Tag */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold ${tagColors[collection.tag] || 'bg-gray-700 text-white'}`}>
                    {collection.tag}
                  </div>

                  {/* Places Count */}
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-white text-xl font-semibold mb-1 leading-tight drop-shadow-md">{collection.title}</h3>
                    <div className="flex items-center gap-1.5 text-white/90 text-sm">
                      <span>{collection.places} Places</span>
                      <Play size={8} className="fill-current" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{collection.desc}</p>

                  {/* Restaurant previews */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {collection.restaurants.slice(0, 3).map((r, i) => (
                        <div
                          key={r.id}
                          className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EF4F5F] to-[#FF8A94] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white"
                          style={{ zIndex: 3 - i }}
                        >
                          {r.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {collection.restaurants[0]?.name}
                      {collection.restaurants.length > 1 && ` +${collection.restaurants.length - 1} more`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-[#1C1C1C] mb-2">No collections found</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Try a different search term or browse all collections.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedTag('All') }}
              className="mt-4 px-5 py-2 bg-[#EF4F5F] text-white text-sm font-semibold rounded-xl hover:bg-[#d83a49] transition-colors"
            >
              View All
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionsPage
