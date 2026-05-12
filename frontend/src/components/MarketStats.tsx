import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, Zap, BarChart3, TrendingUp, DollarSign } from 'lucide-react';

const MarketStats = () => {
  const stats = [
    { 
      label: 'BTC Market Price', 
      value: '$64,231.50', 
      change: '+2.45%', 
      up: true, 
      icon: <Activity className="text-sky-400" size={24} />,
      bgClass: 'bg-sky-500/10',
      borderClass: 'border-sky-500/20',
      glowClass: 'bg-sky-500'
    },
    { 
      label: 'ETH Market Price', 
      value: '$3,452.12', 
      change: '-1.12%', 
      up: false, 
      icon: <Zap className="text-indigo-400" size={24} />,
      bgClass: 'bg-indigo-500/10',
      borderClass: 'border-indigo-500/20',
      glowClass: 'bg-indigo-500'
    },
    { 
      label: 'Total Market Cap', 
      value: '$2.48 Trillion', 
      change: '+0.82%', 
      up: true, 
      icon: <BarChart3 className="text-emerald-400" size={24} />,
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/20',
      glowClass: 'bg-emerald-500'
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"
    >
      {stats.map((stat, i) => (
        <motion.div 
          key={i} 
          variants={item}
          className="glass-card group p-8 rounded-[40px] relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-all duration-500 ${stat.glowClass}`} />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className={`p-4 rounded-[24px] ${stat.bgClass} border ${stat.borderClass} group-hover:scale-110 transition-transform duration-500`}>
              {stat.icon}
            </div>
            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
              stat.up ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20' : 'bg-rose-500/10 text-rose-400 border border-rose-400/20'
            }`}>
              {stat.up ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingUp size={12} strokeWidth={3} className="rotate-180" />}
              {stat.change}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tight leading-none group-hover:text-sky-400 transition-colors duration-300">
              {stat.value}
            </h3>
            <div className="mt-6 flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(j => (
                  <div key={j} className="w-5 h-5 rounded-full border-2 border-slate-900 bg-slate-800" />
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-500">Live predictions active</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MarketStats;
