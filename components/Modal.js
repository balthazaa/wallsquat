import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.target === overlayRef.current) onClose();
    };
    const keyHandler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: '28px 24px 20px',
          minWidth: 320,
          maxWidth: '92vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
          position: 'relative',
        }}
      >
        {title && (
          <div
            style={{
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 18,
              color: '#4a90d9',
            }}
          >
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
