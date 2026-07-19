'use client';
import { motion } from 'framer-motion';

export function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -4 },
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        staggerChildren: 0.15
      }
    },
    exit: { opacity: 0, scale: 0.9 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: 'var(--space-2) var(--space-4)',
        background: 'var(--bg-surface-hover)',
        borderRadius: 'var(--radius-full)',
        width: 'fit-content',
        marginBottom: 'var(--space-4)'
      }}
    >
      <motion.span 
        variants={dotVariants}
        transition={{ duration: 0.4, repeat: Infinity, repeatType: 'reverse' }}
        style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%' }} 
      />
      <motion.span 
        variants={dotVariants}
        transition={{ duration: 0.4, repeat: Infinity, repeatType: 'reverse' }}
        style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%' }} 
      />
      <motion.span 
        variants={dotVariants}
        transition={{ duration: 0.4, repeat: Infinity, repeatType: 'reverse' }}
        style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%' }} 
      />
    </motion.div>
  );
}
