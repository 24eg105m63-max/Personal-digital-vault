import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import EventForm from './pages/EventForm';
import ManageEvents from './pages/ManageEvents';
import ManageRegistrations from './pages/ManageRegistrations';
import NotFound from './pages/NotFound';
import './index.css';
import './events.css';

function userInfo() {
  try { return JSON.parse(localStorage.getItem('vault_user') || 'null'); } catch { return null; }
}

function SiteHeader() {
  const navigate = useNavigate(); const user = userInfo();
  const logout = () => { localStorage.removeItem('vault_token'); localStorage.removeItem('vault_user'); navigate('/'); };
  return <header className="site-header"><Link className="site-brand" to="/"><span className="brand-symbol">C</span><span>COMMON<span className="brand-dot">.</span><small>CAMPUS EVENTS</small></span></Link><nav className="site-nav"><NavLink to="/events">Events</NavLink>{user?.role === 'STUDENT' && <NavLink to="/registrations">My registrations</NavLink>}{user?.role === 'ADMIN' && <NavLink to="/admin">Event desk</NavLink>}{user && <NavLink to="/profile">Profile</NavLink>}</nav><div className="header-actions">{user ? <><Link className="header-user" to={user.role === 'ADMIN' ? '/admin' : '/profile'}><span className="user-avatar">{user.name?.charAt(0) || 'U'}</span><span>{user.name?.split(' ')[0]}</span></Link><button className="header-signout" onClick={logout} title="Sign out" aria-label="Sign out">↗</button></> : <><Link className="header-signin" to="/login">Sign in</Link><Link className="header-join" to="/register">Join campus <span>→</span></Link></>}</div></header>;
}

function SiteFooter() {
  return <footer className="site-footer"><Link className="site-brand" to="/"><span className="brand-symbol">C</span><span>COMMON<span className="brand-dot">.</span><small>CAMPUS EVENTS</small></span></Link><span>Make campus yours. <b>© {new Date().getFullYear()}</b></span><Link to="/events">Explore the calendar ↗</Link></footer>;
}

function SiteLayout() { return <><SiteHeader /><Outlet /><SiteFooter /></>; }
function RequireRole({ role }) { const user = userInfo(); return localStorage.getItem('vault_token') && (!role || user?.role === role) ? <Outlet /> : <Navigate to="/login" replace state={{ from: window.location.pathname }} />; }
function PublicOnly({ children }) { const user = userInfo(); return localStorage.getItem('vault_token') ? <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/events'} replace /> : children; }

export default function App() {
  return <BrowserRouter><Routes><Route element={<SiteLayout />}>
    <Route index element={<HomePage />} />
    <Route path="events" element={<Events />} />
    <Route path="events/:id" element={<EventDetails />} />
    <Route path="login" element={<PublicOnly><Login /></PublicOnly>} />
    <Route path="register" element={<PublicOnly><Register /></PublicOnly>} />
    <Route element={<RequireRole role="STUDENT" />}>
      <Route path="registrations" element={<MyRegistrations />} />
    </Route>
    <Route element={<RequireRole />}><Route path="profile" element={<Profile />} /></Route>
    <Route element={<RequireRole role="ADMIN" />}>
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="admin/events" element={<ManageEvents />} />
      <Route path="admin/events/new" element={<EventForm />} />
      <Route path="admin/events/:id/edit" element={<EventForm editing />} />
      <Route path="admin/registrations" element={<ManageRegistrations />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Route></Routes></BrowserRouter>;
}
