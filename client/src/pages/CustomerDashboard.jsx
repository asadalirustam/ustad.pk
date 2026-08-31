import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Star,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import ReviewModal from '../components/ReviewModal';
import SmartMatchModal from '../components/SmartMatchModal';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [reviewBooking, setReviewBooking] = useState(null);
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Listen to live booking status updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      console.log('[CustomerDashboard] Live socket update received:', data);
      setBookings((prev) =>
        prev.map((b) => (b._id === data.bookingId ? { ...b, status: data.status } : b))
      );
    };

    socket.on('booking_status_updated', handleStatusUpdate);

    return () => {
      socket.off('booking_status_updated', handleStatusUpdate);
    };
  }, [socket]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, {
        status: 'cancelled',
        note: 'Cancelled by customer'
      });
      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const activeCount = bookings.filter((b) => b.status === 'accepted').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Welcome back, {user?.name || 'Customer'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Track your real-time appointments and leave verified reviews for your Ustaads.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setSmartMatchOpen(true)}
              className="flex-1 md:flex-none px-4 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl border border-brand-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>AI Match Ustaad</span>
            </button>
            <Link
              to="/providers"
              className="flex-1 md:flex-none px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Service</span>
            </Link>
          </div>
        </div>

        {/* Stats Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">
                Pending Requests
              </div>
              <div className="text-2xl font-black text-amber-600 mt-0.5">
                {pendingCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              ⏳
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">
                Active / Accepted Jobs
              </div>
              <div className="text-2xl font-black text-blue-600 mt-0.5">
                {activeCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              🛠️
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">
                Completed Bookings
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-0.5">
                {completedCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ✅
            </div>
          </div>
        </div>

        {/* Bookings Table / List Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filter Tabs */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { label: 'All Bookings', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Accepted', value: 'accepted' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilterStatus(tab.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    filterStatus === tab.value
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchBookings}
              className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Bookings Rows */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading your bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                No bookings in this category
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ready for home repairs or tuition? Connect with verified Ustaads now.
              </p>
              <Link
                to="/providers"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                <span>Find Providers</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredBookings.map((b) => {
                const provUser = b.providerId?.userId || {};
                const isCompleted = b.status === 'completed';
                const canCancel = b.status === 'pending' || b.status === 'accepted';

                return (
                  <div
                    key={b._id}
                    className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={b.status} />
                        <span className="text-xs font-bold text-slate-400">
                          #{b._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">
                          {b.serviceCategory}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {b.serviceTitle || `${b.serviceCategory} Service`}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <span>Ustaad: {provUser.name || 'Assigned Provider'}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(b.date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.timeSlot}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.location?.address}</span>
                        </div>
                      </div>

                      {b.notes && (
                        <p className="text-xs text-slate-500 italic bg-slate-100/70 p-2 rounded-xl">
                          Note: "{b.notes}"
                        </p>
                      )}
                    </div>

                    {/* Right side: Pricing & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full lg:w-auto gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Agreed Price
                        </span>
                        <div className="text-base font-black text-slate-900">
                          PKR {(b.finalPrice || b.budget)?.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Leave Review Button */}
                        {isCompleted && !b.hasReview && (
                          <button
                            onClick={() => setReviewBooking(b)}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Leave Review</span>
                          </button>
                        )}

                        {isCompleted && b.hasReview && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reviewed</span>
                          </span>
                        )}

                        {/* Cancel Button */}
                        {canCancel && (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            disabled={cancellingId === b._id}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl transition-all"
                          >
                            {cancellingId === b._id ? 'Cancelling...' : 'Cancel Request'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!reviewBooking}
        booking={reviewBooking}
        onClose={() => setReviewBooking(null)}
        onReviewSubmitted={() => {
          fetchBookings();
          setReviewBooking(null);
        }}
      />

      {/* Smart Match Modal */}
      <SmartMatchModal
        isOpen={smartMatchOpen}
        onClose={() => setSmartMatchOpen(false)}
      />
    </div>
  );
};

export default CustomerDashboard;
