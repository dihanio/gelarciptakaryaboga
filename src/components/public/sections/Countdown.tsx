'use client';

import React, { useState, useEffect } from 'react';

export const Countdown: React.FC<{ targetDate: Date | string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-3 sm:gap-4 justify-center">
      {[
        { label: 'Hari', value: timeLeft.days },
        { label: 'Jam', value: timeLeft.hours },
        { label: 'Menit', value: timeLeft.minutes },
        { label: 'Detik', value: timeLeft.seconds },
      ].map((item, index) => (
        <React.Fragment key={item.label}>
          <div className="flex flex-col items-center bg-white/80 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl border border-slate-200/80 shadow-sm min-w-[65px] sm:min-w-[80px]">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {item.label}
            </span>
          </div>
          {index < 3 && <span className="text-lg sm:text-2xl font-bold text-slate-400 font-mono">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};
