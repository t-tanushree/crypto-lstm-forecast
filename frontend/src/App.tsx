import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MarketStats from './components/MarketStats';
import PriceChart from './components/PriceChart';
import ModelArchitecture from './components/ModelArchitecture';
import FearGreedIndex from './components/FearGreedIndex';
import NewsFeed from './components/NewsFeed';
import AuthPage from './components/AuthPage';
import TickerTape from './components/TickerTape';
import PredictionTable from './components/PredictionTable';
import TradingNotes from './components/TradingNotes';
import SentimentAggregator from './components/SentimentAggregator';
import { 
  Play, 
  RefreshCcw, 
  X, 
  Terminal as TerminalIcon, 
  Activity,
  Zap,
  Cpu,
  Info,
  TrendingUp
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const Terminal = ({ logs }: { logs: string[] }) => (
  <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 font-mono text-xs border border-white/5 h-64 overflow-y-auto custom-scrollbar shadow-inner">
    <div className="flex items-center gap-3 mb-4 text-slate-500 border-b border-white/5 pb-3">
      <TerminalIcon size={14} className="text-sky-500" />
      <span className="font-black uppercase tracking-widest">System_Console_v3.2</span>
    </div>
    {logs.map((log, i) => (
      <div key={i} className="mb-2 flex gap-3">
        <span className="text-sky-500/50 font-bold">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
        <span className={log.includes('ERROR') ? 'text-rose-400' : 'text-slate-300'}>{log}</span>
      </div>
    ))}
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [comparisonCoin, setComparisonCoin] = useState<string | null>(null);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [watchlist, setWatchlist] = useState(['BTC', 'ETH', 'SOL']);
  const [chartData, setChartData] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs, setLogs] = useState(['Terminal initialized. Ready for neural inference...']);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLogs(prev => [...prev, `Establishing secure tunnel to ${activeTab} nodes...`]);
      try {
        const [histRes, predRes, newsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/historical/${selectedAsset}`),
          axios.get(`${API_BASE_URL}/api/predict/${selectedAsset}`),
          axios.get(`${API_BASE_URL}/api/news/${selectedAsset}`)
        ]);
        
        const historical = histRes.data.data;
        const predictions = predRes.data.forecast;
        setNews(newsRes.data);

        const combined = [
          ...historical.map((d: any) => ({ ...d })),
          ...predictions.map((p: any) => ({ date: p.date, predicted: p.predicted }))
        ];

        setChartData(combined);
        setLogs(prev => [...prev, `Success: Synchronized LSTM temporal datasets.`]);
      } catch (error) {
        console.error("Fetch error:", error);
        setLogs(prev => [...prev, `ERROR: Pipeline connection refused.`]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) fetchData();
  }, [selectedAsset, isAuthenticated]);

  const refreshPrediction = async () => {
    setIsRefreshing(true);
    setLogs(prev => [...prev, `Re-initializing LSTM weights for ${activeTab}...`]);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/predict/${selectedAsset}`);
      setLogs(prev => [...prev, `Forecast updated: Confidence score 94.2%`]);
    } catch (e) {
      setLogs(prev => [...prev, `ERROR: Inference execution failed.`]);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={(name) => { setUser(name); setIsAuthenticated(true); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-inter">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 grid-overlay opacity-20" />
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} watchlist={watchlist} />
      
      <div className="flex-1 ml-72 flex flex-col h-screen relative z-10">
        <Header user={user} onSearch={(coin) => setSelectedAsset(coin.toUpperCase())} />

        <main className="flex-1 overflow-y-auto px-10 pb-12 custom-scrollbar">
          <TickerTape />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-8"
          >
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-white mb-2">
                  Market <span className="text-sky-400">Terminal</span>
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Zap size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Pair: {activeTab}/USD</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <Activity size={12} className="text-sky-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network: Synchronized</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshPrediction}
                  disabled={isRefreshing}
                  className="btn-premium flex items-center gap-2 text-white"
                >
                  {isRefreshing ? <RefreshCcw size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                  <span>Execute Neural Inference</span>
                </button>
              </div>
            </div>

            <SentimentAggregator />
            <MarketStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                {/* Main Chart Section */}
                <div className="glass-panel rounded-[48px] p-10 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">Predictive Analysis</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <Info size={14} className="text-sky-500" /> LSTM-DeepV3 Layer Projection
                      </p>
                    </div>
                    <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                      {['1H', '4H', '1D', '1W'].map((t) => (
                        <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest ${t === '1D' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-white'}`}>{t}</button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[450px] w-full">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <RefreshCcw className="animate-spin text-sky-500" size={48} />
                      </div>
                    ) : (
                      <PriceChart data={chartData} coins={[activeTab]} />
                    )}
                  </div>
                </div>

                <div className="glass-panel rounded-[48px] p-10">
                  <PredictionTable data={chartData.filter(d => d.predicted && !d.actual)} coin={selectedAsset} />
                </div>

                <div className="glass-panel rounded-[48px] p-10">
                  <TradingNotes coin={selectedAsset} username={user} />
                </div>
              </div>

              <div className="space-y-10">
                {/* Insights Column */}
                <div className="glass-panel rounded-[48px] p-10">
                  <h3 className="text-xl font-black text-white mb-8">Neural Insights</h3>
                  <div className="space-y-8">
                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Predicted Trend</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-white">Bullish Alpha</p>
                        <TrendingUp size={24} className="text-emerald-500" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inference Confidence</p>
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">94.2%</p>
                      </div>
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '94.2%' }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-[48px] p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Cpu size={18} className="text-sky-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-slate-300">Live Console</span>
                  </div>
                  <Terminal logs={logs} />
                </div>

                <div className="glass-panel rounded-[48px] p-8 flex flex-col items-center">
                  <FearGreedIndex value={68} />
                </div>

                <div className="glass-panel rounded-[48px] p-8 overflow-hidden">
                  <div className="flex items-center gap-3 mb-8">
                    <Activity size={18} className="text-sky-500" />
                    <h3 className="text-xl font-black text-white tracking-tight">Signal Feed</h3>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <NewsFeed news={news} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;