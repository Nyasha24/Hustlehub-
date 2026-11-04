import React from 'react';

function DynamicIslandNavbar({ activeTab, setActiveTab, user, onOpenAuth, onLogout }) {
  const getRoleTagStyle = (role) => {
    switch (role) {
      case 'client':
        return {
          background: 'rgba(59, 130, 246, 0.16)',
          color: '#93c5fd',
          border: '1px solid rgba(59, 130, 246, 0.4)'
        };
      case 'freelancer':
        return {
          background: 'rgba(226, 217, 204, 0.12)',
          color: '#e2d9cc',
          border: '1px solid rgba(226, 217, 204, 0.35)'
        };
      case 'admin':
        return {
          background: 'rgba(245, 158, 11, 0.16)',
          color: '#fcd34d',
          border: '1px solid rgba(245, 158, 11, 0.4)'
        };
      default:
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          color: '#cbd5e1',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        };
    }
  };

  const handleBrandClick = () => {
    if (!user) {
      setActiveTab('home');
    } else if (user.role === 'freelancer') {
      setActiveTab('freelancer-hub');
    } else if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('marketplace');
    }
  };

  return (
    <nav className="dynamic-island">
      <div 
        onClick={handleBrandClick}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', paddingRight: '10px', borderRight: '1px solid rgba(255, 255, 255, 0.12)' }}
        title="HustleHub+"
      >
        <span style={{ fontSize: '21px', fontWeight: '900', fontFamily: 'Newsreader, serif', lineHeight: 1 }}>
          <span style={{ color: '#94a3b8' }}>H</span>
          <sup style={{ color: '#99f6e4', fontSize: '13px', top: '-0.35em' }}>2</sup>
          <sup style={{ color: '#a7f3d0', fontSize: '13px', top: '-0.35em' }}>+</sup>
        </span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', letterSpacing: '0.4px' }}>HustleHub+</span>
      </div>

      {/* Only show 'Home' marketing tab for unauthenticated guests */}
      {!user && (
        <button
          className={`island-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home
        </button>
      )}

      {/* Explore tab: Only for unauthenticated guests and clients */}
      {(!user || user.role === 'client') && (
        <button
          className={`island-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          Explore
        </button>
      )}

      {/* Client: My Orders */}
      {user && user.role === 'client' && (
        <button
          className={`island-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          My Orders
        </button>
      )}

      {/* Freelancer: Hub and Jobs */}
      {user && user.role === 'freelancer' && (
        <>
          <button
            className={`island-tab ${activeTab === 'freelancer-hub' ? 'active' : ''}`}
            onClick={() => setActiveTab('freelancer-hub')}
          >
            Freelancer Hub
          </button>
          <button
            className={`island-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Jobs
          </button>
        </>
      )}

      {/* Admin: Dedicated Admin Center Only */}
      {user && user.role === 'admin' && (
        <button
          className={`island-tab ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          Admin Center
        </button>
      )}

      <div style={{ marginLeft: '6px', paddingLeft: '8px', borderLeft: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {user ? (
          <>
            <span style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '8px',
              ...getRoleTagStyle(user.role)
            }}>
              {user.role}
            </span>
            <button
              onClick={onLogout}
              title="Sign out of your session"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.35)';
              }}
            >
              <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{ padding: '6px 16px', fontSize: '12px' }}
          >
            Sign In / Join
          </button>
        )}
      </div>
    </nav>
  );
}

export default DynamicIslandNavbar;