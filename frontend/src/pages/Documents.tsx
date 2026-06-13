import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File, Trash2, Search, Filter, History, CheckCircle2, Eye, X } from 'lucide-react';
import { socket } from '../lib/socket';
import { toast } from 'sonner';

export const Documents = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [versionHistoryDoc, setVersionHistoryDoc] = useState<any | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();

    const handleDocStatus = (data: any) => {
      setDocuments(prev => {
        const exists = prev.find(d => d.id === data.id);
        if (exists) {
          return prev.map(d => d.id === data.id ? { ...d, status: data.status, step: data.step } : d);
        } else {
          fetchDocuments(); // Refresh if new doc
          return prev;
        }
      });

      if (data.status === 'READY') {
        toast.success(`Document processed successfully!`);
        setIsUploading(false);
      } else if (data.status === 'FAILED') {
        toast.error(`Document processing failed.`);
        setIsUploading(false);
      } else {
        toast.info(`Processing: ${data.step}`);
      }
    };

    socket.on('document-status', handleDocStatus);
    return () => {
      socket.off('document-status', handleDocStatus);
    };
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:3000/documents');
      setDocuments(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    await fetch(`http://localhost:3000/documents/${id}`, { method: 'DELETE' });
    fetchDocuments();
  };

  const loadVersionHistory = async (doc: any) => {
    setVersionHistoryDoc(doc);
    try {
      const res = await fetch(`http://localhost:3000/documents/${doc.id}/versions`);
      setVersions(await res.json());
    } catch (e) {
      console.error(e);
      toast.error('Failed to load version history');
    }
  };

  const handleViewDocument = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/documents/${id}`);
      if (!res.ok) throw new Error('Failed to fetch document');
      const data = await res.json();
      setViewingDoc(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load document content');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    // Hardcoded ownerId for MVP until auth context is fully ready
    formData.append('ownerId', '1'); 

    try {
      const res = await fetch('http://localhost:3000/documents/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        setIsUploading(false);
        throw new Error(`Status ${res.status}: ${text}`);
      }
      toast.info('File uploaded. Processing started...');
      fetchDocuments();
    } catch (e) {
      console.error('Upload failed', e);
      setIsUploading(false);
      toast.error('Upload failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScope = scopeFilter === 'ALL' || doc.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto relative">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
        <p className="text-muted-foreground mt-2">
          Upload and manage knowledge base documents, URLs, and plain text.
        </p>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/10
          ${isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-white/10 bg-card/40 hover:bg-card/60'}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept=".pdf,.docx,.txt,.md"
        />
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            <p className="font-bold ai-gradient-text animate-pulse">Processing Document...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full ai-gradient-bg flex items-center justify-center text-white mb-4 pointer-events-none shadow-lg ring-4 ring-white/10 group-hover:scale-110 transition-transform duration-500">
              <UploadCloud size={36} />
            </div>
            <h3 className="text-xl font-bold pointer-events-none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Drop files here to upload</h3>
            <p className="text-sm text-muted-foreground mt-2 pointer-events-none font-medium">PDF, DOCX, TXT, or Markdown (Max 10MB)</p>
          </>
        )}
      </div>

      {/* Documents Table Area */}
      <div className="glass-panel border-white/5 rounded-3xl shadow-xl overflow-hidden backdrop-blur-2xl">
        {/* Toolbar */}
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-background/30">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-muted-foreground" />
            <select 
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="bg-background border rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="ALL">All Scopes</option>
              <option value="PERSONAL">Personal</option>
              <option value="TEAM">Team</option>
              <option value="ORGANIZATION">Organization</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Document Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Scope</th>
                <th className="px-6 py-4 font-medium">Date Uploaded</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading documents...</td></tr>
              ) : filteredDocuments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No documents found.</td></tr>
              ) : filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-bold flex items-center group-hover:text-primary transition-colors">
                    <div className="p-2 ai-gradient-bg rounded-lg text-white mr-4 shadow-md group-hover:scale-110 transition-transform">
                      <File size={16} />
                    </div>
                    {doc.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      doc.status === 'READY' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {doc.status === 'READY' ? <><CheckCircle2 size={12} className="inline mr-1" /> READY</> : doc.step || doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-muted-foreground border border-white/10 bg-background/50 px-2 py-1 rounded-md">
                      {doc.scope}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewDocument(doc.id)} 
                        className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors" 
                        title="View Document"
                      >
                        <Eye size={16} />
                      </button>
                      <button onClick={() => loadVersionHistory(doc)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors" title="Version History">
                        <History size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Version History Modal */}
      {versionHistoryDoc && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border shadow-lg rounded-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Version History: {versionHistoryDoc.title}</h3>
              <button onClick={() => setVersionHistoryDoc(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {versions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No previous versions found.</p>
              ) : (
                versions.map(v => (
                  <div key={v.id} className="p-4 border rounded-lg flex justify-between items-center bg-muted/10">
                    <div>
                      <p className="font-medium">Version {v.versionNum}</p>
                      <p className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</p>
                    </div>
                    <button className="px-3 py-1 text-xs font-medium border rounded bg-background hover:bg-accent transition-colors">
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* View Document Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border shadow-xl rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b shrink-0 bg-muted/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <File size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingDoc.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                    <span className="capitalize">{viewingDoc.sourceType?.toLowerCase().replace('_', ' ')}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(viewingDoc.createdAt).toLocaleString()}</span>
                    <span className="mx-2">•</span>
                    <span className="uppercase text-xs font-bold border px-1.5 py-0.5 rounded">{viewingDoc.scope}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingDoc(null)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-background/50">
              {viewingDoc.content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 bg-muted/10 border rounded-lg">
                  {viewingDoc.content}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <File size={48} className="mb-4 opacity-20" />
                  <p>No content available for this document.</p>
                  <p className="text-sm mt-2">Status: {viewingDoc.status}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
