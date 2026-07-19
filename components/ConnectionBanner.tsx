'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Fulfills Part 1 §6: AnimatePresence for entry/exit, prefers-reduced-motion fallback handled in CSS
export function ConnectionBanner() {
  const [isOffline, setIsOffline] = useState(false);

  // Stubbing the offline state toggling
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            background: 'var(--status-error)',
            color: 'white',
            padding: 'var(--space-2)',
            textAlign: 'center',
            fontSize: '0.875rem',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50
          }}
        >
          You are offline. Trying to reconnect...
        </motion.div>
      )}
    </AnimatePresence>
  );
}
