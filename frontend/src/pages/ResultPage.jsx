import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Download, Home, ArrowRight, Award } from 'lucide-react';
import api from '../api';

const ResultPage = () => {
    const { attemptId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const { data } = await api.get(`/student/attempts/${attemptId}/result`);
                setResult(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId]);

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-primary-600">Processing your results...</div>;

    const { attempt, details } = result;
    const isPass = attempt.score >= (attempt.totalMarks * attempt.passingScore / 100);

    const handleDownloadPDF = async () => {
        try {
            const response = await api.get(`/student/attempts/${attemptId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate_${attemptId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('PDF Download error:', error);
            alert('Failed to download PDF. Please check your connection.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in">
            <div className="text-center mb-12">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ${isPass ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-red-100 dark:bg-red-900/20 text-red-600'}`}>
                    {isPass ? <Award size={48} /> : <XCircle size={48} />}
                </div>
                <h1 className="text-4xl font-black mb-2">{isPass ? 'Congratulations!' : 'Hard Luck!'}</h1>
                <p className="text-gray-500 text-lg">You have completed the <span className="font-bold text-gray-900 dark:text-white uppercase">"{attempt.title}"</span> exam.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="glass-card p-8 text-center border-none shadow-sm">
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-2">Your Score</p>
                    <p className={`text-5xl font-black ${isPass ? 'text-green-500' : 'text-red-500'}`}>{attempt.score}/{attempt.totalMarks}</p>
                </div>
                <div className="glass-card p-8 text-center border-none shadow-sm">
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-2">Percentage</p>
                    <p className="text-5xl font-black text-primary-600">{Math.round((attempt.score / attempt.totalMarks) * 100)}%</p>
                </div>
                <div className="glass-card p-8 text-center border-none shadow-sm">
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-2">Result Status</p>
                    <p className={`text-2xl font-black uppercase px-4 py-2 rounded-xl inline-block ${isPass ? 'bg-green-50 text-white' : 'bg-red-50 text-white'}`}>
                        {isPass ? 'PASSED' : 'FAILED'}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <CheckCircle2 size={24} className="text-primary-600" />
                    Review Your Answers
                </h3>
                
                {details.map((q, i) => {
                    const isCorrect = q.marksAwarded > 0;
                    return (
                        <div key={i} className={`glass-card p-8 border-l-8 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs font-bold uppercase">Question {i + 1}</span>
                                <span className={`font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>{q.marksAwarded}/{q.marks} Marks</span>
                            </div>
                            <h4 className="text-lg font-semibold mb-6">{q.questionText}</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">Your Answer</p>
                                    <p className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{q.studentAnswer || '(No answer provided)'}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10">
                                    <p className="text-xs text-primary-400 font-bold uppercase mb-2">Correct Answer</p>
                                    <p className="font-medium text-primary-600">{q.correctAnswer}</p>
                                </div>
                            </div>

                            {q.explanation && (
                                <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Explanation</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{q.explanation}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center gap-6 mt-12 pb-12">
                <Link to="/student" className="btn-secondary py-3 px-8">
                    <Home size={20} />
                    Back to Dashboard
                </Link>
                <button 
                    onClick={handleDownloadPDF}
                    className="btn-primary py-3 px-8 bg-slate-900 hover:bg-black shadow-xl"
                >
                    <Download size={20} />
                    Download PDF Report
                </button>
            </div>
        </div>
    );
};

export default ResultPage;
