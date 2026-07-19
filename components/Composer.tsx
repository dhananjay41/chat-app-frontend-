'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDraftInput } from '../hooks/useDraftInput';
import { ErrorModal } from './ErrorModal';

import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Props {
  conversationId: string;
  onSend: (text: string, files: File[]) => void;
}

export function Composer({ conversationId, onSend }: Props) {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { draft, setDraft, clearDraft, isReady } = useDraftInput(conversationId, userId || '');
  const [selectedFiles, setSelectedFiles] = useState<{file: File, previewUrl: string | null}[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: File[] = [];
    acceptedFiles.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const sizeMB = file.size / (1024 * 1024);
      
      if (isImage && sizeMB > 5) {
        setError(`Image "${file.name}" is too large. Maximum size is 5 MB.`);
        return;
      }
      if (isVideo && sizeMB > 20) {
        setError(`Video "${file.name}" is too large. Maximum size is 20 MB.`);
        return;
      }
      validFiles.push(file);
    });

    const mappedFiles = validFiles.map(file => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setSelectedFiles(prev => [...prev, ...mappedFiles]);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].previewUrl) {
        URL.revokeObjectURL(newFiles[index].previewUrl!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov']
    },
    noClick: true, 
    noKeyboard: true 
  });

  const handleSend = () => {
    if (draft.trim() || selectedFiles.length > 0) {
      const filesOnly = selectedFiles.map(s => s.file);
      onSend(draft, filesOnly);
      clearDraft();
      selectedFiles.forEach(s => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
      setSelectedFiles([]);
    }
  };

  return (
    <div {...getRootProps()} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <input {...getInputProps()} />
      
      {/* Drag overlay */}
      {isDragActive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 229, 255, 0.1)',
          backdropFilter: 'blur(2px)',
          border: '2px dashed var(--accent-primary)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          fontWeight: 600
        }}>
          Drop files to attach
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div style={{
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--bg-surface)',
          display: 'flex',
          gap: 'var(--space-2)',
          overflowX: 'auto',
          borderTop: '1px solid var(--border-color)',
        }}>
          {selectedFiles.map(({ file, previewUrl }, i) => {
            const isImage = !!previewUrl;
            return (
              <div key={i} style={{ position: 'relative', width: 60, height: 60, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden', background: 'var(--bg-main)' }}>
                {isImage ? (
                  <img src={previewUrl!} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', padding: '4px', textAlign: 'center', wordBreak: 'break-all' }}>
                    {file.name}
                  </div>
                )}
                <button
                  onClick={() => removeFile(i)}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--bg-surface)',
        borderTop: selectedFiles.length === 0 ? '1px solid var(--border-color)' : 'none',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--space-3)'
      }}>
        <button 
          type="button"
          onClick={() => {
            // Trigger file dialog
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime';
            input.multiple = true;
            input.onchange = (e) => {
              if (e.target && (e.target as HTMLInputElement).files) {
                onDrop(Array.from((e.target as HTMLInputElement).files!));
              }
            };
            input.click();
          }}
          style={{
            background: 'var(--bg-surface-hover)',
            border: 'none',
            color: 'var(--text-secondary)',
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          📎
        </button>
        
        <textarea 
          disabled={!isReady}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={isReady ? "Type a message..." : "Loading..."}
          style={{
            flex: 1,
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            minHeight: '44px',
            maxHeight: '120px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        
        <button
          onClick={handleSend}
          disabled={(!draft.trim() && selectedFiles.length === 0) || !isReady}
          style={{
            background: (draft.trim() || selectedFiles.length > 0) ? 'var(--accent-primary)' : 'var(--bg-surface-hover)',
            color: (draft.trim() || selectedFiles.length > 0) ? 'var(--bg-main)' : 'var(--text-tertiary)',
            border: 'none',
            padding: '0 var(--space-4)',
            height: 44,
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            cursor: (draft.trim() || selectedFiles.length > 0) ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s'
          }}
        >
          Send
        </button>
      </div>
      <ErrorModal isOpen={!!error} message={error || ''} onClose={() => setError(null)} />
    </div>
  );
}
