import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  History, 
  Settings, 
  HelpCircle, 
  Star,
  Activity,
  Zap,
  Cpu,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  watchlist: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, selectedAsset, setSelectedAsset, watchlist }) => {
  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'predictions', icon: <TrendingUp size={20} />, label: 'Market Forecast' },
    { id: 'historical', icon: <History size={20} />, label: 'Price History' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Engine Config' },
  ];

  return (
    <aside className="w-72 h-screen flex flex-col fixed left-0 top-0 z-30 bg-slate-950/80 backdrop-blur-2xl border-r border-white/5">
      {/* Brand Logo */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">
              CryptoPulse<span className="text-sky-500">.</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">AI Predictive Engine</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar space-y-8">
        {/* Main Navigation */}
        <nav>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 px-4">Core Terminal</p>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full nav-item ${item.id === activeTab ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                {item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Dynamic Watchlist */}
        <div>
          <div className="flex items-center justify-between mb-4 px-4">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Active Assets</p>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </div>
          <div className="space-y-1">
            {watchlist.map((coin) => (
              <button
                key={coin}
                onClick={() => setSelectedAsset(coin)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                  selectedAsset === coin 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-1.5 rounded-lg ${selectedAsset === coin ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                    <Star size={14} className={selectedAsset === coin ? 'fill-indigo-400 text-indigo-400' : 'group-hover:text-white'} />
                  </div>
                  <span className="text-sm font-bold tracking-tight">{coin}</span>
                </div>
                <div className="text-[10px] font-black text-slate-600 bg-slate-900 px-2 py-0.5 rounded-md border border-white/5">USD</div>
              </button>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="px-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={14} className="text-sky-500" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Model Status</p>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              V3 Engine active. <span className="text-emerald-400">98.2%</span> uptime recorded.
            </p>
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-6 mt-auto border-t border-white/5 bg-slate-950/40">
        <button className="flex items-center gap-4 w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all">
          <LogOut size={18} />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
