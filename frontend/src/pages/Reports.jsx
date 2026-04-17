import React, { useState, useEffect } from 'react';
import { 
    BarChart3, 
    Search, 
    Download, 
    Filter,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, pass, fail
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const { data } = await api.get('/admin/reports');
                setReports(data);
            } catch (err) {
                console.error('Error fetching reports:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             r.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
        
        const percentage = (r.score / r.totalMarks) * 100;
        const isPass = percentage >= r.passingScore;
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'pass' && isPass) || 
                             (filterStatus === 'fail' && !isPass);
                             
        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        const headers = ['Student', 'Email', 'Exam', 'Score', 'Total', 'Percentage', 'Status', 'Date'];
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + filteredReports.map(r => {
                const percentage = Math.round((r.score / r.totalMarks) * 100);
                const status = percentage >= r.passingScore ? 'PASS' : 'FAIL';
                return [
                    r.studentName,
                    r.studentEmail,
                    r.examTitle,
                    r.score,
                    r.totalMarks,
                    `${percentage}%`,
                    status,
                    new Date(r.submitTime).toLocaleDateString()
                ].join(",");
            }).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "examination_reports.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Examination Reports</h1>
                    <p className="text-gray-500">Track student performance across all exams.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="btn-primary"
                >
                    <Download size={20} />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Attempts</p>
                        <p className="text-2xl font-bold">{reports.length}</p>
                    </div>
                </div>
                <div className="glass-card p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Pass</p>
                        <p className="text-2xl font-bold">
                            {reports.filter(r => (r.score / r.totalMarks) * 100 >= r.passingScore).length}
                        </p>
                    </div>
                </div>
                <div className="glass-card p-6 border-none shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Fail</p>
                        <p className="text-2xl font-bold">
                            {reports.filter(r => (r.score / r.totalMarks) * 100 < r.passingScore).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card border-none shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-slate-900">
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search student or exam..." 
                                className="input-field pl-10 py-2 w-72 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="input-field py-2 text-sm w-40"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pass">Passed</option>
                            <option value="fail">Failed</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-500">
                        Showing {filteredReports.length} results
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Exam</th>
                                <th className="px-6 py-4 text-center">Score</th>
                                <th className="px-6 py-4 text-center">Percentage</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-slate-800/20"></td>
                                    </tr>
                                ))
                            ) : filteredReports.length > 0 ? filteredReports.map((report) => {
                                const percentage = Math.round((report.score / report.totalMarks) * 100);
                                const isPass = percentage >= report.passingScore;
                                
                                return (
                                    <tr key={report.attemptId} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">
                                                    {report.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{report.studentName}</p>
                                                    <p className="text-[10px] text-gray-400">{report.studentEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-sm">{report.examTitle}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-sm">
                                            {report.score} / {report.totalMarks}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-sm font-bold ${isPass ? 'text-green-500' : 'text-red-500'}`}>
                                                    {percentage}%
                                                </span>
                                                <div className="w-16 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full ${isPass ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isPass ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <CheckCircle2 size={12} />
                                                    Passed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <XCircle size={12} />
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {new Date(report.submitTime).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => navigate(`/admin/submissions/${report.attemptId}/review`)}
                                                className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/10 text-primary-600 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center text-gray-400 italic bg-white dark:bg-slate-900">
                                        No examination reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
