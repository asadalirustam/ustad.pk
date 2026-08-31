import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Droplets,
  Airplay,
  GraduationCap,
  Paintbrush,
  Hammer,
  Sparkle,
  Wrench,
  Star,
  Clock,
  MapPin,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import api from '../services/api';
import ProviderCard from '../components/ProviderCard';
import BookingModal from '../components/BookingModal';
import SmartMatchModal from '../components/SmartMatchModal';

const CATEGORIES = [
  { name: 'Electrician', icon: Zap, color: 'from-amber-500 to-orange-500', count: '45+ Ustaads' },
  { name: 'Plumber', icon: Droplets, color: 'from-cyan-500 to-blue-500', count: '38+ Ustaads' },
  { name: 'AC Mechanic', icon: Airplay, color: 'from-blue-600 to-indigo-600', count: '50+ Ustaads' },
  { name: 'Home Tutor', icon: GraduationCap, color: 'from-indigo-500 to-purple-500', count: '60+ Tutors' },
  { name: 'Painter', icon: Paintbrush, color: 'from-rose-500 to-pink-500', count: '28+ Ustaads' },
  { name: 'Carpenter', icon: Hammer, color: 'from-amber-700 to-amber-900', count: '32+ Ustaads' },
  { name: 'Cleaner', icon: Sparkle, color: 'from-emerald-500 to-teal-500', count: '40+ Helpers' },
  { name: 'Appliance Repair', icon: Wrench, color: 'from-slate-700 to-slate-900', count: '35+ Ustaads' }
];

const Home = () => {
  const navigate = useNavigate();
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Bar state
  const [searchCategory, setSearchCategory] = useState('All');
  const [searchCity, setSearchCity] = useState('Lahore');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState(null);
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/providers?sortBy=rating');
        if (res.data.success) {
          setFeaturedProviders(res.data.providers.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load featured providers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCategory !== 'All') params.append('category', searchCategory);
    if (searchCity !== 'All') params.append('city', searchCity);
    if (searchQuery) params.append('search', searchQuery);
    navigate(`/providers?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-slate-900 to-teal-950 text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
        {/* Background glow ornaments */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-bold tracking-wide animate-pulse-slow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pakistan's #1 AI-Matched Local Service Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Find Verified{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200">
                Ustaads & Tutors
              </span>{' '}
              in Minutes
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              From emergency electrical fixes in Lahore to AC repairs in Karachi —
              our intelligent weighted algorithm matches you with top-rated,
              verified local experts at transparent Pakistani Rupee rates.
            </p>

            {/* Search Box Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/40 text-slate-900 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-2 mt-8"
            >
              {/* Category selector */}
              <div className="sm:col-span-4 relative">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full h-12 pl-4 pr-8 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City selector */}
              <div className="sm:col-span-3 relative">
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full h-12 pl-4 pr-8 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="All">All Cities</option>
                </select>
              </div>

              {/* Keywords / Search */}
              <div className="sm:col-span-3 relative">
                <input
                  type="text"
                  placeholder="e.g. UPS repair, Solar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Search submit button */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* AI Smart Match Callout banner */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
              <span>Looking for an instant algorithmic match?</span>
              <button
                onClick={() => setSmartMatchOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold transition-colors border border-emerald-400/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch AI Smart Matcher →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-brand-700">100%</div>
            <div className="text-xs font-bold text-slate-600">CNIC Verified Providers</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-brand-700">4.9 ★</div>
            <div className="text-xs font-bold text-slate-600">Average Job Satisfaction</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-brand-700">30 Min</div>
            <div className="text-xs font-bold text-slate-600">Avg. Response Time</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-brand-700">10+ Cities</div>
            <div className="text-xs font-bold text-slate-600">Nationwide Coverage</div>
          </div>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
              Browse by Trade
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Popular Service Categories
            </h2>
          </div>
          <Link
            to="/services"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start"
          >
            <span>View all services catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/providers?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.count}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Explore Ustaads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-400">
              Simple & Reliable
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              How Ustaad.pk Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Three transparent steps to get your repairs and home lessons sorted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 font-extrabold text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-white">Select Service & Location</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose the category you need and specify your city/area in Lahore, Karachi, Islamabad, or other regions.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 font-extrabold text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-white">AI Weighted Smart Match</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our smart algorithm scores providers based on customer ratings (40%), proximity distance (30%), and budget alignment (30%).
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-white">Instant Booking & Live Sync</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pick a slot, get instant confirmation via real-time Socket.io updates, and leave verified ratings post-completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Providers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
              Top Rated
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Featured Service Providers
            </h2>
          </div>
          <Link
            to="/providers"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start"
          >
            <span>View all providers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-slate-200/70 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <ProviderCard
                key={provider._id}
                provider={provider}
                onBookClick={(p) => setSelectedProviderForBooking(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA Join as Ustaad banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-4 max-w-xl">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Earn with Dignity
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Are You an Electrician, Plumber, or Tutor?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Join thousands of skilled professionals earning direct income across Pakistan. Set your own pricing rates and working hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Link
              to="/register?role=provider"
              className="px-6 py-3.5 bg-white text-brand-800 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-lg transition-all text-center"
            >
              Register as an Ustaad
            </Link>
            <button
              onClick={() => setSmartMatchOpen(true)}
              className="px-6 py-3.5 bg-brand-900/60 hover:bg-brand-900 text-white font-bold text-xs rounded-xl border border-white/20 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Test AI Match</span>
            </button>
          </div>
        </div>
      </section>

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

export default Home;
