import React from 'react';
import { motion } from 'framer-motion';

const MarketHeatmap = () => {
  const coins = [
    { name: 'BTC', change: '+2.4%', value: 68 },
    { name: 'ETH', change: '-1.1%', value: 45 },
    { name: 'SOL', change: '+5.7%', value: 82 },
    { name: 'ADA', change: '-0.2%', value: 48 },
    { name: 'DOT', change: '+1.5%', value: 55 },
    { name: 'MATIC', change: '+3.1%', value: 62 },
    { name: 'LINK', change: '-2.5%', value: 38 },
    { name: 'AVAX', change: '+4.2%', value: 71 },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Market Heatmap</h3>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Relative Strength</span>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {coins.map((coin, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className={`p-3 rounded-xl flex flex-col items-center justify-center border border-white/5 cursor-default transition-colors ${
              coin.change.startsWith('+') 
                ? 'bg-accent-green/10 border-accent-green/20' 
                : 'bg-accent-red/10 border-accent-red/20'
            }`}
          >
            <span className="text-xs font-black text-white mb-1">{coin.name}</span>
            <span className={`text-[10px] font-bold ${
              coin.change.startsWith('+') ? 'text-accent-green' : 'text-accent-red'
            }`}>
              {coin.change}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MarketHeatmap;
