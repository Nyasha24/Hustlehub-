import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import StatusMessage from './StatusMessage';
import CustomDropdown from './CustomDropdown';

const GIG_CATEGORIES = [
  'Web Development',
  'Design & Creative',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'AI & Tech Consulting'
];

function GigForm({ onGigCreated }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Web Development',
    description: '',
    price: '',
    deliveryDays: ''
  });
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (val) => {
    setForm({ ...form, category: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsError(false);

    if (!form.title.trim() || !form.description.trim() || !form.price || !form.deliveryDays) {
      setStatus('All fields are required.');
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      await apiRequest('/api/gigs', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          price: Number(form.price),
          deliveryDays: Number(form.deliveryDays)
        })
      });

      setStatus('Gig created successfully!');
      setForm({
        title: '',
        category: 'Web Development',
        description: '',
        price: '',
        deliveryDays: ''
      });
      if (onGigCreated) onGigCreated();
    } catch (err) {
      setStatus(err.message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
      <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Post a New Freelance Service</h3>
      <StatusMessage message={status} type={isError ? 'error' : 'info'} />

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Service Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={updateField}
            placeholder="e.g. Modern Full-Stack Web Development"
            className="input-field"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Category</label>
            <CustomDropdown
              options={GIG_CATEGORIES}
              value={form.category}
              onChange={handleCategoryChange}
              placeholder="Select Category"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Price (ZAR R)</label>
            <input
              type="number"
              name="price"
              min="5"
              value={form.price}
              onChange={updateField}
              className="input-field"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Delivery (Days)</label>
            <input
              type="number"
              name="deliveryDays"
              min="1"
              max="60"
              value={form.deliveryDays}
              onChange={updateField}
              className="input-field"
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            rows="3"
            placeholder="Describe your service, milestones, and deliverables..."
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '14px' }}
        >
          {loading ? 'Publishing...' : 'Publish Service Listing'}
        </button>
      </form>
    </div>
  );
}

export default GigForm;