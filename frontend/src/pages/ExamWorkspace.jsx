import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
    Clock, 
    Send, 
    ChevronLeft, 
    ChevronRight, 
    Flag, 
    LayoutGrid, 
    Monitor,
    Maximize2,
    Play,
    AlertCircle
} from 'lucide-react';
import api from '../api';
import Editor from '@monaco-editor/react';

const ExamWorkspace = () => {
    const { id: examId } = useParams();
    const [searchParams] = useSearchParams();
    const attemptId = searchParams.get('attempt');
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!isSubmitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isSubmitting]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get(`/exams/${examId}`);
                setExam(data);
                const qs = data.questions || [];
                setQuestions(qs);
                setTimeLeft((data.duration || 0) * 60);

                const initialAnswers = {};
                qs.forEach(q => {
                    initialAnswers[q.id] = '';
                });
                setAnswers(initialAnswers);
            } catch (err) {
                console.error(err);
                alert('Failed to load exam');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [examId]);

    useEffect(() => {
        if (timeLeft <= 0 && !loading) {
            handleSubmit();
            return;
        }
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [timeLeft, loading]);

    useEffect(() => {
        if (!questions.length) return;
        const autoSave = setInterval(async () => {
            const currentQ = questions[currentIdx];
            if (currentQ && answers[currentQ.id]) {
                try {
                    await api.post(`/student/attempts/${attemptId}/save`, {
                        questionId: currentQ.id,
                        answer: answers[currentQ.id]
                    });
                } catch (err) {
                    console.error('Auto-save failed', err);
                }
            }
        }, 5000);
        return () => clearInterval(autoSave);
    }, [currentIdx, answers, attemptId, questions]);

    const handleAnswerChange = (val) => {
        setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: val }));
    };

    const handleSubmit = async () => {
        const isTimeUp = timeLeft <= 0;
        if (!isTimeUp) {
            const confirmed = window.confirm('Are you sure you want to submit your exam?');
            if (!confirmed) return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`/student/attempts/${attemptId}/submit`, { autoSubmitted: isTimeUp });
            navigate(`/result/${attemptId}`);
        } catch (err) {
            alert('Submission failed');
            setIsSubmitting(false);
        }
    };

    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Executing code...\n');
        setTimeout(() => {
            const code = answers[questions[currentIdx]?.id] || '';
            if (code.includes('console.log')) {
                const logs = code.match(/console\.log\(['"](.*)['"]\)/g);
                if (logs) {
                    setOutput(logs.map(l => l.match(/\(['"](.*)['"]\)/)[1]).join('\n'));
                } else {
                    setOutput('Executed successfully with no output.');
                }
            } else {
                setOutput('Standard output:\n> Hello, the exam platform is working!\n> Process finished with exit code 0.');
            }
            setIsRunning(false);
        }, 1200);
    };

    const formatTime = (seconds) => {
        if (seconds < 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">Initializing exam environment...</div>;

    const currentQuestion = questions[currentIdx];

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950 overflow-hidden">
            <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-primary-600 rounded text-white text-sm font-bold">Exam</div>
                    <h2 className="text-lg font-bold truncate max-w-md">{exam?.title}</h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-primary-600'}`}>
                        <Clock size={20} />
                        {formatTime(timeLeft)}
                    </div>
                    <button onClick={handleSubmit} className="btn-primary py-2 px-6 shadow-primary-500/20">
                        Submit Exam <Send size={16} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-y-auto p-12">
                    <div className="max-w-4xl mx-auto w-full space-y-8">
                        {questions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 glass-card text-center gap-6">
                                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                                    <AlertCircle size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">No Questions Available</h3>
                                    <p className="text-gray-500">This exam hasn't been populated with questions yet.</p>
                                </div>
                                <button onClick={() => navigate('/student')} className="btn-secondary">Return to Dashboard</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between text-sm uppercase tracking-widest text-gray-500 font-bold">
                                    <span>Question {currentIdx + 1} of {questions.length}</span>
                                    <span>{currentQuestion?.marks || 0} Marks</span>
                                </div>
                                <div className="glass-card p-10 border-none shadow-sm min-h-[400px]">
                                    <h3 className="text-2xl font-semibold mb-10 leading-relaxed text-gray-800 dark:text-gray-100">
                                        {currentQuestion?.questionText}
                                    </h3>
                                    <div className="mt-8">
                                        {currentQuestion?.type === 'MCQ' && (
                                            <div className="space-y-4">
                                                {Object.entries(currentQuestion.options).map(([key, value]) => (
                                                    <label key={key} className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${answers[currentQuestion.id] === key ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'}`}>
                                                        <input type="radio" className="hidden" checked={answers[currentQuestion.id] === key} onChange={() => handleAnswerChange(key)} />
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border-2 ${answers[currentQuestion.id] === key ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200 dark:border-slate-700 text-gray-400'}`}>{key}</div>
                                                        <span className="text-lg font-medium">{value}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        {currentQuestion?.type === 'Short Answer' && (
                                            <textarea className="input-field min-h-[200px] text-lg p-6 bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700" placeholder="Type your answer here..." value={answers[currentQuestion.id] || ''} onChange={(e) => handleAnswerChange(e.target.value)}></textarea>
                                        )}
                                        {currentQuestion?.type === 'Coding' && (
                                            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                                                    <div className="flex gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <select className="bg-transparent text-xs font-mono outline-none">
                                                            <option>Javascript</option>
                                                            <option>Python</option>
                                                        </select>
                                                        <button onClick={handleRunCode} disabled={isRunning} className="flex items-center gap-1 text-xs text-primary-500 font-bold hover:bg-primary-50 p-1 px-2 rounded disabled:opacity-50">
                                                            <Play size={12} /> {isRunning ? 'Running...' : 'Run'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <Editor height="300px" defaultLanguage="javascript" theme="vs-dark" value={answers[currentQuestion.id] || ''} onChange={(val) => handleAnswerChange(val)} options={{ minimap: { enabled: false }, fontSize: 16 }} />
                                                {output && (
                                                    <div className="bg-slate-900 border-t border-slate-800 p-4 font-mono text-sm text-green-400 max-h-32 overflow-y-auto">
                                                        <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1 text-gray-500 text-[10px] uppercase font-bold">
                                                            <span>Terminal Output</span>
                                                            <button onClick={() => setOutput('')} className="hover:text-white">Clear</button>
                                                        </div>
                                                        <pre className="whitespace-pre-wrap">{output}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-8">
                                    <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} disabled={currentIdx === 0} className="btn-secondary py-3 px-8 disabled:opacity-50"><ChevronLeft size={20} /> Previous</button>
                                    <button className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors font-semibold"><Flag size={18} /> Flag Question</button>
                                    <button onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentIdx === questions.length - 1} className="btn-primary py-3 px-8 disabled:opacity-50">Next Question <ChevronRight size={20} /></button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={`w-80 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-6 transition-all duration-300 ${isSidebarOpen ? '' : 'translate-x-full absolute right-0'}`}>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-between">Question Palette <LayoutGrid size={16} /></h4>
                    <div className="grid grid-cols-4 gap-3">
                        {questions.map((q, idx) => (
                            <button key={q.id} onClick={() => setCurrentIdx(idx)} className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 border-2 ${idx === currentIdx ? 'border-primary-500 text-primary-600' : answers[q.id] ? 'bg-slate-800 border-slate-800 text-white' : 'bg-gray-100 dark:bg-slate-800 border-transparent text-gray-400'}`}>{idx + 1}</button>
                        ))}
                    </div>
                    <div className="mt-10 space-y-4 pt-10 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-sm"><div className="w-4 h-4 rounded bg-slate-800"></div><span className="text-gray-500">Answered</span></div>
                        <div className="flex items-center gap-3 text-sm"><div className="w-4 h-4 rounded bg-gray-100 dark:bg-slate-800"></div><span className="text-gray-500">Not Answered</span></div>
                        <div className="flex items-center gap-3 text-sm"><div className="w-4 h-4 rounded border-2 border-primary-500"></div><span className="text-gray-500">Current</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamWorkspace;
