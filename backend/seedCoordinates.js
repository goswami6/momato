const { sequelize } = require('./config/db');
const { Restaurant } = require('./models');
require('dotenv').config();

// Varanasi area coordinates — realistic spread
const varanasiLocations = [
  { lat: 25.3176, lng: 83.0068, area: 'Assi Ghat' },
  { lat: 25.3100, lng: 82.9913, area: 'Lanka' },
  { lat: 25.3200, lng: 83.0100, area: 'Dashashwamedh' },
  { lat: 25.3050, lng: 82.9870, area: 'Sigra' },
  { lat: 25.2990, lng: 82.9900, area: 'Cantt' },
  { lat: 25.3350, lng: 83.0050, area: 'Godowlia' },
  { lat: 25.2800, lng: 82.9950, area: 'Sarnath' },
  { lat: 25.2700, lng: 82.9600, area: 'BHU' },
  { lat: 25.3400, lng: 83.0200, area: 'Maldahiya' },
  { lat: 25.3250, lng: 82.9800, area: 'Nadesar' },
  { lat: 25.2950, lng: 82.9700, area: 'Mahmoorganj' },
  { lat: 25.3500, lng: 83.0300, area: 'Luxa' },
  { lat: 25.2850, lng: 82.9850, area: 'IP Mall' },
  { lat: 25.3100, lng: 83.0000, area: 'Bhelupur' },
  { lat: 25.3300, lng: 82.9950, area: 'Kabir Chaura' },
  { lat: 25.2600, lng: 82.9500, area: 'Pandeypur' },
  { lat: 25.3150, lng: 82.9750, area: 'Susuwahi' },
  { lat: 25.2900, lng: 83.0050, area: 'Shivpur' },
  { lat: 25.3450, lng: 83.0150, area: 'Chowk' },
  { lat: 25.2750, lng: 82.9750, area: 'DLW' },
];

const addCoordinates = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    const restaurants = await Restaurant.findAll();
    console.log(`Found ${restaurants.length} restaurants`);

    for (let i = 0; i < restaurants.length; i++) {
      const loc = varanasiLocations[i % varanasiLocations.length];
      // Add slight randomness so markers don't overlap
      const jitterLat = (Math.random() - 0.5) * 0.008;
      const jitterLng = (Math.random() - 0.5) * 0.008;
      const deliveryRadius = 3 + Math.random() * 7; // 3-10 km

      await restaurants[i].update({
        latitude: loc.lat + jitterLat,
        longitude: loc.lng + jitterLng,
        deliveryRadius: Math.round(deliveryRadius * 10) / 10,
        area: loc.area,
      });

      console.log(`  Updated "${restaurants[i].name}" → ${(loc.lat + jitterLat).toFixed(4)}, ${(loc.lng + jitterLng).toFixed(4)} (${loc.area})`);
    }

    console.log('\nAll restaurants updated with coordinates!');
    process.exit(0);
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
};

addCoordinates();
