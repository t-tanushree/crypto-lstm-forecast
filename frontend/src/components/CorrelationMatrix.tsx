import React from 'react';

const CorrelationMatrix = () => {
  const coins = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
  
  // Mock correlation data
  const data: { [key: string]: { [key: string]: number } } = {
    'BTC': { 'BTC': 1.00, 'ETH': 0.85, 'SOL': 0.62, 'ADA': 0.71, 'DOT': 0.68 },
    'ETH': { 'BTC': 0.85, 'ETH': 1.00, 'SOL': 0.74, 'ADA': 0.68, 'DOT': 0.75 },
    'SOL': { 'BTC': 0.62, 'ETH': 0.74, 'SOL': 1.00, 'ADA': 0.55, 'DOT': 0.58 },
    'ADA': { 'BTC': 0.71, 'ETH': 0.68, 'SOL': 0.55, 'ADA': 1.00, 'DOT': 0.64 },
    'DOT': { 'BTC': 0.68, 'ETH': 0.75, 'SOL': 0.58, 'ADA': 0.64, 'DOT': 1.00 },
  };

  const getBgColor = (val: number) => {
    if (val === 1) return 'bg-white/10';
    if (val > 0.8) return 'bg-accent-green/30';
    if (val > 0.7) return 'bg-accent-green/20';
    if (val > 0.6) return 'bg-accent-green/10';
    return 'bg-white/5';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Correlation Matrix</h3>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">30-Day Pearson</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-center border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="p-2"></th>
              {coins.map(c => (
                <th key={c} className="p-2 text-[10px] font-black text-gray-500">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coins.map(row => (
              <tr key={row}>
                <td className="p-2 text-[10px] font-black text-gray-500 text-left">{row}</td>
                {coins.map(col => {
                  const val = data[row][col];
                  return (
                    <td 
                      key={col} 
                      className={`p-3 rounded-lg text-[10px] font-bold text-white transition-all hover:scale-110 cursor-default ${getBgColor(val)}`}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[9px] text-gray-600 mt-4 text-center">
        Higher values (close to 1.0) indicate assets moving in high synchronization.
      </p>
    </div>
  );
};

export default CorrelationMatrix;
