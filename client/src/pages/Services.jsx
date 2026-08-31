import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Droplets,
  Airplay,
  GraduationCap,
  Paintbrush,
  Hammer,
  Sparkles,
  Wrench,
  ArrowRight,
  Clock,
  CheckCircle2,
  Search
} from 'lucide-react';
import api from '../services/api';

const getServiceIcon = (iconName) => {
  switch (iconName) {
    case 'Zap':
      return <Zap className="w-6 h-6 text-amber-500" />;
    case 'Droplets':
      return <Droplets className="w-6 h-6 text-cyan-500" />;
    case 'Airplay':
      return <Airplay className="w-6 h-6 text-blue-500" />;
    case 'GraduationCap':
      return <GraduationCap className="w-6 h-6 text-indigo-500" />;
    case 'Paintbrush':
      return <Paintbrush className="w-6 h-6 text-rose-500" />;
    case 'Hammer':
      return <Hammer className="w-6 h-6 text-amber-800" />;
    case 'Sparkles':
      return <Sparkles className="w-6 h-6 text-emerald-500" />;
    default:
      return <Wrench className="w-6 h-6 text-brand-600" />;
  }
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.success) {
          setServices(res.data.services);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
            Transparent Rates & Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            All Home & Technical Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Explore standard service tiers with estimated durations and transparent baseline PKR pricing.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto mt-6">
            <input
              type="text"
              placeholder="Search service name, e.g. AC service, wiring..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 p-6 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                      {getServiceIcon(service.icon)}
                    </div>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                      {service.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.estimatedDuration || '1 - 2 hours'}</span>
                    </div>
                    <div className="font-extrabold text-slate-900">
                      Starting PKR {service.basePrice?.toLocaleString()}
                    </div>
                  </div>

                  <Link
                    to={`/providers?category=${encodeURIComponent(service.category)}`}
                    className="w-full py-2.5 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Available {service.category}s</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
