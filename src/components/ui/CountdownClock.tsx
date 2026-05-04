import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';

interface CountdownClockProps {
  targetDate: string | Date;
}

export const CountdownClock: React.FC<CountdownClockProps> = ({ targetDate }) => {
  const { days, hours, minutes, seconds, isFinished } = useCountdown(targetDate);

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-rose-500/10 rounded-3xl border border-indigo-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-rose-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <PartyPopper className="w-16 h-16 text-rose-400 mb-4 animate-bounce relative z-10" />
        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-rose-300 relative z-10 text-center">
          ¡La fiesta ha comenzado!
        </h3>
      </motion.div>
    );
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl w-20 h-24 sm:w-24 sm:h-28 shadow-xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-200 via-purple-200 to-rose-200 relative z-10 tracking-tight">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-[10px] sm:text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest relative z-10">
        {label}
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
      className="flex gap-2 sm:gap-4 justify-center items-center"
    >
      <TimeBlock value={days} label="Días" />
      <div className="flex flex-col gap-2 pb-6 animate-pulse">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50" />
      </div>
      <TimeBlock value={hours} label="Horas" />
      <div className="flex flex-col gap-2 pb-6 animate-pulse">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50" />
      </div>
      <TimeBlock value={minutes} label="Min" />
      <div className="flex flex-col gap-2 pb-6 animate-pulse">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-500/50" />
      </div>
      <TimeBlock value={seconds} label="Seg" />
    </motion.div>
  );
};
