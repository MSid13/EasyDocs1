import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DocList({ user, setSelectedDoc }) {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:4000/api/docs?user_id=${user.user_id}`)
      .then(res => setDocs(res.data));
  }, [user]);

  const createDoc = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:4000/api/docs', { title, user_id: user.user_id });
    setDocs([...docs, res.data]);
    setTitle('');
  };

  const handleDelete = async (doc) => {
    setDeleteMsg('');
    try {
      await axios.delete(`http://localhost:4000/api/docs/${doc.id}?user_id=${user.user_id}`);
      setDocs(docs.filter(d => d.id !== doc.id));
      setDeleteMsg('Document deleted!');
    } catch (err) {
      setDeleteMsg(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="card">
      <h2>Your Documents</h2>
      <form onSubmit={createDoc} style={{ marginBottom: 20 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New doc title" required style={{ width: '70%' }} />
        <button type="submit">Create</button>
      </form>
      {deleteMsg && <div style={{ color: deleteMsg === 'Document deleted!' ? 'green' : 'red', marginTop: 10 }}>{deleteMsg}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {docs.map(doc => (
          <li key={doc.id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
            <button onClick={() => setSelectedDoc(doc)} style={{ flex: 1, textAlign: 'left', background: 'none', color: '#2563eb', border: 'none', fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>{doc.title} ({doc.role})</button>
            {(doc.role === 'owner' || doc.role === 'editor') && (
              <button style={{ marginLeft: 10, background: '#f87171', color: '#fff' }} onClick={() => handleDelete(doc)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
