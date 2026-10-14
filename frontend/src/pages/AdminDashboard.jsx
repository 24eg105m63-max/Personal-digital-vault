import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/admin/vault-stats').then(({ data }) => setStats(data)).catch((err) => setError(errorMessage(err))); }, []);
  if (!stats && !error) return <Loading label="Loading workspace overview..." />;
  return <div>
    <div className="page-heading"><div><p className="eyebrow">WORKSPACE OVERVIEW</p><h1>Vault overview</h1><p className="muted">A high-level view of your vault workspace.</p></div><Link to="/admin/users" className="primary-button">＋ Manage users</Link></div>
    <ErrorMessage message={error} />
    <section className="admin-stats-grid">
      <AdminStat label="Total users" value={stats?.userCount ?? '—'} icon="♙" tone="tone-blue" />
      <AdminStat label="Total files" value={stats?.fileCount ?? '—'} icon="▧" tone="tone-purple" />
      <AdminStat label="Total notes" value={stats?.noteCount ?? '—'} icon="▤" tone="tone-teal" />
      <AdminStat label="Total credentials" value={stats?.credentialCount ?? '—'} icon="◇" tone="tone-amber" />
    </section>
    <section className="admin-welcome dashboard-card"><div><p className="eyebrow">VAULT CONTROL CENTER</p><h2>Protect the space.<br />Keep it simple.</h2><p>Manage accounts and monitor high-level usage. User files, notes, and credentials remain private to their owners.</p><Link to="/admin/users" className="button-link">Open user management <span>↗</span></Link></div><div className="admin-shield" aria-hidden="true"><span>◆</span><b>✓</b></div></section>
    <section className="dashboard-card admin-shortcut-card"><div><p className="eyebrow">WORKSPACE TOOLS</p><h2>Account management</h2></div><div className="admin-shortcuts"><Link to="/admin/users"><span className="shortcut-icon tone-blue">♙</span><strong>User management</strong><small>Search and manage accounts</small><b>↗</b></Link><Link to="/profile"><span className="shortcut-icon tone-purple">⚙</span><strong>Account profile</strong><small>Review your account details</small><b>↗</b></Link></div></section>
  </div>;
}

function AdminStat({ label, value, icon, tone }) { return <div className="admin-stat-card"><span className={`admin-stat-icon ${tone}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong></div><span className="stat-trend">↗</span></div>; }
