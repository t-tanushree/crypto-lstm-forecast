import React from 'react';
import { motion } from 'framer-motion';
import { Target, BarChart, Zap, ShieldCheck } from 'lucide-react';

const ModelMetrics = () => {
  const metrics = [
    { label: 'RMSE', value: '412.50', desc: 'Root Mean Square Error', icon: <Target className="text-primary" /> },
    { label: 'MAE', value: '285.12', desc: 'Mean Absolute Error', icon: <BarChart className="text-secondary" /> },
    { label: 'MAPE', value: '0.45%', desc: 'Mean Absolute Percentage Error', icon: <Zap className="text-accent-green" /> },
    { label: 'R² Score', value: '0.982', desc: 'Coefficient of Determination', icon: <ShieldCheck className="text-primary" /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((m, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
        >
          <div className="p-3 rounded-2xl bg-white/5 w-fit mb-4 group-hover:bg-white/10 transition-colors">
            {m.icon}
          </div>
          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">{m.label}</p>
          <h4 className="text-2xl font-bold text-white mb-1">{m.value}</h4>
          <p className="text-[10px] text-gray-600 italic">{m.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default ModelMetrics;
