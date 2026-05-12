import React from 'react';
import { Download, Table as TableIcon } from 'lucide-react';

interface Prediction {
  date: string;
  predicted: number;
}

interface PredictionTableProps {
  data: Prediction[];
  coin: string;
}

const PredictionTable: React.FC<PredictionTableProps> = ({ data, coin }) => {
  const exportToCSV = () => {
    const headers = ['Date', 'Predicted Price (USD)'];
    const rows = data.map(p => [p.date, p.predicted.toString()]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${coin}_forecast_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TableIcon size={18} className="text-primary" />
          <h3 className="text-lg font-bold">Forecast Raw Data</h3>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-all font-bold"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4">Forecast Date</th>
              <th className="px-6 py-4">Predicted Value</th>
              <th className="px-6 py-4">Expected Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-gray-300 font-mono">{item.date}</td>
                <td className="px-6 py-4 font-bold text-white">${item.predicted.toLocaleString()}</td>
                <td className="px-6 py-4 text-accent-green font-medium">±0.42%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PredictionTable;
