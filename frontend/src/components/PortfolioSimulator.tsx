import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign } from 'lucide-react';

interface PortfolioSimulatorProps {
  currentPrice: number;
  predictedPrice: number;
  coin: string;
}

const PortfolioSimulator: React.FC<PortfolioSimulatorProps> = ({ currentPrice, predictedPrice, coin }) => {
  const [amount, setAmount] = useState<number>(1000);
  
  const coinAmount = amount / currentPrice;
  const predictedValue = coinAmount * predictedPrice;
  const roi = ((predictedValue - amount) / amount) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <Calculator size={18} className="text-secondary" />
        <h3 className="text-lg font-bold">ROI Simulator</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
            Investment Amount (USD)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-secondary/50 transition-all"
            />
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-gradient-to-br from-secondary/10 to-primary/10 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={64} />
          </div>
          
          <div className="relative z-10">
            <p className="text-xs text-gray-400 mb-1">Predicted Value (7-Day)</p>
            <h4 className="text-3xl font-black text-white mb-4">
              ${predictedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Est. Profit</p>
                <p className={`text-sm font-bold ${roi >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  ${(predictedValue - amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">ROI</p>
                <p className={`text-sm font-bold ${roi >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 text-center italic leading-relaxed">
          *Simulation based on LSTM-DeepV3 7-day price target for {coin}. Not financial advice.
        </p>
      </div>
    </div>
  );
};

export default PortfolioSimulator;
