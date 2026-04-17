import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, 
    Calendar, 
    ArrowRight, 
    Trophy,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
    const [exams, setExams] = useState([]);
    const [stats, setStats] = useState({
        averageScore: 0,
        examsTaken: 0,
        rank: 0,
        pastResults: []
    });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [examsRes, statsRes] = await Promise.all([
                    api.get('/exams/published'),
                    api.get('/student/dashboard-stats')
                ]);
                setExams(examsRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStartExam = async (examId) => {
        try {
            const { data } = await api.post(`/student/exams/${examId}/start`);
            navigate(`/exam/${examId}?attempt=${data.attemptId}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Error starting exam');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Portal</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name}! Ready for your next challenge?</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Available Exams */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar size={20} className="text-primary-600" />
                        Upcoming Exams
                    </h2>
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map(i => <div key={i} className="h-48 glass-card animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {exams.length > 0 ? exams.map((exam) => (
                                <div key={exam.id} className="glass-card p-6 border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-1">
                                            {new Date() >= new Date(exam.startTime) && new Date() <= new Date(exam.endTime) ? (
                                                <div className="px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider w-fit animate-pulse-slow">
                                                    Live Now
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
                                                    Upcoming: {new Date(exam.startTime).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                                            <Clock size={14} />
                                            {exam.duration}m
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">{exam.title}</h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">Test your knowledge in {exam.title}. Ensure a stable internet connection.</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
                                        <div className="text-xs text-gray-400">
                                            Passing: {exam.passingScore}%
                                        </div>
                                        <button 
                                            onClick={() => handleStartExam(exam.id)}
                                            className="btn-primary py-2 px-6"
                                        >
                                            Start Exam
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-2 py-20 text-center glass-card border-none">
                                    <p className="text-gray-500">No exams currently published.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="glass-card p-8 bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-xl">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Trophy size={20} />
                            Your Performance
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2 opacity-80">
                                    <span>Average Score</span>
                                    <span>{stats.averageScore}%</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white" style={{ width: `${stats.averageScore}%` }}></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-3 rounded-xl text-center">
                                    <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">Taken</p>
                                    <p className="text-xl font-bold">{stats.examsTaken}</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl text-center">
                                    <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest mb-1">Avg Rank</p>
                                    <p className="text-xl font-bold">{stats.rank > 0 ? `#${stats.rank}` : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 border-none shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Past Results</h3>
                        <div className="space-y-4">
                            {stats.pastResults.length > 0 ? stats.pastResults.map((result) => (
                                <div key={result.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-slate-700 cursor-pointer" onClick={() => navigate(`/result/${result.id}`)}>
                                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-semibold truncate">{result.examTitle}</p>
                                        <p className="text-xs text-gray-500">Score: {result.score}/{result.totalMarks} • {Math.round((result.score / result.totalMarks) * 100)}%</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 text-center py-6">No exam history found.</p>
                            )}
                        </div>
                        {stats.pastResults.length > 0 && (
                            <button className="w-full mt-6 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl transition-all">
                                View Full History
                            </button>
                        )}
                    </div>

                    <div className="glass-card p-6 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20">
                        <h3 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2">
                            <AlertCircle size={16} />
                            Safety Tip
                        </h3>
                        <p className="text-xs text-amber-700 dark:text-amber-600/80 leading-relaxed">
                            Always keep your camera on and your mic muted. Switching tabs during exams may lead to auto-submission.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
