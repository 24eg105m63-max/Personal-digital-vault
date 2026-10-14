import { Link } from 'react-router-dom';

export default function NotFound() {
  return <main className="not-found"><span>404 / OFF THE MAP</span><h1>This isn't on<br /><em>the calendar.</em></h1><p>That page has moved on. The good stuff is still right here.</p><Link className="primary-button" to="/events">Find an event <span>→</span></Link></main>;
}