import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = () => api.get('/registrations/my').then(({ data }) => setRegistrations(data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const cancel = async (item) => { if (!window.confirm(`Cancel your registration for ${item.eventName}?`)) return; try { await api.delete(`/events/${item.eventId}/register`); load(); } catch (err) { setError(errorMessage(err)); } };
  return <main className="content-wrap"><div className="simple-heading"><div><p className="eyebrow">YOUR CAMPUS PLANS</p><h1>My registrations</h1><p>All the things you said yes to, in one place.</p></div><Link to="/events" className="primary-button">Explore events <span>→</span></Link></div><ErrorMessage message={error} />{loading ? <Loading label="Loading registrations..." /> : registrations.length ? <div className="registration-list">{registrations.map((item) => <article className="registration-row" key={item.id}><div className="registration-calendar"><strong>{new Date(`${item.eventDate}T12:00:00`).toLocaleDateString(undefined, { day: '2-digit' })}</strong><span>{new Date(`${item.eventDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span></div><div className="registration-info"><span className="category-tag">{item.category}</span><Link to={`/events/${item.eventId}`}><h2>{item.eventName}</h2></Link><p>{item.venue} · {item.eventTime?.slice(0, 5)}</p></div><button className="quiet-button" onClick={() => cancel(item)}>Cancel registration</button></article>)}</div> : <div className="empty-state"><span>↗</span><h2>A little room in your calendar</h2><p>You haven’t registered for anything yet.</p><Link className="text-action" to="/events">Browse upcoming events →</Link></div>}</main>;
}