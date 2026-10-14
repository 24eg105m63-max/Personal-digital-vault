import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  useEffect(() => { api.get('/events', { params: { upcoming: true } }).then(({ data }) => setEvents(data.slice(0, 3))).catch(() => setEvents([])); }, []);
  return <main><section className="home-hero"><div className="hero-image" role="img" aria-label="Students gathering on a college campus" /><div className="hero-copy"><p className="eyebrow">THE CAMPUS, IN MOTION</p><h1>Make room for<br /><em>something new.</em></h1><p>Discover the talks, shows, meetups and moments that make this place yours.</p><Link className="primary-button" to="/events">Explore campus events <span>→</span></Link><div className="hero-note"><span>01 / 04</span><span>Curiosity looks good on you</span></div></div><div className="hero-index">CAMPUS<br />LIFE<br /><span>26—27</span></div></section><section className="home-events"><div className="section-heading"><div><p className="eyebrow">ON THE HORIZON</p><h2>Worth putting<br />on the calendar.</h2></div><Link className="text-action" to="/events">All events <span>↗</span></Link></div>{events.length ? <div className="event-grid home-event-grid">{events.map((event) => <EventCard event={event} key={event.id} />)}</div> : <div className="home-empty"><span>✳</span><p>New campus events are taking shape.</p><Link to="/events">Explore the calendar →</Link></div>}</section><section className="home-callout"><span className="eyebrow">SHOW UP. FIND YOUR PEOPLE.</span><h2>A full campus is a<br /><em>better campus.</em></h2><Link to={localStorage.getItem('vault_token') ? '/registrations' : '/register'}>{localStorage.getItem('vault_token') ? 'See your registrations' : 'Join the community'} <span>→</span></Link></section></main>;
}
