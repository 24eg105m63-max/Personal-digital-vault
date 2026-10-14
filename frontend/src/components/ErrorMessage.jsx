export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;
  return <div className="notice notice-error" role="alert"><span>{message}</span>{onDismiss && <button className="notice-close" onClick={onDismiss} aria-label="Dismiss">×</button>}</div>;
}
