import React, { useState } from 'react';
import axios from 'axios';

export default function AdminPanel({ user }) {
  const [target, setTarget] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [msg, setMsg] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSendMsg, setAlertSendMsg] = useState('');
  // State for view docs feature
  const [viewUser, setViewUser] = useState('');
  const [docsResult, setDocsResult] = useState(null);
  const [docsMsg, setDocsMsg] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await axios.delete('http://localhost:4000/api/admin/delete_user', {
        params: {
          username: target,
          admin_user: user.username,
          admin_pass: adminPass
        }
      });
      setMsg('User deleted!');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleSendAlert = async (e) => {
    e.preventDefault();
    setAlertSendMsg('');
    try {
      await axios.post('http://localhost:4000/api/admin/send_alert', {
        username: target,
        message: alertMsg,
        admin_user: user.username,
        admin_pass: adminPass
      });
      setAlertSendMsg('Alert sent!');
    } catch (err) {
      setAlertSendMsg(err.response?.data?.error || 'Send failed');
    }
  };

  // Handler for viewing user docs
  const handleViewDocs = async (e) => {
    e.preventDefault();
    setDocsMsg('');
    setDocsResult(null);
    try {
      const res = await axios.post('http://localhost:4000/api/admin/view_user_docs', {
        username: viewUser,
        admin_user: user.username,
        admin_pass: adminPass
      });
      setDocsResult(res.data.docs);
      if (!res.data.docs || res.data.docs.length === 0) {
        setDocsMsg('No documents found for this user.');
      }
    } catch (err) {
      setDocsMsg(err.response?.data?.error || 'Lookup failed');
    }
  };

  return (
    <div className="card">
      <h2>Admin Panel</h2>
      <form onSubmit={handleDelete} style={{ marginBottom: 24 }}>
        <h4>Delete User</h4>
        <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Username to delete" required style={{ width: 180 }} />
        <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="Admin password" required style={{ width: 180 }} />
        <button type="submit">Delete User</button>
        {msg && <div style={{ color: msg === 'User deleted!' ? 'green' : 'red', marginTop: 10 }}>{msg}</div>}
      </form>
      <form onSubmit={handleSendAlert} style={{ marginBottom: 24 }}>
        <h4>Send Alert</h4>
        <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Username to alert" required style={{ width: 180 }} />
        <input value={alertMsg} onChange={e => setAlertMsg(e.target.value)} placeholder="Alert message" required style={{ width: 220 }} />
        <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="Admin password" required style={{ width: 180 }} />
        <button type="submit">Send Alert</button>
        {alertSendMsg && <div style={{ color: alertSendMsg === 'Alert sent!' ? 'green' : 'red', marginTop: 10 }}>{alertSendMsg}</div>}
      </form>
      {/* View User Docs Feature */}
      <form onSubmit={handleViewDocs} style={{ marginBottom: 24 }}>
        <h4>View User Docs</h4>
        <input value={viewUser} onChange={e => setViewUser(e.target.value)} placeholder="Username to view" required style={{ width: 180 }} />
        <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="Admin password" required style={{ width: 180 }} />
        <button type="submit">View Docs</button>
        {docsMsg && <div style={{ color: 'red', marginTop: 10 }}>{docsMsg}</div>}
        {docsResult && docsResult.length > 0 && (
          <div style={{ marginTop: 10, color: '#222', background: '#f3f4f6', borderRadius: 8, padding: 10 }}>
            <b>Documents:</b>
            <ul style={{ paddingLeft: 18 }}>
              {docsResult.map(doc => (
                <li key={doc.id} style={{ marginBottom: 12 }}>
                  <b>Title:</b> {doc.title}<br />
                  <b>Content:</b>
                  <div style={{ whiteSpace: 'pre-wrap', background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 8, marginTop: 4 }}>{doc.content}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}
