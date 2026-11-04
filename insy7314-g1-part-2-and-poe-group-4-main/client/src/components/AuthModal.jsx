import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, googleLoginUser, saveAuth } from '../services/api';
import StatusMessage from './StatusMessage';

function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    /* Initialize Google Sign-In with White Pill Button */
    if (window.google && isOpen) {
      window.google.accounts.id.initialize({
        client_id: '957017076236-dfl6gn6k01gqr7597br0skp2i0m8h2dc.apps.googleusercontent.com',
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInBtn'),
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 350
        }
      );
    }
  }, [isOpen, isRegistering]);

  if (!isOpen) return null;

  const handleGoogleCallback = async (response) => {
    try {
      setLoading(true);
      const data = await googleLoginUser(response.credential, role);
      saveAuth(data.token, data.user);
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setStatus(err.message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsError(false);

    if (!email || !password || (isRegistering && !fullName)) {
      setStatus('Please fill in all required fields.');
      setIsError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const data = await registerUser(fullName, email, password, role);
        saveAuth(data.token, data.data);
        onLoginSuccess(data.data);
      } else {
        const data = await loginUser(email, password);
        saveAuth(data.token, data.user);
        onLoginSuccess(data.user);
      }
      onClose();
    } catch (err) {
      setStatus(err.message);
      setIsError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay - clicking outside closes modal */}
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
          padding: '20px',
          willChange: 'opacity'
        }}
        onClick={onClose}
      >
        {/* Modal Window Card - stopPropagation prevents closing when clicking inside */}
        <div
          className={`glass-card spring-modal ${shake ? 'shake-animation' : ''}`}
          style={{
            maxWidth: '430px',
            width: '100%',
            padding: '32px',
            position: 'relative',
            willChange: 'transform',
            transform: 'translate3d(0, 0, 0)'
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
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            ✕
          </button>

          {/* Centered Title with Exact H²⁺ Logo Colors */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h2 className="font-serif" style={{ fontSize: '26px', color: '#ffffff', margin: 0, fontWeight: '500' }}>
              {isRegistering ? (
                <span>
                  Join HustleHub
                  <span style={{ fontSize: '24px', fontWeight: '900', marginLeft: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>H</span>
                    <sup style={{ color: '#99f6e4', fontSize: '13px', top: '-0.35em' }}>2</sup>
                    <sup style={{ color: '#a7f3d0', fontSize: '13px', top: '-0.35em' }}>+</sup>
                  </span>
                </span>
              ) : (
                <span>
                  Sign In to{' '}
                  <span style={{ fontSize: '26px', fontWeight: '900' }}>
                    <span style={{ color: '#94a3b8' }}>H</span>
                    <sup style={{ color: '#99f6e4', fontSize: '14px', top: '-0.35em' }}>2</sup>
                    <sup style={{ color: '#a7f3d0', fontSize: '14px', top: '-0.35em' }}>+</sup>
                  </span>
                </span>
              )}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
              {isRegistering ? 'Create your secure account to hire or offer services' : 'Welcome back to your secure freelance workspace'}
            </p>
          </div>

          <StatusMessage message={status} type={isError ? 'error' : 'info'} />

          {/* Prominent Role Selector - Only shown when registering a new account */}
          {isRegistering && (
            <div style={{ marginBottom: '18px' }}>
              <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', textAlign: 'center', fontWeight: '700' }}>
                Select Account Role:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: role === 'client' ? 'rgba(59, 130, 246, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                    color: role === 'client' ? '#93c5fd' : '#94a3b8',
                    border: role === 'client' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Client (Hire)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: role === 'freelancer' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                    color: role === 'freelancer' ? '#6ee7b7' : '#94a3b8',
                    border: role === 'freelancer' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Freelancer (Work)
                </button>
              </div>
            </div>
          )}

          {/* Google SSO Button (Crisp White Button) */}
          <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
            <div id="googleSignInBtn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
            <span style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '0.8px', fontWeight: '700' }}>OR WITH EMAIL</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                />
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>Email Address</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '25px', marginTop: '8px' }}
            >
              {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setStatus(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
            >
              {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register as Client or Freelancer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthModal;