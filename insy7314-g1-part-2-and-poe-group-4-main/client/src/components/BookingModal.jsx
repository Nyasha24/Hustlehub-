import React, { useState, useEffect } from 'react';
import { createBooking } from '../services/api';
import StatusMessage from './StatusMessage';

function BookingModal({ isOpen, gig, onClose, onSuccess }) {
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !gig) return null;

  const platformFee = Math.round(gig.price * 0.10 * 100) / 100;
  const totalPrice = gig.price;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');

    if (!requirements.trim() || requirements.trim().length < 5) {
      setError('Please provide project requirements (minimum 5 characters).');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);

    try {
      const result = await createBooking(gig._id, requirements);
      onSuccess({
        transactionId: result.transaction?._id,
        amount: gig.price
      });
      onClose();
    } catch (err) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 9, 10, 0.85)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className={`glass-card spring-modal ${shake ? 'shake-animation' : ''}`}
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '32px',
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
          position: 'relative',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          }}
        >
          ✕
        </button>

        {/* Centered Title */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h2 className="font-serif" style={{ fontSize: '26px', color: '#ffffff', margin: 0, fontWeight: '500' }}>
            Book Freelance Service
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
            Funds are locked in secure milestone escrow until deliverables are approved
          </p>
        </div>

        {/* Service Snapshot Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', color: '#ffffff', fontWeight: '700', marginBottom: '6px' }}>
            {gig.title}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Category: <span style={{ color: '#cbd5e1' }}>{gig.category}</span> &nbsp;|&nbsp; Timeline: <span style={{ color: '#cbd5e1' }}>{gig.deliveryDays} Days</span>
          </p>
        </div>

        <StatusMessage message={error} type="error" />

        <form onSubmit={handleConfirm}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
              Project Instructions & Deliverables
            </label>
            <textarea
              className="input-field"
              rows="4"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe the scope, requirements, and deliverables expected..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Pricing Summary */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Service Fee:</span>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>R{gig.price ? gig.price.toLocaleString() : '0'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Simulated Platform Fee (10%):</span>
              <span style={{ color: '#cbd5e1' }}>R{platformFee ? platformFee.toLocaleString() : '0'} (Included)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', marginTop: '4px', fontWeight: 'bold' }}>
              <span style={{ color: '#ffffff', fontSize: '14px' }}>Total Escrow Deposit:</span>
              <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: '800' }}>
                R{totalPrice ? totalPrice.toLocaleString() : '0'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, padding: '12px', fontWeight: '700' }}>
              {loading ? 'Securing Escrow...' : 'Confirm + Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal;