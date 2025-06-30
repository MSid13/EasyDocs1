import React, { useState } from 'react';
import './quickstart-link.css';
import axios from 'axios';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signup') {
        const res = await axios.post('http://localhost:4000/api/signup', { username, password });
        setUser({ username: res.data.username, user_id: res.data.user_id });
      } else {
        const res = await axios.post('http://localhost:4000/api/login', { username, password });
        setUser({ username: res.data.username, user_id: res.data.user_id });
      }
    } catch (err) {
      setError(err.response?.data?.error || (mode === 'signup' ? 'Sign up failed' : 'Login failed'));
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, width: '100%' }}>
      <form onSubmit={handleSubmit} autoComplete="off">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{mode === 'signup' ? 'Sign Up' : 'Login'}</h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required autoComplete="username" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
        </div>
        <button type="submit">{mode === 'signup' ? 'Sign Up' : 'Login'}</button>
        <button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }} style={{ marginTop: 10, background: '#e0e7ef', color: '#222' }}>
          {mode === 'signup' ? 'Switch to Login' : 'Sign Up'}
        </button>
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <a
            href="/quickstart.html"
            target="_blank"
            rel="noopener noreferrer"
            className="quickstart-link"
            style={{
              color: '#2563eb',
              fontWeight: 500,
              textDecoration: 'none',
              fontSize: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            Quickstart Guide <span style={{ fontSize: 18, marginLeft: 2 }}>→</span>
            <span className="quickstart-underline" style={{
              position: 'absolute',
              left: 0,
              bottom: -2,
              width: '100%',
              height: 2,
              background: '#2563eb',
              borderRadius: 2,
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.45s cubic-bezier(.4,0,.2,1)',
              pointerEvents: 'none',
              zIndex: 1
            }}></span>
          </a>
        </div>

        {error && <div style={{ color: 'red', marginTop: 12, textAlign: 'center' }}>{error}</div>}
      </form>
    </div>
  );
}

