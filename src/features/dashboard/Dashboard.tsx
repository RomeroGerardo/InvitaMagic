import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ totalEvents: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id')
          .eq('user_id', user.id);
        
        if (!error && data) {
          setStats({ totalEvents: data.length });
        }
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Bienvenido a InvitaMagic
            </h1>
            <p className="text-slate-500">
              Aquí tienes un resumen de tu actividad.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Stats Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Eventos Creados</p>
            <p className="text-4xl font-black text-slate-800">{stats.totalEvents}</p>
          </div>
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
            <Calendar className="w-8 h-8" />
          </div>
        </motion.div>

        {/* Action Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-3xl shadow-md text-white flex flex-col justify-between"
        >
          <div>
            <Sparkles className="w-8 h-8 mb-4 text-purple-200" />
            <h3 className="text-xl font-bold mb-2">Administra tus Eventos</h3>
            <p className="text-indigo-100 text-sm mb-4">Revisa la lista de todos tus eventos o crea uno nuevo desde tu panel de control.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/events')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all font-semibold"
          >
            Ir a Mis Eventos <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
