import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TIME_SLOTS = [
  '09:00 - 12:00 (Morning)',
  '12:00 - 15:00 (Afternoon)',
  '15:00 - 18:00 (Late Afternoon)',
  '18:00 - 21:00 (Evening)'
];

const BookingModal = ({ isOpen, onClose, provider, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Tomorrow as default min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: minDateString,
    timeSlot: TIME_SLOTS[0],
    address: user?.address || 'Gulberg, Lahore',
    city: user?.city || 'Lahore',
    budget: provider?.priceRange?.min || 1000,
    notes: '',
    serviceTitle: `${provider?.category || 'Service'} Booking`
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  if (!isOpen || !provider) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=booking');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        providerId: provider._id,
        serviceCategory: provider.category,
        serviceTitle: formData.serviceTitle,
        date: formData.date,
        timeSlot: formData.timeSlot,
        address: formData.address,
        city: formData.city,
        budget: Number(formData.budget),
        notes: formData.notes,
        lat: provider.location?.lat,
        long: provider.location?.long
      };

      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setSuccessBooking(res.data.booking);
        if (onBookingSuccess) {
          onBookingSuccess(res.data.booking);
        }
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit booking request.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessBooking(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-700 via-brand-600 to-teal-700 text-white flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
              Confirm Appointment
            </div>
            <h3 className="text-lg font-bold">
              Book {provider.userId?.name || 'Ustaad'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {successBooking ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">
                Booking Request Sent!
              </h4>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your request has been dispatched in real-time to{' '}
                <strong className="text-slate-800">{provider.userId?.name}</strong>.
                You will receive a notification as soon as they accept!
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-800">{provider.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(successBooking.date).toLocaleDateString('en-PK', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slot:</span>
                  <span className="font-semibold text-slate-800">{successBooking.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreed Budget:</span>
                  <span className="font-semibold text-brand-700 font-mono">
                    PKR {successBooking.budget?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleClose();
                    navigate('/dashboard');
                  }}
                  className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-brand-600/20"
                >
                  View My Bookings
                </button>
                <button
                  onClick={handleClose}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Provider Quick Info Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-brand-700">
                    {provider.category} Expert
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {provider.userId?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 font-medium uppercase">
                    Standard Range
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    PKR {provider.priceRange?.min} - {provider.priceRange?.max}
                  </div>
                </div>
              </div>

              {/* Date & Slot selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={minDateString}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Time Slot
                  </label>
                  <div className="relative">
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      {TIME_SLOTS.map((slot, index) => (
                        <option key={index} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Service Address / Street
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. House #14, Street 5, Gulberg III"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Budget Stated */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
                  <span>Stated Budget (PKR)</span>
                  <span className="text-slate-400 font-normal">
                    Suggested: PKR {provider.priceRange?.min || 500} - {provider.priceRange?.max || 2500}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="300"
                    step="100"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-brand-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Notes / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Describe the Issue / Task (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Describe details: e.g. Main switch trips when water pump starts..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Confirm & Send Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
