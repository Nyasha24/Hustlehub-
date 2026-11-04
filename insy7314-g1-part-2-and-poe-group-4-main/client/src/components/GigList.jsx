import React from 'react';

function GigList({ gigs, user, onDelete }) {
  if (!gigs || gigs.length === 0) {
    return <p style={{ color: '#64748b' }}>No gigs available at the moment.</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
      {gigs.map((gig) => (
        <div key={gig._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: '12px', fontWeight: 'bold' }}>
            {gig.category}
          </span>
          <h3 style={{ margin: '10px 0 6px 0' }}>{gig.title}</h3>
          <p style={{ color: '#475569', fontSize: '14px', minHeight: '40px' }}>{gig.description}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#0f172a' }}>${gig.price}</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>⏱ {gig.deliveryDays} day(s)</span>
          </div>

          {user && (user.role === 'admin' || (user.id === gig.freelancer?._id || user.id === gig.freelancer)) && (
            <button
              onClick={() => onDelete(gig._id)}
              style={{ marginTop: '10px', width: '100%', padding: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Delete Gig
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default GigList;