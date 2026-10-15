import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Files from './pages/Files';
import Notes from './pages/Notes';
import Credentials from './pages/Credentials';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function storedUser() {
  try { return JSON.parse(localStorage.getItem('vault_user') || 'null'); } catch { return null; }
}

function VaultLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(storedUser);
  useEffect(() => {
    const syncUser = () => setUser(storedUser());
    window.addEventListener('vault-profile-updated', syncUser);
    return () => window.removeEventListener('vault-profile-updated', syncUser);
  }, []);
  return <div className="app-shell">
    <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <div className="page-shell">
      <Navbar onMenu={() => setMenuOpen((open) => !open)} user={user} />
      <main className="page-content"><Outlet /></main>
      <MobileBottomNav />
    </div>
  </div>;
}

function MobileBottomNav() {
  const links = [['◫', 'Home', '/dashboard'], ['▧', 'Files', '/files'], ['▤', 'Notes', '/notes'], ['♙', 'Users', '/admin/users'], ['◎', 'Profile', '/profile']];
  return <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{links.map(([icon, label, path]) => <NavLink key={path} to={path} end className={({ isActive }) => isActive ? 'mobile-bottom-link active' : 'mobile-bottom-link'}><span>{icon}</span>{label}</NavLink>)}</nav>;
}

function LogoutPage() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('vault_token'); localStorage.removeItem('vault_user'); navigate('/login', { replace: true }); };
  return <section className="state-card logout-state"><div className="state-icon">↗</div><h1>Sign out?</h1><p>Your vault will stay protected. You can sign in again any time.</p><div className="button-row"><button className="secondary-button" onClick={() => navigate(-1)}>Cancel</button><button className="danger-button" onClick={logout}>Sign out</button></div></section>;
}

function PublicOnly({ children }) {
  if (localStorage.getItem('vault_token')) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
    <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
    <Route element={<ProtectedRoute />}>
      <Route element={<VaultLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="files" element={<Files />} />
        <Route path="notes" element={<Notes />} />
        <Route path="credentials" element={<Credentials />} />
        <Route path="profile" element={<Profile />} />
        <Route path="logout" element={<LogoutPage />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Route>
  </Routes></BrowserRouter>;
}
