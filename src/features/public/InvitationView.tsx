import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { AppEvent } from '../../store/eventStore';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

import { CountdownClock } from '../../components/ui/CountdownClock';
import { RSVPForm } from './RSVPForm';

const InvitationView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isVideo = (url: string | null | undefined) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|ogg)$/i) || url.includes('video');
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('ID de evento no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Evento no encontrado');

        setEvent(data);
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Error al cargar la invitación');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl max-w-md w-full text-center shadow-xl">
          <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">¡Ups!</h1>
          <p className="text-slate-300">{error || 'Evento no encontrado'}</p>
        </div>
      </div>
    );
  }

  const bgIsVideo = isVideo(event.background_image_url);

  return (
    <div 
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-cover bg-center bg-fixed"
      style={!bgIsVideo && event.background_image_url ? { backgroundImage: `url('${event.background_image_url}')` } : {}}
    >
      <Helmet>
        <title>{event.title} - Estás Invitado</title>
        <meta name="description" content={event.description ? event.description.substring(0, 150) + '...' : `Estás invitado a ${event.title}`} />
        <meta property="og:title" content={`${event.title} - Estás Invitado`} />
        <meta property="og:description" content={event.description ? event.description.substring(0, 150) + '...' : `Estás invitado a ${event.title}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Video Background */}
      {bgIsVideo && event.background_image_url && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={event.background_image_url} type="video/mp4" />
        </video>
      )}

      {/* Dark overlay for readability */}
      {event.background_image_url && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-none z-0" />
      )}

      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-8 sm:p-12 rounded-3xl max-w-2xl w-full text-center shadow-2xl relative z-10 transition-all duration-500 hover:shadow-indigo-500/10 hover:border-slate-600/50"
      >
        
        {event.theme && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center justify-center space-x-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-indigo-500/20 shadow-inner"
          >
            <Sparkles className="w-4 h-4" />
            <span className="uppercase tracking-wider">{event.theme}</span>
            <Sparkles className="w-4 h-4" />
          </motion.div>
        )}

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 mb-8 leading-tight"
        >
          {event.title}
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <CountdownClock targetDate={event.event_date} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <RSVPForm eventId={event.id} />
        </motion.div>

        {event.description && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-800/30 rounded-2xl p-6 mb-8 border border-slate-700/30"
          >
            <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-slate-400 mt-8 border-t border-slate-800/50 pt-8"
        >
          <div className="flex items-center bg-slate-800/50 px-5 py-3 rounded-xl border border-slate-700/30 w-full sm:w-auto justify-center shadow-sm">
            <Calendar className="w-5 h-5 mr-3 text-indigo-400" />
            <span className="font-medium text-slate-200">
              {new Date(event.event_date).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center bg-slate-800/50 px-5 py-3 rounded-xl border border-slate-700/30 w-full sm:w-auto justify-center shadow-sm">
              <MapPin className="w-5 h-5 mr-3 text-rose-400" />
              <span className="font-medium text-slate-200">{event.location}</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InvitationView;
