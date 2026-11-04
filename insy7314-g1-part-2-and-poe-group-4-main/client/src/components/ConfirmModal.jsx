import React, { useEffect } from 'react';

function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm Delete',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  loading = false
}) {
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4, 8, 10, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2100,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card spring-modal"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '30px 26px',
          borderRadius: '18px',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(239, 68, 68, 0.15)',
          textAlign: 'center',
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon Badge */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, transparent 70%)',
            border: '2px solid rgba(239, 68, 68, 0.65)',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>

        <h3 className="font-serif" style={{ fontSize: '22px', color: '#ffffff', margin: '0 0 8px 0', fontWeight: '500' }}>
          {title}
        </h3>

        <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
            style={{ flex: 1, padding: '11px', fontSize: '13px' }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1.3,
              padding: '11px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
