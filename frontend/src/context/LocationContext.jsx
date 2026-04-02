import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext();

const POPULAR_CITIES = [
  { name: 'Varanasi', lat: 25.3176, lng: 83.0068 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
];

const STORAGE_KEY = 'momato_location';

export const LocationProvider = ({ children }) => {
  const [city, setCity] = useState('Varanasi');
  const [coords, setCoords] = useState({ lat: 25.3176, lng: 83.0068 });
  const [locality, setLocality] = useState('');
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | loading | ready | denied | error

  // Restore from localStorage on mount, auto-detect if no saved location
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.city) setCity(parsed.city);
        if (parsed.coords) setCoords(parsed.coords);
        if (parsed.locality) setLocality(parsed.locality);
        return; // have saved location, skip auto-detect
      }
    } catch { /* ignore */ }
    // No saved location — auto-detect via geolocation
    if (navigator.geolocation) {
      setGeoStatus('loading');
      navigator.geolocation.getCurrentPosition(
        async ({ coords: pos }) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.latitude}&lon=${pos.longitude}`,
              { headers: { Accept: 'application/json' } }
            );
            if (!res.ok) throw new Error('Reverse geocode failed');
            const data = await res.json();
            const address = data.address || {};
            const detectedCity = address.city || address.town || address.village || address.state_district || 'Your city';
            const detectedLocality = address.suburb || address.neighbourhood || address.city_district || '';
            setCity(detectedCity);
            setCoords({ lat: pos.latitude, lng: pos.longitude });
            setLocality(detectedLocality);
            setGeoStatus('ready');
          } catch {
            setCoords({ lat: pos.latitude, lng: pos.longitude });
            setGeoStatus('error');
          }
        },
        () => setGeoStatus('idle'), // silently fallback to default on deny
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ city, coords, locality }));
  }, [city, coords, locality]);

  const selectCity = useCallback((cityName) => {
    const found = POPULAR_CITIES.find(c => c.name === cityName);
    if (found) {
      setCity(found.name);
      setCoords({ lat: found.lat, lng: found.lng });
      setLocality('');
    } else {
      setCity(cityName);
      setLocality('');
    }
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: pos }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.latitude}&lon=${pos.longitude}`,
            { headers: { Accept: 'application/json' } }
          );
          if (!res.ok) throw new Error('Reverse geocode failed');
          const data = await res.json();
          const address = data.address || {};
          const detectedCity = address.city || address.town || address.village || address.state_district || 'Your city';
          const detectedLocality = address.suburb || address.neighbourhood || address.city_district || '';
          setCity(detectedCity);
          setCoords({ lat: pos.latitude, lng: pos.longitude });
          setLocality(detectedLocality);
          setGeoStatus('ready');
        } catch {
          setCoords({ lat: pos.latitude, lng: pos.longitude });
          setGeoStatus('error');
        }
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  const displayLocation = locality ? `${locality}, ${city}` : city;

  return (
    <LocationContext.Provider value={{
      city,
      coords,
      locality,
      displayLocation,
      geoStatus,
      selectCity,
      detectLocation,
      popularCities: POPULAR_CITIES,
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
