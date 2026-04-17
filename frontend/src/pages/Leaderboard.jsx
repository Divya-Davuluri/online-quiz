import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Medal, Clock, Star, TrendingUp } from 'lucide-react';
import api from '../api';

const Leaderboard = () => {
    const { id: examId } = useParams();
    const [rankers, setRankers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankers = async () => {
            try {
                const { data } = await api.get(`/student/exams/${examId}/leaderboard`);
                setRankers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRankers();
    }, [examId]);

    const getMedalColor = (rank) => {
        switch(rank) {
            case 0: return 'text-amber-400';
            case 1: return 'text-slate-400';
            case 2: return 'text-amber-600';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/50 mx-auto mb-6">
                    <Trophy size={40} />
                </div>
                <h1 className="text-4xl font-black">Global Leaderboard</h1>
                <p className="text-gray-500 mt-2">See how you stack up against the best performers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[0, 1, 2].map((i) => rankers[i] && (
                    <div key={i} className={`glass-card p-8 text-center border-none shadow-sm relative overflow-hidden ${i === 0 ? 'scale-110 z-10 border-2 border-amber-400/30' : ''}`}>
                         {i === 0 && <div className="absolute top-0 right-0 p-2 bg-amber-400 text-white rounded-bl-xl font-bold text-xs">TOP #1</div>}
                         <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 border-2 border-white dark:border-slate-700 shadow-lg">
                            <span className="text-2xl font-bold">{rankers[i].name.charAt(0)}</span>
                         </div>
                         <h3 className="font-bold text-lg">{rankers[i].name}</h3>
                         <p className="text-primary-600 font-black text-3xl mt-2">{rankers[i].score} pts</p>
                         <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-2">
                             <Clock size={12} /> {Math.floor(rankers[i].timeTaken / 60)}m {rankers[i].timeTaken % 60}s
                         </p>
                    </div>
                ))}
            </div>

            <div className="glass-card overflow-hidden border-none shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
                    <h3 className="font-bold uppercase tracking-widest text-sm text-gray-500">Hall of Fame</h3>
                    <TrendingUp size={18} className="text-primary-600" />
                </div>
                <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {rankers.map((ranker, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-all">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-8 font-black text-lg ${getMedalColor(i)}`}>
                                            {i < 3 ? <Medal size={24} /> : `#${i + 1}`}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center font-bold">
                                                {ranker.name.charAt(0)}
                                            </div>
                                            <span className="font-bold">{ranker.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <span className="font-black text-xl text-primary-600">{ranker.score}</span>
                                    <span className="text-xs text-gray-400 ml-2 font-bold uppercase tracking-tight">Points</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="text-sm text-gray-500 font-medium flex items-center justify-end gap-2">
                                        <Clock size={14} />
                                        {Math.floor(ranker.timeTaken / 60)}m {ranker.timeTaken % 60}s
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {rankers.length === 0 && !loading && (
                    <div className="p-20 text-center text-gray-500">
                        <Star size={40} className="mx-auto mb-4 opacity-20" />
                        <p>No rankings yet. Be the first to complete the exam!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
