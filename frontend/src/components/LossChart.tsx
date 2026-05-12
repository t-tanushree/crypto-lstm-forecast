import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LossChartProps {
  data: {
    loss: number[];
    val_loss: number[];
  };
}

const LossChart: React.FC<LossChartProps> = ({ data }) => {
  // Format data for Recharts
  const formattedData = data.loss.map((l, i) => ({
    epoch: i + 1,
    loss: l,
    val_loss: data.val_loss[i]
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
          <XAxis 
            dataKey="epoch" 
            stroke="#4b5563" 
            fontSize={10}
            label={{ value: 'Epochs', position: 'insideBottom', offset: -5, fill: '#4b5563', fontSize: 10 }}
          />
          <YAxis 
            stroke="#4b5563" 
            fontSize={10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f0f12', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '10px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Line 
            type="monotone" 
            dataKey="loss" 
            stroke="#6366f1" 
            strokeWidth={2}
            dot={false}
            name="Training Loss"
          />
          <Line 
            type="monotone" 
            dataKey="val_loss" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
            name="Validation Loss"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LossChart;
