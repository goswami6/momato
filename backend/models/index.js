const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Review = require('./Review');
const Collection = require('./Collection');
const Favorite = require('./Favorite');
const Order = require('./Order');
const Cart = require('./Cart');
const Photo = require('./Photo');
const Reservation = require('./Reservation');
const Offer = require('./Offer');
const Address = require('./Address');

// User -> Restaurant (owner)
User.hasMany(Restaurant, { foreignKey: 'ownerId', as: 'restaurants' });
Restaurant.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Restaurant -> MenuItems
Restaurant.hasMany(MenuItem, { foreignKey: 'restaurantId', as: 'menuItems' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// User -> Reviews
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Restaurant -> Reviews
Restaurant.hasMany(Review, { foreignKey: 'restaurantId', as: 'reviews' });
Review.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Collection <-> Restaurant (many-to-many)
Collection.belongsToMany(Restaurant, {
  through: 'collection_restaurants',
  foreignKey: 'collectionId',
  as: 'restaurants',
});
Restaurant.belongsToMany(Collection, {
  through: 'collection_restaurants',
  foreignKey: 'restaurantId',
  as: 'collections',
});

// User <-> Restaurant favorites
User.belongsToMany(Restaurant, {
  through: Favorite,
  foreignKey: 'userId',
  otherKey: 'restaurantId',
  as: 'favorites',
});
Restaurant.belongsToMany(User, {
  through: Favorite,
  foreignKey: 'restaurantId',
  otherKey: 'userId',
  as: 'savedByUsers',
});

Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Favorite.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favoriteItems' });
Restaurant.hasMany(Favorite, { foreignKey: 'restaurantId', as: 'favoriteItems' });

// Orders
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Restaurant.hasMany(Order, { foreignKey: 'restaurantId', as: 'orders' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Cart
User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Restaurant.hasMany(Cart, { foreignKey: 'restaurantId', as: 'restaurantCart' });
Cart.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
MenuItem.hasMany(Cart, { foreignKey: 'menuItemId', as: 'cartEntries' });
Cart.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

// Restaurant -> Photos
Restaurant.hasMany(Photo, { foreignKey: 'restaurantId', as: 'photos' });
Photo.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
User.hasMany(Photo, { foreignKey: 'uploadedBy', as: 'photos' });
Photo.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// Reservations
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Restaurant.hasMany(Reservation, { foreignKey: 'restaurantId', as: 'reservations' });
Reservation.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Offers
Restaurant.hasMany(Offer, { foreignKey: 'restaurantId', as: 'offers' });
Offer.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Addresses
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = { User, Restaurant, MenuItem, Review, Collection, Favorite, Order, Cart, Photo, Reservation, Offer, Address };
