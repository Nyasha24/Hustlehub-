import React from 'react';

function Footer() {
  return (
    <footer style={{
      width: '100%',
      borderTop: 'none',
      background: 'linear-gradient(180deg, transparent 0%, rgba(6, 10, 11, 0.75) 30%, rgba(6, 10, 11, 0.95) 100%)',
      padding: '16px 24px',
      marginTop: '40px',
      color: '#94a3b8',
      fontSize: '13px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        textAlign: 'center'
      }}>
        {/* Centered Brand with H in gray, 2 in light teal, + in light mint */}
        <span style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'Newsreader, serif', lineHeight: 1 }}>
          <span style={{ color: '#94a3b8' }}>H</span>
          <sup style={{ color: '#99f6e4', fontSize: '11px', top: '-0.35em' }}>2</sup>
          <sup style={{ color: '#a7f3d0', fontSize: '11px', top: '-0.35em' }}>+</sup>
        </span>
        <span style={{ color: '#cbd5e1', fontWeight: '500', fontSize: '12px', letterSpacing: '0.2px' }}>
          © {new Date().getFullYear()} HustleHub+. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
