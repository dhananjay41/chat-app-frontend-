'use client';
import { motion } from 'framer-motion';
import { Message } from '../features/messages/messagesSlice';
import { useDraggable } from '@dnd-kit/core';
import { useDispatch } from 'react-redux';
import { setFallbackForwardMessage } from '../features/dragForward/dragForwardSlice';

export function MessageBubble({ message, isOwn, isOverlay = false }: { message: Message, isOwn?: boolean, isOverlay?: boolean }) {
  const dispatch = useDispatch();
  const isMine = isOwn;
  const hasBody = !!message.body?.trim();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: message._id || message.clientTempId || Math.random().toString(),
    data: { message }
  });

  return (
    <motion.div
      ref={setNodeRef}
      layoutId={message._id || message.clientTempId}
      initial={isOverlay ? undefined : { opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: 1 }}
      exit={isOverlay ? undefined : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMine ? 'flex-end' : 'flex-start',
        marginBottom: 'var(--space-4)',
        width: '100%',
        position: 'relative'
      }}
    >
      {(message as any).forwardedFrom && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
          Forwarded
        </div>
      )}

      <div
        {...listeners}
        {...attributes}

        style={{
          background: isMine ? 'var(--accent-secondary)' : 'var(--bg-surface-hover)',
          color: 'var(--text-primary)',
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          borderBottomRightRadius: isMine ? '2px' : 'var(--radius-lg)',
          borderBottomLeftRadius: !isMine ? '2px' : 'var(--radius-lg)',
          maxWidth: '75%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {message.attachments && message.attachments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: hasBody ? '8px' : '0' }}>
            {message.attachments.map((att, idx) => (
              <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', maxWidth: '300px', backgroundColor: 'var(--bg-main)' }}>
                {att.resource_type === 'image' ? (
                  <img src={att.secure_url} alt="attachment" style={{ width: '100%', height: 'auto', display: 'block' }} />
                ) : (
                  <video src={att.secure_url} controls style={{ width: '100%', height: 'auto', display: 'block' }} />
                )}
                {message.status === 'pending' && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <style>{`
                      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}</style>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {hasBody && (
          <div style={{ lineHeight: 1.5 }}>
            {message.body}
          </div>
        )}

        {/* Timestamp & Status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '4px',
          gap: '8px',
          opacity: 0.8
        }}>
          {/* Keyboard fallback for forwarding */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setFallbackForwardMessage(message));
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              fontSize: '0.65rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            Forward
          </button>

          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem' }}>
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isMine && (
              <span style={{ fontSize: '0.65rem' }}>
                {message.status === 'pending' && '⏳'}
                {message.status === 'sent' && !message.readBy?.length && '✓'}
                {message.status === 'sent' && message.readBy && message.readBy.length > 0 && <span style={{ color: 'var(--accent-primary)' }}>✓✓</span>}
                {message.status === 'error' && <span style={{ color: 'var(--status-error)' }}>!</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
