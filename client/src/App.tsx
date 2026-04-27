import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Login, Dashboard, Schools, Competitions, Users, SendNotification } from './pages';

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spin" /></div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index                element={<Dashboard />} />
            <Route path="competitions"  element={<Competitions />} />
            <Route path="notifications" element={<SendNotification />} />
            <Route path="schools"       element={<Schools />} />
            <Route path="users"         element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
