import React, { useEffect } from 'react';

function GigDetailModal({ isOpen, gig, onClose, onBookGig, onOpenAuth, user }) {
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

  const isOwner = user && gig.freelancerId && (gig.freelancerId._id === user._id || gig.freelancerId === user._id);
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(gig.location || 'South Africa')}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gig.location || 'South Africa')}`;

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
        zIndex: 1400,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card spring-modal"
        style={{
          maxWidth: '880px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          borderRadius: '20px',
          padding: 0,
          position: 'relative',
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(0, 0, 0, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            fontSize: '14px',
            cursor: 'pointer',
            zIndex: 20,
            backdropFilter: 'blur(6px)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#cbd5e1';
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)';
          }}
        >
          ✕
        </button>

        {/* Left Column: Visual Media, Freelancer ID, Embedded Map */}
        <div
          style={{
            flex: '0 0 370px',
            width: '370px',
            background: 'rgba(0, 0, 0, 0.35)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxSizing: 'border-box'
          }}
        >
          {/* Gig Image Banner */}
          <div
            style={{
              width: '100%',
              height: '160px',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              background: '#091518',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {gig.image ? (
              <img
                src={gig.image}
                alt={gig.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '13px'
                }}
              >
                H²⁺ Verified Service
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(6, 14, 16, 0.85) 0%, transparent 60%)'
              }}
            />
            {gig.deliveryDays && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(6px)'
                }}
              >
                Delivery: {gig.deliveryDays} Days
              </span>
            )}
          </div>

          {/* Compact Freelancer Profile Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#334155',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                color: '#ffffff',
                fontSize: '15px'
              }}
            >
              {gig.freelancerId?.fullName ? gig.freelancerId.fullName.charAt(0).toUpperCase() : 'F'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {gig.freelancerId?.fullName || 'Verified Freelancer'}
                </span>
                <span style={{ fontSize: '10px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  ✓ ID Verified
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {gig.freelancerId?.email || 'H²⁺ Registered Partner'}
              </p>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#040b0d',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                padding: '6px 10px',
                background: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <svg style={{ width: '13px', height: '13px', color: '#cbd5e1', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span style={{ fontSize: '11px', color: '#f1f5f9', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {gig.location || 'South Africa (Remote)'}
                </span>
              </div>
              <a
                href={mapsExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', color: '#99f6e4', textDecoration: 'none', marginLeft: '6px', flexShrink: 0 }}
              >
                Maps ↗
              </a>
            </div>
            <iframe
              title={`Interactive Map for ${gig.title}`}
              width="100%"
              height="140"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapsEmbedUrl}
            />
          </div>
        </div>

        {/* Right Column: Title, Category, Deliverables, Specs, Action Buttons */}
        <div
          style={{
            flex: '1 1 450px',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div>
            {/* Category & Pricing Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '14px', paddingRight: '36px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  {gig.category || 'Freelance Service'}
                </span>
                <h2
                  className="font-serif"
                  style={{
                    fontSize: '22px',
                    color: '#ffffff',
                    margin: '8px 0 0 0',
                    lineHeight: 1.25,
                    fontWeight: '500'
                  }}
                >
                  {gig.title}
                </h2>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Verified Fixed Price</span>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
                  R{gig.price ? gig.price.toLocaleString() : '0'}
                </span>
              </div>
            </div>

            {/* Tags */}
            {gig.tags && gig.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {gig.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Service Description Section */}
            <div style={{ marginBottom: '18px' }}>
              <h4
                style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: '#94a3b8',
                  marginBottom: '6px'
                }}
              >
                Service Overview & Deliverables
              </h4>
              <p
                style={{
                  color: '#e2e8f0',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-line',
                  maxHeight: '140px',
                  overflowY: 'auto'
                }}
              >
                {gig.description}
              </p>
            </div>

            {/* Service Guarantee Specs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '20px'
              }}
            >
              <div
                style={{
                  flex: '1 1 120px',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              >
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px' }}>PROTOCOL ESCROW</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>100% Protected</span>
              </div>
              <div
                style={{
                  flex: '1 1 120px',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              >
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px' }}>PLATFORM FEE</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>10% Included</span>
              </div>
              <div
                style={{
                  flex: '1 1 120px',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              >
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '10px' }}>EST. TURNAROUND</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>{gig.deliveryDays || 3} Days</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '10px' }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: '1 1 120px', padding: '12px', fontSize: '13px' }}
            >
              Close
            </button>

            {user ? (
              user.role === 'client' ? (
                <button
                  onClick={() => {
                    onClose();
                    onBookGig(gig);
                  }}
                  className="btn-primary"
                  style={{
                    flex: '2 1 220px',
                    padding: '12px 18px',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}
                >
                  Book Service (R{gig.price ? gig.price.toLocaleString() : '0'}) →
                </button>
              ) : isOwner ? (
                <button
                  disabled
                  style={{
                    flex: '2 1 220px',
                    padding: '12px 18px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                >
                  Your Active Listing
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onBookGig(gig);
                  }}
                  className="btn-primary"
                  style={{
                    flex: '2 1 220px',
                    padding: '12px 18px',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}
                >
                  Book Service (R{gig.price ? gig.price.toLocaleString() : '0'}) →
                </button>
              )
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="btn-primary"
                style={{
                  flex: '2 1 220px',
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: '700'
                }}
              >
                Sign In to Book This Service
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GigDetailModal;
