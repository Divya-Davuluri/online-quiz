import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    FileText, 
    Trash2, 
    CheckCircle2, 
    Eye, 
    Upload, 
    X,
    Clock,
    Target,
    Printer
} from 'lucide-react';
import api from '../api';

const ExamManagement = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        duration: 60,
        passingScore: 70,
        startTime: '',
        endTime: ''
    });

    const fetchExams = async () => {
        try {
            const { data } = await api.get('/admin/all-exams');
            setExams(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleCreateExam = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/admin/exams', formData);
            setIsModalOpen(false);
            setFormData({ title: '', duration: 60, passingScore: 70, startTime: '', endTime: '' });
            navigate(`/admin/exams/${data.id}/questions`);
        } catch (err) {
            alert('Failed to create exam');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (id) => {
        try {
            await api.put(`/admin/exams/${id}/publish`);
            fetchExams();
        } catch (err) {
            alert('Failed to publish exam');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? Only draft exams can be deleted.')) return;
        try {
            await api.delete(`/admin/exams/${id}`);
            fetchExams();
        } catch (err) {
            alert('Failed to delete exam. It might be published.');
        }
    };

    const handleExportPDF = (id) => {
        window.open(`${api.defaults.baseURL}/admin/exams/${id}/export-pdf`, '_blank');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exam Management</h1>
                    <p className="text-gray-500">Create, edit, and publish your examination papers.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary shadow-xl shadow-primary-500/20"
                >
                    <Plus size={20} />
                    Create New Exam
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {exams.map((exam) => (
                    <div key={exam.id} className="glass-card p-6 flex items-center justify-between border-none shadow-sm group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                <FileText size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">{exam.title}</h3>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={14} /> {exam.duration} mins</span>
                                    <span className="flex items-center gap-1"><Target size={14} /> Pass: {exam.passingScore}%</span>
                                    <span className={`flex items-center gap-1 ${exam.published ? 'text-green-500 font-bold' : 'text-amber-500'}`}>
                                        <CheckCircle2 size={14} /> {exam.published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate(`/admin/exams/${exam.id}/questions`)}
                                title="Manage Questions"
                                className="btn-secondary h-10 w-10 p-0 flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 border-none"
                            >
                                <Eye size={18} />
                            </button>
                            <button 
                                onClick={() => handleExportPDF(exam.id)}
                                title="Export Questions PDF"
                                className="btn-secondary h-10 w-10 p-0 flex items-center justify-center border-none"
                            >
                                <Printer size={18} />
                            </button>
                            <button 
                                onClick={() => handleDelete(exam.id)}
                                title="Delete Draft"
                                className="btn-secondary h-10 w-10 p-0 flex items-center justify-center text-red-500 hover:bg-red-50 border-none"
                            >
                                <Trash2 size={18} />
                            </button>
                            {!exam.published && (
                                <button 
                                    onClick={() => handlePublish(exam.id)}
                                    className="btn-primary py-2 px-6"
                                >
                                    Publish
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {exams.length === 0 && (
                    <div className="glass-card p-20 text-center border-dashed border-2 border-gray-200 dark:border-slate-800">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400">No Exams Found</h3>
                        <p className="text-gray-500 mt-2">Start by creating your first examination paper.</p>
                    </div>
                )}
            </div>

            {/* Create Exam Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-xl p-8 border border-white/10 shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black italic tracking-tighter">NEW EXAM CONFIG</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleCreateExam} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">Exam Title</label>
                                <input 
                                    required
                                    type="text" 
                                    className="input-field" 
                                    placeholder="e.g. Advanced React Architecture"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">Duration (Mins)</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="input-field" 
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">Passing Score (%)</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="input-field" 
                                        value={formData.passingScore}
                                        onChange={(e) => setFormData({...formData, passingScore: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">Start Window</label>
                                    <input 
                                        required
                                        type="datetime-local" 
                                        className="input-field text-sm" 
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">End Window</label>
                                    <input 
                                        required
                                        type="datetime-local" 
                                        className="input-field text-sm" 
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 py-4">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 uppercase font-black italic tracking-tighter">
                                    {loading ? 'Initializing...' : 'Establish Protocol'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamManagement;
