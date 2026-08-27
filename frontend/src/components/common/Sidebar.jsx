import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Clock, 
  CalendarCheck, 
  BarChart3, 
  Hotel,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'departments', label: 'Departments & Roles', icon: Building2 },
    { id: 'shifts', label: 'Shifts & Roster', icon: Clock },
    { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Hotel className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-white text-base tracking-tight block">NORU HOTEL</span>
          <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Staff Management</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-slate-200">System Connected</p>
            <p className="text-slate-400 text-[11px]">Database Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
