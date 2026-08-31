import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Star,
  CheckCircle2,
  DollarSign,
  Phone,
  Mail,
  ArrowLeft,
  Sparkles,
  Zap,
  Droplets,
  Airplay,
  GraduationCap,
  Paintbrush,
  Hammer,
  Wrench
} from 'lucide-react';
import api from '../services/api';
import StarRating from '../components/StarRating';
import BookingModal from '../components/BookingModal';

const ProviderProfile = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/providers/${id}`);
        if (res.data.success) {
          setProvider(res.data.provider);
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to fetch provider profile:', err);
        setError('Provider profile not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{error || 'Provider not found'}</h2>
        <Link
          to="/providers"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all providers</span>
        </Link>
      </div>
    );
  }

  const user = provider.userId || {};

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          to="/providers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Service Providers</span>
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-brand-700 to-emerald-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-brand-600/20 shrink-0">
              {user.name?.charAt(0) || 'U'}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {user.name}
                </h1>
                {provider.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Ustaad
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Verification In Progress
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">
                  {provider.category}
                </span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{provider.location?.address || `${provider.location?.city}, Pakistan`}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{provider.experienceYears || 3}+ Years Experience</span>
                </div>
              </div>

              {/* Rating and total jobs */}
              <div className="flex items-center gap-3 pt-1">
                <StarRating
                  rating={provider.avgRating}
                  totalReviews={provider.totalReviews}
                  showNumber
                  size="md"
                />
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-700">
                  {provider.completedBookingsCount || 0} Successful Jobs Completed
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setBookingModalOpen(true)}
            className="w-full md:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-xl shadow-brand-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* 2-Column Grid: Details Left, Booking Widget Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About / Bio */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                About {user.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {provider.bio ||
                  `${user.name} is a certified ${provider.category} providing reliable and affordable services across ${provider.location?.city}.`}
              </p>
            </div>

            {/* Skills & Expertise */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Skills & Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {provider.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Weekly Availability Schedule */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Working Days & Available Time Slots</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.availability?.map((avail, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5"
                  >
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{avail.day}</span>
                      <span className="text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md font-semibold">
                        Available
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {avail.slots?.join('  |  ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Verified Customer Reviews ({reviews.length})
                </h3>
                <StarRating rating={provider.avgRating} showNumber size="sm" />
              </div>

              {reviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No customer reviews yet. Be the first to book and share your feedback!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                            {rev.customerId?.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {rev.customerId?.name || 'Customer'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {rev.customerId?.city || 'Lahore'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <StarRating rating={rev.rating} size="sm" />
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Booking Card on Right */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6 sticky top-24">
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400">
                  Standard Pricing Tier
                </span>
                <div className="text-2xl font-black text-slate-900">
                  PKR {provider.priceRange?.min?.toLocaleString()} - {provider.priceRange?.max?.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500">
                  Rates vary depending on scope of repair and parts required.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-bold text-slate-800">{provider.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Base City:</span>
                  <span className="font-bold text-slate-800">{provider.location?.city}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Response Speed:</span>
                  <span className="font-bold text-emerald-600">Within 30 mins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment:</span>
                  <span className="font-bold text-slate-800">Cash on Completion / Online</span>
                </div>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Booking Now</span>
              </button>

              <div className="text-[11px] text-center text-slate-400">
                🔒 Safe Booking Guarantee & verified ID on Ustaad.pk
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={bookingModalOpen}
        provider={provider}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};

export default ProviderProfile;
