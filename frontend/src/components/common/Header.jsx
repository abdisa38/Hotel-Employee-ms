import React from 'react';
import { Calendar, Clock, UserPlus, Fingerprint } from 'lucide-react';

export default function Header({ onQuickPunchClick, onAddEmployeeClick }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Date */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onQuickPunchClick}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium transition shadow-sm"
        >
          <Fingerprint className="w-4 h-4 text-blue-600" />
          <span>Clock In / Out</span>
        </button>

        <button
          onClick={onAddEmployeeClick}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm shadow-blue-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>
    </header>
  );
}
