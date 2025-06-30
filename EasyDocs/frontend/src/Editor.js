import React, { useState, useEffect, useRef } from 'react';
import YjsQuillEditor from './YjsQuillEditor';
import axios from 'axios';

export default function Editor({ user, doc, goBack }) {
  const [autosave, setAutosave] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [role, setRole] = useState(doc.role);
  const [shareUser, setShareUser] = useState('');
  const [shareRole, setShareRole] = useState('viewer');
  const [shareMsg, setShareMsg] = useState('');
  const [loadError, setLoadError] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [removeMsg, setRemoveMsg] = useState('');
  const editorDivRef = useRef();
  const yjsEditorRef = useRef();

  // Fetch doc and collaborators
  useEffect(() => {
    axios.get(`http://localhost:4000/api/docs/${doc.id}?user_id=${user.user_id}`)
      .then(res => {
        setRole(res.data.role);
        setLoadError('');
      })
      .catch(err => {
        setLoadError(err.response?.data?.error || 'Failed to load document');
      });
    // Fetch collaborators
    axios.get(`http://localhost:4000/api/docs/${doc.id}/collaborators?user_id=${user.user_id}`)
      .then(res => setCollaborators(res.data))
      .catch(() => setCollaborators([]));
  }, [doc.id, user.user_id]);

  const handleShare = async (e) => {
    e.preventDefault();
    setShareMsg('');
    try {
      await axios.post(`http://localhost:4000/api/docs/${doc.id}/share`, {
        username: shareUser,
        role: shareRole,
        user_id: user.user_id
      });
      setShareMsg('Shared!');
      setShareUser('');
      // Refresh collaborators
      const res = await axios.get(`http://localhost:4000/api/docs/${doc.id}/collaborators?user_id=${user.user_id}`);
      setCollaborators(res.data);
    } catch (err) {
      setShareMsg(err.response?.data?.error || 'Share failed');
    }
  };

  const handleRemove = async (username) => {
    setRemoveMsg('');
    try {
      await axios.post(`http://localhost:4000/api/docs/${doc.id}/remove`, {
        username,
        user_id: user.user_id
      });
      setRemoveMsg('Removed!');
      // Refresh collaborators
      const res = await axios.get(`http://localhost:4000/api/docs/${doc.id}/collaborators?user_id=${user.user_id}`);
      setCollaborators(res.data);
    } catch (err) {
      setRemoveMsg(err.response?.data?.error || 'Remove failed');
    }
  };

  // Print handler
  const handlePrint = () => {
    // Find the .ql-editor div inside the editor card
    const editorCard = editorDivRef.current;
    if (!editorCard) return;
    const qlEditor = editorCard.querySelector('.ql-editor');
    if (!qlEditor) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Print Document</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://cdn.quilljs.com/1.3.6/quill.snow.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h2>${doc.title}</h2>`);
    printWindow.document.write(qlEditor.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="card" ref={editorDivRef}>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={goBack} style={{ background: '#e0e7ef', color: '#222', marginRight: 10, padding: '4px 10px', fontSize: 14, borderRadius: 6, border: 'none', fontWeight: 500, cursor: 'pointer', minWidth: 60, maxWidth: 90 }}>Back</button>
          <h2 style={{ flex: 1 }}>{doc.title} <span style={{ fontWeight: 400, fontSize: 18, color: '#888' }}>({role})</span></h2>
          <button onClick={handlePrint} style={{ background: '#10b981', color: '#fff', marginLeft: 10, padding: '4px 10px', fontSize: 14, borderRadius: 6, border: 'none', fontWeight: 500, cursor: 'pointer', minWidth: 60, maxWidth: 90 }}>Print</button>
          {role !== 'viewer' && (
            <label style={{ marginLeft: 16, display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={autosave}
                onChange={e => setAutosave(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Autosave
            </label>
          )}
        </div>
      </div>
      {loadError && <div style={{ color: 'red', marginBottom: 10 }}>{loadError}</div>}
      <YjsQuillEditor
        ref={yjsEditorRef}
        docId={doc.id}
        readOnly={role === 'viewer'}
        userId={user.user_id}
        initialContent={doc.content}
      />
      {role !== 'viewer' && (
        <>
          <button
            style={{ background: '#2563eb', color: '#fff', marginTop: 12, marginBottom: 12, padding: '8px 20px', borderRadius: 6, fontWeight: 600 }}
            onClick={async () => {
              const quill = yjsEditorRef.current?.getQuill();
              if (!quill) return alert('Editor not loaded');
              const content = JSON.stringify(quill.getContents());
              await fetch(`http://localhost:4000/api/docs/${doc.id}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: user.user_id,
                  content
                })
              });
              alert('Document saved!');
            }}
          >Save</button>
          {autosave && lastSaved && (
            <div style={{ color: '#10b981', fontSize: 13, marginBottom: 8, textAlign: 'right' }}>
              Autosaved at {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </>
      )}
      <div style={{ marginTop: 24 }}>
        <h4>Collaborators</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {collaborators.map(c => (
            <li key={c.username} style={{ marginBottom: 6 }}>
              {c.username} <span style={{ color: '#888', fontSize: 14 }}>({c.role})</span>
              {role === 'owner' && c.username !== user.username && (
                <button style={{ marginLeft: 10, background: '#f87171', color: '#fff', padding: '3px 10px', fontSize: 13, borderRadius: 5, border: 'none', fontWeight: 500, cursor: 'pointer', minWidth: 50, maxWidth: 80 }} onClick={() => handleRemove(c.username)}>Remove</button>
              )}
              {/* Editors and viewers can leave */}
              {role !== 'owner' && c.username === user.username && (
                <button style={{ marginLeft: 10, background: '#f87171', color: '#fff', padding: '3px 10px', fontSize: 13, borderRadius: 5, border: 'none', fontWeight: 500, cursor: 'pointer', minWidth: 50, maxWidth: 80 }} onClick={() => handleRemove(user.username)}>Leave</button>
              )}
            </li>
          ))}
        </ul>
        {removeMsg && <div style={{ color: removeMsg === 'Removed!' ? 'green' : 'red' }}>{removeMsg}</div>}
      </div>
      {role === 'owner' ? (
        <form onSubmit={handleShare} style={{ marginTop: 24 }}>
          <h4>Share with user</h4>
          <input value={shareUser} onChange={e => setShareUser(e.target.value)} placeholder="Username" required style={{ width: 180 }} />
          <select value={shareRole} onChange={e => setShareRole(e.target.value)}>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="submit">Share</button>
          {shareMsg && <span style={{ marginLeft: 10, color: shareMsg === 'Shared!' ? 'green' : 'red' }}>{shareMsg}</span>}
        </form>
      ) : null}
    </div>
  );
}
