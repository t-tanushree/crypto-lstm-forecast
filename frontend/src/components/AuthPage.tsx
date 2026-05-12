import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, User, TrendingUp, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  onLogin: (username: string) => void;
}

const API_BASE_URL = 'http://localhost:8000';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE_URL}/api/login`, {
          username,
          password
        });
        onLogin(response.data.username);
      } else {
        await axios.post(`${API_BASE_URL}/api/register`, {
          username,
          email,
          password
        });
        alert('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'An error occurred during authentication');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md rounded-[40px] p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 mb-6">
            <TrendingUp className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join CryptoLSTM'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Enter your credentials to access the terminal' : 'Start your forecasting journey today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              {isLogin ? 'Username or Email' : 'Username'}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder={isLogin ? 'Username or email' : 'CryptoTrader'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12"
                required
              />
            </div>
          </div>

          <button className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 group transition-all shadow-xl shadow-sky-500/20 mt-4">
            {isLogin ? 'Access Terminal' : 'Create Account'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sky-500 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
