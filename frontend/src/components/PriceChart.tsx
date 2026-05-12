
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  date: string;
  [key: string]: any;
}

interface PriceChartProps {
  data: ChartData[];
  coins: string[]; // Support multiple coins
}

const PriceChart: React.FC<PriceChartProps> = ({ data, coins }) => {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f43f5e', '#fb923c'];

  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            {coins.map((coin, index) => (
              <linearGradient key={coin} id={`color${coin}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#4b5563" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#4b5563" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f0f12', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
          
          {coins.map((coin, index) => (
            <React.Fragment key={coin}>
              <Area 
                type="monotone" 
                dataKey={(coin === coins[0] ? 'actual' : `${coin}_actual`)as string } 
                stroke={colors[index % colors.length]} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#color${coin})`} 
                name={`${coin} Actual`}
              />
              <Area 
                type="monotone" 
                dataKey={(coin === coins[0] ? 'predicted' : `${coin}_predicted`)as string } 
                stroke={colors[index % colors.length]} 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={0} 
                name={`${coin} Forecast`}
              />
            </React.Fragment>
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
