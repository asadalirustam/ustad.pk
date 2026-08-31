import React, { useState } from 'react';
import { X, Star, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import StarRating from './StarRating';

const ReviewModal = ({ isOpen, onClose, booking, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a brief feedback comment.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/reviews', {
        bookingId: booking._id,
        rating,
        comment: comment.trim()
      });

      if (res.data.success) {
        if (res.data.flaggedNotice) {
          setFeedbackNotice({
            type: 'flagged',
            message: res.data.message,
            reason: res.data.flaggedNotice
          });
        } else {
          setFeedbackNotice({
            type: 'success',
            message: 'Thank you! Your verified review has been published.'
          });
        }

        if (onReviewSubmitted) {
          onReviewSubmitted(res.data.review);
        }
      }
    } catch (err) {
      console.error('Review submit error:', err);
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setComment('');
    setRating(5);
    setError('');
    setFeedbackNotice(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-white text-white" />
            <h3 className="text-base font-bold">Rate & Review Ustaad</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {feedbackNotice ? (
            <div className="text-center py-4 space-y-4">
              {feedbackNotice.type === 'flagged' ? (
                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-emerald-100 text-brand-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}

              <h4 className="text-lg font-bold text-slate-900">
                {feedbackNotice.type === 'flagged'
                  ? 'Review Held for Moderation'
                  : 'Review Submitted!'}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {feedbackNotice.message}
              </p>

              {feedbackNotice.reason && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 text-left">
                  <strong>Safety Notice:</strong> {feedbackNotice.reason}
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="text-center py-2">
                <div className="text-xs text-slate-500 font-medium mb-2">
                  How was your experience with{' '}
                  <strong className="text-slate-800">
                    {booking.providerId?.userId?.name || 'the service provider'}
                  </strong>
                  ?
                </div>
                <div className="flex justify-center my-2">
                  <StarRating
                    rating={rating}
                    interactive
                    onChange={setRating}
                    size="xl"
                  />
                </div>
                <div className="text-xs font-bold text-amber-600">
                  {rating === 5 && 'Outstanding ⭐⭐⭐⭐⭐'}
                  {rating === 4 && 'Very Good ⭐⭐⭐⭐'}
                  {rating === 3 && 'Average ⭐⭐⭐'}
                  {rating === 2 && 'Below Average ⭐⭐'}
                  {rating === 1 && 'Poor Experience ⭐'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detailed Feedback
                </label>
                <textarea
                  rows="3"
                  placeholder="Share details regarding punctuality, quality of work, and pricing transparency..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Submit Review</span>
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

export default ReviewModal;
