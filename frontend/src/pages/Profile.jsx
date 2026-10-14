import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Profile() {
	const [profile, setProfile] = useState(null); const [error, setError] = useState('');
	useEffect(() => { api.get('/user/me').then(({ data }) => setProfile(data)).catch((err) => setError(errorMessage(err))); }, []);
	if (!profile && !error) return <Loading label="Loading profile..." />;
	return <main className="content-wrap profile-page"><p className="eyebrow">YOUR CAMPUS ACCOUNT</p><h1>Profile</h1><p className="intro-copy">The details attached to your event registrations.</p><ErrorMessage message={error} />{profile && <section className="profile-sheet"><div className="profile-monogram">{profile.name?.charAt(0)}</div><div><span className="category-tag">{profile.role === 'ADMIN' ? 'ADMINISTRATOR' : 'STUDENT'}</span><h2>{profile.name}</h2><p>{profile.email}</p><p>{profile.phone}</p></div><div className="profile-note"><span>ACCOUNT STATUS</span><strong>Active</strong><small>Member since {new Date().getFullYear()}</small></div></section>}</main>;
}
