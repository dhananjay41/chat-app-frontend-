'use client';
import { Conversation } from '../lib/mockData';
import { useDroppable } from '@dnd-kit/core';

interface Props {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id: conversation.id,
    data: { conversation }
  });

  const getBackgroundColor = () => {
    if (isOver) return 'rgba(0, 229, 255, 0.1)'; // Accent primary transparent
    if (isActive) return 'var(--bg-surface-hover)';
    return 'transparent';
  };

  return (
    <div 
      ref={setNodeRef}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--space-3) var(--space-4)',
        cursor: 'pointer',
        background: getBackgroundColor(),
        borderLeft: isOver ? '3px solid var(--accent-primary)' : isActive ? '3px solid var(--accent-secondary)' : '3px solid transparent',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div style={{ position: 'relative', marginRight: 'var(--space-3)' }}>
        <img 
          src={conversation.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.name)}&background=2E3342&color=F8FAFC`} 
          alt={conversation.name}
          style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
        />
        {conversation.isOnline && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 12,
            height: 12,
            background: 'var(--status-online)',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--bg-surface)'
          }} />
        )}
      </div>
      
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
            {conversation.name}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {conversation.lastMessageTimestamp 
              ? new Date(conversation.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : ''}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-1)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }} className="truncate">
            {conversation.lastMessage || 'No messages yet'}
          </span>
          {conversation.unreadCount > 0 && (
            <div style={{
              background: 'var(--accent-primary)',
              color: 'var(--bg-main)',
              fontSize: '0.75rem',
              fontWeight: 700,
              paddingTop: '2px',
              paddingBottom: '4px',
              paddingLeft: '6px',
              paddingRight: '6px',
              borderRadius: 'var(--radius-full)',
              marginLeft: 'var(--space-2)'
            }}>
              {conversation.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
