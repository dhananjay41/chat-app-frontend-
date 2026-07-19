'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { uploadFile } from '../features/uploads/uploadThunks';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorModal } from './ErrorModal';

export default function DropzoneArea({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const uploads = useSelector((state: RootState) => state.uploads);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
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

      // Use timestamp + random for unique ID
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Dispatch upload thunk
      dispatch(uploadFile({ id: uploadId, file }));
    });
  }, [dispatch]);

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
    noClick: true, // We want the dropzone to wrap the whole chat area but not intercept clicks
    noKeyboard: true,
  });

  const pendingUploads = Object.values(uploads).filter(u => u.status === 'uploading');

  return (
    <div {...getRootProps()} style={{ height: '100%', position: 'relative', outline: 'none' }}>
      <input {...getInputProps()} />
      {children}
      <AnimatePresence>
        {isDragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(91, 157, 217, 0.2)',
              border: '2px dashed #5b9dd9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            <h2 style={{ color: '#5b9dd9', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Drop files to upload...</h2>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 11, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <AnimatePresence>
          {pendingUploads.map(upload => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '10px', width: '200px'
              }}
            >
              <div style={{ fontSize: '0.8em', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Uploading...</span>
                <span>{upload.progress}%</span>
              </div>
              <div style={{ height: '4px', background: '#444', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${upload.progress}%` }}
                  style={{ height: '100%', background: '#5b9dd9' }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <ErrorModal isOpen={!!error} message={error || ''} onClose={() => setError(null)} />
    </div>
  );
}
