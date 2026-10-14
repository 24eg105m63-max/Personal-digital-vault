import { Link, NavLink, useNavigate } from 'react-router-dom';

const links = [
  ['◫', 'Dashboard', '/dashboard'],
  ['◴', 'Overview', '/admin'],
  ['▧', 'Files', '/files'],
  ['▤', 'Notes', '/notes'],
  ['◇', 'Credentials', '/credentials'],
  ['♙', 'Users', '/admin/users'],
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  return <>
    {open && <button className="sidebar-overlay" onClick={onClose} aria-label="Close navigation" />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <Link className="brand" to="/dashboard" onClick={onClose}>
        <span className="brand-mark"><span>◆</span></span><span className="brand-copy"><strong>Personal</strong><small>Digital Vault</small></span>
      </Link>
      <div className="sidebar-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{links.map(([icon, label, path]) => <NavLink key={path} to={path} end onClick={onClose} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><span className="nav-icon">{icon}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom">
        <NavLink to="/profile" end onClick={onClose} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><span className="nav-icon">◎</span>Profile</NavLink>
        <div className="secure-note"><span className="secure-lock">✓</span><div><strong>Vault secured</strong><small>Encrypted session</small></div></div>
        <button className="logout-button" onClick={() => { onClose?.(); navigate('/logout'); }}><span>↪</span>Sign out</button>
      </div>
      <div className="sidebar-footer">PERSONAL DIGITAL VAULT <span>•</span> 1.0</div>
    </aside>
  </>;
}
