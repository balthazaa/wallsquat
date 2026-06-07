import { COLORS } from '../lib/constants';

export default function Modal({ visible, onClose, children, style: extraStyle }) {
  if (!visible) return null;

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        inset: 0,
        background: COLORS.overlay,
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
        ...extraStyle,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '1.8rem',
          padding: 28,
          width: '92%',
          maxWidth: 400,
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)',
          animation: 'slideUpModal 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
