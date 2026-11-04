import React, { useEffect } from 'react';

function CelebrationModal({ isOpen, type = 'booking', title, message, receipt, role, onClose, buttonText }) {
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

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'freelancer':
        return {
          bg: 'rgba(226, 217, 204, 0.12)',
          border: '1px solid rgba(226, 217, 204, 0.4)',
          color: '#e2d9cc',
          label: 'Freelancer Account'
        };
      case 'admin':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          color: '#fcd34d',
          label: 'Platform Administrator'
        };
      case 'client':
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          color: '#93c5fd',
          label: 'Client Account'
        };
    }
  };

  const badgeStyle = getRoleBadgeStyle(role);

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
        zIndex: 2200,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card spring-modal"
        style={{
          maxWidth: '450px',
          width: '100%',
          padding: '32px 28px',
          textAlign: 'center',
          border: '1px solid rgba(226, 217, 204, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(226, 217, 204, 0.12)',
          borderRadius: '20px',
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Icon Glow Indicator */}
        {type === 'login' ? (
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(153, 246, 228, 0.25) 0%, rgba(167, 243, 208, 0.08) 70%)',
              border: '2px solid #99f6e4',
              boxShadow: '0 0 25px rgba(153, 246, 228, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto'
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#99f6e4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        ) : type === 'logout' ? (
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, transparent 70%)',
              border: '2px solid #94a3b8',
              boxShadow: '0 0 20px rgba(148, 163, 184, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto'
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
        ) : type === 'gig_created' ? (
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(226, 217, 204, 0.25) 0%, transparent 70%)',
              border: '2px solid #e2d9cc',
              boxShadow: '0 0 25px rgba(226, 217, 204, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto'
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e2d9cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
        ) : (
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
              border: '2px solid #ffffff',
              boxShadow: '0 0 25px rgba(255, 255, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto'
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        )}

        {/* Title */}
        <h2 className="font-serif" style={{ fontSize: '24px', color: '#ffffff', margin: '0 0 8px 0', fontWeight: '500' }}>
          {title || 'Action Successful'}
        </h2>

        {/* Role Pill for Login */}
        {type === 'login' && role && (
          <div style={{ marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '20px',
                background: badgeStyle.bg,
                border: badgeStyle.border,
                color: badgeStyle.color,
                letterSpacing: '0.5px'
              }}
            >
              {badgeStyle.label}
            </span>
          </div>
        )}

        <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
          {message}
        </p>

        {/* Booking Receipt Summary */}
        {receipt && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'left',
              marginBottom: '22px',
              fontSize: '13px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Transaction ID:</span>
              <span className="font-mono" style={{ color: '#e2d9cc', fontSize: '12px' }}>
                {receipt.transactionId || 'TXN-' + Math.floor(Math.random() * 900000 + 100000)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Total Escrow Locked:</span>
              <span style={{ fontWeight: '800', color: '#ffffff' }}>
                R{receipt.amount ? Number(receipt.amount).toLocaleString() : '0'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Milestone Vault:</span>
              <span style={{ color: '#ffffff', fontWeight: '700' }}>Smart Contract Secured</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-primary"
          style={{
            width: '100%',
            borderRadius: '24px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '700'
          }}
        >
          {buttonText || (type === 'login' ? 'Continue to Workspace →' : type === 'logout' ? 'Return to Marketplace' : type === 'gig_created' ? 'View My Hub' : 'Continue to Dashboard')}
        </button>
      </div>
    </div>
  );
}

export default CelebrationModal;