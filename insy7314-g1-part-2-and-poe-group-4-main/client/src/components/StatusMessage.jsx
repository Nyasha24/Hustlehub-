import React from 'react';

function StatusMessage({ message, type = 'info' }) {
  if (!message) {
    return null;
  }

  const isError = type === 'error';
  const style = {
    padding: '12px 16px',
    borderRadius: '10px',
    margin: '12px 0',
    backgroundColor: isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
    color: isError ? '#fca5a5' : '#a7f3d0',
    border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.35)' : 'rgba(45, 212, 191, 0.35)'}`,
    fontSize: '13px',
    lineHeight: '1.5'
  };

  return <div style={style}>{message}</div>;
}

export default StatusMessage;