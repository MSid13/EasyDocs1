import React, { useState, useEffect } from 'react';
import Login from './Login';
import DocList from './DocList';
import Editor from './Editor';
import AdminPanel from './AdminPanel';
import Alert from './Alert';
import axios from 'axios';
import Settings from './Settings';

function App() {
  const [user, setUser] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.body.style.background = theme === 'dark' ? '#18181b' : '#f8fafc';
    document.body.style.color = theme === 'dark' ? '#f3f4f6' : '#222';
  }, [theme]);

  // Fetch alerts for user
  useEffect(() => {
    if (user && user.user_id) {
      axios.get(`http://localhost:4000/api/user/alerts?user_id=${user.user_id}`)
        .then(res => {
          if (res.data && res.data.length > 0) setAlert(res.data[0]);
          else setAlert(null);
        });
    }
  }, [user]);

  const dismissAlert = async () => {
    if (alert && user) {
      await axios.post('http://localhost:4000/api/user/alerts/dismiss', { alert_id: alert.id, user_id: user.user_id });
      setAlert(null);
    }
  };

  if (!user) return <Login setUser={setUser} />;

  return (
    <div>
      <div style={{ position: 'fixed', top: 0, left: 0, background: theme === 'dark' ? '#222' : '#f8fafc', color: theme === 'dark' ? '#f3f4f6' : '#222', padding: '10px 20px', width: '100%', zIndex: 1000, borderBottom: '1px solid #e5e7eb', fontWeight: 500, fontSize: 18, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Welcome, <b>{user.username}</b></span>
        <button onClick={() => setShowSettings(true)} style={{ background: theme === 'dark' ? '#333' : '#e0e7ef', color: theme === 'dark' ? '#f3f4f6' : '#222', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 14, fontWeight: 500, cursor: 'pointer', minWidth: 60, maxWidth: 90 }}>Settings</button>
      </div>
      <div style={{ marginTop: 60 }}>
        {user.username === 'admin' ? (
          <AdminPanel user={user} />
        ) : !selectedDoc ? (
          <DocList user={user} setSelectedDoc={setSelectedDoc} />
        ) : (
          <Editor user={user} doc={selectedDoc} goBack={() => setSelectedDoc(null)} />
        )}
      </div>
      {alert && <Alert message={alert.message} onClose={dismissAlert} />}
      {showSettings && <Settings user={user} onClose={() => setShowSettings(false)} onThemeChange={setTheme} theme={theme} />}
    </div>
  );
}

export default App;
