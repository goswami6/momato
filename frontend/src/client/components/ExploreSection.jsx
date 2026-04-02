import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { apiGetRestaurants } from '../../services/api';
import { useLocation as useLocationCtx } from '../../context/LocationContext';

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl mb-5 bg-white overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left outline-none"
      >
        <span className="text-xl font-normal text-[#1C1C1C] tracking-tight">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="text-gray-500" size={20} />
        ) : (
          <ChevronDown className="text-gray-500" size={20} />
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100 p-5 pt-0' : 'max-h-0 opacity-0'
          }`}
      >
        {children}
      </div>
    </div>
  );
};

const ExploreSection = () => {
  const [restaurants, setRestaurants] = useState([]);
  const { city } = useLocationCtx();

  useEffect(() => {
    apiGetRestaurants({ limit: 100, location: city })
      .then((data) => setRestaurants(data.restaurants || []))
      .catch(() => setRestaurants([]));
  }, [city]);

  const cuisines = useMemo(() => {
    const values = restaurants
      .flatMap((restaurant) => String(restaurant.cuisine || '').split(','))
      .map((item) => item.trim())
      .filter(Boolean);

    return [...new Set(values)].slice(0, 20);
  }, [restaurants]);

  const cities = useMemo(() => {
    const values = restaurants
      .map((restaurant) => restaurant.city)
      .filter(Boolean);

    return [...new Set(values)].slice(0, 14);
  }, [restaurants]);

  const locations = useMemo(() => {
    const values = restaurants
      .map((restaurant) => restaurant.area || restaurant.address)
      .filter(Boolean);

    return [...new Set(values)].slice(0, 9);
  }, [restaurants]);

  const restaurantTypes = ['Quick Bites', 'Casual Dining', 'Fine Dining', 'Cafes', 'Pure Veg', 'Family Dining', 'Rooftop', 'Dessert Parlours', 'Buffet'];

  const cityName = cities[0] || 'Varanasi';

  return (
    <section className="bg-[#F8F8F8] py-10 md:py-16 px-4">
      <div className="max-w-[1100px] mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#1C1C1C] mb-6 md:mb-8">
          Explore options near me
        </h2>

        {/* 1. Popular Cuisines */}
        <AccordionItem title="Popular cuisines near me">
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {cuisines.map((item) => (
              <React.Fragment key={item}>
                <Link to={`/search?q=${encodeURIComponent(item)}`} className="text-gray-500 hover:text-gray-800 text-lg transition-colors">
                  {item} near me
                </Link>
                <span className="text-gray-300 last:hidden flex items-center">•</span>
              </React.Fragment>
            ))}
          </div>
        </AccordionItem>

        {/* 2. Popular Restaurant Types */}
        <AccordionItem title="Popular restaurant types near me">
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {restaurantTypes.map((item) => (
              <React.Fragment key={item}>
                <Link to={`/search?q=${encodeURIComponent(item)}`} className="text-gray-500 hover:text-gray-800 text-lg">
                  {item} near me
                </Link>
                <span className="text-gray-300 last:hidden flex items-center">•</span>
              </React.Fragment>
            ))}
          </div>
        </AccordionItem>

        {/* 3. Cities (Grid Style) */}
        <AccordionItem title="Explore Dining Cities at Momato">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map((city) => (
              <Link key={city} to={`/search?q=&location=${encodeURIComponent(city)}`} className="text-gray-500 hover:text-gray-800 text-lg">
                {city}
              </Link>
            ))}
            <Link to="/search" className="text-[#EF4F5F] font-medium text-lg">All restaurants</Link>
          </div>
        </AccordionItem>

        {/* 4. Popular Locations */}
        <AccordionItem title="Restaurants in Popular Locations">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <Link key={loc} to={`/search?q=&location=${encodeURIComponent(loc)}`} className="text-gray-500 hover:text-gray-800 text-lg">
                {loc}
              </Link>
            ))}
          </div>
        </AccordionItem>

        {/* 5. More Fun (Special Highlight) */}
        <AccordionItem title={`Discover more in ${cityName}`}>
          <div className="flex flex-wrap gap-8">
            {['Newly opened', 'Top rated', 'Outdoor seating', 'Late night dining'].map(item => (
              <Link key={item} to={`/search?q=${encodeURIComponent(item)}`} className="text-gray-500 hover:text-[#EF4F5F] text-lg font-medium transition-all">
                {item}
              </Link>
            ))}
          </div>
        </AccordionItem>

      </div>
    </section>
  );
};

export default ExploreSection;