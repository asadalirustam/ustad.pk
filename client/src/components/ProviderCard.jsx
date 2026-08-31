import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Droplets,
  Airplay,
  GraduationCap,
  Paintbrush,
  Hammer,
  Wrench
} from 'lucide-react';
import StarRating from './StarRating';

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'electrician':
      return <Zap className="w-5 h-5 text-amber-500" />;
    case 'plumber':
      return <Droplets className="w-5 h-5 text-cyan-500" />;
    case 'ac mechanic':
      return <Airplay className="w-5 h-5 text-blue-500" />;
    case 'home tutor':
      return <GraduationCap className="w-5 h-5 text-indigo-500" />;
    case 'painter':
      return <Paintbrush className="w-5 h-5 text-rose-500" />;
    case 'carpenter':
      return <Hammer className="w-5 h-5 text-amber-700" />;
    default:
      return <Wrench className="w-5 h-5 text-brand-600" />;
  }
};

const ProviderCard = ({ provider, onBookClick, matchData = null }) => {
  const user = provider.userId || {};
  const priceMin = provider.priceRange?.min || 500;
  const priceMax = provider.priceRange?.max || 2500;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Header Banner for Smart Match score if present */}
      {matchData && (
        <div className="bg-gradient-to-r from-brand-600 to-teal-600 px-4 py-2 text-white text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Smart Match: {matchData.scores?.matchPercentage || 95}%</span>
          </div>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
            {matchData.distanceKm} km away
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Top bar: Category badge and Verification */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/90 rounded-full text-xs font-semibold text-slate-700">
            {getCategoryIcon(provider.category)}
            <span>{provider.category}</span>
          </div>

          {provider.verified ? (
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Ustaad</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              <span>Under Review</span>
            </div>
          )}
        </div>

        {/* Name and Rating */}
        <div className="mb-3">
          <Link
            to={`/providers/${provider._id}`}
            className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1"
          >
            {user.name || 'Service Provider'}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <StarRating
              rating={provider.avgRating}
              totalReviews={provider.totalReviews}
              showNumber
              size="sm"
            />
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {provider.completedBookingsCount || 0} jobs completed
            </span>
          </div>
        </div>

        {/* Location & Experience */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {provider.location?.address || `${provider.location?.city || 'Lahore'}, Pakistan`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{provider.experienceYears || 3}+ years verified experience</span>
          </div>
        </div>

        {/* Bio preview */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {provider.bio || `Specialized ${provider.category} providing trusted home services.`}
        </p>

        {/* Skills pill tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {provider.skills?.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200"
            >
              {skill}
            </span>
          ))}
          {provider.skills?.length > 3 && (
            <span className="text-[11px] font-medium text-slate-400 self-center">
              +{provider.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer bar: Pricing & Booking button */}
      <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
            Rate Range
          </span>
          <div className="text-sm font-extrabold text-slate-900">
            PKR {priceMin.toLocaleString()} - {priceMax.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/providers/${provider._id}`}
            className="p-2 rounded-xl text-slate-600 hover:text-brand-600 hover:bg-slate-200/60 transition-colors text-xs font-semibold"
            title="View Details"
          >
            Details
          </Link>
          <button
            onClick={() => onBookClick && onBookClick(provider)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all duration-200 flex items-center gap-1"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
