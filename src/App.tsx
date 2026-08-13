import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/auth.store';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterParticipant from './pages/auth/RegisterParticipant';
import RegisterBusiness from './pages/auth/RegisterBusiness';
import Browse from './pages/Browse';
import RaffleDetail from './pages/RaffleDetail';
import ParticipantDashboard from './pages/ParticipantDashboard';
import BusinessDashboard from './pages/BusinessDashboard';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<div>Landing page (coming soon)</div>} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'BUSINESS' ? '/business/dashboard' : '/browse'} replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/register/participant" element={!isAuthenticated ? <RegisterParticipant /> : <Navigate to="/browse" replace />} />
        <Route path="/register/business" element={!isAuthenticated ? <RegisterBusiness /> : <Navigate to="/business/dashboard" replace />} />

        {/* Participant */}
        <Route path="/browse" element={isAuthenticated ? <Browse /> : <Navigate to="/login" replace />} />
        <Route path="/raffle/:id" element={isAuthenticated ? <RaffleDetail /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={isAuthenticated ? <ParticipantDashboard /> : <Navigate to="/login" replace />} />

        {/* Business */}
        <Route path="/business/dashboard" element={isAuthenticated ? <BusinessDashboard /> : <Navigate to="/login" replace />} />

        <Route path="*" element={<div>404 — Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
