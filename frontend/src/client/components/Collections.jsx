import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { apiGetCollections } from '../../services/api';
import { useLocation as useLocationCtx } from '../../context/LocationContext';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { city } = useLocationCtx();

  useEffect(() => {
    apiGetCollections()
      .then((data) => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-10 bg-white px-4 sm:px-8 lg:px-16">
        <div className="main-container">
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[320px] rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) return null;

  return (
    <section className="py-10 bg-white px-4 sm:px-8 lg:px-16">
      <div className="main-container">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium text-[#1C1C1C] mb-1">Collections</h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <h6 className="text-[18px] text-[#363636] font-light">
              Explore curated lists of top restaurants, cafes, pubs, and bars in {city}, based on trends
            </h6>
            <Link to="/collections" className="flex items-center text-[#FF7E8B] hover:text-[#EF4F5F] transition-colors text-sm font-normal">
              All collections in {city}
              <Play size={10} className="ml-1 fill-current" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {collections.slice(0, 4).map((item) => (
            <Link
              to={`/collections/${item.id}`}
              key={item.id}
              className="relative h-[320px] rounded-lg overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#EF4F5F]/30 to-[#FF8A94]/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-white/80 mt-1">
                  {item.placeCount != null ? `${item.placeCount} Places` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
