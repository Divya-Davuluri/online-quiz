import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Search, Clock, Award } from 'lucide-react';
import api from '../api';

const GlobalLeaderboard = () => {
    const [rankers, setRankers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await api.get('/student/global-leaderboard');
                setRankers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const filteredRankers = rankers.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="p-6 space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="text-center space-y-4 mb-12">
                <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-amber-500/30 transform rotate-3">
                    <Trophy size={40} />
                </div>
                <h1 className="text-4xl font-black tracking-tight">Global Leaderboard</h1>
                <p className="text-gray-500 max-w-xl mx-auto">See how you stack up against the best. Rankings are based on total cumulative score and time taken across all completed exams.</p>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search student rank..." 
                        className="input-field pl-12 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900">
                {loading ? (
                    <div className="h-64 flex items-center justify-center text-primary-500 font-bold">Loading Rankings...</div>
                ) : filteredRankers.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                            <tr>
                                <th className="px-8 py-5">Rank</th>
                                <th className="px-8 py-5">Student</th>
                                <th className="px-8 py-5">Exams Taken</th>
                                <th className="px-8 py-5">Global Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                            {filteredRankers.map((ranker, index) => {
                                const rank = index + 1;
                                return (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3 font-black text-xl">
                                                {rank === 1 && <Medal className="text-yellow-500" size={28} />}
                                                {rank === 2 && <Medal className="text-gray-400" size={28} />}
                                                {rank === 3 && <Medal className="text-amber-700" size={28} />}
                                                {rank > 3 && <span className="w-7 text-center text-gray-400">{rank}</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                                                    {ranker.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors">{ranker.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-bold text-gray-600 dark:text-gray-400">
                                                {ranker.examsTaken} Completed
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-600">
                                                {ranker.totalScore || 0} pts
                                            </div>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock size={12} /> {(ranker.totalTime / 60).toFixed(1)} mins
                                            </p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="py-20 text-center flex flex-col items-center justify-center text-gray-500">
                        <Award size={48} className="text-gray-300 dark:text-slate-700 mb-4" />
                        <p className="font-bold text-lg mb-1">No Data Available</p>
                        <p className="text-sm">The leaderboard will populate once students complete their exams.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalLeaderboard;
