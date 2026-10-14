import { useEffect, useState } from 'react';
import api, { errorMessage } from '../services/api';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { api.get('/user/me').then(({ data }) => { setProfile(data); setForm({ name: data.name, phone: data.phone }); }).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, []);

  const saveProfile = async (event) => {
    event.preventDefault(); setSavingProfile(true); setError(''); setNotice('');
    try { const { data } = await api.put('/user/me', form); setProfile(data); setForm({ name: data.name, phone: data.phone }); updateStoredName(data.name); setNotice('Profile details saved.'); }
    catch (err) { setError(errorMessage(err)); } finally { setSavingProfile(false); }
  };
  const changePassword = async (event) => {
    event.preventDefault(); setError(''); setNotice('');
    if (password.newPassword !== password.confirmPassword) return setError('The new passwords do not match.');
    if (password.newPassword.length < 8) return setError('Use at least 8 characters for your new password.');
    setSavingPassword(true);
    try { await api.put('/user/password', { currentPassword: password.currentPassword, newPassword: password.newPassword }); setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' }); setNotice('Password changed. Your current session remains active.'); }
    catch (err) { setError(errorMessage(err)); } finally { setSavingPassword(false); }
  };

  if (loading) return <Loading label="Loading profile..." />;
  return <div>
    <div className="page-heading"><div><p className="eyebrow">ACCOUNT DETAILS</p><h1>Profile & settings</h1><p className="muted">Manage your personal details and account security.</p></div></div>
    <ErrorMessage message={error} onDismiss={() => setError('')} />
    {notice && <div className="notice notice-success" role="status">{notice}<button className="notice-close" onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    {profile && <section className="profile-layout">
      <div className="profile-summary dashboard-card"><div className="profile-avatar">{profile.name?.charAt(0)?.toUpperCase()}</div><h2>{profile.name}</h2><p>{profile.email}</p><div className="profile-summary-foot"><span className="secure-lock">✓</span><span><strong>Account protected</strong><small>JWT authenticated</small></span></div></div>
      <div className="profile-forms">
        <form className="dashboard-card settings-form" onSubmit={saveProfile}><div className="section-title"><div><p className="eyebrow">YOUR INFORMATION</p><h2>Personal details</h2></div><span className="soft-icon">◎</span></div><label>Full name<input required minLength="2" maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input value={profile.email} readOnly disabled /></label><label>Phone number<input required minLength="10" maxLength="15" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><button className="primary-button" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save changes'}</button></form>
        <form className="dashboard-card settings-form" onSubmit={changePassword}><div className="section-title"><div><p className="eyebrow">ACCOUNT SECURITY</p><h2>Change password</h2></div><span className="soft-icon">◇</span></div><label>Current password<input type="password" autoComplete="current-password" required value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} /></label><label>New password<input type="password" minLength="8" autoComplete="new-password" required value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} /></label><label>Confirm new password<input type="password" minLength="8" autoComplete="new-password" required value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} /></label><button className="secondary-button" disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Update password'}</button></form>
      </div>
    </section>}
  </div>;
}

function updateStoredName(name) { try { const user = JSON.parse(localStorage.getItem('vault_user') || '{}'); localStorage.setItem('vault_user', JSON.stringify({ ...user, name })); window.dispatchEvent(new Event('vault-profile-updated')); } catch { /* Keep the server response authoritative without disrupting the session. */ } }
