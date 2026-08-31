import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Briefcase,
  DollarSign,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Calendar,
  Search,
  Filter,
  Trash2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'providers', 'flagged_reviews', 'bookings'
  const [analytics, setAnalytics] = useState(null);
  const [providers, setProviders] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [providerFilter, setProviderFilter] = useState('all'); // 'all', 'verified', 'unverified'
  const [bookingFilter, setBookingFilter] = useState('all');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, providersRes, flaggedRes, bookingsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/providers'),
        api.get('/reviews/admin/flagged'),
        api.get('/admin/bookings')
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.analytics);
      if (providersRes.data.success) setProviders(providersRes.data.providers);
      if (flaggedRes.data.success) setFlaggedReviews(flaggedRes.data.reviews);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Toggle Provider Verification
  const handleToggleVerification = async (providerId, currentStatus) => {
    try {
      const res = await api.put(`/admin/providers/${providerId}/verify`, {
        verified: !currentStatus
      });
      if (res.data.success) {
        setProviders((prev) =>
          prev.map((p) => (p._id === providerId ? { ...p, verified: !currentStatus } : p))
        );
        fetchAdminData(); // Refresh metrics
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle verification');
    }
  };

  // Moderate Flagged Review (Approve or Remove)
  const handleModerateReview = async (reviewId, action) => {
    try {
      const res = await api.put(`/reviews/admin/${reviewId}/moderate`, { action });
      if (res.data.success) {
        setFlaggedReviews((prev) => prev.filter((r) => r._id !== reviewId));
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to moderate review');
    }
  };

  const filteredProviders = providers.filter((p) => {
    if (providerFilter === 'verified') return p.verified;
    if (providerFilter === 'unverified') return !p.verified;
    return true;
  });

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/30">
              Ustaad.pk Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Platform Oversight & Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Verify service providers, moderate anti-fraud reviews, and analyze transaction volume.
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'analytics', label: '📊 Platform Analytics', count: null },
            {
              id: 'providers',
              label: '🛠️ Provider Verifications',
              count: analytics?.users?.pendingVerification || null
            },
            {
              id: 'flagged_reviews',
              label: '🛡️ Flagged Fake Reviews Desk',
              count: flaggedReviews.length || null,
              isAlert: flaggedReviews.length > 0
            },
            { id: 'bookings', label: '📅 All Bookings Monitor', count: bookings.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    tab.isAlert
                      ? 'bg-rose-500 text-white animate-pulse'
                      : activeTab === tab.id
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: Analytics Overview */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Gross Platform Volume
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  PKR {(analytics.finance?.grossVolume || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">Total job value serviced</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Total Bookings
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {analytics.bookings?.total || 0}
                </div>
                <div className="text-[11px] text-slate-400">
                  {analytics.bookings?.completed || 0} completed successfully
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Registered Providers
                </div>
                <div className="text-2xl font-black text-brand-600">
                  {analytics.users?.providers || 0}
                </div>
                <div className="text-[11px] text-slate-400">
                  {analytics.users?.verifiedProviders || 0} verified with CNIC
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">
                  Household Customers
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {analytics.users?.customers || 0}
                </div>
                <div className="text-[11px] text-slate-400">Active accounts</div>
              </div>
            </div>

            {/* Category Breakdown & Top Providers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Bookings by Service Trade</span>
                </h3>

                <div className="space-y-3">
                  {analytics.categoryBreakdown?.map((item) => (
                    <div key={item.category} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{item.category}</span>
                        <span>{item.bookingsCount} bookings</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.bookingsCount / (analytics.bookings?.total || 1)) * 100
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Active Providers */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Top Rated Active Ustaads</span>
                </h3>

                <div className="divide-y divide-slate-100">
                  {analytics.topProviders?.map((prov) => (
                    <div
                      key={prov._id}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">
                          {prov.userId?.name || 'Provider'}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {prov.category} • {prov.location?.city}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-amber-600">
                          ⭐ {prov.avgRating?.toFixed(1) || '5.0'} / 5.0
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {prov.completedBookingsCount || 0} jobs completed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Provider Verification Desk */}
        {activeTab === 'providers' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Provider Verifications Management
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect registration credentials and toggle verified badge.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="all">All Providers ({providers.length})</option>
                  <option value="unverified">Unverified Only</option>
                  <option value="verified">Verified Only</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {filteredProviders.map((p) => {
                const u = p.userId || {};
                return (
                  <div
                    key={p._id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {u.name || 'Provider Name'}
                        </span>
                        {p.verified ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                            <ShieldAlert className="w-3 h-3" /> Unverified
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                        <span>📍 {p.location?.city || u.city}</span>
                        <span>📞 {u.phone || 'No phone'}</span>
                        <span>✉️ {u.email}</span>
                        <span>
                          💰 PKR {p.priceRange?.min} - {p.priceRange?.max}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleVerification(p._id, p.verified)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          p.verified
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                        }`}
                      >
                        {p.verified ? 'Revoke Verification' : 'Approve & Verify'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Flagged Reviews Moderation */}
        {activeTab === 'flagged_reviews' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200 space-y-6 p-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Anti-Fraud Fake Review Moderation Desk</span>
              </h3>
              <p className="text-xs text-slate-500">
                Rule triggered when 3+ rapid reviews are left for the same provider within a short window.
              </p>
            </div>

            {flaggedReviews.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  No flagged reviews pending moderation!
                </div>
                <p className="text-xs text-slate-400">
                  All marketplace ratings are verified and clean.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedReviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 bg-amber-50/60 rounded-2xl border-2 border-amber-200 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-amber-900">
                          Trigger Reason: {rev.flagReason}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Submitted on {new Date(rev.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <StarRating rating={rev.rating} size="sm" showNumber />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block">Reviewer (Customer):</span>
                        <strong className="text-slate-800">
                          {rev.customerId?.name} ({rev.customerId?.email})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Service Provider:</span>
                        <strong className="text-slate-800">
                          {rev.providerId?.userId?.name}
                        </strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleModerateReview(rev._id, 'remove')}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Fake Review</span>
                      </button>
                      <button
                        onClick={() => handleModerateReview(rev._id, 'approve')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Review</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: All Bookings Monitor */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Global Bookings Monitor
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time visibility across all system bookings and appointments.
                </p>
              </div>

              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="all">All Bookings ({bookings.length})</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {filteredBookings.map((b) => (
                <div
                  key={b._id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} />
                      <span className="font-bold text-slate-900 text-sm">
                        {b.serviceCategory}
                      </span>
                      <span className="text-xs text-slate-400">
                        #{b._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span>Customer: {b.customerId?.name || 'Customer'}</span>
                      <span>•</span>
                      <span>
                        Provider: {b.providerId?.userId?.name || 'Assigned Ustaad'}
                      </span>
                      <span>•</span>
                      <span>📅 {new Date(b.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>📍 {b.location?.city}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Amount
                    </span>
                    <div className="text-sm font-black text-slate-900">
                      PKR {(b.finalPrice || b.budget)?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
