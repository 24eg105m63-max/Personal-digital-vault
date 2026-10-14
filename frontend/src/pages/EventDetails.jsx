import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function EventDetails() {
  const { id } = useParams(); const [event, setEvent] = useState(null); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get(`/events/${id}`).then(({ data }) => setEvent(data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, [id]);
  const register = async () => { if (!localStorage.getItem('vault_token')) { window.location.href = '/login'; return; } try { await api.post(`/events/${id}/register`); setNotice('Registration confirmed. See you there!'); } catch (err) { setError(errorMessage(err)); } };
  if (loading) return <Loading label="Opening event details..." />;
  if (!event) return <main className="content-wrap"><ErrorMessage message={error} /><Link className="text-action" to="/events">← All events</Link></main>;
  const date = new Date(`${event.eventDate}T${event.eventTime}`);
  return <main className="content-wrap"><Link className="back-link" to="/events">← All events</Link><ErrorMessage message={error} />{notice && <div className="notice-success">{notice}</div>}<article className="event-detail"><div className="detail-aside"><p className="eyebrow">{event.category} / CAMPUS EVENT</p><div className="detail-date"><span>{date.toLocaleDateString(undefined, { month: 'long' })}</span><strong>{date.toLocaleDateString(undefined, { day: '2-digit' })}</strong><small>{date.toLocaleDateString(undefined, { weekday: 'long' })}</small></div><div className="detail-meta"><span>◷ {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span><span>⌖ {event.venue}</span><span>◎ {event.registeredParticipants} of {event.maximumParticipants} registered</span></div><button className="primary-button" onClick={register} disabled={event.registeredParticipants >= event.maximumParticipants}>Register for event <span>→</span></button></div><div className="detail-main"><p className="eyebrow">THE DETAILS</p><h1>{event.name}</h1><p className="detail-description">{event.description}</p><div className="capacity-track"><span style={{ width: `${Math.min(100, (event.registeredParticipants / event.maximumParticipants) * 100)}%` }} /></div><div className="capacity-label"><span>Places claimed</span><strong>{event.registeredParticipants} / {event.maximumParticipants}</strong></div></div></article></main>;
}