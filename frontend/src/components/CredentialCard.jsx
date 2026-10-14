import { useState } from 'react';

export default function CredentialCard({ credential, onEdit, onDelete, onReveal }) {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePassword = async () => {
    if (visible) {
      setVisible(false);
      setPassword('');
      return;
    }

    setLoading(true);
    try {
      const revealedPassword = await onReveal(credential.id);
      if (revealedPassword !== null) {
        setPassword(revealedPassword);
        setVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="item-card credential-card">
      <div className="service-icon">{credential.serviceName?.charAt(0).toUpperCase()}</div>
      <div className="item-main">
        <strong>{credential.serviceName}</strong>
        <span>{credential.username}</span>
        <div className="password-row">
          <span>{visible ? password : '••••••••••'}</span>
          <button className="text-button" onClick={togglePassword} disabled={loading}>
            {loading ? 'Loading...' : visible ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      <div className="item-actions">
        <button className="ghost-button" onClick={() => onEdit(credential)}>Edit</button>
        <button className="ghost-button danger-text" onClick={() => onDelete(credential.id)}>Delete</button>
      </div>
    </article>
  );
}
