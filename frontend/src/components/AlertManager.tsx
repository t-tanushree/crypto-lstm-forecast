import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

interface Alert {
    id: number;
    symbol: string;
    condition_type: string;
    target_value: number;
    is_active: boolean;
}

interface AlertManagerProps {
    token: string;
    currentSymbol: string;
}

const AlertManager: React.FC<AlertManagerProps> = ({ token, currentSymbol }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [targetValue, setTargetValue] = useState('');
    const [conditionType, setConditionType] = useState('PRICE_ABOVE');
    const [loading, setLoading] = useState(false);

    const fetchAlerts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(res.data);
        } catch (err) {
            console.error('Failed to fetch alerts', err);
        }
    };

    useEffect(() => {
        if (token) fetchAlerts();
    }, [token]);

    const handleCreateAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetValue) return;

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/alerts`, {
                symbol: currentSymbol,
                condition_type: conditionType,
                target_value: parseFloat(targetValue)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTargetValue('');
            fetchAlerts();
        } catch (err) {
            console.error('Failed to create alert', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-sky-500/20 p-3 rounded-2xl">
                    <Bell className="text-sky-400" size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white">Market <span className="text-sky-400">Alerts</span></h3>
                    <p className="text-slate-400 text-sm">Get notified when targets are hit.</p>
                </div>
            </div>

            <form onSubmit={handleCreateAlert} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1">Condition</label>
                    <select
                        value={conditionType}
                        onChange={(e) => setConditionType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                        <option value="PRICE_ABOVE">Price Above</option>
                        <option value="PRICE_BELOW">Price Below</option>
                    </select>
                </div>
                <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1">Target Price ($)</label>
                    <input
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-sky-500 outline-none"
                        placeholder="e.g. 75000"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Add Alert
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                        <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                        <p className="text-sm">No active alerts for this account.</p>
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div key={alert.id} className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${alert.condition_type.includes('ABOVE') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {alert.condition_type.includes('ABOVE') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-black text-sm">{alert.symbol}</span>
                                        <span className="text-slate-500 text-[10px] font-bold uppercase">
                                            {alert.condition_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-sky-400 font-bold">${alert.target_value.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-slate-500 hover:text-rose-500 p-2">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertManager;
