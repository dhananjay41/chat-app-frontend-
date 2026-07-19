'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setFallbackForwardMessage } from '../features/dragForward/dragForwardSlice';
import { forwardMessage } from '../store/socketMiddleware';

export function ForwardModal() {
  const dispatch = useDispatch<AppDispatch>();
  const fallbackForwardMessage = useSelector((state: RootState) => state.dragForward.fallbackForwardMessage);
  const { byId, allIds } = useSelector((state: RootState) => state.conversations);
  const { userId: currentUserId } = useSelector((state: RootState) => state.auth);
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  if (!fallbackForwardMessage) return null;

  const handleForward = () => {
    if (!selectedConversationId) return;

    const clientTempId = `temp_fwd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    dispatch(forwardMessage({
      originalMessage: fallbackForwardMessage,
      targetConversationId: selectedConversationId,
      clientTempId
    }));
    
    dispatch(setFallbackForwardMessage(null));
    setSelectedConversationId(null);
  };

  const handleCancel = () => {
    dispatch(setFallbackForwardMessage(null));
    setSelectedConversationId(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '90%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
          Forward Message
        </h3>
        
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 'var(--space-4)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          {allIds.map(id => {
            const conv = byId[id];
            if (!conv) return null;
            const otherMember = conv.members.find(m => m._id !== currentUserId) || conv.members[0];
            const name = conv.name || otherMember?.displayName || 'Unknown';
            const isSelected = selectedConversationId === id;

            return (
              <div 
                key={id}
                onClick={() => setSelectedConversationId(id)}
                style={{
                  padding: 'var(--space-3)',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'transparent',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)'
                }}
              >
                <img 
                  src={otherMember?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2E3342&color=F8FAFC`} 
                  alt={name}
                  style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>{name}</span>
                {isSelected && <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }}>✓</span>}
              </div>
            );
          })}
          {allIds.length === 0 && (
            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No conversations available.
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={!selectedConversationId}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: selectedConversationId ? 'pointer' : 'not-allowed',
              opacity: selectedConversationId ? 1 : 0.5
            }}
          >
            Forward/Send
          </button>
        </div>
      </div>
    </div>
  );
}
