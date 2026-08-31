import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle } from 'lucide-react';

const StatusBadge = ({ status, className = '' }) => {
  const getBadgeConfig = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          label: 'Pending Request',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 mr-1" />
        };
      case 'accepted':
        return {
          label: 'Accepted / Confirmed',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <PlayCircle className="w-3.5 h-3.5 mr-1" />
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <XCircle className="w-3.5 h-3.5 mr-1" />
        };
      case 'rejected':
        return {
          label: 'Declined',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />
        };
      default:
        return {
          label: status || 'Unknown',
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: null
        };
    }
  };

  const { label, bg, icon } = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge;
