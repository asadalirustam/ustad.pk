import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  MapPin,
  Star,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../services/api';
import ProviderCard from '../components/ProviderCard';
import BookingModal from '../components/BookingModal';
import SmartMatchModal from '../components/SmartMatchModal';

const CATEGORIES = [
  'All',
  'Electrician',
  'Plumber',
  'AC Mechanic',
  'Home Tutor',
  'Painter',
  'Carpenter',
  'Cleaner',
  'Appliance Repair'
];

const CITIES = [
  'All',
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar'
];

const ProvidersList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minRating, setMinRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [priceMax, setPriceMax] = useState('');

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Modals
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState(null);
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);

  // Fetch providers whenever filters change
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category && category !== 'All') params.append('category', category);
        if (city && city !== 'All') params.append('city', city);
        if (search) params.append('search', search);
        if (minRating) params.append('minRating', minRating);
        if (verifiedOnly) params.append('verified', 'true');
        if (priceMax) params.append('priceMax', priceMax);
        if (sortBy) params.append('sortBy', sortBy);

        const res = await api.get(`/providers?${params.toString()}`);
        if (res.data.success) {
          setProviders(res.data.providers);
        }
      } catch (err) {
        console.error('Failed to fetch providers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [category, city, search, minRating, verifiedOnly, sortBy, priceMax]);

  const resetFilters = () => {
    setCategory('All');
    setCity('All');
    setSearch('');
    setMinRating('');
    setVerifiedOnly(false);
    setSortBy('rating');
    setPriceMax('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header & AI Match Callout */}
        <div className="bg-gradient-to-r from-brand-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Local Experts
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Browse & Book Local Ustaads
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Filter by trade, city, price range, and verified customer ratings.
            </p>
          </div>

          <button
            onClick={() => setSmartMatchOpen(true)}
            className="px-5 py-3 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Smart Matcher</span>
          </button>
        </div>

        {/* Search & Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by provider name, skills, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-sm"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="price_low">Sort: Price Low to High</option>
              <option value="price_high">Sort: Price High to Low</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="newest">Sort: Newest</option>
            </select>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="sm:hidden px-4 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Provider Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-brand-600" />
                <span>Filters</span>
              </span>
              <button
                onClick={resetFilters}
                className="text-xs text-brand-600 hover:underline font-semibold"
              >
                Reset all
              </button>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Service Category
              </label>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      category === cat
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {category === cat && <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                City / Region
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Pakistani Cities' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Minimum Rating
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Any', value: '' },
                  { label: '4.0★+', value: '4.0' },
                  { label: '4.8★+', value: '4.8' }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setMinRating(item.value)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      minRating === item.value
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Budget Slider / Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex justify-between">
                <span>Max Budget Limit</span>
                <span className="text-brand-700 font-bold">
                  {priceMax ? `PKR ${Number(priceMax).toLocaleString()}` : 'No Limit'}
                </span>
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={priceMax || 5000}
                onChange={(e) => setPriceMax(e.target.value === '5000' ? '' : e.target.value)}
                className="w-full accent-brand-600"
              />
            </div>

            {/* Verified Only Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Only</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </aside>

          {/* Provider Cards Listing */}
          <main className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Showing {providers.length} service providers</span>
              {(category !== 'All' || city !== 'All' || search || minRating || verifiedOnly) && (
                <button
                  onClick={resetFilters}
                  className="text-brand-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear active filters</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-slate-200 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No providers found matching your criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your filters, selecting 'All Cities', or lowering the minimum rating.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider._id}
                    provider={provider}
                    onBookClick={(p) => setSelectedProviderForBooking(p)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Booking and Smart Match Modals */}
      <BookingModal
        isOpen={!!selectedProviderForBooking}
        provider={selectedProviderForBooking}
        onClose={() => setSelectedProviderForBooking(null)}
      />

      <SmartMatchModal
        isOpen={smartMatchOpen}
        onClose={() => setSmartMatchOpen(false)}
        onSelectProviderForBooking={(p) => {
          setSmartMatchOpen(false);
          setSelectedProviderForBooking(p);
        }}
      />
    </div>
  );
};

export default ProvidersList;
