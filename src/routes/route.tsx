import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';

const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={user && user.emailVerified ? <Navigate to="/home" replace /> : <Login />} />
                <Route path="/home" element={user && user.emailVerified ? <Home /> : <Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to={user && user.emailVerified ? "/home" : "/"} replace />} />
            </Routes>
        </Router>
    );
};  

export default AppRoutes;
