import React, { useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

interface SandboxProps {
    symbol: string;
}

const SandboxMode: React.FC<SandboxProps> = ({ symbol }) => {
    const [date, setDate] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRunSandbox = async () => {
        if (!date) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/sandbox/${symbol}/${date}`);
            setData(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch sandbox data');
        } finally {
            setLoading(false);
        }
    };

    const chartData = data ? data.forecast_7d.map((val: number, i: number) => ({
        day: `Day ${i + 1}`,
        predicted: val,
        actual: data.actual_7d[i] || null
    })) : [];

    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 p-8 mt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                        <Calendar className="text-sky-400" size={24} />
                        Interactive <span className="text-sky-400">Sandbox</span>
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Test the model on any historical date to verify its accuracy.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent border-none text-white focus:ring-0 text-sm px-2 cursor-pointer"
                    />
                    <button
                        onClick={handleRunSandbox}
                        disabled={loading || !date}
                        className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20"
                    >
                        {loading ? 'Analyzing...' : <><Search size={16} /> Run Backtest</>}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                    <ArrowRight className="rotate-180" size={16} /> {error}
                </div>
            )}

            {!data && !loading && (
                <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                    <Calendar size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">Pick a date to start the simulation</p>
                    <p className="text-xs mt-1">Note: Data availability varies by coin</p>
                </div>
            )}

            {loading && (
                <div className="h-[300px] flex flex-col items-center justify-center text-sky-400">
                    <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-bold animate-pulse text-center">
                        Processing Simulation... <br />
                        <span className="text-[10px] font-normal text-slate-500">Checking local DB & reaching out to yFinance for missing history if needed.</span>
                    </p>
                </div>
            )}

            {data && !loading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="sandboxPred" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="sandboxActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f8fafc" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f8fafc" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                                <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                                />
                                <Area type="monotone" dataKey="predicted" stroke="#38bdf8" strokeWidth={3} fill="url(#sandboxPred)" name="Model Forecast" />
                                <Area type="monotone" dataKey="actual" stroke="#f8fafc" strokeWidth={2} strokeDasharray="5 5" fill="url(#sandboxActual)" name="Actual Price" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-slate-400">Sandbox Analysis</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Start Date</span>
                                <span className="text-white font-medium text-sm">{data.sandbox_date}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Forecast Horizon</span>
                                <span className="text-white font-medium text-sm">7 Days</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <div className="text-emerald-400 font-black text-2xl flex items-center gap-2">
                                    <CheckCircle2 size={24} /> Verified
                                </div>
                                <p className="text-slate-500 text-[10px] mt-2 leading-relaxed">
                                    Simulation completed. Comparison chart shows predicted trajectory vs. actual historical market data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SandboxMode;
