import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Star, MapPin, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiGetFavorites, apiRemoveFavorite } from '../../services/api';

const getRatingColor = (r) => {
  if (r >= 4.5) return 'bg-[#267E3E]';
  if (r >= 4.0) return 'bg-[#3F8F46]';
  if (r >= 3.5) return 'bg-[#CDD614]';
  return 'bg-[#DB7C38]';
};

const SavedRestaurants = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    apiGetFavorites()
      .then((data) => setFavorites(Array.isArray(data.favorites) ? data.favorites : []))
      .catch((err) => setError(err.message || 'Failed to load saved restaurants'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = async (restaurantId) => {
    try {
      await apiRemoveFavorite(restaurantId);
      setFavorites((prev) => prev.filter((item) => String(item.restaurantId) !== String(restaurantId)));
    } catch (err) {
      setError(err.message || 'Failed to remove saved restaurant');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] md:pt-26 pt-16">
        <div className="main-container py-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-[#1C1C1C]">Saved Restaurants</h1>
            <p className="text-[#696969] mt-2">Login to view and manage your wishlist.</p>
            <Link to="/login" className="inline-block mt-5 px-6 py-3 bg-[#EF4F5F] text-white rounded-xl font-medium hover:bg-[#e23744] transition-colors">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] md:pt-26 pt-16">
      <div className="main-container py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#696969] hover:text-[#EF4F5F] transition-colors mb-4">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EF4F5F]/10 flex items-center justify-center text-[#EF4F5F]">
              <Bookmark size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1C]">Saved Restaurants</h1>
              <p className="text-sm text-[#696969]">Your personal wishlist of places to try</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-[#696969] py-16">Loading saved restaurants...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <Bookmark size={34} className="mx-auto text-gray-300 mb-3" />
            <p className="text-[#1C1C1C] font-semibold">No saved restaurants yet</p>
            <p className="text-sm text-[#696969] mt-1">Tap the bookmark icon on any restaurant to save it here.</p>
            <Link to="/search" className="inline-block mt-5 px-5 py-2.5 bg-[#EF4F5F] text-white rounded-xl text-sm font-semibold hover:bg-[#e23744] transition-colors">
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => {
              const restaurant = item.restaurant || item.Restaurant;
              if (!restaurant) return null;

              const rating = Number(restaurant.avgRating || restaurant.rating || 0);
              return (
                <div key={item.id} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                  <Link to={`/restaurant/${restaurant.id}`} className="block group">
                    <div className="relative h-47.5 overflow-hidden bg-gray-100">
                      {restaurant.image ? (
                        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                      )}
                      <span className={`absolute top-3 right-3 text-white text-xs font-bold px-1.5 py-0.5 rounded ${getRatingColor(rating)}`}>
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/restaurant/${restaurant.id}`} className="block">
                      <h2 className="text-[16px] font-semibold text-[#1C1C1C] truncate hover:text-[#EF4F5F] transition-colors">{restaurant.name}</h2>
                    </Link>
                    {restaurant.cuisine && <p className="text-[13px] text-[#696969] mt-1 truncate">{restaurant.cuisine}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[12px] text-[#9c9c9c] flex items-center gap-1">
                        <MapPin size={11} /> {restaurant.area || restaurant.city || 'Varanasi'}
                      </span>
                      {restaurant.costForTwo && <span className="text-[12px] font-medium text-[#696969]">Rs.{restaurant.costForTwo} for two</span>}
                    </div>

                    <button
                      onClick={() => handleRemove(restaurant.id)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#1C1C1C] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} /> Remove from saved
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRestaurants;
