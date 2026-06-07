import { COLORS } from '../lib/constants';

export default function Modal({ visible, onClose, children, showClose, style: extraStyle }) {
  if (!visible) return null;

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.40)',
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
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
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {showClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: COLORS.subtleBg2,
              color: COLORS.textMedium,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
