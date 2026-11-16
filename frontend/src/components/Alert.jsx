import { useEffect } from 'react';

// Dismissible alert. type: "success" | "error" | "warning". Success alerts auto-close.
const Alert = ({ alert, onClose }) => {
  useEffect(() => {
    if (!alert || alert.type !== 'success') return undefined;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [alert, onClose]);

  if (!alert) return null;

  return (
    <div className={`alert alert-${alert.type}`} role="alert">
      <span>{alert.message}</span>
      <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss alert">
        ×
      </button>
    </div>
  );
};

export default Alert;
