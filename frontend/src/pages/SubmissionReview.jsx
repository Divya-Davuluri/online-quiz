import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    Code, 
    Type
} from 'lucide-react';
import api from '../api';

const SubmissionReview = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState({});

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const { data } = await api.get(`/student/attempts/${attemptId}/result`);
                setResult(data);
                
                // Initialize grading state
                const initialGrading = {};
                data.details.forEach(q => {
                    initialGrading[q.questionId] = q.marksAwarded;
                });
                setGrading(initialGrading);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmission();
    }, [attemptId]);

    const handleUpdateGrade = async (qId, marks) => {
        setGrading({ ...grading, [qId]: parseInt(marks) });
    };

    const handleSaveGrades = async () => {
        try {
            await api.post(`/admin/attempts/${attemptId}/grade`, grading);
            alert('Grades updated successfully!');
            navigate('/admin');
        } catch (err) {
            alert('Failed to update grades');
        }
    };

    if (loading) return <div>Loading submission...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Review Submission</h1>
                    <p className="text-gray-500">Student: <span className="text-primary-600 font-bold">{result.attempt.studentName}</span> • Exam: {result.attempt.title}</p>
                </div>
            </div>

            <div className="space-y-6">
                {result.details.map((q, i) => (
                    <div key={i} className="glass-card p-8 border-none shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 bg-zinc-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold">{i + 1}</span>
                                {q.type === 'Coding' ? <Code size={18} className="text-blue-500" /> : <Type size={18} className="text-purple-500" />}
                                <span className="text-sm font-bold opacity-50 uppercase tracking-widest">{q.type}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-xs font-bold text-gray-400">Award Marks:</label>
                                <input 
                                    type="number" 
                                    max={q.marks}
                                    min={0}
                                    className="w-20 input-field py-1 text-center font-bold text-primary-600"
                                    value={grading[q.questionId]}
                                    onChange={(e) => handleUpdateGrade(q.questionId, e.target.value)}
                                />
                                <span className="text-sm font-bold text-gray-400">/ {q.marks}</span>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold">{q.questionText}</h3>
                        
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Student Answer</p>
                            {q.type === 'Coding' ? (
                                <pre className="font-mono text-sm bg-black p-4 rounded-xl text-green-400 overflow-x-auto">
                                    {q.studentAnswer || '// No code submitted'}
                                </pre>
                            ) : (
                                <p className="text-gray-700 dark:text-gray-300 italic">
                                    "{q.studentAnswer || 'No answer provided'}"
                                </p>
                            )}
                        </div>

                        <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl">
                            <p className="text-xs font-bold text-primary-400 uppercase mb-1">Correct Answer Reference</p>
                            <p className="text-sm text-primary-600 font-medium">{q.correctAnswer}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-8 right-8 flex gap-4">
                <button 
                    onClick={() => navigate('/admin')}
                    className="btn-secondary py-3 px-8 shadow-xl"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSaveGrades}
                    className="btn-primary py-3 px-8 shadow-xl shadow-primary-500/20"
                >
                    <Save size={20} />
                    Finalize Grading
                </button>
            </div>
        </div>
    );
};

export default SubmissionReview;
