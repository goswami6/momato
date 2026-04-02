import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Image, FolderOpen } from 'lucide-react'

const collectionsData = [
  { id: 1, title: 'Best of Varanasi', description: 'Top rated restaurants handpicked for the best dining experience in Varanasi', tag: 'Popular', placeCount: 15, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop' },
  { id: 2, title: 'Pure Veg Heaven', description: 'The finest vegetarian restaurants with authentic flavors and pure ingredients', tag: 'Trending', placeCount: 22, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop' },
  { id: 3, title: 'Must-Visit Street Food', description: 'Iconic street food joints that define the taste of Varanasi', tag: 'Featured', placeCount: 18, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop' },
  { id: 4, title: 'Best Breakfast Spots', description: 'Start your morning right with these amazing breakfast places', tag: 'Morning', placeCount: 10, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=300&h=200&fit=crop' },
  { id: 5, title: 'Romantic Dining', description: 'Perfect restaurants for a special date night in the city', tag: 'Special', placeCount: 8, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop' },
  { id: 6, title: 'Budget Eats', description: 'Delicious food that goes easy on the wallet. Great taste at great prices', tag: 'Value', placeCount: 25, image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&h=200&fit=crop' },
  { id: 7, title: 'Newly Opened', description: 'Fresh arrivals on the Varanasi food scene. Be the first to try!', tag: 'New', placeCount: 6, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop' },
  { id: 8, title: 'Late Night Cravings', description: 'Restaurants and cafes that serve delicious food after midnight', tag: 'Nightlife', placeCount: 12, image: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=300&h=200&fit=crop' },
]

const AdminCollections = () => {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1C1C1C]">Collections</h2>
          <p className="text-sm text-gray-500">Manage curated restaurant collections</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#EF4F5F] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#d9404f] transition-colors shadow-lg shadow-[#EF4F5F]/20"
        >
          <Plus size={18} />
          New Collection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-[#1C1C1C]">{collectionsData.length}</p>
          <p className="text-xs text-gray-500">Total Collections</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {collectionsData.reduce((a, c) => a + c.placeCount, 0)}
          </p>
          <p className="text-xs text-gray-500">Total Places</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {Math.round(collectionsData.reduce((a, c) => a + c.placeCount, 0) / collectionsData.length)}
          </p>
          <p className="text-xs text-gray-500">Avg Places/Collection</p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {collectionsData.map((collection) => (
          <div key={collection.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
            {/* Image */}
            <div className="relative h-36 overflow-hidden">
              <img
                src={collection.image}
                alt={collection.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#EF4F5F] px-2 py-0.5 rounded-full">
                {collection.tag}
              </span>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-sm">{collection.title}</h3>
                <p className="text-white/70 text-[11px] flex items-center gap-1 mt-0.5">
                  <FolderOpen size={11} />
                  {collection.placeCount} Places
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-xs text-gray-500 line-clamp-2">{collection.description}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors">
                  <Edit2 size={13} /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminCollections
