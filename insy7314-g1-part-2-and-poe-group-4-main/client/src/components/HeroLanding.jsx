import React from 'react';

function HeroLanding({ onExplore, onJoin }) {
  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 20px 40px', overflow: 'hidden' }}>
      
      {/* 10 Opaque Floating Background Symbols across Viewport */}
      {/* 1. Code Brackets */}
      <svg className="floating-bg-symbol float-a" style={{ top: '12%', left: '7%', width: '110px', height: '110px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>

      {/* 2. Briefcase Node */}
      <svg className="floating-bg-symbol float-b" style={{ top: '18%', right: '8%', width: '125px', height: '125px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>

      {/* 3. Star / Sparkle */}
      <svg className="floating-bg-symbol float-c" style={{ bottom: '22%', left: '10%', width: '105px', height: '105px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>

      {/* 4. Layers */}
      <svg className="floating-bg-symbol float-d" style={{ bottom: '24%', right: '12%', width: '120px', height: '120px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>

      {/* 5. Central Compass Node */}
      <svg className="floating-bg-symbol float-a" style={{ top: '68%', left: '46%', width: '85px', height: '85px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
      </svg>

      {/* 6. Shield Node */}
      <svg className="floating-bg-symbol float-b" style={{ top: '35%', left: '18%', width: '95px', height: '95px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>

      {/* 7. Hexagon Node */}
      <svg className="floating-bg-symbol float-c" style={{ top: '42%', right: '20%', width: '100px', height: '100px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </svg>

      {/* 8. Terminal Prompt */}
      <svg className="floating-bg-symbol float-d" style={{ bottom: '10%', left: '32%', width: '90px', height: '90px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" y1="19" x2="20" y2="19"></line>
      </svg>

      {/* 9. Lightning Spark */}
      <svg className="floating-bg-symbol float-a" style={{ top: '8%', right: '35%', width: '80px', height: '80px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>

      {/* 10. Database Node */}
      <svg className="floating-bg-symbol float-b" style={{ bottom: '12%', right: '36%', width: '88px', height: '88px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
      </svg>

      {/* Main Hero Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '980px', margin: '0 auto' }}>
        
        {/* Headline without Flickering/Breathing, with Tactile 3D Bevel on Hover */}
        <h1 className="font-serif headline-title" style={{ fontSize: 'clamp(42px, 6.5vw, 76px)', fontWeight: '400', lineHeight: '1.12', color: '#ffffff', marginBottom: '24px', letterSpacing: '-0.5px' }}>
          <span className="bevel-text">The Secure Marketplace</span> for <br />
          <span className="bevel-text" style={{ color: '#a7f3d0', fontStyle: 'italic', fontWeight: '500' }}>High-Impact Freelancers</span> & <br />
          <span className="bevel-text">Visionary Clients.</span>
        </h1>

        <p className="bevel-text" style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '680px', margin: '0 auto 40px auto', lineHeight: '1.65', fontWeight: '400' }}>
          HustleHub+ connects verified South African talent with clients through milestone escrows, transparent platform fees, and real-time tax insights.
        </p>

        {/* CTA Buttons with 3D Bevel Elevation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={onExplore} className="btn-primary" style={{ fontSize: '15px', padding: '14px 34px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>Browse Marketplace</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>→</span>
          </button>
          <button onClick={onJoin} className="btn-secondary" style={{ fontSize: '15px', padding: '14px 34px' }}>
            Post a Service / Join H²⁺
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroLanding;