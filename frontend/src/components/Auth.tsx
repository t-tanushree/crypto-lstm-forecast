import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

interface AuthProps {
    onLogin: (token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const params = new URLSearchParams();
                params.append('username', email);
                params.append('password', password);
                const res = await axios.post(`${API_BASE_URL}/token`, params);
                onLogin(res.data.access_token);
            } else {
                // Frontend Validations
                if (!fullName || fullName.length < 2) {
                    setError('Full name must be at least 2 characters');
                    setLoading(false);
                    return;
                }
                if (password.length < 8) {
                    setError('Password must be at least 8 characters');
                    setLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }

                await axios.post(`${API_BASE_URL}/register`, { 
                    email, 
                    full_name: fullName, 
                    password 
                });
                setError('Account created! Please log in.');
                setIsLogin(true);
                // Clear fields for login
                setFullName('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            const status = err.response?.status;
            let msg = err.response?.data?.detail || 'Authentication failed';
            if (status === 401 && isLogin) {
                msg = "Incorrect email or password. If you just registered and it failed, please try 'Sign Up' again.";
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 shadow-2xl rounded-3xl border border-slate-800 p-8 w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Join the Future'}
                </h2>
                <p className="text-slate-400 text-sm">
                    {isLogin ? 'Sign in to access your personalized dashboard' : 'Create an account to track your watchlist and alerts'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Full Name</label>
                        <div className="relative">
                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                placeholder="John Doe"
                                required={!isLogin}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {!isLogin && (
                    <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                placeholder="••••••••"
                                required={!isLogin}
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-xl text-xs">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                    {loading ? 'Processing...' : (
                        isLogin ? <><LogIn size={20} /> Sign In</> : <><UserPlus size={20} /> Create Account</>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
                >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
        </div>
    );
};

export default Auth;
