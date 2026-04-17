import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Globe } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data);
            navigate(data.user.role === 'admin' ? '/admin' : '/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-gradient-mesh overflow-hidden relative">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-10 w-72 h-72 bg-primary-600/30 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-0 -right-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>

            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/50 mx-auto mb-6">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Login to access your quiz dashboard</p>
                </div>

                <div className="glass-card p-8 bg-slate-900/50">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    className="input-field pl-10 bg-slate-800/50 border-slate-700 text-white"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    className="input-field pl-10 bg-slate-800/50 border-slate-700 text-white"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-lg"
                        >
                            {loading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="relative my-8 text-center text-sm text-slate-500">
                        <span className="absolute left-0 top-1/2 w-full h-[1px] bg-slate-800 -z-10"></span>
                        <span className="bg-slate-900 px-4">OR</span>
                    </div>

                    <button className="btn-secondary w-full py-3 bg-slate-800 border-slate-700 text-slate-200">
                        <Globe size={20} className="text-primary-500" />
                        Continue with Google
                    </button>

                    <p className="mt-8 text-center text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-400 font-semibold hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
