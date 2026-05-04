import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RSVPFormProps {
  eventId: string;
}

interface RSVPFormData {
  name: string;
  status: 'attending' | 'declined';
  companions: number;
}

export const RSVPForm: React.FC<RSVPFormProps> = ({ eventId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RSVPFormData>({
    defaultValues: {
      name: '',
      status: 'attending',
      companions: 0,
    }
  });

  const status = watch('status');

  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('guests')
        .insert([
          {
            event_id: eventId,
            name: data.name,
            status: data.status,
            companions: data.status === 'attending' ? data.companions : 0,
          }
        ]);

      if (insertError) throw insertError;
      
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting RSVP:', err);
      setError(err.message || 'Error al enviar la confirmación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center mt-12 w-full max-w-md mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">¡Gracias por confirmar!</h3>
        <p className="text-emerald-200/80">Hemos registrado tu respuesta correctamente.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 mt-12 w-full max-w-md mx-auto text-left relative z-20 shadow-xl"
    >
      <h3 className="text-2xl font-bold text-white mb-6 text-center">Confirmar Asistencia</h3>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start overflow-hidden"
          >
            <XCircle className="w-5 h-5 text-rose-400 mr-3 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-200">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
            Nombre completo
          </label>
          <input
            {...register('name', { required: 'El nombre es obligatorio' })}
            type="text"
            id="name"
            placeholder="Ej. Juan Pérez"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
          />
          {errors.name && <p className="mt-1.5 text-sm text-rose-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            ¿Asistirás?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`
              cursor-pointer flex items-center justify-center py-3 px-4 rounded-xl border transition-all
              ${status === 'attending' 
                ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-[1.02]' 
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'}
            `}>
              <input 
                type="radio" 
                value="attending" 
                className="sr-only"
                {...register('status')}
              />
              <span className="font-medium">Sí, asistiré</span>
            </label>
            <label className={`
              cursor-pointer flex items-center justify-center py-3 px-4 rounded-xl border transition-all
              ${status === 'declined' 
                ? 'bg-rose-500/20 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)] scale-[1.02]' 
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'}
            `}>
              <input 
                type="radio" 
                value="declined" 
                className="sr-only"
                {...register('status')}
              />
              <span className="font-medium">No podré ir</span>
            </label>
          </div>
        </div>

        <AnimatePresence>
          {status === 'attending' && (
            <motion.div 
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="companions" className="block text-sm font-medium text-slate-300 mb-1.5 mt-2">
                Número de acompañantes
              </label>
              <input
                {...register('companions', { 
                  min: { value: 0, message: 'No puede ser negativo' },
                  valueAsNumber: true 
                })}
                type="number"
                id="companions"
                min="0"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              />
              {errors.companions && <p className="mt-1.5 text-sm text-rose-400">{errors.companions.message}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-6 border border-indigo-400/30"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar Confirmación'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};
