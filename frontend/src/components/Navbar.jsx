import { Link } from 'react-router-dom';

export default function Navbar({ onMenu }) {
  return <header className="topbar"><button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation">☰</button><Link className="mobile-brand" to="/dashboard"><span className="brand-mark">V</span> Vault</Link><div className="topbar-meta"><span className="status-dot" /> Protected workspace</div></header>;
}
