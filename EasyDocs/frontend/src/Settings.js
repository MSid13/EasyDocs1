import React, { useState } from 'react';
import axios from 'axios';

// Settings modal as a centered popup overlay
export default function Settings({ user, onClose, onThemeChange, theme }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      await axios.post('http://localhost:4000/api/change_password', {
        username: user.username,
        old_password: oldPassword,
        new_password: newPassword
      });
      setMsg('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password change failed');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      zIndex: 1500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s',
    }}>
      <div className="card settings-modal" style={{
        position: 'relative',
        maxWidth: 420,
        width: '100%',
        minHeight: 420,
        boxSizing: 'border-box',
        overflow: 'visible',
        background: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        borderRadius: 16,
        padding: 32,
        margin: 16,
        zIndex: 1600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#fff',
            border: '1.5px solid #e5e7eb',
            borderRadius: '50%',
            fontSize: 26,
            width: 40,
            height: 40,
            cursor: 'pointer',
            zIndex: 2000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: 0,
          }}
          aria-label="Close settings"
        >
          &times;
        </button>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Settings</h2>
        <form onSubmit={handlePasswordChange} autoComplete="off" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Current Password</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Current Password" required autoComplete="current-password" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required autoComplete="new-password" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required autoComplete="new-password" />
          </div>
          <button type="submit">Change Password</button>
          {msg && <div style={{ color: 'green', marginTop: 12, textAlign: 'center' }}>{msg}</div>}
          {error && <div style={{ color: 'red', marginTop: 12, textAlign: 'center' }}>{error}</div>}
        </form>
        <hr style={{ margin: '32px 0' }} />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ fontWeight: 500 }}>Theme: </span>
          <button onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')} style={{ marginLeft: 8, minWidth: 80, padding: '8px 12px', fontSize: 15 }}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
