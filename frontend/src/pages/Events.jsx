import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import EventCard from '../components/EventCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const categories = ['All events', 'Academic', 'Arts & Culture', 'Career', 'Community', 'Sports', 'Technology'];

export default function Events() {
  const [events, setEvents] = useState([]); const [search, setSearch] = useState(''); const [category, setCategory] = useState('All events');
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const load = () => { setLoading(true); api.get('/events', { params: { search, category: category === 'All events' ? undefined : category, upcoming: true } }).then(({ data }) => setEvents(data)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); };
  useEffect(() => { const timer = setTimeout(load, 180); return () => clearTimeout(timer); }, [search, category]);
  const register = async (event) => { if (!localStorage.getItem('vault_token')) { window.location.href = '/login'; return; } setNotice(''); setError(''); try { await api.post(`/events/${event.id}/register`); setNotice(`You're on the list for ${event.name}.`); load(); } catch (err) { setError(errorMessage(err)); } };
  return <main className="content-wrap"><div className="page-intro"><div><p className="eyebrow">CAMPUS CALENDAR / 2026</p><h1>Find your next<br /><em>good thing.</em></h1><p className="intro-copy">Ideas, people and moments worth showing up for.</p></div><div className="intro-stamp"><span>ON CAMPUS</span><strong>{events.length.toString().padStart(2, '0')}</strong><small>upcoming events</small></div></div>
    <div className="event-toolbar"><label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events, places, topics" aria-label="Search events" /></label><div className="category-tabs" aria-label="Filter by category">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? 'category-tab active' : 'category-tab'}>{item}</button>)}</div></div>
    {notice && <div className="notice-success" role="status">{notice}</div>}<ErrorMessage message={error} />
    {loading ? <Loading label="Loading campus events..." /> : events.length ? <section className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} onRegister={register} />)}</section> : <div className="empty-state"><span>✳</span><h2>No events found</h2><p>Try another search or category. New campus happenings are added regularly.</p><button className="secondary-button" onClick={() => { setSearch(''); setCategory('All events'); }}>Clear filters</button></div>}
    <div className="events-footnote"><span>Made for campus life</span><Link to="/">Back to the event desk ↑</Link></div></main>;
}