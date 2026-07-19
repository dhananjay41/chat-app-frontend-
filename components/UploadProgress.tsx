'use client';
import { motion, AnimatePresence } from 'framer-motion';

export interface UploadItem {
  id: string;
  name: string;
  progress: number;
}

export function UploadProgress({ uploads }: { uploads: UploadItem[] }) {
  return (
    <AnimatePresence>
      {uploads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            overflow: 'hidden'
          }}
        >
          {uploads.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: '0.75rem', width: 100 }} className="truncate">
                {item.name}
              </span>
              <div style={{ flex: 1, height: 4, background: 'var(--bg-main)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  style={{ height: '100%', background: 'var(--accent-primary)' }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', width: 30, textAlign: 'right' }}>
                {Math.round(item.progress)}%
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
