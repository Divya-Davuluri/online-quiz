import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Zap, 
    Shield, 
    Cpu, 
    ArrowRight,
    Play,
    CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white selection:bg-primary-500 selection:text-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 bg-gradient-mesh overflow-hidden">
                <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] -z-10"></div>
                
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-10 animate-fade-in">
                        <Zap size={14} className="fill-primary-500" />
                        Next Gen Exam Platform
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tightest leading-[0.9] mb-10 animate-slide-up">
                        SMARTER <br />
                        <span className="text-gradient">EXAMINATIONS.</span>
                    </h1>
                    
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up delay-100">
                        The ultimate dashboard for educators and students to create, manage, and ace online exams with realnd-time auto-saving and secure code execution.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6 animate-slide-up delay-200">
                        <Link to="/register" className="btn-primary py-4 px-12 text-lg group shadow-2xl shadow-primary-500/40">
                            Start Free Trial
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="flex items-center gap-3 font-bold hover:text-primary-600 transition-all">
                            <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-900 shadow-xl">
                                <Play size={18} className="fill-primary-600 text-primary-600 ml-1" />
                            </div>
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="max-w-5xl mx-auto mt-24 relative p-4 rounded-[2.5rem] bg-gray-200 dark:bg-slate-800 shadow-2xl animate-fade-in delay-300">
                    <div className="rounded-[1.5rem] overflow-hidden bg-white dark:bg-slate-950 border-4 border-white dark:border-slate-900 shadow-inner h-[400px] flex items-center justify-center">
                         <div className="text-center">
                            <div className="flex justify-center gap-2 mb-4">
                               <div className="w-3 h-3 rounded-full bg-red-400"></div>
                               <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                               <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <p className="text-gray-400 font-medium">Dashboard Interface Live Preview</p>
                         </div>
                    </div>
                    {/* Decorative Blobs */}
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-3xl -z-10 rounded-full"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 blur-3xl -z-10 rounded-full"></div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black mb-4">Revolutionizing Assessments</h2>
                        <p className="text-gray-500 dark:text-gray-400">Everything you need to deliver high-stakes exams with confidence.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureItem 
                            icon={<Zap className="text-amber-500" />}
                            title="Real-time Speed"
                            desc="Don't worry about lost connectivity. Our 3s auto-save system ensures every keystroke is preserved in real-time."
                        />
                        <FeatureItem 
                            icon={<Shield className="text-emerald-500" />}
                            title="Enterprise Security"
                            desc="Proctored workspace with tab-lock, browser exit protection, and secure server-side timer validation."
                        />
                        <FeatureItem 
                            icon={<Cpu className="text-primary-500" />}
                            title="Coding Sandbox"
                            desc="Embedded Monaco IDE for technical challenges. Run and test code in a secure, containerized environment."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3 text-2xl font-black">
                        <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white text-sm">EP</div>
                        QuizPlatform
                    </div>
                    <div className="flex gap-10 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureItem = ({ icon, title, desc }) => (
    <div className="glass-card p-10 group hover:-translate-y-2 transition-all duration-300">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center mb-8 shadow-sm group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:scale-110 transition-all">
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{desc}</p>
        <div className="mt-8 flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest">
            Learn More
            <ArrowRight size={14} />
        </div>
    </div>
);

export default LandingPage;
