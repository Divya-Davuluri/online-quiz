import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:rotate-12 transition-transform">
                        <FileText size={24} />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">QuizPlatform</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-bold text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-widest">Features</a>
                    <a href="#about" className="text-sm font-bold text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-widest">About</a>
                    <div className="w-px h-6 bg-gray-200 dark:bg-slate-800 mx-2"></div>
                    <Link to="/login" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors uppercase tracking-widest">Login</Link>
                    <Link to="/register" className="btn-primary py-2.5 px-8">Join Now</Link>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-gray-600 dark:text-gray-300" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-6 flex flex-col gap-4 animate-fade-in">
                    <Link to="/login" className="text-lg font-bold">Login</Link>
                    <Link to="/register" className="btn-primary w-full py-3">Get Started</Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
