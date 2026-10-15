import { Link } from 'react-router-dom';
import './landing.css';

const features = [
  { icon: '▧', title: 'Files, all together', text: 'Keep important documents and images organized in one private space.' },
  { icon: '✎', title: 'Notes that stay yours', text: 'Save ideas, reminders, and personal details you want close at hand.' },
  { icon: '⌑', title: 'Credentials, protected', text: 'Store account details in your vault and access them when you need them.' },
];

function Brand() {
  return <Link className="landing-brand" to="/" aria-label="Personal Digital Vault home">
    <span className="landing-brand-mark" aria-hidden="true">◆</span>
    <span>Personal Digital Vault</span>
  </Link>;
}

function VaultPreview() {
  return <div className="landing-preview" aria-label="Preview of the vault dashboard">
    <div className="preview-topbar"><div className="preview-brand"><span>◆</span> Your Vault</div><span className="preview-avatar">JD</span></div>
    <div className="preview-content">
      <p className="preview-overline">YOUR PRIVATE SPACE</p>
      <h2>Everything in its place.</h2>
      <div className="preview-stats">
        <div className="preview-stat"><span className="preview-icon files-icon">▧</span><small>My files</small><strong>Documents</strong></div>
        <div className="preview-stat"><span className="preview-icon notes-icon">✎</span><small>My notes</small><strong>Ideas &amp; plans</strong></div>
      </div>
      <div className="preview-recent">
        <div className="preview-recent-heading"><strong>Recently saved</strong><span>Private</span></div>
        <div className="preview-row"><span className="preview-file-icon">PDF</span><span><strong>Important documents</strong><small>Stored securely</small></span><b>•••</b></div>
        <div className="preview-row"><span className="preview-note-icon">✎</span><span><strong>Personal notes</strong><small>Only for you</small></span><b>•••</b></div>
      </div>
    </div>
    <div className="preview-shield"><span>✓</span></div>
  </div>;
}

export default function LandingPage() {
  const signedIn = Boolean(localStorage.getItem('vault_token'));
  const destination = signedIn ? '/dashboard' : '/register';

  return <main className="landing-page">
    <header className="landing-header">
      <Brand />
      <nav className="landing-nav" aria-label="Main navigation">
        <a href="#features">Features</a>
        <a href="#privacy">Privacy</a>
        <Link className="landing-signin" to={signedIn ? '/dashboard' : '/login'}>{signedIn ? 'Open vault' : 'Sign in'}</Link>
        <Link className="landing-nav-cta" to={destination}>{signedIn ? 'Go to dashboard' : 'Create your vault'} <span>→</span></Link>
      </nav>
    </header>

    <section className="landing-hero">
      <div className="landing-hero-copy">
        <div className="landing-kicker"><span /> A calmer place for your digital life</div>
        <h1>Your important things,<br /><em>kept in one safe place.</em></h1>
        <p className="landing-intro">Bring your files, notes, and account details together in a private digital vault that’s easy to use and yours to control.</p>
        <div className="landing-actions">
          <Link className="landing-primary" to={destination}>{signedIn ? 'Open your vault' : 'Create your free account'} <span>→</span></Link>
          <a className="landing-secondary" href="#features">Explore features <span>↓</span></a>
        </div>
        <div className="landing-assurance"><span className="assurance-check">✓</span><span>Private by design</span><i /> <span>Simple to organize</span></div>
      </div>
      <div className="landing-hero-art"><div className="hero-glow" /><div className="hero-orbit orbit-a" /><div className="hero-orbit orbit-b" /><VaultPreview /><span className="floating-lock" aria-hidden="true">⌑</span><span className="floating-spark spark-a" aria-hidden="true">✦</span><span className="floating-spark spark-b" aria-hidden="true">✧</span></div>
    </section>

    <section className="landing-features" id="features">
      <div className="landing-section-intro"><p className="landing-eyebrow">ONE VAULT, LESS CLUTTER</p><h2>Keep the essentials close.</h2><p>A few thoughtful tools to help you bring your personal digital life together.</p></div>
      <div className="landing-feature-grid">{features.map((feature, index) => <article className="landing-feature-card" key={feature.title}><span className={`feature-icon feature-icon-${index + 1}`} aria-hidden="true">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p><span className="feature-number">0{index + 1}</span></article>)}</div>
    </section>

    <section className="landing-privacy" id="privacy">
      <div className="privacy-emblem" aria-hidden="true"><span>◆</span><b>✓</b></div>
      <div><p className="landing-eyebrow">YOUR SPACE, YOUR CONTROL</p><h2>Personal information deserves a personal space.</h2><p>Sign in to access your vault. Your files, notes, and credentials stay organized around you.</p></div>
      <Link className="privacy-link" to={destination}>{signedIn ? 'Continue to your vault' : 'Get started'} <span>→</span></Link>
    </section>

    <footer className="landing-footer"><Brand /><span>Keep what matters close.</span><span>© {new Date().getFullYear()} Personal Digital Vault</span></footer>
  </main>;
}
