import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, User, Zap, ChevronDown, Command } from 'lucide-react';

const Header = ({ user, onSearch }: { user: string; onSearch?: (coin: string) => void }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.currentTarget.value.toUpperCase());
      e.currentTarget.value = '';
    }
  };

  return (
    <header className="h-24 flex items-center justify-between px-10 sticky top-0 z-20 bg-slate-950/20 backdrop-blur-md">
      <div className="flex items-center gap-8 flex-1">
        <div className="relative group w-full max-w-md">
          <div className="absolute inset-0 bg-sky-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search markets or commands..."
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-16 text-sm font-medium text-slate-100 focus:outline-none focus:border-sky-500/40 focus:ring-4 focus:ring-sky-500/5 transition-all"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-white/5">
            <Command size={10} className="text-slate-500" />
            <span className="text-[10px] font-black text-slate-500">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
          <div className="relative">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.15em]">Live Data Stream</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all group">
            <Bell size={22} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-sky-500 rounded-full border-[3px] border-slate-950 group-hover:scale-110 transition-transform" />
          </button>
          
          <div className="w-px h-10 bg-white/5 mx-2" />
          
          <div className="flex items-center gap-4 pl-2 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white tracking-tight leading-none mb-1">{user}</p>
              <div className="flex items-center justify-end gap-1.5">
                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enterprise UI</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="w-12 h-12 relative rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-xl shadow-sky-500/20 border border-white/20">
                {user.charAt(0).toUpperCase()}
              </div>
            </div>
            <ChevronDown size={16} className="text-slate-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
