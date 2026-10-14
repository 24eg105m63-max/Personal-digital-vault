import { useEffect, useMemo, useState } from 'react';
import api, { errorMessage } from '../services/api';
import NoteCard from '../components/NoteCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const blank = { title: '', content: '' };

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => { load(); }, []);
  async function load() {
    try { const { data } = await api.get('/notes'); setNotes(data); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }
  const visibleNotes = useMemo(() => notes.filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(search.toLowerCase())), [notes, search]);
  const open = (note = null) => { setEditing(note); setForm(note ? { title: note.title, content: note.content } : blank); setModal(true); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const { data } = editing ? await api.put(`/notes/${editing.id}`, form) : await api.post('/notes', form);
      setNotes((current) => editing ? current.map((note) => note.id === editing.id ? data : note) : [data, ...current]);
      setModal(false); setNotice(editing ? 'Note updated.' : 'Note saved successfully.');
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  };
  const remove = (id) => setPendingDelete(notes.find((note) => note.id === id) || null);
  const confirmRemove = async () => {
    if (!pendingDelete) return;
    try { await api.delete(`/notes/${pendingDelete.id}`); setNotes((current) => current.filter((note) => note.id !== pendingDelete.id)); setPendingDelete(null); setNotice('Note deleted.'); }
    catch (err) { setError(errorMessage(err)); }
  };

  return <div>
    <div className="page-heading"><div><p className="eyebrow">THOUGHTS & IDEAS</p><h1>My notes</h1><p className="muted">A private place for the details worth remembering.</p></div><button className="primary-button" onClick={() => open()}>＋ Add note</button></div>
    <ErrorMessage message={error} onDismiss={() => setError('')} />
    {notice && <div className="notice notice-success" role="status">{notice}<button className="notice-close" onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    {!loading && notes.length > 0 && <form className="search-bar" onSubmit={(event) => event.preventDefault()}><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your notes..." aria-label="Search notes" /></form>}
    {loading ? <Loading label="Loading notes..." /> : visibleNotes.length ? <div className="items-list">{visibleNotes.map((note) => <NoteCard key={note.id} note={note} onEdit={open} onDelete={remove} />)}</div> : <div className="empty-state"><span>▤</span><h3>{search ? 'No notes found' : 'No notes yet'}</h3><p>{search ? 'Try another search.' : 'Write down a thought, plan, or reminder.'}</p>{!search && <button className="primary-button" onClick={() => open()}>Create a note</button>}</div>}
    {modal && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(false)}><form className="modal" onSubmit={save}><div className="modal-header"><div><p className="eyebrow">{editing ? 'EDIT NOTE' : 'NEW NOTE'}</p><h2>{editing ? 'Update your note' : 'Capture a thought'}</h2></div><button type="button" className="close-button" onClick={() => setModal(false)} aria-label="Close">×</button></div><label>Title<input required minLength="2" maxLength="200" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Note title" /></label><label>Content<textarea required rows="7" maxLength="20000" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Start writing..." /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Save note'}</button></div></form></div>}
    <ConfirmDialog open={!!pendingDelete} title="Delete this note?" message={`“${pendingDelete?.title || ''}” will be permanently removed.`} confirmLabel="Delete note" onCancel={() => setPendingDelete(null)} onConfirm={confirmRemove} />
  </div>;
}
