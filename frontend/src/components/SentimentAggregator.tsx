import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, Meh } from 'lucide-react';

const SentimentAggregator = () => {
  const sentiment = {
    score: 72,
    label: 'Greed',
    trend: 'Optimistic',
    breakdown: [
      { coin: 'BTC', status: 'Positive' },
      { coin: 'ETH', status: 'Positive' },
      { coin: 'SOL', status: 'Neutral' },
      { coin: 'ADA', status: 'Negative' },
    ]
  };

  return (
    <div className="w-full glass-card rounded-[24px] p-4 flex items-center justify-between mb-8 overflow-hidden group border-white/5 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green">
          <Smile size={24} />
        </div>
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-widest">Market Sentiment</h4>
          <p className="text-[10px] text-gray-500">Aggregated from News & Social signals</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex gap-2">
          {sentiment.breakdown.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[8px] font-bold text-gray-600">{s.coin}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${
                s.status === 'Positive' ? 'bg-accent-green animate-pulse' : 
                s.status === 'Negative' ? 'bg-accent-red' : 'bg-gray-600'
              }`} />
            </div>
          ))}
        </div>

        <div className="h-10 w-px bg-white/10" />

        <div className="text-right">
          <span className="text-[10px] font-bold text-accent-green uppercase tracking-tighter">Overall: {sentiment.label}</span>
          <div className="flex items-center gap-2">
             <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${sentiment.score}%` }}
                  className="h-full bg-accent-green"
                />
             </div>
             <span className="text-xs font-bold text-white">{sentiment.score}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentAggregator;
