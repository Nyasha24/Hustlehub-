import React, { useState } from 'react';
import { apiRequest, saveAuth } from '../services/api';
import StatusMessage from './StatusMessage';
import CustomDropdown from './CustomDropdown';

const ROLE_OPTIONS = [
  { value: 'client', label: 'Client (Hire Freelancers)' },
  { value: 'freelancer', label: 'Freelancer (Offer Services)' }
];

function LoginForm({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsError(false);

    if (!email || !password || (isRegistering && !fullName)) {
      setStatus('Please fill in all required fields.');
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const data = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ fullName, email, password, role })
        });
        saveAuth(data.token, data.data);
        onLogin(data.data);
      } else {
        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        saveAuth(data.token, data.user);
        onLogin(data.user);
      }
    } catch (err) {
      setStatus(err.message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', background: 'rgba(15, 23, 26, 0.85)', backdropFilter: 'blur(16px)' }}>
      <h2 style={{ color: '#ffffff', marginBottom: '8px' }}>{isRegistering ? 'Create an Account' : 'Sign In'}</h2>
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
        {isRegistering ? 'Join HustleHub+ as a client or freelancer' : 'Access your dashboard'}
      </p>

      <StatusMessage message={status} type={isError ? 'error' : 'info'} />

      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="input-field"
            />
          </div>
        )}

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            className="input-field"
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="input-field"
          />
        </div>

        {isRegistering && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>I want to join as a:</label>
            <CustomDropdown
              options={ROLE_OPTIONS}
              value={role}
              onChange={setRole}
              placeholder="Select Account Role"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '6px' }}
        >
          {loading ? 'Processing...' : isRegistering ? 'Register Account' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => { setIsRegistering(!isRegistering); setStatus(''); }}
          style={{ background: 'none', border: 'none', color: '#99f6e4', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
        >
          {isRegistering ? 'Already have an account? Sign in' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}

export default LoginForm;