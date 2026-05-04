import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppEvent } from '../../store/eventStore';
import { Calendar, MapPin, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import EventStats from './EventStats';
import { motion } from 'framer-motion';

interface EventListProps {
  events: AppEvent[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12 }
  }
};

const EventList: React.FC<EventListProps> = ({ events }) => {
  const navigate = useNavigate();

  if (!events || events.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/60 backdrop-blur-xl border border-slate-200/60 p-12 rounded-3xl shadow-sm text-center"
      >
        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes eventos aún</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Crea tu primer evento mágico para empezar a invitar a tus amigos y familiares.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      {events.map((event) => {
        const eventDate = new Date(event.event_date);
        const formattedDate = new Intl.DateTimeFormat('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(eventDate);
        
        return (
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            key={event.id} 
            className="group relative bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Top decorative gradient bar */}
            <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {event.theme || 'General'}
                </div>
                <button 
                  onClick={() => navigate(`/dashboard/event/${event.id}`)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Editar Evento"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-indigo-600 transition-all">
                {event.title}
              </h3>
              
              <div className="space-y-3 mb-6 mt-auto">
                <div className="flex items-center text-slate-600 text-sm">
                  <Calendar className="w-4 h-4 mr-3 text-indigo-400" />
                  {formattedDate}
                </div>
                {event.location && (
                  <div className="flex items-center text-slate-600 text-sm">
                    <MapPin className="w-4 h-4 mr-3 text-indigo-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>

              <EventStats eventId={event.id} />

              <div className="mt-6 flex gap-3">
                <a 
                  href={`/invitacion/${event.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Invitación
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${window.location.origin}/invitacion/${event.id}`);
                    alert('¡Enlace copiado al portapapeles! Ya puedes compartirlo.');
                  }}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-2.5 rounded-xl flex items-center justify-center transition-colors border border-slate-200/50"
                  title="Copiar enlace"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default EventList;
