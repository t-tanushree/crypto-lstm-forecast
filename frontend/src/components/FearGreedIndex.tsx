import React from 'react';
import { motion } from 'framer-motion';

interface FearGreedIndexProps {
  value: number; // 0 to 100
}

const FearGreedIndex: React.FC<FearGreedIndexProps> = ({ value }) => {
  const getStatus = (val: number) => {
    if (val < 25) return { label: 'Extreme Fear', color: '#f43f5e' };
    if (val < 45) return { label: 'Fear', color: '#fb923c' };
    if (val < 55) return { label: 'Neutral', color: '#eab308' };
    if (val < 75) return { label: 'Greed', color: '#10b981' };
    return { label: 'Extreme Greed', color: '#06b6d4' };
  };

  const status = getStatus(value);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Gauge Background */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-white/5" />
        
        {/* Gauge Color Fill */}
        <motion.div 
          initial={{ rotate: -90 }}
          animate={{ rotate: -90 + (value * 1.8) }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-transparent border-t-current origin-center"
          style={{ color: status.color, transformOrigin: 'center center' }}
        />
        
        {/* Needle */}
        <motion.div 
          initial={{ rotate: -90 }}
          animate={{ rotate: -90 + (value * 1.8) }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-0 left-1/2 w-1 h-12 bg-white origin-bottom -translate-x-1/2 rounded-full"
        />
      </div>
      
      <div className="text-center mt-4">
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: status.color }}>
          {status.label}
        </p>
      </div>
    </div>
  );
};

export default FearGreedIndex;
