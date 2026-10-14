import { Link } from 'react-router-dom';

const dateParts = (value) => {
  const date = new Date(`${value}T12:00:00`);
  return { month: date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(), day: date.toLocaleDateString(undefined, { day: '2-digit' }), full: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) };
};

export default function EventCard({ event, registered = false, onRegister }) {
  const date = dateParts(event.eventDate);
  const soldOut = event.registeredParticipants >= event.maximumParticipants;
  return <article className="event-card">
    <div className="event-date"><span>{date.month}</span><strong>{date.day}</strong></div>
    <div className="event-card-content">
      <div className="event-card-top"><span className="category-tag">{event.category}</span><span className="event-time">{event.eventTime?.slice(0, 5)}</span></div>
      <Link to={`/events/${event.id}`} className="event-title"><h3>{event.name}</h3></Link>
      <p className="event-summary">{event.description}</p>
      <div className="event-card-bottom"><span className="event-venue">⌖ {event.venue}</span><span>{event.registeredParticipants}/{event.maximumParticipants} seats</span></div>
      {onRegister && <button className="text-action" disabled={registered || soldOut} onClick={() => onRegister(event)}>{registered ? 'Registered' : soldOut ? 'Full' : 'Register'} <span>→</span></button>}
    </div>
    <div className="event-card-line" />
  </article>;
}