import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Trash2, 
    ChevronLeft, 
    Code, 
    CheckCircle2, 
    HelpCircle,
    Save,
    Upload
} from 'lucide-react';
import api from '../api';

const QuestionManagement = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        questionText: '',
        type: 'MCQ',
        marks: 5,
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        explanation: ''
    });

    useEffect(() => {
        const fetchExamDetails = async () => {
            try {
                const { data } = await api.get(`/exams/${examId}`);
                setExam(data);
                setQuestions(data.questions || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchExamDetails();
    }, [examId]);

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post(`/admin/exams/${examId}/questions`, newQuestion);
            setQuestions([...questions, { ...newQuestion, id: data.id }]);
            setIsAdding(false);
            setNewQuestion({
                questionText: '',
                type: 'MCQ',
                marks: 5,
                options: { A: '', B: '', C: '', D: '' },
                correctAnswer: 'A',
                explanation: ''
            });
        } catch (err) {
            alert('Failed to add question');
        }
    };

    const handleDeleteQuestion = async (qId) => {
        // Implement delete endpoint if needed
        setQuestions(questions.filter(q => q.id !== qId));
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/exams')} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold">Manage Questions</h1>
                    <p className="text-gray-500">Exam: <span className="text-primary-600 font-bold">{exam?.title}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Questions List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Total Questions: {questions.length}</h2>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="btn-primary py-2"
                        >
                            <Plus size={18} />
                            Add Question
                        </button>
                    </div>

                    {questions.map((q, idx) => (
                        <div key={q.id} className="glass-card p-6 border-none shadow-sm group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">{idx + 1}</span>
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-[10px] font-bold uppercase text-gray-400 tracking-widest">{q.type}</span>
                                    <span className="text-sm font-bold text-gray-500">{q.marks} Marks</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h3 className="text-lg font-semibold mb-4">{q.questionText}</h3>
                            {q.type === 'MCQ' && (
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {Object.entries(q.options).map(([key, val]) => (
                                        <div key={key} className={`p-2 rounded-lg text-sm flex items-center gap-2 ${q.correctAnswer === key ? 'bg-green-500/10 border border-green-500/20 text-green-600' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-500'}`}>
                                            <span className="font-bold">{key}:</span> {val}
                                            {q.correctAnswer === key && <CheckCircle2 size={12} />}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {q.explanation && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-500">
                                    <span className="font-bold">Explanation:</span> {q.explanation}
                                </div>
                            )}
                        </div>
                    ))}

                    {questions.length === 0 && !isAdding && (
                        <div className="p-20 text-center glass-card border-dashed">
                            <HelpCircle size={40} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">No questions added yet. Start by adding one or uploading an Excel file.</p>
                        </div>
                    )}
                </div>

                {/* Question Form / Instructions */}
                <div className="space-y-6">
                    {isAdding ? (
                        <div className="glass-card p-8 border-none shadow-xl animate-fade-in">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Plus size={20} className="text-primary-600" />
                                Create Question
                            </h3>
                            <form onSubmit={handleAddQuestion} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Question Type</label>
                                    <select 
                                        className="input-field py-2"
                                        value={newQuestion.type}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                                    >
                                        <option value="MCQ">Multiple Choice</option>
                                        <option value="Short Answer">Short Answer</option>
                                        <option value="Coding">Coding Challenge</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Question Text</label>
                                    <textarea 
                                        className="input-field h-24 text-sm"
                                        placeholder="What is the time complexity of binary search?"
                                        value={newQuestion.questionText}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                                        required
                                    />
                                </div>

                                {newQuestion.type === 'MCQ' && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Options</label>
                                        {['A', 'B', 'C', 'D'].map(key => (
                                            <div key={key} className="flex gap-2">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border-2 cursor-pointer ${newQuestion.correctAnswer === key ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/30' : 'border-gray-200 dark:border-slate-800 text-gray-400'}`}
                                                    onClick={() => setNewQuestion({...newQuestion, correctAnswer: key})}
                                                >
                                                    {key}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    className="input-field py-2 text-sm" 
                                                    placeholder={`Option ${key}`}
                                                    value={newQuestion.options[key]}
                                                    onChange={(e) => setNewQuestion({
                                                        ...newQuestion, 
                                                        options: { ...newQuestion.options, [key]: e.target.value }
                                                    })}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {newQuestion.type !== 'MCQ' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Correct Answer / Pattern</label>
                                        <input 
                                            type="text" 
                                            className="input-field py-2 text-sm" 
                                            placeholder="e.g. O(log n)"
                                            value={newQuestion.correctAnswer}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Explanation</label>
                                    <textarea 
                                        className="input-field h-16 text-xs"
                                        placeholder="Optional: Explain why this is the correct answer."
                                        value={newQuestion.explanation}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary py-2 text-sm">Cancel</button>
                                    <button type="submit" className="btn-primary py-2 text-sm">Save Question</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="glass-card p-8 border-none shadow-sm flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6">
                                <Upload size={32} />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Excel Question Upload</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                Quickly add multiple questions at once. Download our template and upload it back.
                            </p>
                            <button 
                                onClick={() => window.open(`${api.defaults.baseURL}/admin/template`, '_blank')}
                                className="btn-secondary w-full py-2 mb-3"
                            >
                                Download Template
                            </button>
                            <label className="btn-primary w-full py-2 bg-slate-900 hover:bg-black cursor-pointer">
                                <Upload size={18} />
                                {loading ? 'Importing...' : 'Upload File'}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".xlsx"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setLoading(true);
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        try {
                                            await api.post(`/admin/exams/${examId}/import`, formData);
                                            alert('Questions imported successfully');
                                            window.location.reload();
                                        } catch (err) {
                                            alert('Import failed');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionManagement;
