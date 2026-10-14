import { Link } from 'react-router-dom';

export default function NotFound() {
  return <main className="not-found"><span>404 / PAGE NOT FOUND</span><h1>This page is<br />outside your vault.</h1><p>The address may have changed, or the page may not exist.</p><Link className="primary-button" to="/dashboard">Go to dashboard <span>→</span></Link></main>;
}
