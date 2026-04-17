import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import api from '../api';

const StudentResultsList = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await api.get('/student/all-results');
                setResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const handleDownloadPDF = async (e, attemptId) => {
        e.stopPropagation();
        try {
            const response = await api.get(`/student/attempts/${attemptId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ReportCard_${attemptId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('PDF Download error:', error);
            alert('Failed to download report card. Please try again.');
        }
    };

    return (
        <div className="p-6 space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <BookOpen size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black">My Results History</h1>
                    <p className="text-gray-500">Comprehensive overview of all your past exam attempts.</p>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center p-20 text-primary-500 font-bold">Loading your results...</div>
                ) : results.length > 0 ? (
                    results.map((result) => {
                        const percent = Math.round((result.score / result.totalMarks) * 100);
                        const isPass = percent >= 40; // Assuming 40% passing for now

                        return (
                            <div 
                                key={result.id} 
                                onClick={() => navigate(`/result/${result.id}`)}
                                className="glass-card p-6 border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPass ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-red-100 dark:bg-red-900/20 text-red-600'}`}>
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-primary-600 transition-colors">{result.examTitle}</h3>
                                        <p className="text-sm text-gray-500">Submitted: {new Date(result.submitTime).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Score</p>
                                        <p className={`text-2xl font-black ${isPass ? 'text-green-500' : 'text-red-500'}`}>{result.score}/{result.totalMarks}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Percentage</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{percent}%</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 pl-4 border-l border-gray-100 dark:border-slate-800">
                                        <button 
                                            onClick={(e) => handleDownloadPDF(e, result.id)}
                                            className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                                            title="Download Report card"
                                        >
                                            <Download size={20} />
                                        </button>
                                        <div className="p-3 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center glass-card border-none">
                        <BookOpen size={48} className="mx-auto text-gray-300 dark:text-slate-700 mb-4" />
                        <p className="font-bold text-lg text-gray-900 dark:text-white">No Results Found</p>
                        <p className="text-gray-500">You haven't completed any exams yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentResultsList;
