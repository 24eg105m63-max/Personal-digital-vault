import { NavLink, useNavigate } from 'react-router-dom';

const links = [['▦', 'Dashboard', '/dashboard'], ['□', 'My Files', '/files'], ['✎', 'Notes', '/notes'], ['◇', 'Credentials', '/credentials'], ['○', 'Profile', '/profile']];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('vault_token'); localStorage.removeItem('vault_user'); navigate('/login'); };
  return <><aside className={`sidebar ${open ? 'sidebar-open' : ''}`}><div className="brand"><span className="brand-mark">V</span><div><strong>Personal</strong><span>Digital Vault</span></div></div><nav>{links.map(([icon, label, path]) => <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><span className="nav-icon">{icon}</span>{label}</NavLink>)}</nav><div className="sidebar-bottom"><div className="secure-note"><span>●</span><div><strong>Vault secured</strong><small>JWT protected session</small></div></div><button className="logout-button" onClick={logout}><span>↪</span> Sign out</button></div></aside>{open && <button className="sidebar-overlay" onClick={onClose} aria-label="Close navigation" />}</>;
}
