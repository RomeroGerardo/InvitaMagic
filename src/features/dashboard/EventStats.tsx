import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { UserCheck, UserX, UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventStatsProps {
  eventId: string;
}

interface Stats {
  confirmed: number;
  declined: number;
  companions: number;
}

const EventStats: React.FC<EventStatsProps> = ({ eventId }) => {
  const [stats, setStats] = useState<Stats>({ confirmed: 0, declined: 0, companions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('status, companions')
          .eq('event_id', eventId);

        if (error) throw error;

        if (isMounted && data) {
          const newStats = data.reduce(
            (acc: Stats, guest: any) => {
              if (guest.status === 'attending') {
                acc.confirmed += 1;
                acc.companions += guest.companions || 0;
              } else if (guest.status === 'declined') {
                acc.declined += 1;
              }
              return acc;
            },
            { confirmed: 0, declined: 0, companions: 0 }
          );
          setStats(newStats);
        }
      } catch (err) {
        console.error('Error fetching guest stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`public:guests:event_id=eq.${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests', filter: `event_id=eq.${eventId}` },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="mt-auto pt-4 border-t border-slate-100/50 flex justify-center py-4">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
      className="mt-auto pt-4 border-t border-slate-100/50 grid grid-cols-3 gap-2"
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-sm border border-white/60 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-white/80 hover:shadow-md group"
      >
        <div className="bg-emerald-100/80 p-2 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform duration-300">
          <UserCheck className="w-5 h-5" />
        </div>
        <div className="text-center mt-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Confirmados</p>
          <motion.p 
            key={stats.confirmed}
            initial={{ scale: 1.5, color: '#10b981' }}
            animate={{ scale: 1, color: '#1e293b' }}
            transition={{ duration: 0.5 }}
            className="text-lg font-black text-slate-800 leading-none"
          >
            {stats.confirmed}
          </motion.p>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-sm border border-white/60 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-white/80 hover:shadow-md group"
      >
        <div className="bg-rose-100/80 p-2 rounded-xl text-rose-600 group-hover:scale-110 transition-transform duration-300">
          <UserX className="w-5 h-5" />
        </div>
        <div className="text-center mt-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Rechazados</p>
          <motion.p 
            key={stats.declined}
            initial={{ scale: 1.5, color: '#f43f5e' }}
            animate={{ scale: 1, color: '#1e293b' }}
            transition={{ duration: 0.5 }}
            className="text-lg font-black text-slate-800 leading-none"
          >
            {stats.declined}
          </motion.p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-sm border border-white/60 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-white/80 hover:shadow-md group"
      >
        <div className="bg-indigo-100/80 p-2 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform duration-300">
          <UserPlus className="w-5 h-5" />
        </div>
        <div className="text-center mt-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Acompañ.</p>
          <motion.p 
            key={stats.companions}
            initial={{ scale: 1.5, color: '#6366f1' }}
            animate={{ scale: 1, color: '#1e293b' }}
            transition={{ duration: 0.5 }}
            className="text-lg font-black text-slate-800 leading-none"
          >
            {stats.companions}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EventStats;
