import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, 
    FileText, 
    CheckCircle2, 
    Clock, 
    Search
} from 'lucide-react';
import api from '../api';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalExams: 0,
        totalStudents: 0,
        totalSubmissions: 0,
        recentSubmissions: []
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newExam, setNewExam] = useState({
        title: '',
        duration: 60,
        passingScore: 70,
        startTime: '',
        endTime: ''
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/dashboard-stats');
                setStats(data);
                
                // For demo, let's fetch students too
                const { data: studentList } = await api.get('/admin/students');
                setStudents(studentList);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Exams', value: stats.totalExams, icon: <FileText className="text-blue-500" />, color: 'bg-blue-500/10', onClick: () => navigate('/admin/exams') },
        { label: 'Total Students', value: stats.totalStudents, icon: <Users className="text-purple-500" />, color: 'bg-purple-500/10', onClick: () => navigate('/admin/students') },
        { label: 'Submissions', value: stats.totalSubmissions, icon: <CheckCircle2 className="text-green-500" />, color: 'bg-green-500/10', onClick: () => navigate('/admin/reports') },
        { label: 'Ongoing', value: stats.ongoingExams || 0, icon: <Clock className="text-amber-500" />, color: 'bg-amber-500/10' },
    ];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = {
        labels: stats.monthlyStats?.map(s => monthNames[parseInt(s.month) - 1]) || monthNames.slice(0, 6),
        datasets: [{
            label: 'Exams Scheduled',
            data: stats.monthlyStats?.map(s => s.count) || [0, 0, 0, 0, 0, 0],
            backgroundColor: '#0ea5e9',
            borderRadius: 8,
        }]
    };

    const handleExportStudents = () => {
        const headers = ['Name', 'Email', 'Exams Taken'];
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + students.map(s => [s.name, s.email, s.examsTaken].join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "students_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/admin/exams', newExam);
            setShowModal(false);
            setNewExam({ title: '', duration: 60, passingScore: 70, startTime: '', endTime: '' });
            navigate(`/admin/exams/${data.id}/questions`);
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating exam');
        } finally {
            setLoading(false);
        }
    };

    const handleRetakePermission = async (studentId) => {
        if (window.confirm('Allow this student to retake? Previous and current attempt data for this specific exam will be cleared.')) {
            alert('Retake permission granted.');
        }
    };

    const filteredStudents = (students || []).filter(s => 
        (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (s.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Portal</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExportStudents} className="btn-secondary">Export Report</button>
                    <button onClick={() => setShowModal(true)} className="btn-primary">Create New Exam</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <div 
                        key={i} 
                        onClick={card.onClick}
                        className={`glass-card p-6 flex items-center gap-4 border-none shadow-sm ${card.onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-200' : ''}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 border-none shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold">Performance Trends</h3>
                    </div>
                    <div className="h-72">
                        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="glass-card p-8 border-none shadow-sm h-full">
                    <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
                    <div className="space-y-6 overflow-y-auto max-h-[400px]">
                        {stats.recentSubmissions?.length > 0 ? stats.recentSubmissions.map((sub, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                                        {sub.studentName?.charAt(0) || '?'}
                                    </div>
                                    <div className="truncate w-32">
                                        <p className="text-sm font-semibold truncate">{sub.studentName || 'Unknown'}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{sub.examTitle}</p>
                                    </div>
                                </div>
                                 <div className="text-right flex flex-col items-end">
                                    <p className="text-sm font-bold text-green-500">{sub.score !== null ? `${sub.score}%` : 'Pending'}</p>
                                    <button 
                                        onClick={() => navigate(`/admin/submissions/${sub.id}/review`)}
                                        className="text-[10px] text-primary-600 font-bold hover:underline"
                                    >
                                        Review & Grade
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400 text-sm italic">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden border-none shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Student Directory</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search name or email..." 
                            className="input-field pl-10 py-1.5 text-sm w-64" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Student</th>
                                <th className="px-6 py-4 font-semibold">Exams</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-xs uppercase">
                                                {student.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{student.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-gray-400">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                            {student.examsTaken || 0} TAKEN
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            <span className="text-xs">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button className="text-primary-600 hover:text-primary-800 text-xs font-bold uppercase tracking-tighter">Report</button>
                                        <button 
                                            onClick={() => handleRetakePermission(student.id)}
                                            className="text-amber-600 hover:text-amber-800 text-xs font-bold uppercase tracking-tighter"
                                        >
                                            Retake
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Exam Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-xl p-8 border border-white/10 shadow-2xl animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black italic tracking-tighter">NEW EXAM CONFIG</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleCreateExam} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">Exam Title</label>
                                <input 
                                    required
                                    type="text" 
                                    className="input-field" 
                                    placeholder="e.g. Advanced React Architecture"
                                    value={newExam.title}
                                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">Duration (Mins)</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="input-field" 
                                        value={newExam.duration}
                                        onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">Passing Score (%)</label>
                                    <input 
                                        required
                                        type="number" 
                                        className="input-field" 
                                        value={newExam.passingScore}
                                        onChange={(e) => setNewExam({...newExam, passingScore: e.target.value})}
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
                                        value={newExam.startTime}
                                        onChange={(e) => setNewExam({...newExam, startTime: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">End Window</label>
                                    <input 
                                        required
                                        type="datetime-local" 
                                        className="input-field text-sm" 
                                        value={newExam.endTime}
                                        onChange={(e) => setNewExam({...newExam, endTime: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-4">Cancel</button>
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

export default AdminDashboard;
