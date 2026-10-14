import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const user = readUser();
  useEffect(() => {
    Promise.all([api.get('/dashboard'), api.get('/files')])
      .then(([dashboard, fileResponse]) => { setData(dashboard.data); setFiles(fileResponse.data.slice(0, 4)); })
      .catch((err) => setError(errorMessage(err)));
  }, []);
  if (!data && !error) return <Loading label="Loading your vault..." />;
  const firstName = (data?.name || user?.name || 'there').split(' ')[0];
  const total = data ? data.fileCount + data.noteCount + data.credentialCount : 0;
  return <div>
    <div className="page-heading"><div><p className="eyebrow">YOUR PRIVATE WORKSPACE</p><h1>Welcome back, {firstName}</h1><p className="muted">Your important digital things, safe and organized in one place.</p></div><div className="date-chip"><span className="date-chip-icon">◷</span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div></div>
    <ErrorMessage message={error} />
    <section className="stats-grid">
      <Stat label="My files" value={data?.fileCount ?? '—'} icon="▧" tone="tone-blue" to="/files" />
      <Stat label="My notes" value={data?.noteCount ?? '—'} icon="▤" tone="tone-purple" to="/notes" />
      <Stat label="My credentials" value={data?.credentialCount ?? '—'} icon="◇" tone="tone-teal" to="/credentials" />
    </section>
    <section className="dashboard-lower">
      <div className="dashboard-card welcome-panel"><div className="welcome-copy"><p className="eyebrow">A LITTLE MORE PEACE OF MIND</p><h2>Your digital life,<br />in good hands.</h2><p>{total ? `You have ${total} items stored in your private vault.` : 'Start by adding a file, note, or login you want to keep safe.'}</p><Link className="button-link" to="/files">Explore my files <span>↗</span></Link></div><div className="welcome-illustration" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="vault-emoji">▣</div><span className="sparkle sparkle-one">✦</span><span className="sparkle sparkle-two">✧</span></div></div>
      <div className="dashboard-card quick-panel"><div className="card-title-row"><div><p className="eyebrow">GET THINGS DONE</p><h2>Quick actions</h2></div><span className="soft-icon">✦</span></div>
        <QuickAction to="/files" icon="↑" tone="tone-blue" title="Upload a file" text="Save a document privately" />
        <QuickAction to="/notes" icon="＋" tone="tone-purple" title="Write a note" text="Keep an idea within reach" />
        <QuickAction to="/credentials" icon="◇" tone="tone-teal" title="Add a credential" text="Secure a login detail" />
      </div>
    </section>
    <section className="dashboard-card recent-panel"><div className="section-title"><div><p className="eyebrow">RECENTLY ADDED</p><h2>My recent files</h2></div><Link to="/files" className="subtle-link">View all <span>→</span></Link></div>
      {files.length ? <div className="recent-files">{files.map((file) => <Link to="/files" className="recent-file" key={file.id}><span className={`file-type-icon ${file.contentType?.includes('pdf') ? 'pdf-type' : ''}`}>{file.contentType?.includes('pdf') ? 'PDF' : file.originalFileName?.split('.').pop()?.slice(0, 4).toUpperCase()}</span><span className="recent-file-main"><strong>{file.originalFileName}</strong><small>{formatBytes(file.fileSize)} · {new Date(file.uploadedAt).toLocaleDateString()}</small></span><span className="file-arrow">↗</span></Link>)}</div> : <div className="dashboard-empty"><span>▧</span><strong>No files yet</strong><p>Upload your first file to start your vault.</p><Link to="/files" className="secondary-button">Upload a file</Link></div>}
    </section>
  </div>;
}

function readUser() { try { return JSON.parse(localStorage.getItem('vault_user') || 'null'); } catch { return null; } }
function formatBytes(bytes = 0) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
function Stat({ label, value, icon, tone, to }) { return <Link className="dashboard-stat" to={to}><span className={`stat-icon ${tone}`}>{icon}</span><span className="stat-detail"><small>{label}</small><strong>{value}</strong></span><span className="stat-trend">↗</span></Link>; }
function QuickAction({ to, icon, tone, title, text }) { return <Link to={to} className="quick-action"><span className={`action-icon ${tone}`}>{icon}</span><span><strong>{title}</strong><small>{text}</small></span><b>›</b></Link>; }
