import { useEffect, useState } from 'react';

export default function FadeIn({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        marginTop: visible ? 0 : 12,
        transition:
          'opacity 0.5s ease ' +
          delay +
          'ms, margin-top 0.5s cubic-bezier(0.22, 1, 0.36, 1) ' +
          delay +
          'ms',
      }}
    >
      {children}
    </div>
  );
}
