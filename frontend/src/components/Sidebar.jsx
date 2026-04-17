import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    FileText, 
    Users, 
    BarChart3, 
    Settings, 
    LogOut, 
    Trophy,
    BookOpen,
    Sun,
    Moon
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const [isDark, setIsDark] = React.useState(true);

    React.useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const adminLinks = [
        { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/admin/exams', icon: <FileText size={20} />, label: 'Manage Exams' },
        { to: '/admin/students', icon: <Users size={20} />, label: 'Students' },
        { to: '/admin/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
    ];

    const studentLinks = [
        { to: '/student', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/student/results', icon: <BookOpen size={20} />, label: 'My Results' },
        { to: '/student/leaderboard', icon: <Trophy size={20} />, label: 'Leaderboard' },
    ];

    const links = user?.role === 'admin' ? adminLinks : studentLinks;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-6 flex flex-col z-50">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                        <FileText size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.role === 'admin' ? 'Admin Portal' : 'Student Portal'}</h1>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto space-y-4 pt-6 border-t border-gray-200 dark:border-slate-800">
                {/* Theme Toggle */}
                <button 
                    onClick={() => setIsDark(!isDark)}
                    className="sidebar-link w-full bg-gray-50 dark:bg-slate-800/50"
                >
                    {isDark ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-primary-600" />}
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="truncate">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                    </div>
                </div>

                <button 
                    onClick={logout}
                    className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
