import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebsocketProvider } from 'y-websocket';
import 'quill/dist/quill.snow.css';

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['clean']
];

import { forwardRef, useImperativeHandle } from 'react';

const YjsQuillEditor = forwardRef(function YjsQuillEditor({ docId, readOnly, userId, initialContent }, ref) {
  const editorRef = useRef();
  const ydocRef = useRef();
  const providerRef = useRef();
  const bindingRef = useRef();
  const quillRef = useRef();

  useImperativeHandle(ref, () => ({
    getQuill: () => quillRef.current
  }), []);

  useEffect(() => {
    // Remove any existing toolbar DOM nodes to prevent duplicates
    if (editorRef.current) {
      const toolbars = editorRef.current.parentNode?.querySelectorAll('.ql-toolbar');
      toolbars?.forEach(tb => tb.remove());
    }
    // Create Yjs doc and provider
    ydocRef.current = new Y.Doc();
    providerRef.current = new WebsocketProvider('ws://localhost:1234', `doc-${docId}`, ydocRef.current);
    const ytext = ydocRef.current.getText('quill');
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      readOnly,
      modules: { toolbar: toolbarOptions }
    });

    bindingRef.current = new QuillBinding(ytext, quillRef.current, providerRef.current.awareness);

    // Set initial content if provided and not already set
    if (initialContent) {
      try {
        const delta = JSON.parse(initialContent);
        // Only set if different from current
        if (JSON.stringify(quillRef.current.getContents()) !== JSON.stringify(delta)) {
          console.log('[YjsQuillEditor] Setting initial Quill Delta:', delta);
          quillRef.current.setContents(delta);
        }
      } catch (e) {
        console.log('[YjsQuillEditor] Setting initial HTML (fallback):', initialContent);
        quillRef.current.clipboard.dangerouslyPasteHTML(initialContent);
      }
    }

    // Debug: log Quill content on every change
    const logChange = () => {
      const contents = quillRef.current.getContents();
      console.log('[YjsQuillEditor] Current Quill Delta on change:', contents);
    };
    quillRef.current.on('text-change', logChange);

    return () => {
      providerRef.current.destroy();
      ydocRef.current.destroy();
      // Clean up toolbars on unmount
      if (editorRef.current) {
        const toolbars = editorRef.current.parentNode?.querySelectorAll('.ql-toolbar');
        toolbars?.forEach(tb => tb.remove());
      }
      if (quillRef.current) {
        quillRef.current.off('text-change', logChange);
      }
    };
  }, [docId, readOnly, userId]);

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      padding: 24,
      marginBottom: 24,
      maxWidth: 800,
      marginLeft: 'auto',
      marginRight: 'auto',
      minHeight: 350
    }}>
      <div ref={editorRef} style={{ height: 300 }} />
    </div>
  );
});

export default YjsQuillEditor;
