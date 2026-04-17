import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ExamManagement from './pages/ExamManagement';
import QuestionManagement from './pages/QuestionManagement';
import SubmissionReview from './pages/SubmissionReview';
import StudentManagement from './pages/StudentManagement';
import Reports from './pages/Reports';
import ExamWorkspace from './pages/ExamWorkspace';
import ResultPage from './pages/ResultPage';
import Leaderboard from './pages/Leaderboard';
import GlobalLeaderboard from './pages/GlobalLeaderboard';
import StudentResultsList from './pages/StudentResultsList';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

    return children;
};

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
            <Sidebar />
            <main className="flex-1 p-8 ml-64 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route path="/admin/*" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<AdminDashboard />} />
                                    <Route path="/exams" element={<ExamManagement />} />
                                    <Route path="/students" element={<StudentManagement />} />
                                    <Route path="/exams/:id/questions" element={<QuestionManagement />} />
                                    <Route path="/reports" element={<Reports />} />
                                    <Route path="/submissions/:attemptId/review" element={<SubmissionReview />} />
                                    <Route path="/results/:id" element={<ResultPage />} />
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/student/*" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<StudentDashboard />} />
                                    <Route path="/leaderboard" element={<GlobalLeaderboard />} />
                                    <Route path="/leaderboard/:id" element={<Leaderboard />} />
                                    <Route path="/results" element={<StudentResultsList />} />
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/exam/:id" element={
                        <ProtectedRoute allowedRoles={['student']}>
                           <ExamWorkspace />
                        </ProtectedRoute>
                    } />

                    <Route path="/result/:attemptId" element={
                        <ProtectedRoute>
                           <ResultPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={<LandingPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
