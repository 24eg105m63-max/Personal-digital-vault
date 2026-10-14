import { useEffect, useRef, useState } from 'react';
import api, { errorMessage } from '../services/api';
import FileCard from '../components/FileCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';

const accepted = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx';
const maxBytes = 20 * 1024 * 1024;

export default function Files() {
  const input = useRef(null);
  const previewUrl = useRef(null);
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [renameItem, setRenameItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [preview, setPreview] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => { load(); return () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }; }, []);
  async function load(search = '') {
    setLoading(true); setError('');
    try { const { data } = await api.get('/files', { params: search ? { q: search } : {} }); setFiles(data); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }
  const search = (event) => { event.preventDefault(); load(query.trim()); };
  const selectUpload = () => input.current?.click();

  const upload = async (file) => {
    if (!file) return;
    if (file.size > maxBytes) { setError('Files must be 20 MB or smaller.'); return; }
    if (!accepted.split(',').some((extension) => file.name.toLowerCase().endsWith(extension))) { setError('Choose a PDF, Office document, text file, JPEG, or PNG.'); return; }
    const body = new FormData(); body.append('file', file); setBusy(true); setError(''); setNotice('');
    try { await api.post('/files/upload', body); setNotice('File uploaded successfully.'); await load(query.trim()); }
    catch (err) { setError(errorMessage(err, 'Upload failed.')); }
    finally { setBusy(false); }
  };
  const onFileInput = (event) => { const file = event.target.files?.[0]; event.target.value = ''; upload(file); };
  const download = async (file) => {
    try { const { data } = await api.get(`/files/${file.id}/download`, { responseType: 'blob' }); const url = URL.createObjectURL(data); const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.originalFileName; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch (err) { setError(errorMessage(err, 'Download failed.')); }
  };
  const openPreview = async (file) => {
    setError('');
    try {
      const { data } = await api.get(`/files/${file.id}/preview`, { responseType: 'blob' });
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = URL.createObjectURL(data);
      setPreview({ id: file.id, url: previewUrl.current, name: file.originalFileName, type: file.contentType });
    } catch (err) { setError(errorMessage(err, 'Preview could not be loaded.')); }
  };
  const closePreview = () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); previewUrl.current = null; setPreview(null); };
  const remove = (id) => setPendingDelete(files.find((file) => file.id === id) || null);
  const confirmRemove = async () => {
    if (!pendingDelete) return;
    setBusy(true); setError('');
    try { await api.delete(`/files/${pendingDelete.id}`); setFiles((items) => items.filter((file) => file.id !== pendingDelete.id)); setNotice('File deleted.'); setPendingDelete(null); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  };
  const openRename = (file) => { setRenameItem(file); setNewName(file.originalFileName); };
  const rename = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const { data } = await api.put(`/files/${renameItem.id}`, { name: newName }); setFiles((items) => items.map((file) => file.id === data.id ? data : file)); setRenameItem(null); setNotice('File renamed.'); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  };
  const drop = (event) => { event.preventDefault(); setDragging(false); upload(event.dataTransfer.files?.[0]); };

  return <div>
    <div className="page-heading"><div><p className="eyebrow">YOUR PRIVATE LIBRARY</p><h1>My files</h1><p className="muted">Your documents stay private to your account.</p></div><button className="primary-button" onClick={selectUpload} disabled={busy}>↑ Upload file</button><input ref={input} type="file" hidden onChange={onFileInput} accept={accepted} /></div>
    <ErrorMessage message={error} onDismiss={() => setError('')} />
    {notice && <div className="notice notice-success" role="status">{notice}<button className="notice-close" onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    <div className={`upload-strip ${dragging ? 'drag-active' : ''}`} role="button" tabIndex="0" onClick={selectUpload} onKeyDown={(event) => event.key === 'Enter' && selectUpload()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}><div className="upload-symbol">↑</div><div><strong>{busy ? 'Saving your file...' : 'Drop a file here or browse'}</strong><span>PDF, DOC, DOCX, TXT, JPG, PNG, XLS, XLSX · maximum 20 MB</span></div><span className="subtle-link">Choose file</span></div>
    <form className="search-bar" onSubmit={search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your files..." aria-label="Search files" /><button className="secondary-button">Search</button></form>
    {loading ? <Loading label="Loading files..." /> : files.length ? <div className="items-list">{files.map((file) => <FileCard key={file.id} file={file} onPreview={openPreview} onRename={openRename} onDownload={download} onDelete={remove} />)}</div> : <div className="empty-state"><span>▧</span><h3>{query ? 'No files found' : 'No files yet'}</h3><p>{query ? 'Try another search.' : 'Upload your first document to get started.'}</p>{!query && <button className="primary-button" onClick={selectUpload}>Upload a file</button>}</div>}
    {renameItem && <div className="modal-backdrop"><form className="modal" onSubmit={rename}><div className="modal-header"><div><p className="eyebrow">FILE DETAILS</p><h2>Rename file</h2></div><button type="button" className="close-button" onClick={() => setRenameItem(null)} aria-label="Close">×</button></div><label>File name<input autoFocus required maxLength="255" value={newName} onChange={(event) => setNewName(event.target.value)} /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setRenameItem(null)}>Cancel</button><button className="primary-button" disabled={busy}>Save name</button></div></form></div>}
    {preview && <div className="modal-backdrop preview-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closePreview()}><section className="preview-modal" role="dialog" aria-modal="true" aria-label={`Preview ${preview.name}`}><header><strong>{preview.name}</strong><div><button className="icon-button" onClick={() => download({ id: preview.id, originalFileName: preview.name })} title="Download">↓</button><button className="close-button" onClick={closePreview} aria-label="Close preview">×</button></div></header>{preview.type?.startsWith('image/') ? <img src={preview.url} alt={preview.name} /> : ['application/pdf', 'text/plain'].includes(preview.type) ? <iframe title={`Preview of ${preview.name}`} src={preview.url} sandbox="allow-same-origin" /> : <div className="preview-unavailable"><span>▧</span><strong>Preview is unavailable for this document.</strong><p>Download the file to open it in a compatible app.</p><button className="primary-button" onClick={() => download({ id: preview.id, originalFileName: preview.name })}>Download file</button></div>}</section></div>}
    <ConfirmDialog open={!!pendingDelete} title="Delete this file?" message={`“${pendingDelete?.originalFileName || ''}” will be permanently removed from your vault.`} confirmLabel="Delete file" busy={busy} onCancel={() => setPendingDelete(null)} onConfirm={confirmRemove} />
  </div>;
}
