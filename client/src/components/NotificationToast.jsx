import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, CheckCircle2, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationToast = () => {
  const { latestNotification, clearLatestNotification } = useSocket();

  if (!latestNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-4 animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3">
      <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl shrink-0 mt-0.5">
        {latestNotification.type === 'new_booking' ? (
          <Sparkles className="w-5 h-5 text-emerald-400" />
        ) : (
          <Bell className="w-5 h-5 text-teal-400" />
        )}
      </div>

      <div className="flex-1 text-xs">
        <div className="font-bold text-white mb-0.5 flex items-center justify-between">
          <span>{latestNotification.title}</span>
          <span className="text-[10px] text-slate-400 font-normal">Just now</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
          {latestNotification.message}
        </p>

        <div className="flex items-center gap-2">
          <Link
            to={
              latestNotification.type === 'new_booking'
                ? '/provider-dashboard'
                : '/dashboard'
            }
            onClick={clearLatestNotification}
            className="text-[11px] font-bold text-brand-400 hover:text-brand-300 underline"
          >
            View in Dashboard →
          </Link>
        </div>
      </div>

      <button
        onClick={clearLatestNotification}
        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationToast;
