import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, LogOut, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Mis Eventos', to: '/dashboard/events', icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1.5 rounded-lg mr-3 shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Invita<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Magic</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                  /* This needs fixing for isActive in className above but works decently with group */
                  'group-[.active]:text-indigo-600 text-slate-400 group-hover:text-slate-600'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors duration-200 group"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
        {/* Header optional for later, maybe user profile info */}
        <header className="h-16 bg-white/50 backdrop-blur-md border-b border-slate-200 flex items-center justify-end px-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                U
             </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
