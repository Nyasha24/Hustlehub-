import React, { useState } from 'react';

function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Glowing Button with Bevel Depth */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Help & System Guide"
        className="help-fab"
        style={{
          fontSize: '18px',
          fontWeight: '700'
        }}
      >
        {isOpen ? '✕' : '?'}
      </button>

      {/* Slide-in Help Modal */}
      {isOpen && (
        <div
          className="glass-card spring-modal"
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '350px',
            maxHeight: '75vh',
            overflowY: 'auto',
            borderRadius: '16px',
            padding: '22px',
            zIndex: 900,
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(153, 246, 228, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '17px', fontWeight: '900', fontFamily: 'Newsreader, serif' }}>
                <span style={{ color: '#94a3b8' }}>H</span>
                <sup style={{ color: '#99f6e4', fontSize: '11px' }}>2</sup>
                <sup style={{ color: '#a7f3d0', fontSize: '11px' }}>+</sup>
              </span>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '15px', fontWeight: '700' }}>
                HustleHub+ Guide
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
            Welcome to HustleHub+ — South Africa's high-security freelance marketplace platform.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Guide Card 1 */}
            <div style={{ background: 'rgba(6, 14, 16, 0.55)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(153, 246, 228, 0.15)' }}>
              <span style={{ color: '#99f6e4', fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                Milestone Escrow Protection
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5', display: 'block' }}>
                Client funds remain locked in secure escrow until you review and approve completed deliverables. Zero dispute risk.
              </span>
            </div>

            {/* Guide Card 2 */}
            <div style={{ background: 'rgba(6, 14, 16, 0.55)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(153, 246, 228, 0.15)' }}>
              <span style={{ color: '#99f6e4', fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                10% Platform Fee & Invoicing
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5', display: 'block' }}>
                Transparent flat 10% marketplace fee on completed orders with automatic SARS-compliant VAT breakdowns on every payout.
              </span>
            </div>

            {/* Guide Card 3 */}
            <div style={{ background: 'rgba(6, 14, 16, 0.55)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(153, 246, 228, 0.15)' }}>
              <span style={{ color: '#99f6e4', fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                Verified Freelancer Hub
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5', display: 'block' }}>
                Registered freelancers can publish new service listings, set delivery timelines, specify locations, and fulfill active orders seamlessly.
              </span>
            </div>

            {/* Guide Card 4 */}
            <div style={{ background: 'rgba(6, 14, 16, 0.55)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(153, 246, 228, 0.15)' }}>
              <span style={{ color: '#99f6e4', fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                Authentication & SSO Security
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5', display: 'block' }}>
                Sign in with 1-Click Google OAuth SSO or standard credentials. Recover access in seconds using Resend 6-Digit OTP verification.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HelpWidget;
