import React, { useState } from 'react';
import {
  Sparkles,
  X,
  MapPin,
  Compass,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import api from '../services/api';
import StarRating from './StarRating';

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

const SmartMatchModal = ({ isOpen, onClose, onSelectProviderForBooking }) => {
  const [category, setCategory] = useState('Electrician');
  const [city, setCity] = useState('Lahore');
  const [budget, setBudget] = useState('1500');
  const [customCoords, setCustomCoords] = useState(null);
  const [loadingCoords, setLoadingCoords] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingCoords(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomCoords({
          lat: pos.coords.latitude,
          long: pos.coords.longitude
        });
        setLoadingCoords(false);
      },
      (err) => {
        console.warn('GPS location access denied or timed out:', err.message);
        setLoadingCoords(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFindMatches = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        category,
        customerCity: city,
        customerBudget: Number(budget) || undefined,
        customerLat: customCoords?.lat,
        customerLong: customCoords?.long,
        limit: 5
      };

      const res = await api.post('/providers/match', payload);
      if (res.data.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Smart match error:', err);
      setError(err.response?.data?.message || 'Failed to calculate smart matches.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-900 via-brand-700 to-teal-800 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Match Algorithm</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              AI Weighted Service Matching
            </h3>
            <p className="text-xs text-emerald-100/80">
              Formula: (Rating × 40%) + (Proximity × 30%) + (Price Match × 30%)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Input Form */}
          <form onSubmit={handleFindMatches} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Service Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <Layers className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* City / Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Your Location</span>
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    className="text-[10px] text-brand-600 hover:underline flex items-center gap-0.5"
                  >
                    <Compass className="w-3 h-3" />
                    <span>{customCoords ? 'GPS Active' : 'Use GPS'}</span>
                  </button>
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setCustomCoords(null);
                    }}
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Lahore">Lahore (Default)</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                  </select>
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Stated Budget */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Budget (PKR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="100"
                    min="300"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-brand-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-600" />
                <span>Haversine distance will calculate shortest proximity</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Smart Match</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Matches Output List */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Top Ranked Ustaads in {results.category}</span>
                  <span className="bg-brand-100 text-brand-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {results.matches?.length || 0} Matches
                  </span>
                </h4>
              </div>

              {results.matches?.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No providers currently registered in this category or location.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.matches.map((item, index) => {
                    const prov = item.provider;
                    const matchPct = item.scores?.matchPercentage || 90;

                    return (
                      <div
                        key={prov._id}
                        className="bg-white border-2 border-slate-100 hover:border-brand-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center">
                              #{index + 1}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {prov.userId?.name || 'Service Provider'}
                            </span>
                            {prov.verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <StarRating rating={prov.avgRating} size="sm" showNumber />
                            <span className="text-slate-300">•</span>
                            <span className="font-medium text-slate-700">
                              📍 {item.distanceKm} km away ({prov.location?.city})
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-bold text-slate-900">
                              PKR {prov.priceRange?.min} - {prov.priceRange?.max}
                            </span>
                          </div>

                          {/* Score breakdown metrics */}
                          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-500">
                            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <div className="text-slate-400 font-medium">Rating (40%)</div>
                              <div className="font-bold text-slate-800">
                                {Math.round(item.scores.ratingScore * 100)}%
                              </div>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <div className="text-slate-400 font-medium">Proximity (30%)</div>
                              <div className="font-bold text-slate-800">
                                {Math.round(item.scores.proximityScore * 100)}%
                              </div>
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <div className="text-slate-400 font-medium">Budget Fit (30%)</div>
                              <div className="font-bold text-slate-800">
                                {Math.round(item.scores.priceScore * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Overall score badge & Action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-2xl font-black text-brand-600">
                              {matchPct}%
                            </div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                              Match Score
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onClose();
                              if (onSelectProviderForBooking) {
                                onSelectProviderForBooking(prov);
                              }
                            }}
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartMatchModal;
