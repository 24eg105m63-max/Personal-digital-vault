import { Link, useLocation } from 'react-router-dom';

const titleByPath = { '/admin': 'Vault overview', '/dashboard': 'Dashboard', '/files': 'My files', '/notes': 'My notes', '/credentials': 'My credentials', '/profile': 'Profile', '/admin/users': 'User management', '/logout': 'Sign out' };

export default function Navbar({ onMenu, user }) {
  const { pathname } = useLocation();
  const initials = (user?.name || 'Vault User').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <header className="topbar">
    <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation">☰</button>
    <div className="mobile-brand"><span className="brand-mark"><span>◆</span></span><span>Personal Digital Vault</span></div>
    <div className="topbar-title">{titleByPath[pathname] || 'Personal Digital Vault'}</div>
    <div className="topbar-actions"><span className="topbar-status"><i /> Secure workspace</span><Link className="topbar-user" to="/profile" aria-label="View profile"><span className="user-avatar">{initials}</span><span>{user?.name || 'Account'}</span><b>⌄</b></Link></div>
  </header>;
}
