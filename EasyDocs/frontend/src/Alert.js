import React from 'react';

export default function Alert({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 30,
      right: 30,
      background: 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)',
      color: '#222',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      padding: '20px 32px',
      zIndex: 2000,
      minWidth: 260,
      fontWeight: 500,
      fontSize: 18,
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{
        background: 'none',
        border: 'none',
        color: '#222',
        fontWeight: 700,
        fontSize: 22,
        marginLeft: 16,
        cursor: 'pointer',
        lineHeight: 1
      }}>&times;</button>
    </div>
  );
}
