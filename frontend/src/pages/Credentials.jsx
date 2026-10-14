import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import CredentialCard from '../components/CredentialCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const empty = { serviceName: '', username: '', password: '' };

export default function Credentials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = () => api.get('/credentials')
    .then(({ data }) => setItems(data))
    .catch((err) => setError(errorMessage(err)))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const open = (item) => {
    setEditing(item);
    setForm(item ? { serviceName: item.serviceName, username: item.username, password: '' } : empty);
    setModal(true);
  };

  const reveal = async (id) => {
    try {
      const { data } = await api.get(`/credentials/${id}/password`);
      return data.password;
    } catch (err) {
      setError(errorMessage(err));
      return null;
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = editing
        ? await api.put(`/credentials/${editing.id}`, form)
        : await api.post('/credentials', form);
      setItems(editing ? items.map((item) => item.id === editing.id ? data : item) : [data, ...items]);
      setModal(false);
      setForm(empty);
      setNotice(editing ? 'Credential updated.' : 'Credential saved securely.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = (id) => setPendingDelete(items.find((item) => item.id === id) || null);
  const confirmRemove = async () => {
    if (!pendingDelete) return;
    try {
      await api.delete(`/credentials/${pendingDelete.id}`);
      setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
      setPendingDelete(null);
      setNotice('Credential deleted.');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div><p className="eyebrow">ACCESS DETAILS</p><h1>Credentials</h1><p className="muted">Keep your important logins close, never exposed.</p></div>
        <button className="primary-button" onClick={() => open(null)}>＋ Add credential</button>
      </div>
      <div className="security-banner"><span>◇</span><div><strong>Passwords are hidden by default</strong><p>Credential passwords are fetched only when you choose to reveal them.</p></div></div>
      <ErrorMessage message={error} onDismiss={() => setError('')} />
      {notice && <div className="notice notice-success">{notice}</div>}
      {loading ? <Loading label="Loading credentials..." /> : items.length ? (
        <div className="items-list">
          {items.map((item) => <CredentialCard key={item.id} credential={item} onEdit={open} onDelete={remove} onReveal={reveal} />)}
        </div>
      ) : <div className="empty-state"><span>◇</span><h3>No credentials yet</h3><p>Add a login detail to keep it safely at hand.</p></div>}
      {modal && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={save}>
            <div className="modal-header"><div><p className="eyebrow">{editing ? 'EDIT CREDENTIAL' : 'NEW CREDENTIAL'}</p><h2>{editing ? 'Update access detail' : 'Secure a login'}</h2></div><button type="button" className="close-button" onClick={() => setModal(false)}>×</button></div>
            <label>Service name<input required minLength="2" maxLength="100" value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} placeholder="e.g. GitHub" /></label>
            <label>Username<input required minLength="2" maxLength="100" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Username or email" /></label>
            <label>{editing ? 'New password' : 'Password'}<input required type="password" maxLength="500" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" autoComplete="new-password" /></label>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Save credential'}</button></div>
          </form>
        </div>
      )}
      <ConfirmDialog open={!!pendingDelete} title="Delete this credential?" message={`“${pendingDelete?.serviceName || ''}” and its encrypted password will be permanently removed.`} confirmLabel="Delete credential" onCancel={() => setPendingDelete(null)} onConfirm={confirmRemove} />
    </div>
  );
}
