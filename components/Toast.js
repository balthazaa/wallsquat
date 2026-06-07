import { useEffect, useRef, useState } from 'react';
import { COLORS } from '../lib/constants';

export default function Toast({ msg }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!msg) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        background: COLORS.toastBg,
        color: '#fff',
        padding: '10px 24px',
        borderRadius: 999,
        fontSize: '0.88rem',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
        zIndex: 200,
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      {msg}
    </div>
  );
}
