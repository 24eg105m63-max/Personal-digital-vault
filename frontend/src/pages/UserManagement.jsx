import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const fresh = { name: '', email: '', phone: '', password: '', active: true };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(fresh);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDeactivate, setPendingDeactivate] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const actor = readUser();

  const load = async (term = '') => {
    setLoading(true); setError('');
    try { const { data } = await api.get('/admin/users', { params: term ? { search: term } : {} }); setUsers(data); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(fresh); setShowModal(true); };
  const openEdit = (user) => { setEditing(user); setForm({ name: user.name, email: user.email, phone: user.phone, password: '', active: user.active }); setShowModal(true); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) {
        const { data } = await api.put(`/admin/users/${editing.id}`, { name: form.name, phone: form.phone, active: form.active });
        setUsers((items) => items.map((item) => item.id === data.id ? data : item)); setNotice('User account updated.');
      } else {
        const { data } = await api.post('/admin/users', form);
        setUsers((items) => [...items, data].sort((a, b) => a.name.localeCompare(b.name))); setNotice('User account created.');
      }
      setShowModal(false);
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  };
  const toggleActive = async (user) => {
    if (user.email === actor?.email) return setError('You cannot deactivate your own account.');
    if (user.active) return setPendingDeactivate(user);
    await setUserActive(user, true);
  };
  const setUserActive = async (user, active) => {
    setUpdatingStatus(true);
    setError('');
    try {
      const { data } = await api.put(`/admin/users/${user.id}`, { name: user.name, phone: user.phone, active });
      setUsers((items) => items.map((item) => item.id === data.id ? data : item)); setNotice(active ? 'Account reactivated.' : 'Account deactivated.');
      if (!active) setPendingDeactivate(null);
    } catch (err) { setError(errorMessage(err)); }
    finally { setUpdatingStatus(false); }
  };
  const submitSearch = (event) => { event.preventDefault(); setQuery(search); load(search); };
  const filteredUsers = users.filter((user) => !query || `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()));

  return <div>
    <div className="page-heading"><div><p className="eyebrow">ACCOUNT MANAGEMENT</p><h1>User management</h1><p className="muted">Manage vault accounts and account status.</p></div><button className="primary-button" onClick={openCreate}>＋ Add user</button></div>
    {notice && <div className="notice notice-success" role="status">{notice}<button className="notice-close" onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    <ErrorMessage message={error} onDismiss={() => setError('')} />
    <section className="dashboard-card user-management-card">
      <div className="user-table-toolbar"><div><h2>All users</h2><span>{users.length} accounts</span></div><form className="search-bar" onSubmit={submitSearch}><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" aria-label="Search users" /><button className="secondary-button">Search</button></form></div>
      {loading ? <Loading label="Loading users..." /> : filteredUsers.length ? <div className="user-table-wrap"><table className="user-table"><thead><tr><th>USER</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id}><td><span className="table-user"><span className="table-avatar">{user.name?.[0]?.toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></span></td><td><span className={`status-badge ${user.active ? 'status-active' : 'status-inactive'}`}><i />{user.active ? 'Active' : 'Inactive'}</span></td><td><div className="table-actions"><button className="icon-button" onClick={() => openEdit(user)} aria-label={`Edit ${user.name}`} title="Edit user">✎</button><button className={`icon-button ${user.active ? 'action-danger' : 'action-success'}`} onClick={() => toggleActive(user)} disabled={user.email === actor?.email} aria-label={`${user.active ? 'Deactivate' : 'Reactivate'} ${user.name}`} title={user.active ? 'Deactivate' : 'Reactivate'}>{user.active ? '⊖' : '✓'}</button></div></td></tr>)}</tbody></table></div> : <div className="dashboard-empty"><span>♙</span><strong>No users found</strong><p>{query ? 'Try a different name or email.' : 'Add an account to get started.'}</p></div>}
    </section>
    {showModal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowModal(false); }}><form className="modal user-modal" onSubmit={save}><div className="modal-header"><div><p className="eyebrow">{editing ? 'EDIT ACCOUNT' : 'NEW ACCOUNT'}</p><h2>{editing ? 'Update user' : 'Add a user'}</h2></div><button type="button" className="close-button" onClick={() => setShowModal(false)} aria-label="Close">×</button></div><label>Full name<input required minLength="2" maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>{!editing && <label>Email address<input required type="email" maxLength="254" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>}<div className="form-row"><label>Phone number<input required minLength="10" maxLength="15" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label></div>{!editing && <label>Temporary password<input required type="password" minLength="8" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>}{editing && <label className="toggle-field"><span>Account enabled</span><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} disabled={editing.email === actor?.email} /></label>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create user'}</button></div></form></div>}
    <ConfirmDialog open={!!pendingDeactivate} title="Deactivate this account?" message={`${pendingDeactivate?.name || ''} will no longer be able to sign in. Their private vault data is retained.`} confirmLabel="Deactivate" busy={updatingStatus} onCancel={() => setPendingDeactivate(null)} onConfirm={() => setUserActive(pendingDeactivate, false)} />
  </div>;
}

function readUser() { try { return JSON.parse(localStorage.getItem('vault_user') || 'null'); } catch { return null; } }
