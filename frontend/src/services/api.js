const BASE = '/api';

const getHeaders = () => {
  try {
    const stored = localStorage.getItem('momato_user');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) {
        return {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };
      }
    }
  } catch { }
  return { 'Content-Type': 'application/json' };
};

const getAuthHeader = () => {
  try {
    const stored = localStorage.getItem('momato_user');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) return { Authorization: `Bearer ${token}` };
    }
  } catch { }
  return {};
};

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const uploadRequest = async (path, formData, method = 'POST') => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getAuthHeader(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ─── Auth ───────────────────────────────────────────────────────────────────
export const apiLogin = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const apiSignup = (name, email, phone, password, role = 'user') =>
  request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, phone, password, role }) });

export const apiGetMe = () => request('/auth/me');

export const apiUpdateProfile = (data) =>
  request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });

export const apiChangePassword = (currentPassword, newPassword) =>
  request('/auth/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });

export const apiForgotPassword = (email) =>
  request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

export const apiResetPassword = (token, newPassword) =>
  request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });

// ─── Restaurants ─────────────────────────────────────────────────────────────
export const apiGetRestaurants = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== '' && v !== false)
  );
  const qs = new URLSearchParams(clean).toString();
  return request(`/restaurants${qs ? `?${qs}` : ''}`);
};

export const apiGetRestaurantById = (id) => request(`/restaurants/${id}`);

export const apiCreateRestaurant = (data) =>
  request('/restaurants', { method: 'POST', body: JSON.stringify(data) });

export const apiCreateRestaurantWithImage = (formData) =>
  uploadRequest('/restaurants', formData);

export const apiUpdateRestaurant = (id, data) =>
  request(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const apiUpdateRestaurantWithImage = (id, formData) =>
  uploadRequest(`/restaurants/${id}`, formData, 'PUT');

export const apiDeleteRestaurant = (id) =>
  request(`/restaurants/${id}`, { method: 'DELETE' });

// ─── Menu ────────────────────────────────────────────────────────────────────
export const apiGetMenuItems = (restaurantId) =>
  request(`/restaurants/${restaurantId}/menu`);

export const apiAddMenuItem = (restaurantId, data) =>
  request(`/restaurants/${restaurantId}/menu`, { method: 'POST', body: JSON.stringify(data) });

export const apiAddMenuItemWithImage = (restaurantId, formData) =>
  uploadRequest(`/restaurants/${restaurantId}/menu`, formData);

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const apiGetReviews = (restaurantId) =>
  request(`/restaurants/${restaurantId}/reviews`);

export const apiAddReview = (restaurantId, rating, comment, photos = []) => {
  const fd = new FormData();
  fd.append('rating', rating);
  fd.append('comment', comment);
  photos.forEach((file) => fd.append('photos', file));
  return uploadRequest(`/restaurants/${restaurantId}/reviews`, fd);
};

export const apiDeleteReview = (id) =>
  request(`/reviews/${id}`, { method: 'DELETE' });

// ─── Collections ─────────────────────────────────────────────────────────────
export const apiGetCollections = () => request('/collections');
export const apiGetCollectionById = (id) => request(`/collections/${id}`);

// ─── Admin ───────────────────────────────────────────────────────────────────
export const apiAdminStats = () => request('/admin/stats');
export const apiAdminUsers = () => request('/admin/users');
export const apiAdminDeleteUser = (id) =>
  request(`/admin/users/${id}`, { method: 'DELETE' });
export const apiAdminReviews = () => request('/admin/reviews');
export const apiAdminDeleteReview = (id) =>
  request(`/admin/reviews/${id}`, { method: 'DELETE' });

// ─── Owner ────────────────────────────────────────────────────────────────────
export const apiOwnerStats = () => request('/owner/stats');
export const apiGetOwnerRestaurants = () => request('/owner/restaurants');

// ─── Menu item management ─────────────────────────────────────────────────────
export const apiUpdateMenuItem = (id, data) =>
  request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const apiUpdateMenuItemWithImage = (id, formData) =>
  uploadRequest(`/menu/${id}`, formData, 'PUT');

export const apiDeleteMenuItem = (id) =>
  request(`/menu/${id}`, { method: 'DELETE' });

// ─── Favorites ───────────────────────────────────────────────────────────────
export const apiGetFavorites = () => request('/favorites');

export const apiAddFavorite = (restaurantId) =>
  request(`/favorites/${restaurantId}`, { method: 'POST' });

export const apiRemoveFavorite = (restaurantId) =>
  request(`/favorites/${restaurantId}`, { method: 'DELETE' });

// ─── Admin Moderation ────────────────────────────────────────────────────────
export const apiAdminPendingRestaurants = () => request('/admin/restaurants/pending');
export const apiAdminAllRestaurants = (status) =>
  request(`/admin/restaurants${status ? `?status=${status}` : ''}`);
export const apiAdminApproveRestaurant = (id) =>
  request(`/admin/restaurants/${id}/approve`, { method: 'PUT' });
export const apiAdminRejectRestaurant = (id, reason) =>
  request(`/admin/restaurants/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) });

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const apiGetCart = () => request('/cart');

export const apiAddToCart = (menuItemId, quantity = 1) =>
  request('/cart', { method: 'POST', body: JSON.stringify({ menuItemId, quantity }) });

export const apiUpdateCartItem = (id, quantity) =>
  request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });

export const apiRemoveFromCart = (id) =>
  request(`/cart/${id}`, { method: 'DELETE' });

export const apiClearCart = () =>
  request('/cart/clear', { method: 'DELETE' });

// ─── Addresses ────────────────────────────────────────────────────────────────
export const apiGetAddresses = () => request('/addresses');

export const apiAddAddress = (data) =>
  request('/addresses', { method: 'POST', body: JSON.stringify(data) });

export const apiUpdateAddress = (id, data) =>
  request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const apiDeleteAddress = (id) =>
  request(`/addresses/${id}`, { method: 'DELETE' });

// ─── Orders ───────────────────────────────────────────────────────────────────
export const apiPlaceOrder = (data) =>
  request('/orders', { method: 'POST', body: JSON.stringify(data) });

export const apiGetMyOrders = () => request('/orders');

export const apiGetOrderById = (id) => request(`/orders/${id}`);

export const apiCancelOrder = (id) =>
  request(`/orders/${id}/cancel`, { method: 'PUT' });

export const apiReorder = (id) =>
  request(`/orders/${id}/reorder`, { method: 'POST' });

// ─── Owner Orders ─────────────────────────────────────────────────────────────
export const apiGetOwnerOrders = (status) =>
  request(`/owner/orders${status ? `?status=${status}` : ''}`);

export const apiUpdateOrderStatus = (id, status) =>
  request(`/owner/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// ─── Location / Nearby ───────────────────────────────────────────────────────
export const apiGetNearbyRestaurants = (lat, lng, radius = 5) => {
  const qs = new URLSearchParams({ lat, lng, radius }).toString();
  return request(`/restaurants/nearby?${qs}`);
};

// ─── Photos ──────────────────────────────────────────────────────────────────
export const apiGetPhotos = (restaurantId, type) => {
  const qs = type ? `?type=${type}` : '';
  return request(`/restaurants/${restaurantId}/photos${qs}`);
};

export const apiAddPhoto = (restaurantId, formData) =>
  uploadRequest(`/restaurants/${restaurantId}/photos`, formData);

export const apiDeletePhoto = (id) =>
  request(`/photos/${id}`, { method: 'DELETE' });

// ─── Reservations ────────────────────────────────────────────────────────────
export const apiCreateReservation = (restaurantId, data) =>
  request(`/restaurants/${restaurantId}/reservations`, { method: 'POST', body: JSON.stringify(data) });

export const apiGetMyReservations = () => request('/reservations');

export const apiUpdateReservationStatus = (id, status) =>
  request(`/reservations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const apiGetOwnerReservations = (status, date) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (date) params.set('date', date);
  const qs = params.toString();
  return request(`/owner/reservations${qs ? `?${qs}` : ''}`);
};

export const apiOwnerUpdateReservationStatus = (id, status) =>
  request(`/owner/reservations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// ─── Offers / Coupons ────────────────────────────────────────────────────────
export const apiGetOffers = (restaurantId) =>
  request(`/restaurants/${restaurantId}/offers`);

export const apiValidateCoupon = (code, restaurantId, orderTotal) =>
  request('/offers/validate', { method: 'POST', body: JSON.stringify({ code, restaurantId, orderTotal }) });

export const apiGetOwnerOffers = () => request('/owner/offers');

export const apiCreateOffer = (data) =>
  request('/owner/offers', { method: 'POST', body: JSON.stringify(data) });

export const apiUpdateOffer = (id, data) =>
  request(`/owner/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const apiDeleteOffer = (id) =>
  request(`/owner/offers/${id}`, { method: 'DELETE' });
