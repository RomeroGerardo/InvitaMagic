import { useState, useEffect } from 'react';
import { isPast, intervalToDuration } from 'date-fns';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
}

export function useCountdown(targetDate: string | Date | null): CountdownTime {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
  });

  useEffect(() => {
    if (!targetDate) return;

    const target = new Date(targetDate);

    const updateCountdown = () => {
      const now = new Date();
      
      if (isPast(target)) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isFinished: true,
        });
        return;
      }

      const duration = intervalToDuration({ start: now, end: target });
      
      setTimeLeft({
        days: duration.days || 0,
        hours: duration.hours || 0,
        minutes: duration.minutes || 0,
        seconds: duration.seconds || 0,
        isFinished: false,
      });
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  return timeLeft;
}
