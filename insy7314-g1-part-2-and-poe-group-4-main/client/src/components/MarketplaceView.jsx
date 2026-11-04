import React, { useState, useMemo } from 'react';
import GigDetailModal from './GigDetailModal';

const CATEGORIES = [
  'All',
  'Web Development',
  'Design & Creative',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'AI & Tech Consulting'
];

function MarketplaceView({ gigs, loading, user, onBookGig, onOpenAuth, onDeleteGig }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGigForDetail, setSelectedGigForDetail] = useState(null);

  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (gig.category && gig.category.toLowerCase() === selectedCategory.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        gig.title?.toLowerCase().includes(query) ||
        gig.description?.toLowerCase().includes(query) ||
        gig.location?.toLowerCase().includes(query) ||
        gig.category?.toLowerCase().includes(query) ||
        gig.freelancerId?.fullName?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [gigs, searchQuery, selectedCategory]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px 40px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h2 style={{ fontFamily: 'Newsreader, serif', fontSize: '38px', color: '#ffffff', margin: '10px 0', fontWeight: '400' }}>
          Explore South Africa's <em style={{ fontStyle: 'italic', color: '#2dd4bf' }}>Elite</em> Freelance Gigs
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
          Browse trusted services with guaranteed milestone escrows, transparent 10% platform fee, and instant Google Maps location verification.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by skill, title, location (e.g. Cape Town, React, Logo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gigs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#2dd4bf' }}>
          <div className="spinner" style={{ marginBottom: '16px' }}></div>
          <p style={{ fontSize: '15px', color: '#94a3b8' }}>Loading verified gigs from Railway API...</p>
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <svg style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 12px auto', display: 'block' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '8px' }}>No Gigs Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '450px', margin: '0 auto 20px' }}>
            No active gigs matched your search criteria. Try adjusting your search query or exploring another category.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="btn-primary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {filteredGigs.map((gig) => {
            const isOwner = user && gig.freelancerId && (gig.freelancerId._id === user._id || gig.freelancerId === user._id);
            const isAdmin = user && user.role === 'admin';
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gig.location || 'South Africa')}`;

            return (
              <div
                key={gig._id}
                className="glass-card spring-hover"
                onClick={() => setSelectedGigForDetail(gig)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {/* Optional Gig Thumbnail Header */}
                {gig.image && (
                  <div style={{ width: '100%', height: '175px', overflow: 'hidden', position: 'relative', background: '#091518' }}>
                    <img
                      src={gig.image}
                      alt={gig.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.currentTarget.parentElement.style.display = 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(6, 14, 16, 0.9) 0%, rgba(6, 14, 16, 0.15) 60%, transparent 100%)'
                    }} />
                    {gig.deliveryDays && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 9px',
                        borderRadius: '8px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: '#ffffff',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        {gig.deliveryDays}d delivery
                      </span>
                    )}
                  </div>
                )}

                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    {/* Top Bar: Category & Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}>
                        {gig.category || 'General'}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Fixed Price</span>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>
                          R{gig.price ? gig.price.toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '700',
                      lineHeight: '1.4',
                      marginBottom: '10px'
                    }}>
                      {gig.title}
                    </h3>

                    {/* Tags */}
                    {gig.tags && gig.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {gig.tags.slice(0, 4).map((tag, idx) => (
                          <span key={idx} style={{
                            fontSize: '10px',
                            color: '#94a3b8',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      marginBottom: '18px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {gig.description}
                    </p>

                    {/* Location & Google Maps Link */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                      <svg style={{ width: '14px', height: '14px', color: '#94a3b8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="View location pin on Google Maps"
                        style={{
                          color: '#cbd5e1',
                          fontSize: '12px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {gig.location || 'South Africa (Remote)'}
                        <span style={{ fontSize: '10px' }}>↗</span>
                      </a>
                    </div>

                    {/* Freelancer Profile Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      marginBottom: '18px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        color: '#ffffff',
                        fontSize: '13px'
                      }}>
                        {gig.freelancerId?.fullName ? gig.freelancerId.fullName.charAt(0).toUpperCase() : 'F'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {gig.freelancerId?.fullName || 'Verified Freelancer'}
                        </p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                          {gig.freelancerId?.email || 'H²⁺ Verified Partner'}
                        </p>
                      </div>
                    </div>
                  </div>

                {/* Card CTA Actions */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {user ? (
                    user.role === 'client' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookGig(gig);
                        }}
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                      >
                        Book Service →
                      </button>
                    ) : isOwner ? (
                      <button
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#94a3b8',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      >
                        Your Active Listing
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookGig(gig);
                        }}
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                      >
                        Book Service →
                      </button>
                    )
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAuth();
                      }}
                      className="btn-primary"
                      style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                    >
                      Sign In to Book
                    </button>
                  )}

                  {(isAdmin || isOwner) && onDeleteGig && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGig(gig._id);
                      }}
                      title="Delete this listing (RBAC owner or admin)"
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg style={{ width: '15px', height: '15px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Expanded Gig Detail Modal */}
      <GigDetailModal
        isOpen={!!selectedGigForDetail}
        gig={selectedGigForDetail}
        onClose={() => setSelectedGigForDetail(null)}
        onBookGig={onBookGig}
        onOpenAuth={onOpenAuth}
        user={user}
      />
    </div>
  );
}

export default MarketplaceView;
