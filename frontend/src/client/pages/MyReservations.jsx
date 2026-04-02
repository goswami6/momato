import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, Users, MapPin, XCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiGetMyReservations, apiUpdateReservationStatus } from '../../services/api';

const statusLabel = {
  pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled',
  completed: 'Completed', 'no-show': 'No Show',
};
const statusColor = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-green-50 text-green-700',
  'no-show': 'bg-gray-100 text-gray-500',
};

const MyReservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    apiGetMyReservations()
      .then(d => setReservations(Array.isArray(d) ? d : []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    setCancelling(id);
    try {
      await apiUpdateReservationStatus(id, 'cancelled');
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    } catch (err) {
      alert(err.message || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = reservations.filter(r => ['pending', 'confirmed'].includes(r.status));
  const past = reservations.filter(r => !['pending', 'confirmed'].includes(r.status));

  return (
    <div className="min-h-screen bg-[#F8F8F8] md:pt-26 pt-14 pb-10">
      <div className="main-container py-6">
        <div className="flex items-center gap-2 text-sm text-[#696969] mb-6">
          <Link to="/" className="hover:text-[#EF4F5F]">Home</Link>
          <ChevronRight size={14} />
          <span className="text-[#1C1C1C] font-medium">My Reservations</span>
        </div>

        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-6">My Reservations</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#EF4F5F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <CalendarDays size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-bold text-[#1C1C1C] mb-2">No reservations yet</h2>
            <p className="text-sm text-[#696969] mb-6">Book a table at your favourite restaurant</p>
            <Link to="/" className="px-6 py-3 bg-[#EF4F5F] text-white rounded-xl font-semibold text-sm hover:bg-[#d63b4b] transition-colors">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#1C1C1C] mb-4">Upcoming</h2>
                <div className="space-y-3">
                  {upcoming.map(r => (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 flex-wrap">
                      {r.restaurant?.image ? (
                        <img src={r.restaurant.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <CalendarDays size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/restaurant/${r.restaurantId}`} className="text-[15px] font-bold text-[#1C1C1C] hover:text-[#EF4F5F]">
                            {r.restaurant?.name || 'Restaurant'}
                          </Link>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor[r.status]}`}>
                            {statusLabel[r.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#696969] flex-wrap mt-1">
                          <span className="flex items-center gap-1"><CalendarDays size={13} /> {r.date}</span>
                          <span className="flex items-center gap-1"><Clock size={13} /> {r.time}</span>
                          <span className="flex items-center gap-1"><Users size={13} /> {r.partySize} guests</span>
                        </div>
                        {r.restaurant?.address && (
                          <p className="text-xs text-[#9C9C9C] mt-1 flex items-center gap-1">
                            <MapPin size={11} /> {r.restaurant.address}
                          </p>
                        )}
                        {r.specialRequests && (
                          <p className="text-xs text-[#9C9C9C] mt-1 italic">"{r.specialRequests}"</p>
                        )}
                      </div>
                      {r.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancelling === r.id}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors"
                        >
                          <XCircle size={13} /> {cancelling === r.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#1C1C1C] mb-4">Past</h2>
                <div className="space-y-3">
                  {past.map(r => (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 opacity-75 flex-wrap">
                      {r.restaurant?.image ? (
                        <img src={r.restaurant.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <CalendarDays size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#1C1C1C]">{r.restaurant?.name || 'Restaurant'}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[r.status]}`}>
                            {statusLabel[r.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#696969] flex-wrap">
                          <span className="flex items-center gap-1"><CalendarDays size={12} /> {r.date}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {r.time}</span>
                          <span className="flex items-center gap-1"><Users size={12} /> {r.partySize}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
