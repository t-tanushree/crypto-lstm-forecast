import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TickerTape = () => {
  const coins = [
    { name: 'BTC', price: '64,231.50', change: '+2.4%', up: true },
    { name: 'ETH', price: '3,452.12', change: '-1.1%', up: false },
    { name: 'SOL', price: '145.82', change: '+5.7%', up: true },
    { name: 'ADA', price: '0.45', change: '-0.2%', up: false },
    { name: 'DOT', price: '7.24', change: '+1.5%', up: true },
    { name: 'MATIC', price: '0.72', change: '+3.1%', up: true },
    { name: 'LINK', price: '14.20', change: '-2.5%', up: false },
  ];

  // Duplicate items for seamless looping
  const tickerItems = [...coins, ...coins, ...coins];

  return (
    <div className="w-full bg-white/5 border-b border-white/10 overflow-hidden h-10 flex items-center">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex whitespace-nowrap gap-12 px-6"
      >
        {tickerItems.map((coin, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-black text-white">{coin.name}</span>
            <span className="text-xs text-gray-400 font-mono">${coin.price}</span>
            <span className={`text-[10px] font-bold flex items-center ${coin.up ? 'text-accent-green' : 'text-accent-red'}`}>
              {coin.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {coin.change}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TickerTape;
