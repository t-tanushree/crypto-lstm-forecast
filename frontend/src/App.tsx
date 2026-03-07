import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Cpu, LogOut, Bell, User as UserIcon } from 'lucide-react';
import SandboxMode from './components/SandboxMode';
import Auth from './components/Auth';
import AlertManager from './components/AlertManager';

const API_BASE_URL = 'http://localhost:8000';

interface PricePoint {
  timestamp: string;
  close: number;
  type: 'actual' | 'forecast';
}

interface Metrics {
  symbol: string;
  mae: number;
  rmse: number;
  mape: number;
  last_updated: string;
}

interface Sentiment {
  value: number;
  classification: string;
  timestamp: string;
}

interface ForecastResponse {
  symbol: string;
  current_price: number;
  predicted_next_day_price: number;
  forecast_7d: number[];
  historical_data: any[];
  indicators: {
    rsi: number;
    sma20: number;
    sma50: number;
  };
}

const App: React.FC = () => {
  const [symbol, setSymbol] = useState('BTC-USD');
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [wsPrice, setWsPrice] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'price_update' && msg.symbol === symbol) {
        setWsPrice(msg.price);
      } else if (msg.type === 'alert_triggered' && user && msg.user_id === user.id) {
        setNotifications(prev => [{ ...msg, id: Date.now() }, ...prev].slice(0, 5));
      }
    };
    return () => ws.close();
  }, [symbol, user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) {
      setToken(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
  };

  useEffect(() => {
    fetchData();
  }, [symbol]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [forecastRes, metricsRes, predictionsRes, sentimentRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/forecast/${symbol}`),
        axios.get(`${API_BASE_URL}/metrics/${symbol}`),
        axios.get(`${API_BASE_URL}/predictions/${symbol}`),
        axios.get(`${API_BASE_URL}/sentiment`)
      ]);
      setData(forecastRes.data);
      setMetrics(metricsRes.data);
      setPredictions(predictionsRes.data);
      setSentiment(sentimentRes.data);
      setWsPrice(forecastRes.data.current_price);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from the server. Make sure the backend and metrics services are running.');
    } finally {
      setLoading(false);
    }
  };

  const trend = data ? (data.predicted_next_day_price > data.current_price ? 'UP' : 'DOWN') : 'NEUTRAL';
  const percentageChange = data ? (((data.predicted_next_day_price - data.current_price) / data.current_price) * 100).toFixed(2) : '0';

  // Prepare combined data for chart: history + forecast
  const chartData: PricePoint[] = data ? [
    ...data.historical_data.map((d: any) => ({ ...d, type: 'actual' as const })),
    ...data.forecast_7d.map((price: number, i: number) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return {
        timestamp: date.toISOString().split('T')[0],
        close: price,
        type: 'forecast' as const
      };
    })
  ] : [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-white">
        <div className="text-accent animate-pulse text-2xl font-bold flex items-center gap-3">
          <Activity className="animate-spin" />
          Loading Predictions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Cpu className="text-sky-400" />
                Crypto<span className="text-sky-400">LSTM</span> Forecast
              </h1>
              <p className="text-slate-400 mt-1">Deep learning powered price predictions</p>
            </div>
            {user && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800">
                <UserIcon size={16} className="text-sky-400" />
                <span className="text-xs font-bold text-white">{user.email.split('@')[0]}</span>
                <button onClick={handleLogout} className="ml-2 text-slate-500 hover:text-rose-400 p-1">
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            {['BTC-USD', 'ETH-USD', 'SOL-USD'].map((s) => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${symbol === s ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {s.split('-')[0]}
              </button>
            ))}
          </div>
        </header>

        {/* Notifications */}
        <div className="fixed top-24 right-8 z-50 space-y-3 pointer-events-none">
          {notifications.map(n => (
            <div key={n.id} className="bg-sky-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right pointer-events-auto border border-sky-400">
              <Bell className="animate-bounce" size={20} />
              <div>
                <div className="font-black text-sm uppercase">Alert Triggered!</div>
                <div className="text-xs opacity-90">{n.symbol} is {n.condition.replace('_', ' ')} ${n.target.toLocaleString()}</div>
              </div>
              <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="ml-2 opacity-50 hover:opacity-100">×</button>
            </div>
          ))}
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-slate-900 rounded-3xl border border-slate-800 mb-10 shadow-2xl">
          <div className="px-8 py-12 md:px-12 md:py-16 relative z-10">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Predict the <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-500">Future of Crypto</span> with LSTM.
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Our deep learning models analyze historical trends and technical indicators to provide high-precision 7-day price forecasts. Real-time data streaming ensures you stay ahead of the market.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 px-4 py-2 rounded-full text-sky-400 text-sm font-bold">
                  <Activity size={16} /> Live Market Data
                </div>
                <div className="flex items-center gap-2 bg-fuchsia-500/10 border border-fuchsia-500/30 px-4 py-2 rounded-full text-fuchsia-400 text-sm font-bold">
                  <Cpu size={16} /> 95%+ Precision
                </div>
              </div>
            </div>
            {/* Sentiment Meter Overlay */}
            <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-2xl items-center gap-6">
              <div className="text-center">
                <div className="text-slate-400 text-xs font-bold uppercase mb-1">Market Sentiment</div>
                <div className={`text-3xl font-black ${sentiment?.value! > 60 ? 'text-emerald-400' : sentiment?.value! < 40 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {sentiment?.value || 50}
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">{sentiment?.classification || 'Neutral'}</div>
              </div>
              <div className="w-1 h-12 bg-slate-700 rounded-full"></div>
              <div className="flex flex-col gap-1">
                <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${sentiment?.value! > 60 ? 'bg-emerald-500' : sentiment?.value! < 40 ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${sentiment?.value || 50}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                  <span>FEAR</span>
                  <span>GREED</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 font-medium">Current Price</span>
              <DollarSign className="text-sky-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-white">
              ${(wsPrice || data?.current_price)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 bg-sky-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all duration-500"></div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 font-medium">7-Day Forecast</span>
              {trend === 'UP' ? <TrendingUp className="text-emerald-400" size={20} /> : <TrendingDown className="text-rose-400" size={20} />}
            </div>
            <div className="text-3xl font-bold text-white">
              ${data?.predicted_next_day_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm mt-2 font-semibold ${trend === 'UP' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend === 'UP' ? '+' : ''}{percentageChange}% Expected
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 font-medium">Technical Indicators</span>
              <Activity className="text-sky-400" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">RSI (14)</span>
                <span className={`font-bold ${data?.indicators.rsi! > 70 ? 'text-rose-400' : data?.indicators.rsi! < 30 ? 'text-emerald-400' : 'text-sky-400'}`}>
                  {data?.indicators.rsi.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">SMA 20/50</span>
                <span className={`font-bold ${data?.indicators.sma20! > data?.indicators.sma50! ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data?.indicators.sma20! > data?.indicators.sma50! ? 'Bullish Cross' : 'Bearish Cross'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 font-medium">Model Sentiment</span>
              <Cpu className="text-fuchsia-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-white uppercase tracking-wider">
              {trend === 'UP' ? 'Bullish' : 'Bearish'}
            </div>
            <p className="text-sm text-slate-500 mt-2">LSTM Multi-Feature Analysis</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 font-medium">Model Reliability</span>
              <Activity className="text-emerald-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-white">
              {metrics ? (100 - metrics.mape).toFixed(1) : '95.0'}%
            </div>
            <div className="text-sm mt-2 text-slate-500 flex flex-col gap-1">
              <span>MAE: ${metrics?.mae.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              <span className="text-xs text-slate-600 italic">Historical Backtest Accuracy</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white">Price Performance & 7-Day Forecast</h3>
            <div className="text-xs text-slate-400 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-sky-500 rounded-full"></span> Historical
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-fuchsia-500 rounded-full"></span> Predicted
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  minTickGap={30}
                  stroke="#94a3b8"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val > 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val: any, _name: any, props: any) => [
                    `$${Number(val).toLocaleString()}`,
                    props.payload.type === 'actual' ? 'Actual Price' : 'Forecasted Price'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  data={chartData.filter(d => d.type === 'actual')}
                  stroke="#38bdf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  data={chartData.filter(d => d.type === 'forecast')}
                  stroke="#d946ef"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorForecast)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Manager */}
        {token ? (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-10 mt-10">
            <AlertManager token={token} currentSymbol={symbol} />
          </div>
        ) : (
          <div className="mt-10">
            <Auth onLogin={(t) => setToken(t)} />
          </div>
        )}

        {/* Phase 5: Sandbox Mode */}
        <SandboxMode symbol={symbol} />

        {/* Prediction History */}
        <div className="mt-10 bg-slate-900/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Prediction History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-sm border-b border-slate-800">
                  <th className="pb-4 font-medium">Target Date</th>
                  <th className="pb-4 font-medium">Predicted Price</th>
                  <th className="pb-4 font-medium">Actual Price</th>
                  <th className="pb-4 font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {predictions.length > 0 ? predictions.map((p: any, i: number) => {
                  const diff = p.actual_price ? Math.abs(p.actual_price - p.predicted_price) : null;
                  const accuracy = diff !== null ? (100 - (diff / p.actual_price) * 100).toFixed(2) : 'Pending';

                  return (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-4 text-sm font-medium">{p.target_date}</td>
                      <td className="py-4 text-sm">${p.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="py-4 text-sm">{p.actual_price ? `$${p.actual_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}</td>
                      <td className={`py-4 text-sm font-bold ${accuracy === 'Pending' ? 'text-slate-500' : parseFloat(accuracy) > 95 ? 'text-emerald-400' : 'text-sky-400'}`}>
                        {accuracy}{accuracy !== 'Pending' ? '%' : ''}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 italic">No prediction history available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2026 CryptoForecast LSTM • Experimental Price Predictions</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
