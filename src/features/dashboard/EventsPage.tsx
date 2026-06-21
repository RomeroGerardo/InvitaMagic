import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useEventStore, type AppEvent } from '../../store/eventStore';
import EventList from './EventList';
import { Sparkles, CalendarPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { events, setEvents, isLoading, setIsLoading, setError, error } = useEventStore();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('event_date', { ascending: true });

        if (error) throw error;
        setEvents(data as AppEvent[]);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError('No se pudieron cargar los eventos. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user, setEvents, setIsLoading, setError]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header with glassmorphism/gradient */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 p-8 shadow-2xl text-white"
      >
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] rounded-full bg-purple-600/30 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[120%] rounded-full bg-indigo-600/30 blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400" />
              Tus Eventos Mágicos
            </h1>
            <p className="text-slate-300 max-w-xl">
              Administra tus invitaciones, controla la asistencia de tus invitados y haz que cada celebración sea inolvidable.
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/event/new')}
            className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-indigo-50 transition-all focus:ring-2 focus:ring-white focus:outline-none"
          >
            <CalendarPlus className="w-5 h-5" />
            Crear Nuevo Evento
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 shadow-sm"
        >
          {error}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Cargando tu magia...</p>
        </div>
      ) : (
        <EventList events={events} />
      )}
    </motion.div>
  );
};

export default EventsPage;
