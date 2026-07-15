import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', {
                username,
                password
            });
            
            const { token, fullName, role } = response.data;
            localStorage.setItem('jwtToken', token);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('fullName', fullName);
            localStorage.setItem('role', role);

            onLoginSuccess();
        } catch (err) {
            console.error(err);
            setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-md transition-opacity duration-300">
            <div class="w-full max-w-md p-8 mx-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-lg">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 text-white text-2xl font-outfit font-bold shadow-lg shadow-primary-500/30 mb-4">
                        MV
                    </div>
                    <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Chào mừng quay trở lại</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Đăng nhập vào hệ thống Minh Vũ Store</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tên đăng nhập</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <i className="fa-solid fa-user"></i>
                            </span>
                            <input 
                                type="text" 
                                required 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all text-sm" 
                                placeholder="admin"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mật khẩu</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <i class="fa-solid fa-lock"></i>
                            </span>
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all text-sm" 
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span>{loading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                        {!loading && <i className="fa-solid fa-arrow-right"></i>}
                    </button>
                </form>
            </div>
        </div>
    );
}
