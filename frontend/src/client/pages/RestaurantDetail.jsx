import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, Clock, Phone, Bookmark, Share2, ChevronRight,
  Minus, Plus, ShoppingBag, X, Camera, ImagePlus,
  Navigation, Utensils, BadgePercent, ExternalLink,
  MessageSquare, Leaf, Wine, Trees, Bike, Store, MoonStar,
  Search, Flame, Sparkles, CalendarDays, Users, Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  apiGetRestaurantById, apiGetRestaurants,
  apiGetMenuItems, apiGetReviews, apiAddReview,
  apiGetFavorites, apiAddFavorite, apiRemoveFavorite,
  apiAddToCart, apiClearCart,
  apiGetPhotos, apiGetOffers, apiCreateReservation,
} from '../../services/api';
import DeliveryRadiusMap from '../components/DeliveryRadiusMap';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';

const getRatingColor = (r) => {
  if (r >= 4.5) return 'bg-[#267E3E]';
  if (r >= 4.0) return 'bg-[#3F8F46]';
  if (r >= 3.5) return 'bg-[#CDD614]';
  return 'bg-[#DB7C38]';
};

const getRatingLabel = (r) => {
  if (r >= 4.5) return 'Excellent';
  if (r >= 4.0) return 'Very Good';
  if (r >= 3.5) return 'Good';
  return 'Average';
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [similarRestaurants, setSimilarRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuSort, setMenuSort] = useState('default');
  const [saved, setSaved] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [photoFilter, setPhotoFilter] = useState('all');
  const [offers, setOffers] = useState([]);
  const [bookingForm, setBookingForm] = useState({ date: '', time: '19:00', partySize: 2, guestName: '', guestPhone: '', specialRequests: '' });
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const { addRestaurant: trackView } = useRecentlyViewed();

  const overviewRef = useRef(null);
  const menuRef = useRef(null);
  const reviewsRef = useRef(null);
  const photosRef = useRef(null);
  const bookTableRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setRestaurant(null);
      setExpandedCategory(null);
      try {
        const [restaurantData, menuData, reviewData] = await Promise.all([
          apiGetRestaurantById(id),
          apiGetMenuItems(id),
          apiGetReviews(id),
        ]);
        setRestaurant(restaurantData);
        trackView(restaurantData);
        setMenuItems(Array.isArray(menuData) ? menuData : []);
        setReviews(Array.isArray(reviewData) ? reviewData : []);

        if (user) {
          apiGetFavorites()
            .then((favoriteData) => {
              const list = Array.isArray(favoriteData.favorites) ? favoriteData.favorites : [];
              const isSaved = list.some((item) => String(item.restaurantId) === String(id));
              setSaved(isSaved);
            })
            .catch(() => setSaved(false));
        } else {
          setSaved(false);
        }

        apiGetRestaurants({ limit: 20 })
          .then((data) => {
            const list = data.restaurants || [];
            const cuisine = restaurantData.cuisine?.split(',')[0]?.trim().toLowerCase();
            const others = list.filter((r) => String(r.id) !== String(id));
            const byCuisine = cuisine
              ? others.filter((r) => (r.cuisine || '').toLowerCase().includes(cuisine))
              : [];
            setSimilarRestaurants((byCuisine.length >= 4 ? byCuisine : [...byCuisine, ...others.filter(r => !byCuisine.includes(r))]).slice(0, 6));
          })
          .catch(() => { });

        apiGetPhotos(id).then(p => setGalleryPhotos(Array.isArray(p) ? p : [])).catch(() => { });
        apiGetOffers(id).then(o => setOffers(Array.isArray(o) ? o : [])).catch(() => { });
      } catch {
        setError('Could not load restaurant details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleToggleSaved = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (favoriteBusy) return;

    setFavoriteBusy(true);
    try {
      if (saved) {
        await apiRemoveFavorite(id);
        setSaved(false);
      } else {
        await apiAddFavorite(id);
        setSaved(true);
      }
    } finally {
      setFavoriteBusy(false);
    }
  };

  const menu = React.useMemo(() => {
    let items = [...menuItems];
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }
    if (menuSort === 'priceLow') items.sort((a, b) => a.price - b.price);
    else if (menuSort === 'priceHigh') items.sort((a, b) => b.price - a.price);
    const groups = {};
    items.forEach((item) => {
      const cat = item.category || 'Menu';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return Object.entries(groups).map(([category, items]) => ({ category, items }));
  }, [menuItems, menuSearch, menuSort]);

  const photoGallery = React.useMemo(() => {
    const uploaded = galleryPhotos.map(p => ({ url: p.url, type: p.type }));
    const fromMenu = menuItems.filter(i => i.image).map(i => ({ url: i.image, type: 'food' }));
    const cover = restaurant?.image ? [{ url: restaurant.image, type: 'exterior' }] : [];
    const all = [...cover, ...uploaded, ...fromMenu];
    const seen = new Set();
    return all.filter(p => { if (seen.has(p.url)) return false; seen.add(p.url); return true; });
  }, [menuItems, restaurant, galleryPhotos]);

  const filteredPhotos = React.useMemo(() => {
    if (photoFilter === 'all') return photoGallery;
    return photoGallery.filter(p => p.type === photoFilter);
  }, [photoGallery, photoFilter]);

  const featuredDishes = React.useMemo(() => {
    return [...menuItems]
      .filter((item) => item.name)
      .sort((first, second) => Number(second.price || 0) - Number(first.price || 0))
      .slice(0, 4);
  }, [menuItems]);

  const frequentlyOrdered = React.useMemo(() => {
    const bestsellers = menuItems.filter((item) => item.isBestseller);
    if (bestsellers.length >= 3) return bestsellers.slice(0, 6);
    return [...menuItems]
      .filter((item) => item.name && item.image)
      .sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
      .slice(0, 6);
  }, [menuItems]);

  const reviewBreakdown = React.useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const rating = Math.round(Number(review.rating || 0));
      if (counts[rating] != null) counts[rating] += 1;
    });
    return counts;
  }, [reviews]);

  const totalReviews = reviews.length || Number(restaurant?.reviewCount || 0);

  const mapQuery = encodeURIComponent([restaurant?.name, restaurant?.address, restaurant?.area, restaurant?.city].filter(Boolean).join(', '));
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`;

  const amenities = [
    restaurant?.isVeg && { label: 'Pure Veg', icon: Leaf, tone: 'text-green-700 bg-green-50 border-green-100' },
    restaurant?.hasAlcohol && { label: 'Serves Alcohol', icon: Wine, tone: 'text-rose-700 bg-rose-50 border-rose-100' },
    restaurant?.petFriendly && { label: 'Pet Friendly', icon: Trees, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
    restaurant?.hasOutdoorSeating && { label: 'Outdoor Seating', icon: Trees, tone: 'text-sky-700 bg-sky-50 border-sky-100' },
    restaurant?.hasDelivery && { label: 'Delivery', icon: Bike, tone: 'text-violet-700 bg-violet-50 border-violet-100' },
    restaurant?.hasDineIn && { label: 'Dine In', icon: Store, tone: 'text-amber-700 bg-amber-50 border-amber-100' },
    restaurant?.hasNightlife && { label: 'Nightlife', icon: MoonStar, tone: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
  ].filter(Boolean);

  useEffect(() => {
    if (menu.length > 0 && !expandedCategory) {
      setExpandedCategory(menu[0].category);
    }
  }, [menu, expandedCategory]);

  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[itemId]?.qty > 1) {
        updated[itemId] = { ...updated[itemId], qty: updated[itemId].qty - 1 };
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const scrollToSection = (ref, tab) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const newReview = await apiAddReview(id, reviewRating, reviewComment.trim(), reviewPhotos);
      setReviews((prev) => [newReview, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      setReviewPhotos([]);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', ref: overviewRef },
    { id: 'menu', label: 'Order Online', ref: menuRef },
    { id: 'reviews', label: 'Reviews', ref: reviewsRef },
    { id: 'photos', label: 'Photos', ref: photosRef },
    ...(restaurant?.hasDineIn ? [{ id: 'book', label: 'Book a Table', ref: bookTableRef }] : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] md:pt-26 pt-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#EF4F5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#696969] text-sm">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white md:pt-26 pt-10">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-2">Restaurant not found</h1>
        <p className="text-[#696969] mb-6">{error || "The restaurant you're looking for doesn't exist."}</p>
        <Link to="/" className="px-6 py-3 bg-[#EF4F5F] text-white rounded-xl font-medium hover:bg-[#e23744] transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  const avgRating = Number(restaurant.avgRating || restaurant.rating || 0);
  const hours =
    restaurant.openingTime && restaurant.closingTime
      ? `${restaurant.openingTime} - ${restaurant.closingTime}`
      : null;
  const coverImg = restaurant.image || null;

  return (
    <div className="bg-[#F8F8F8] min-h-screen md:py-26 py-10">
      {/* BREADCRUMB */}
      <div className="main-container pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#696969]">
          <Link to="/" className="hover:text-[#EF4F5F] transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-[#1C1C1C] font-medium truncate max-w-[200px]">{restaurant.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSaved}
            disabled={favoriteBusy}
            className={`p-2 rounded-full transition-colors ${saved ? 'bg-red-50 text-[#EF4F5F]' : 'hover:bg-gray-100 text-[#696969]'}`}
          >
            <Bookmark size={20} fill={saved ? '#EF4F5F' : 'none'} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-[#696969]">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* COVER PHOTO */}
      <section className="main-container pt-5 pb-2">
        {photoGallery.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 rounded-2xl overflow-hidden">
            <div
              className="relative h-[260px] sm:h-[320px] md:h-[380px] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => setLightbox({ open: true, index: 0 })}
            >
              <img src={photoGallery[0].url} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-white/75 text-xs uppercase tracking-[0.2em] font-bold">Featured restaurant</p>
                  <h2 className="text-white text-xl sm:text-2xl font-bold mt-1 drop-shadow-md">{restaurant.name}</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Camera size={13} /> {photoGallery.length} photo{photoGallery.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
              {photoGallery.slice(1, 5).map((photo, index) => (
                <button
                  key={photo.url}
                  type="button"
                  onClick={() => setLightbox({ open: true, index: index + 1 })}
                  className="relative h-[123px] sm:h-[150px] md:h-[88px] rounded-2xl overflow-hidden group"
                >
                  <img src={photo.url} alt={`${restaurant.name} ${index + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-[220px] sm:h-[280px] md:h-[340px] rounded-2xl bg-gradient-to-br from-[#EF4F5F]/20 to-[#FF8A94]/20 flex items-center justify-center">
            <Utensils size={64} className="text-[#EF4F5F]/40" />
          </div>
        )}
      </section>

      {/* RESTAURANT INFO */}
      <section ref={overviewRef} className="main-container pt-5 pb-3">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#EF4F5F]">Dining destination</p>
                <h1 className="text-xl sm:text-2xl md:text-[30px] font-bold text-[#1C1C1C] leading-tight mt-1">{restaurant.name}</h1>
                {restaurant.cuisine && (
                  <p className="text-[#EF4F5F] text-sm font-medium mt-2">{restaurant.cuisine}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[220px]">
                <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] px-4 py-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#9C9C9C] font-bold">Rating</p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className={`px-2 py-1 rounded-lg text-sm font-bold text-white ${getRatingColor(avgRating)}`}>{avgRating.toFixed(1)}</span>
                    <span className="text-sm font-medium text-[#1C1C1C]">{getRatingLabel(avgRating)}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-[#FAFAFA] px-4 py-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#9C9C9C] font-bold">Reviews</p>
                  <p className="mt-1 text-lg font-bold text-[#1C1C1C]">{totalReviews || 'New'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3 mt-5 text-sm text-[#696969]">
              {restaurant.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="shrink-0" />
                  <span>{restaurant.address}</span>
                </div>
              )}
              {hours && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="shrink-0" />
                  {restaurant.isOpen ? (
                    <span className="text-[#267E3E] font-medium">Open now</span>
                  ) : (
                    <span className="text-red-500 font-medium">Closed</span>
                  )}
                  <span>- {hours}</span>
                </div>
              )}
              {restaurant.costForTwo && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <span className="font-medium text-[#1C1C1C]">Rs.{restaurant.costForTwo} for two</span>
                </div>
              )}
            </div>

            {restaurant.description && (
              <p className="mt-5 text-sm leading-7 text-[#4A4A4A] bg-[#FAFAFA] border border-gray-100 rounded-2xl p-4">
                {restaurant.description}
              </p>
            )}

            {amenities.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-[#1C1C1C] mb-3">What to expect here</h3>
                <div className="flex flex-wrap gap-2.5">
                  {amenities.map((item) => {
                    const Icon = item.icon;
                    return (
                      <span key={item.label} className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium ${item.tone}`}>
                        <Icon size={15} /> {item.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {offers.length > 0 ? (
              <div className="mt-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#1C1C1C]">Available Offers</h3>
                {offers.slice(0, 3).map(offer => (
                  <div key={offer.id} className="bg-gradient-to-br from-[#EF4F5F] to-[#D63B4B] rounded-2xl p-4 text-white flex items-center gap-4">
                    <Tag size={24} className="opacity-80 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold">{offer.title}</h4>
                      <p className="text-xs opacity-80 mt-0.5">
                        {offer.description || `Use code ${offer.code}`}
                        {offer.minOrderValue > 0 && ` · Min order Rs.${offer.minOrderValue}`}
                      </p>
                      <span className="inline-block mt-1.5 text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">{offer.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 bg-gradient-to-br from-[#EF4F5F] to-[#D63B4B] rounded-2xl p-5 text-white flex items-center gap-4">
                <BadgePercent size={28} className="opacity-80 shrink-0" />
                <div>
                  <h3 className="text-base font-bold">Flat 50% OFF</h3>
                  <p className="text-sm opacity-80 mt-0.5">On orders above Rs.399. Use code MOMATO50</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-base font-bold text-[#1C1C1C] mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} className="flex items-center justify-between gap-3 text-[#1C1C1C] hover:text-[#EF4F5F] transition-colors">
                    <span className="flex items-center gap-2"><Phone size={15} /> Call restaurant</span>
                    <ExternalLink size={14} />
                  </a>
                )}
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 text-[#1C1C1C] hover:text-[#EF4F5F] transition-colors">
                  <span className="flex items-center gap-2"><Navigation size={15} /> Get directions</span>
                  <ExternalLink size={14} />
                </a>
                <div className="flex items-center justify-between gap-3 text-[#1C1C1C]">
                  <span className="flex items-center gap-2"><Clock size={15} /> Timings</span>
                  <span className="text-[#696969] text-right">{hours || 'Hours not listed'}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[#1C1C1C]">
                  <span className="flex items-center gap-2"><MessageSquare size={15} /> Review mood</span>
                  <span className="text-[#696969] text-right">{getRatingLabel(avgRating)}</span>
                </div>
              </div>
            </div>

            {featuredDishes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-base font-bold text-[#1C1C1C] mb-4">Must try here</h3>
                <div className="space-y-3">
                  {featuredDishes.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#FAFAFA] border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <Utensils size={18} className="text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1C1C1C] truncate">{item.name}</p>
                        <p className="text-xs text-[#696969] truncate">{item.category || 'Chef recommendation'}</p>
                      </div>
                      <p className="text-sm font-bold text-[#1C1C1C]">Rs.{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {restaurant.hasDelivery && (
              <DeliveryRadiusMap
                latitude={restaurant.latitude}
                longitude={restaurant.longitude}
                deliveryRadius={restaurant.deliveryRadius}
                restaurantName={restaurant.name}
              />
            )}
          </div>
        </div>
      </section>

      {/* TAB NAVIGATION */}
      <nav className="sticky top-[60px] md:top-[72px] z-50 bg-white border-b border-gray-100 mt-3">
        <div className="main-container flex items-center gap-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.ref, tab.id)}
              className={`relative px-5 py-4 text-[15px] font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-[#EF4F5F]' : 'text-[#696969] hover:text-[#1C1C1C]'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="detailTab" className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#EF4F5F] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* FREQUENTLY ORDERED */}
      {frequentlyOrdered.length > 0 && (
        <section className="main-container py-6 pb-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#1C1C1C] mb-1 flex items-center gap-2">
              <Flame size={20} className="text-orange-500" /> Frequently Ordered
            </h2>
            <p className="text-sm text-[#696969] mb-5">Most popular dishes at this restaurant</p>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {frequentlyOrdered.map((item) => {
                const inCart = cart[item.id];
                return (
                  <div key={item.id} className="shrink-0 w-[160px] group">
                    <div className="relative h-[140px] rounded-xl overflow-hidden mb-2">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Utensils size={24} className="text-gray-400" />
                        </div>
                      )}
                      {item.isBestseller && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          BESTSELLER
                        </span>
                      )}
                      <div className="absolute bottom-2 right-2">
                        {inCart ? (
                          <div className="flex items-center bg-[#EF4F5F] rounded-lg overflow-hidden shadow-md">
                            <button onClick={() => removeFromCart(item.id)} className="px-2 py-1 text-white hover:bg-[#d63b4b]">
                              <Minus size={12} />
                            </button>
                            <span className="px-1.5 text-white text-xs font-bold">{inCart.qty}</span>
                            <button onClick={() => addToCart(item)} className="px-2 py-1 text-white hover:bg-[#d63b4b]">
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-white text-[#EF4F5F] border border-[#EF4F5F] text-xs font-bold px-3 py-1.5 rounded-lg shadow-md hover:bg-[#EF4F5F] hover:text-white transition-colors"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`w-3.5 h-3.5 border-[1.5px] rounded-sm flex items-center justify-center shrink-0 ${item.isVeg ? 'border-[#267E3E]' : 'border-[#E43B4F]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-[#267E3E]' : 'bg-[#E43B4F]'}`} />
                      </span>
                      <h4 className="text-sm font-medium text-[#1C1C1C] truncate">{item.name}</h4>
                    </div>
                    <p className="text-sm font-semibold text-[#1C1C1C]">Rs.{item.price}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* MENU */}
      <section ref={menuRef} className="main-container py-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 pb-4 border-b border-gray-100 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-[#1C1C1C] flex items-center gap-2">
              <Utensils size={20} className="text-[#EF4F5F]" /> Menu
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={menuSearch}
                  onChange={e => setMenuSearch(e.target.value)}
                  placeholder="Search menu..."
                  className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F] w-[180px]"
                />
              </div>
              <select
                value={menuSort}
                onChange={e => setMenuSort(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#EF4F5F]"
              >
                <option value="default">Default</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-[#696969]">Veg Only</span>
                <div
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${vegOnly ? 'bg-[#267E3E]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${vegOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>
          </div>

          {menu.length === 0 ? (
            <div className="p-8 text-center text-[#696969]">
              <Utensils size={40} className="mx-auto mb-3 opacity-30" />
              <p>No menu items available yet.</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row">
              <div className="md:w-[220px] border-r border-gray-100 bg-[#FAFAFA]">
                <div className="p-3">
                  {menu.map((cat) => {
                    const filteredCount = vegOnly ? cat.items.filter((i) => i.isVeg).length : cat.items.length;
                    return (
                      <button
                        key={cat.category}
                        onClick={() => setExpandedCategory(cat.category)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${expandedCategory === cat.category
                          ? 'bg-white text-[#EF4F5F] shadow-sm border border-gray-100'
                          : 'text-[#696969] hover:text-[#1C1C1C] hover:bg-white'
                          }`}
                      >
                        {cat.category}
                        <span className="text-[11px] ml-1 opacity-60">({filteredCount})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1 p-4 md:p-6">
                {menu.map((cat) => {
                  if (expandedCategory && expandedCategory !== cat.category) return null;
                  const items = vegOnly ? cat.items.filter((i) => i.isVeg) : cat.items;
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.category} className="mb-6 last:mb-0">
                      <h3 className="text-[16px] font-semibold text-[#1C1C1C] mb-4 flex items-center gap-2">
                        {cat.category}
                        <span className="text-xs text-[#696969] font-normal">({items.length} items)</span>
                      </h3>
                      <div className="space-y-0">
                        {items.map((item, idx) => {
                          const inCart = cart[item.id];
                          return (
                            <div
                              key={item.id}
                              className={`flex items-start justify-between gap-4 py-5 ${idx !== items.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                              {item.image && (
                                <div className="shrink-0 w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-xl overflow-hidden order-last">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center shrink-0 ${item.isVeg ? 'border-[#267E3E]' : 'border-[#E43B4F]'}`}>
                                    <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-[#267E3E]' : 'bg-[#E43B4F]'}`} />
                                  </span>
                                  {item.isBestseller && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                      <Flame size={10} /> Bestseller
                                    </span>
                                  )}
                                  {item.isNew && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                      <Sparkles size={10} /> New
                                    </span>
                                  )}
                                  {item.spiceLevel && (
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${item.spiceLevel === 'hot' ? 'text-red-700 bg-red-50' :
                                      item.spiceLevel === 'medium' ? 'text-orange-700 bg-orange-50' :
                                        'text-green-700 bg-green-50'
                                      }`}>
                                      {item.spiceLevel === 'hot' ? '🌶️🌶️' : item.spiceLevel === 'medium' ? '🌶️' : 'Mild'}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-[15px] font-medium text-[#1C1C1C]">{item.name}</h4>
                                <p className="text-[15px] font-semibold text-[#1C1C1C] mt-0.5">Rs.{item.price}</p>
                                {item.description && (
                                  <p className="text-[13px] text-[#696969] mt-2 leading-relaxed line-clamp-2">{item.description}</p>
                                )}
                              </div>
                              <div className="shrink-0 w-[100px] flex flex-col items-center">
                                {inCart ? (
                                  <div className="flex items-center bg-[#EF4F5F] rounded-lg overflow-hidden">
                                    <button onClick={() => removeFromCart(item.id)} className="px-2.5 py-2 text-white hover:bg-[#d63b4b] transition-colors">
                                      <Minus size={14} />
                                    </button>
                                    <span className="px-2 text-white text-sm font-bold">{inCart.qty}</span>
                                    <button onClick={() => addToCart(item)} className="px-2.5 py-2 text-white hover:bg-[#d63b4b] transition-colors">
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="w-full py-2 border-2 border-[#EF4F5F] text-[#EF4F5F] rounded-lg text-sm font-bold hover:bg-[#EF4F5F] hover:text-white transition-all"
                                  >
                                    ADD
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section ref={reviewsRef} className="main-container pb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#1C1C1C] mb-6">Reviews and Ratings</h2>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 p-5 sm:p-7 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 mb-6">
            {/* Left: Overall Rating */}
            <div className="flex flex-col items-center lg:items-center justify-center">
              <div className={`w-24 h-24 rounded-2xl ${getRatingColor(avgRating)} flex flex-col items-center justify-center shadow-lg`}>
                <span className="text-3xl font-black text-white leading-none">{avgRating.toFixed(1)}</span>
                <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider mt-1">out of 5</span>
              </div>
              <div className="flex items-center gap-0.5 mt-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill={s <= Math.round(avgRating) ? '#EF4F5F' : '#E0E0E0'} stroke="none" />
                ))}
              </div>
              <p className="text-sm font-semibold text-[#1C1C1C] mt-2">{getRatingLabel(avgRating)}</p>
              {totalReviews > 0 && (
                <p className="text-xs text-[#9C9C9C] mt-0.5">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
              )}
            </div>

            {/* Right: Bar Breakdown */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewBreakdown[rating];
                const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                const barColors = {
                  5: 'from-[#267E3E] to-[#3F8F46]',
                  4: 'from-[#3F8F46] to-[#6BA54A]',
                  3: 'from-[#CDD614] to-[#E5E82A]',
                  2: 'from-[#DB7C38] to-[#E59A4E]',
                  1: 'from-[#E74C3C] to-[#EF6F5F]',
                };
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-sm font-medium text-[#1C1C1C] w-10 shrink-0">
                      {rating} <Star size={12} fill="#1C1C1C" stroke="none" />
                    </button>
                    <div className="flex-1 h-3 rounded-full bg-gray-200/70 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${barColors[rating]}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: (5 - rating) * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#696969] w-10 text-right tabular-nums">{count > 0 ? `${pct}%` : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {user ? (
            <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-sm font-semibold text-[#1C1C1C] mb-3">Write a Review</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star size={24} fill={s <= (hoverRating || reviewRating) ? '#EF4F5F' : '#E0E0E0'} stroke="none" />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-[#1C1C1C] placeholder-[#9C9C9C] focus:outline-none focus:border-[#EF4F5F] resize-none"
              />
              {/* Photo upload */}
              <div className="flex items-center gap-3 mt-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm text-[#696969] rounded-lg cursor-pointer transition-colors">
                  <ImagePlus size={16} /> Add Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files).slice(0, 5 - reviewPhotos.length);
                      setReviewPhotos((prev) => [...prev, ...files].slice(0, 5));
                      e.target.value = '';
                    }}
                  />
                </label>
                {reviewPhotos.length > 0 && (
                  <span className="text-xs text-[#696969]">{reviewPhotos.length}/5 photos</span>
                )}
              </div>
              {reviewPhotos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {reviewPhotos.map((file, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReviewPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {reviewError && <p className="text-xs text-red-500 mt-1">{reviewError}</p>}
              <button
                type="submit"
                disabled={submittingReview || !reviewComment.trim()}
                className="mt-3 px-5 py-2 bg-[#EF4F5F] text-white text-sm font-semibold rounded-xl hover:bg-[#d63b4b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-sm text-[#696969]">
                <Link to="/login" className="text-[#EF4F5F] font-semibold hover:underline">Login</Link> to write a review
              </p>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-center text-sm text-[#696969] py-4">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-0">
              {reviews.map((review, idx) => {
                const userName = review.user?.name || review.User?.name || 'Anonymous';
                const initial = userName.charAt(0).toUpperCase();
                const dateStr = review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';
                return (
                  <div key={review.id} className={`py-5 ${idx !== reviews.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF4F5F] to-[#FF8A94] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#1C1C1C]">{userName}</span>
                          {dateStr && <span className="text-[11px] text-[#696969]">{dateStr}</span>}
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={13} fill={s <= (review.rating || 0) ? '#EF4F5F' : '#E0E0E0'} stroke="none" />
                          ))}
                        </div>
                        <p className="text-sm text-[#3D3D3D] leading-relaxed">{review.comment}</p>
                        {/* Review photos */}
                        {Array.isArray(review.photos) && review.photos.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {review.photos.map((photo, pIdx) => (
                              <div key={pIdx} className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer group" onClick={() => setLightbox({ open: true, index: 0 })}>
                                <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* PHOTOS */}
      <section ref={photosRef} className="main-container pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-[#1C1C1C]">Photos ({photoGallery.length})</h2>
              <div className="flex gap-2">
                {['all', 'food', 'ambiance', 'exterior', 'menu'].map(t => (
                  <button
                    key={t}
                    onClick={() => setPhotoFilter(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${photoFilter === t ? 'bg-[#EF4F5F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {filteredPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredPhotos.map((photo, index) => (
                  <div
                    key={photo.url + index}
                    onClick={() => setLightbox({ open: true, index })}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                  >
                    <img src={photo.url} alt={`${restaurant.name} ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[10px] font-medium capitalize">{photo.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-[#696969]">No photos available.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1C1C1C]">Location</h3>
                <p className="text-sm text-[#696969] mt-1">{restaurant.area || restaurant.city || 'Find this place on map'}</p>
              </div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#EF4F5F] hover:underline">
                Open map <ExternalLink size={14} />
              </a>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-100 h-[260px] bg-gray-50">
              <iframe
                title={`${restaurant.name} map`}
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {restaurant.address && <p className="text-sm text-[#4A4A4A] mt-4 leading-6">{restaurant.address}</p>}
          </div>
        </div>
      </section>

      {/* BOOK A TABLE */}
      {restaurant.hasDineIn && (
        <section ref={bookTableRef} className="main-container pb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#1C1C1C] mb-5 flex items-center gap-2">
              <CalendarDays size={20} className="text-[#EF4F5F]" /> Book a Table
            </h2>
            {bookingStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CalendarDays size={28} className="text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-[#1C1C1C] mb-1">Reservation Requested!</h3>
                <p className="text-sm text-[#696969] mb-4">You'll receive confirmation shortly.</p>
                <button onClick={() => setBookingStatus(null)} className="text-sm text-[#EF4F5F] font-semibold hover:underline">
                  Book another table
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) { navigate('/login'); return; }
                  if (!bookingForm.date || !bookingForm.time) return;
                  setBookingSubmitting(true);
                  try {
                    await apiCreateReservation(id, bookingForm);
                    setBookingStatus('success');
                    setBookingForm({ date: '', time: '19:00', partySize: 2, guestName: '', guestPhone: '', specialRequests: '' });
                  } catch (err) {
                    setBookingStatus(err.message || 'Booking failed');
                  } finally {
                    setBookingSubmitting(false);
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.date}
                    onChange={e => setBookingForm(f => ({ ...f, date: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={e => setBookingForm(f => ({ ...f, time: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <select
                      value={bookingForm.partySize}
                      onChange={e => setBookingForm(f => ({ ...f, partySize: Number(e.target.value) }))}
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full py-2.5 bg-[#EF4F5F] text-white text-sm font-bold rounded-xl hover:bg-[#d63b4b] transition-colors disabled:opacity-50"
                  >
                    {bookingSubmitting ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (optional)</label>
                  <input
                    value={bookingForm.specialRequests}
                    onChange={e => setBookingForm(f => ({ ...f, specialRequests: e.target.value }))}
                    placeholder="Birthday, window seat, high chair..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    value={bookingForm.guestName}
                    onChange={e => setBookingForm(f => ({ ...f, guestName: e.target.value }))}
                    placeholder={user?.name || 'Your name'}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    value={bookingForm.guestPhone}
                    onChange={e => setBookingForm(f => ({ ...f, guestPhone: e.target.value }))}
                    placeholder="10-digit phone"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#EF4F5F]"
                  />
                </div>
                {typeof bookingStatus === 'string' && bookingStatus !== 'success' && (
                  <p className="sm:col-span-2 lg:col-span-4 text-xs text-red-500">{bookingStatus}</p>
                )}
              </form>
            )}
          </div>
        </section>
      )}

      {/* SIMILAR RESTAURANTS */}
      {similarRestaurants.length > 0 && (
        <section className="main-container pb-10">
          <h2 className="text-xl font-bold text-[#1C1C1C] mb-1">Similar Restaurants Nearby</h2>
          <p className="text-sm text-[#696969] mb-5">People who viewed this also checked out</p>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-x-visible">
            {similarRestaurants.map((r) => (
              <Link
                key={r.id}
                to={`/restaurant/${r.id}`}
                className="shrink-0 w-[200px] md:w-auto bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="h-[140px] overflow-hidden bg-gray-100">
                  {r.image ? (
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#1C1C1C] truncate group-hover:text-[#EF4F5F] transition-colors">{r.name}</h3>
                    <span className={`shrink-0 text-white text-[11px] font-bold px-1.5 py-0.5 rounded ${getRatingColor(Number(r.avgRating || r.rating || 0))}`}>
                      {Number(r.avgRating || r.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  {r.cuisine && <p className="text-[12px] text-[#696969] mt-1 truncate">{r.cuisine}</p>}
                  <p className="text-[12px] text-[#9C9C9C] mt-1">
                    {r.area}{r.costForTwo ? ` - Rs.${r.costForTwo} for two` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FLOATING CART BAR */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full z-[200]"
          >
            <div className="main-container pb-4">
              <div
                onClick={() => setCartOpen(true)}
                className="bg-[#EF4F5F] text-white rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#d63b4b] transition-colors shadow-[0_-4px_20px_rgba(239,79,95,0.3)]"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} />
                  <span className="font-bold">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
                  <span className="text-white/70">|</span>
                  <span className="font-bold">Rs.{cartTotal}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  View Cart <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/50 z-[300]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[301] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-[#1C1C1C]">Your Order</h2>
                <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={22} className="text-[#696969]" />
                </button>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#1C1C1C]">{restaurant.name}</p>
                {restaurant.area && <p className="text-xs text-[#696969]">{restaurant.area}</p>}
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`w-3.5 h-3.5 border-[1.5px] rounded-sm flex items-center justify-center ${item.isVeg ? 'border-[#267E3E]' : 'border-[#E43B4F]'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-[#267E3E]' : 'bg-[#E43B4F]'}`} />
                          </span>
                          <span className="text-sm font-medium text-[#1C1C1C] truncate">{item.name}</span>
                        </div>
                        <p className="text-sm text-[#696969]">Rs.{item.price * item.qty}</p>
                      </div>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => removeFromCart(item.id)} className="px-2 py-1 hover:bg-gray-50 transition-colors">
                          <Minus size={14} className="text-[#EF4F5F]" />
                        </button>
                        <span className="px-2 text-sm font-bold text-[#1C1C1C]">{item.qty}</span>
                        <button onClick={() => addToCart(item)} className="px-2 py-1 hover:bg-gray-50 transition-colors">
                          <Plus size={14} className="text-[#EF4F5F]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#696969]">Item Total</span>
                  <span className="text-sm font-medium text-[#1C1C1C]">Rs.{cartTotal}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#696969]">Delivery Fee</span>
                  <span className="text-sm font-medium text-[#267E3E]">FREE</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-base font-bold text-[#1C1C1C]">Total</span>
                  <span className="text-base font-bold text-[#1C1C1C]">Rs.{cartTotal}</span>
                </div>
                <button
                  onClick={async () => {
                    if (!user) { navigate('/login'); return; }
                    try {
                      await apiClearCart();
                      for (const item of cartItems) {
                        await apiAddToCart(item.id, item.qty);
                      }
                      navigate('/cart');
                    } catch (err) {
                      toast.error(err.message || 'Failed to sync cart');
                    }
                  }}
                  className="w-full mt-4 py-3.5 bg-[#EF4F5F] text-white font-bold rounded-xl hover:bg-[#d63b4b] transition-colors text-[15px]">
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox.open && filteredPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[400] flex items-center justify-center"
            onClick={() => setLightbox({ open: false, index: 0 })}
          >
            <button
              className="absolute top-5 right-5 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setLightbox({ open: false, index: 0 })}
            >
              <X size={28} />
            </button>
            {filteredPhotos.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
                  onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: (prev.index - 1 + filteredPhotos.length) % filteredPhotos.length })); }}
                >
                  <ChevronRight size={28} className="rotate-180" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
                  onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: (prev.index + 1) % filteredPhotos.length })); }}
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
            <img
              src={filteredPhotos[lightbox.index]?.url}
              alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightbox.index + 1} / {filteredPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestaurantDetail;
