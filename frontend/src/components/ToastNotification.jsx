import React, { useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  let bgStyle = { background: '#0f172a', color: '#ffffff', borderColor: '#334155' };
  let IconComponent = CheckCircle2;
  let iconColor = '#10b981';

  if (type === 'info') {
    IconComponent = Sparkles;
    iconColor = '#38bdf8';
  } else if (type === 'error') {
    bgStyle = { background: '#7f1d1d', color: '#ffffff', borderColor: '#991b1b' };
    IconComponent = AlertCircle;
    iconColor = '#f87171';
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${bgStyle.borderColor}`,
        ...bgStyle,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <IconComponent size={18} color={iconColor} className="shrink-0" />
      <span style={{ fontSize: '0.84375rem', fontWeight: 600 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            padding: '0.2rem',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '0.5rem'
          }}
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
