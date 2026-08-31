import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  DollarSign,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  User,
  MapPin,
  Calendar,
  Save,
  AlertCircle,
  Bell,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';

const CATEGORIES = [
  'Electrician',
  'Plumber',
  'AC Mechanic',
  'Home Tutor',
  'Painter',
  'Carpenter',
  'Cleaner',
  'Appliance Repair'
];

const ProviderDashboard = () => {
  const { user, refreshProfile } = useAuth();
  const { socket } = useSocket();

  const [stats, setStats] = useState(null);
  const [provider, setProvider] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'profile'

  // Profile update form state
  const [profileForm, setProfileForm] = useState({
    category: '',
    skills: '',
    priceMin: 500,
    priceMax: 2500,
    experienceYears: 3,
    bio: '',
    city: 'Lahore',
    address: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/providers/dashboard/stats'),
        api.get('/bookings/my')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setProvider(statsRes.data.provider);

        const p = statsRes.data.provider;
        setProfileForm({
          category: p.category || 'Electrician',
          skills: p.skills?.join(', ') || '',
          priceMin: p.priceRange?.min || 500,
          priceMax: p.priceRange?.max || 2500,
          experienceYears: p.experienceYears || 3,
          bio: p.bio || '',
          city: p.location?.city || 'Lahore',
          address: p.location?.address || ''
        });
      }

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load provider dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen to live booking requests via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = (data) => {
      console.log('[ProviderDashboard] Live new_booking_request received:', data);
      if (data.booking) {
        setBookings((prev) => [data.booking, ...prev]);
        setStats((prev) =>
          prev ? { ...prev, pendingCount: (prev.pendingCount || 0) + 1 } : prev
        );
      }
    };

    socket.on('new_booking_request', handleNewRequest);

    return () => {
      socket.off('new_booking_request', handleNewRequest);
    };
  }, [socket]);

  // Handle status actions: Accept, Reject, Complete
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, {
        status: newStatus
      });

      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
        fetchDashboardData(); // Refresh earnings and counters
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Save profile settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess('');

    try {
      const payload = {
        category: profileForm.category,
        skills: profileForm.skills.split(',').map((s) => s.trim()),
        priceMin: Number(profileForm.priceMin),
        priceMax: Number(profileForm.priceMax),
        experienceYears: Number(profileForm.experienceYears),
        bio: profileForm.bio,
        city: profileForm.city,
        address: profileForm.address
      };

      const res = await api.put('/providers/profile', payload);
      if (res.data.success) {
        setSaveSuccess('Provider profile updated successfully!');
        setProvider(res.data.provider);
        refreshProfile();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const activeBookings = bookings.filter((b) => b.status === 'accepted');
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected'
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Provider Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Ustaad Dashboard
              </span>
              {provider?.verified ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Partner
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Pending Admin Verification
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {user?.name || 'Service Provider'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {provider?.category} • {provider?.location?.city || 'Lahore'} • Real-time Booking Dispatch Active
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Job Requests ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Profile & Availability
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">
              Total Earnings
            </div>
            <div className="text-2xl font-black text-emerald-600">
              PKR {(stats?.totalEarnings || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">From completed jobs</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">
              Completed Jobs
            </div>
            <div className="text-2xl font-black text-slate-900">
              {stats?.completedCount || 0}
            </div>
            <div className="text-[11px] text-slate-400">Successful deliveries</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">
              Average Rating
            </div>
            <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
              <span>{stats?.avgRating ? stats.avgRating.toFixed(1) : '5.0'}</span>
              <span className="text-base text-slate-400">/ 5.0</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {stats?.totalReviews || 0} verified reviews
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">
              New Requests
            </div>
            <div className="text-2xl font-black text-brand-600 animate-pulse">
              {pendingBookings.length}
            </div>
            <div className="text-[11px] text-slate-400">Requires your response</div>
          </div>
        </div>

        {/* Tab 1: Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="space-y-8">
            {/* 1. Pending Action Items */}
            {pendingBookings.length > 0 && (
              <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
                    <h3 className="text-base font-extrabold text-amber-900">
                      Incoming Booking Requests ({pendingBookings.length})
                    </h3>
                  </div>
                  <span className="text-xs text-amber-700 font-semibold">
                    Accept or decline promptly
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingBookings.map((b) => (
                    <div
                      key={b._id}
                      className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {b.customerId?.name || 'Customer'}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {b.customerId?.phone || 'No phone'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            {b.serviceCategory}
                          </span>
                          <span>📅 {new Date(b.date).toLocaleDateString()}</span>
                          <span>⏰ {b.timeSlot}</span>
                          <span>📍 {b.location?.address}</span>
                        </div>

                        {b.notes && (
                          <div className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl">
                            "{b.notes}"
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">
                            Offered Budget
                          </div>
                          <div className="text-base font-black text-brand-700">
                            PKR {b.budget?.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'rejected')}
                            disabled={updatingId === b._id}
                            className="px-3.5 py-2 border border-slate-200 hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl transition-all"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'accepted')}
                            disabled={updatingId === b._id}
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Job</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Active & Accepted Jobs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Active / Accepted Appointments ({activeBookings.length})
              </h3>

              {activeBookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No currently active jobs in progress.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeBookings.map((b) => (
                    <div
                      key={b._id}
                      className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={b.status} />
                          <span className="font-bold text-slate-900 text-sm">
                            {b.customerId?.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            • 📞 {b.customerId?.phone}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex flex-wrap gap-3 pt-1">
                          <span>📅 {new Date(b.date).toLocaleDateString()}</span>
                          <span>⏰ {b.timeSlot}</span>
                          <span>📍 {b.location?.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-bold">
                            Payment Expected
                          </div>
                          <div className="text-sm font-black text-slate-900">
                            PKR {(b.finalPrice || b.budget)?.toLocaleString()}
                          </div>
                        </div>

                        <button
                          onClick={() => handleUpdateStatus(b._id, 'completed')}
                          disabled={updatingId === b._id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Job History */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Job History & Records ({pastBookings.length})
              </h3>

              {pastBookings.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No completed jobs yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pastBookings.slice(0, 10).map((b) => (
                    <div
                      key={b._id}
                      className="py-3.5 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={b.status} />
                          <span className="font-bold text-slate-800">
                            {b.customerId?.name || 'Customer'}
                          </span>
                          <span className="text-slate-400">• {b.serviceCategory}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {new Date(b.date).toLocaleDateString()} • {b.location?.city}
                        </div>
                      </div>

                      <div className="font-black text-slate-900">
                        PKR {(b.finalPrice || b.budget)?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Profile & Availability Settings */}
        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-3xl"
          >
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Manage Profile & Working Rates
              </h3>
              <p className="text-xs text-slate-500">
                Update your trade skills, price range, and service area.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Category / Trade
                </label>
                <select
                  value={profileForm.category}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={profileForm.experienceYears}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      experienceYears: e.target.value
                    })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Skills & Specializations (comma separated)
              </label>
              <input
                type="text"
                value={profileForm.skills}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, skills: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Min Rate (PKR)
                </label>
                <input
                  type="number"
                  step="100"
                  value={profileForm.priceMin}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, priceMin: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-brand-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Rate (PKR)
                </label>
                <input
                  type="number"
                  step="100"
                  value={profileForm.priceMax}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, priceMax: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-brand-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Base City
                </label>
                <select
                  value={profileForm.city}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, city: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area / Coverage Address
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bio & Work Experience
              </label>
              <textarea
                rows="3"
                value={profileForm.bio}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, bio: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
