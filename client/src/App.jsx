import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar     from './components/Navbar';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Gigs       from './pages/Gigs';
import GigDetail  from './pages/GigDetail';
import CreateGig  from './pages/CreateGig';
import './App.css';

function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="dashboard">
      <p>Welcome, {user?.name}</p>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gigs"     element={<Gigs />} />
        {/* /gigs/create must come before /gigs/:id so it isn't matched as an id */}
        <Route path="/gigs/create" element={<PrivateRoute><CreateGig /></PrivateRoute>} />
        <Route path="/gigs/:id"    element={<GigDetail />} />
        <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/gigs" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
