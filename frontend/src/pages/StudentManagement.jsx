import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    Trash2, 
    Eye, 
    ChevronLeft, 
    ChevronRight,
    UserCircle,
    RotateCcw,
    Mail,
    Calendar,
    FileText
} from 'lucide-react';
import api from '../api';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const itemsPerPage = 8;

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/students');
            setStudents(data);
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student record?')) return;
        try {
            await api.delete(`/admin/students/${id}`);
            fetchStudents();
            setSelectedStudent(null);
        } catch (err) {
            alert('Failed to delete student');
        }
    };

    const fetchStudentDetails = async (id) => {
        try {
            const { data } = await api.get(`/admin/students/${id}`);
            setSelectedStudent(data);
        } catch (err) {
            alert('Could not fetch detailed profile');
        }
    };

    const handleGrantRetake = (id) => {
        alert('Universal Retake Authorization Protocol initialized.');
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const currentData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header and Total Enrolled Card */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Directory</h1>
                    <p className="text-gray-400">Manage and monitor all enrolled students.</p>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl flex items-center gap-4 min-w-[200px]">
                    <div className="bg-primary-500/20 p-3 rounded-xl">
                        <Users className="text-primary-400" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Enrolled</p>
                        <p className="text-2xl font-bold text-white">{students.length}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className={`transition-all duration-300 ${selectedStudent ? 'lg:w-2/3' : 'w-full'}`}>
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto min-h-[400px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-80 gap-4">
                                    <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-gray-400 font-medium">Loading records...</p>
                                </div>
                            ) : currentData.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-700/30 text-gray-300 text-xs font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Exams Taken</th>
                                            <th className="px-6 py-4">Joined Date</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {currentData.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-700/20 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-105 transition-transform">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-white">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={14} className="text-gray-500" />
                                                        {student.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold border border-primary-500/20">
                                                        {student.examsTaken} Exams
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                        <Calendar size={14} />
                                                        {new Date(student.joinedDate).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => fetchStudentDetails(student.id)}
                                                            className="p-2 rounded-lg bg-slate-700/50 text-gray-300 hover:bg-primary-500 hover:text-white transition-all"
                                                            title="View Profile"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(student.id)}
                                                            className="p-2 rounded-lg bg-slate-700/50 text-gray-300 hover:bg-red-500 hover:text-white transition-all"
                                                            title="Delete Student"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-80 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="bg-slate-700/30 p-6 rounded-full mb-4">
                                        <Users size={48} className="text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400">Registry Empty</h3>
                                    <p className="text-gray-500 max-w-xs mt-2">No student records found. Try adjusting your search or add new students.</p>
                                </div>
                            )}
                        </div>

                        {currentData.length > 0 && (
                            <div className="p-4 border-t border-white/5 bg-white/5 flex justify-between items-center px-8">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-20"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white disabled:opacity-20"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {selectedStudent && (
                    <div className="w-1/3 animate-slide-left">
                        <div className="glass-card p-0 border border-primary-500/20 shadow-2xl overflow-hidden">
                            <div className="p-8 pb-12 bg-gradient-to-br from-primary-600/20 via-transparent to-purple-600/20 relative">
                                <button 
                                    onClick={() => setSelectedStudent(null)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-3xl bg-primary-500 transform rotate-3 flex items-center justify-center text-white mb-6 shadow-2xl relative">
                                        <UserCircle size={60} />
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-slate-900"></div>
                                    </div>
                                    <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-1">{selectedStudent.name}</h2>
                                    <div className="flex items-center gap-2 text-primary-400 font-bold mb-6">
                                        <Mail size={14} />
                                        <span className="text-xs uppercase tracking-tight">{selectedStudent.email}</span>
                                    </div>

                                    <div className="grid grid-cols-2 w-full gap-4">
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Joined</p>
                                            <p className="font-bold text-sm">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Sessions</p>
                                            <p className="font-bold text-sm tracking-tighter text-primary-400">{selectedStudent.attempts.length} COMPLETED</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 pb-2">SESSION LOGS</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedStudent.attempts.length > 0 ? selectedStudent.attempts.map((attempt, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold tracking-tight">{attempt.examTitle}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase">{new Date(attempt.startTime).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-black italic text-green-500">{attempt.score || 0} PTS</p>
                                        </div>
                                    )) : (
                                        <p className="text-[10px] font-bold text-gray-600 uppercase italic text-center py-4">No sessions recorded yet.</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                                    <button 
                                        onClick={() => handleGrantRetake(selectedStudent.id)}
                                        className="btn-secondary h-12 flex items-center justify-center gap-2 group hover:border-amber-500/50"
                                    >
                                        <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500 text-amber-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Retake</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(selectedStudent.id)}
                                        className="btn-secondary h-12 flex items-center justify-center gap-2 group hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                                    >
                                        <Trash2 size={16} className="text-red-500 group-hover:text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Purge</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const X = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default StudentManagement;
