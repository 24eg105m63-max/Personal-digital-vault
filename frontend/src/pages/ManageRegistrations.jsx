import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

export default function ManageRegistrations() {
  const [registrations, setRegistrations] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [search, setSearch] = useState('');
  const load = () => api.get('/admin/registrations').then(({ data }) => setRegistrations(data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const remove = async (registration) => { if (!window.confirm(`Remove ${registration.studentName} from ${registration.eventName}?`)) return; try { await api.delete(`/admin/registrations/${registration.id}`); load(); } catch (err) { setError(errorMessage(err)); } };
  const filtered = registrations.filter((r) => `${r.studentName} ${r.studentEmail} ${r.eventName}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="content-wrap"><div className="simple-heading"><div><p className="eyebrow">ADMIN / ATTENDANCE</p><h1>Registrations</h1><p>See who’s coming and keep the lists accurate.</p></div><div className="count-stamp"><strong>{registrations.length}</strong><span>total entries</span></div></div><label className="search-field registration-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students or events" /></label><ErrorMessage message={error} />{loading ? <Loading label="Loading registration list..." /> : <div className="table-wrap"><table className="registration-table"><thead><tr><th>STUDENT</th><th>EVENT</th><th>REGISTERED</th><th aria-label="Actions" /></tr></thead><tbody>{filtered.map((r) => <tr key={r.id}><td><strong>{r.studentName}</strong><small>{r.studentEmail} · {r.studentPhone}</small></td><td><strong>{r.eventName}</strong><small>{r.category} · {r.venue}</small></td><td>{r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : '—'}</td><td><button className="quiet-button" onClick={() => remove(r)}>Remove</button></td></tr>)}</tbody></table>{!filtered.length && <div className="table-empty">No registrations match that search.</div>}</div>}</main>;
}