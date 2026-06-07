import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const bgColor = type === 'success' ? '#4a90d9' : '#e74c3c';

  return (
    <div
      style={{
        position: 'fixed',
        top: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        background: bgColor,
        color: '#fff',
        padding: '10px 28px',
        borderRadius: 8,
        fontWeight: 500,
        fontSize: 15,
        zIndex: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
    >
      {message}
    </div>
  );
}
