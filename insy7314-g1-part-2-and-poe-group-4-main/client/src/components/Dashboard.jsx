import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import GigList from './GigList';
import GigForm from './GigForm';
import StatusMessage from './StatusMessage';

function Dashboard({ user }) {
  const [gigs, setGigs] = useState([]);
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);

  const loadGigs = async () => {
    try {
      setStatus('Loading available gigs...');
      setIsError(false);
      const data = await apiRequest('/api/gigs');
      setGigs(data.data || []);
      setStatus('');
    } catch (err) {
      setStatus(err.message);
      setIsError(true);
    }
  };

  const deleteGig = async (id) => {
    try {
      await apiRequest(`/api/gigs/${id}`, { method: 'DELETE' });
      loadGigs();
    } catch (err) {
      setStatus(err.message);
      setIsError(true);
    }
  };

  useEffect(() => {
    loadGigs();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
        <h2>Welcome to HustleHub+, {user.fullName}</h2>
        <p style={{ color: '#64748b', margin: '4px 0' }}>
          Role: <strong style={{ textTransform: 'capitalize', color: '#2563eb' }}>{user.role}</strong> | Email: {user.email}
        </p>
      </header>

      {(user.role === 'freelancer' || user.role === 'admin') && (
        <GigForm onGigCreated={loadGigs} />
      )}

      <div>
        <h3>Marketplace Gigs</h3>
        <StatusMessage message={status} type={isError ? 'error' : 'info'} />
        <GigList gigs={gigs} user={user} onDelete={deleteGig} />
      </div>
    </div>
  );
}

export default Dashboard;