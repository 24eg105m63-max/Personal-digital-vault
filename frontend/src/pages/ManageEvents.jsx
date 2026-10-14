import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

export default function ManageEvents() {
  const [events, setEvents] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = () => api.get('/events', { params: { upcoming: false } }).then(({ data }) => setEvents(data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const remove = async (event) => { if (!window.confirm(`Delete “${event.name}” and all of its registrations? This cannot be undone.`)) return; try { await api.delete(`/events/${event.id}`); load(); } catch (err) { setError(errorMessage(err)); } };
  return <main className="content-wrap"><div className="simple-heading"><div><p className="eyebrow">ADMIN / EVENT DESK</p><h1>Manage events</h1><p>Keep listings current, useful and welcoming.</p></div><Link to="/admin/events/new" className="primary-button">＋ Add event</Link></div><ErrorMessage message={error} />{loading ? <Loading label="Loading events..." /> : <div className="manage-list">{events.map((event) => <article className="manage-event" key={event.id}><div className="manage-event-date"><strong>{new Date(`${event.eventDate}T12:00:00`).toLocaleDateString(undefined, { day: '2-digit' })}</strong><span>{new Date(`${event.eventDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span></div><div className="manage-event-main"><div className="event-card-top"><span className="category-tag">{event.category}</span><span className="event-time">{event.eventTime?.slice(0, 5)}</span></div><h2>{event.name}</h2><p>{event.venue} · {event.registeredParticipants} of {event.maximumParticipants} places</p></div><div className="manage-actions"><Link className="icon-action" aria-label={`Edit ${event.name}`} title="Edit event" to={`/admin/events/${event.id}/edit`}>↗</Link><button className="icon-action danger" aria-label={`Delete ${event.name}`} title="Delete event" onClick={() => remove(event)}>×</button></div></article>)}</div>}</main>;
}