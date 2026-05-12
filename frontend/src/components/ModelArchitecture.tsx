import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Cpu, Activity } from 'lucide-react';

const ModelArchitecture = () => {
  const layers = [
    { name: 'Input Layer', type: 'Time Series', shape: '(60, 1)', icon: <Database className="text-blue-400" /> },
    { name: 'LSTM Layer 1', type: 'RNN (Units: 50)', shape: '(None, 60, 50)', icon: <Layers className="text-primary" /> },
    { name: 'Dropout 1', type: 'Rate: 0.2', shape: '(None, 60, 50)', icon: <Activity className="text-accent-red" /> },
    { name: 'LSTM Layer 2', type: 'RNN (Units: 50)', shape: '(None, 60, 50)', icon: <Layers className="text-primary" /> },
    { name: 'Dropout 2', type: 'Rate: 0.2', shape: '(None, 60, 50)', icon: <Activity className="text-accent-red" /> },
    { name: 'LSTM Layer 3', type: 'RNN (Units: 50)', shape: '(None, 50)', icon: <Layers className="text-primary" /> },
    { name: 'Dense Output', type: 'Linear', shape: '(None, 1)', icon: <Cpu className="text-accent-green" /> },
  ];

  return (
    <div className="space-y-4">
      {layers.map((layer, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors group"
        >
          <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
            {layer.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm">{layer.name}</h4>
            <p className="text-xs text-gray-400">{layer.type}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">Output Shape</p>
            <p className="text-xs font-semibold text-primary">{layer.shape}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ModelArchitecture;
