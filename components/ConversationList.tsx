'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchAvailableUsers } from '../features/auth/authApi';
import { createConversation } from '../features/conversations/conversationsApi';
import { ConversationItem } from './ConversationItem';
import { useRouter, useParams } from 'next/navigation';

export default function ConversationList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const currentConversationId = params?.conversationId as string | undefined;

  const { byId, allIds } = useSelector((state: RootState) => state.conversations);
  const { availableUsers, userId: currentUserId } = useSelector((state: RootState) => state.auth);
  const { onlineUserIds } = useSelector((state: RootState) => state.presence);


  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (availableUsers.length === 0) {
      dispatch(fetchAvailableUsers());
    }
  }, [availableUsers.length, dispatch]);

  const handleStartDm = async (targetUserId: string) => {
    setIsCreating(false);
    const result = await dispatch(createConversation(targetUserId));
    if (createConversation.fulfilled.match(result)) {
      router.push(`/chat/${result.payload._id}`);
    }
  };

  const otherUsers = availableUsers.filter((u) => u._id !== currentUserId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Messages</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          style={{
            background: 'var(--bg-surface-hover)',
            border: 'none',
            color: 'var(--text-primary)',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
      </div>

      {isCreating && (
        <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Start conversation with:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {otherUsers.map(u => (
              <button
                key={u._id}
                onClick={() => handleStartDm(u._id)}
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-2)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <img 
                  src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName)}&background=2E3342&color=F8FAFC`}
                  alt="" 
                  style={{ width: 24, height: 24, borderRadius: 'var(--radius-full)' }} 
                />
                {u.displayName}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {allIds.map((id) => {
          const conv = byId[id];
          if (!conv) return null;
          
          const otherMember = conv.members.find(m => m._id !== currentUserId) || conv.members[0];
          
          let lastMessageText = 'No messages yet';
          if (conv.lastMessage) {
            if (typeof conv.lastMessage === 'string') {
              lastMessageText = 'Message...';
            } else if (conv.lastMessage.body) {
              lastMessageText = conv.lastMessage.body;
            } else if (conv.lastMessage.attachments && conv.lastMessage.attachments.length > 0) {
              lastMessageText = 'Attachment';
            }
          }

          const adaptedConv = {
            id: conv._id,
            name: conv.name || otherMember?.displayName || 'Unknown',
            avatarUrl: otherMember?.avatarUrl,
            lastMessage: lastMessageText,
            lastMessageTimestamp: conv.updatedAt,
            unreadCount: conv.unreadCount || 0,
            isOnline: otherMember ? onlineUserIds.includes(otherMember._id) : false,
          };

          return (
            <ConversationItem 
              key={conv._id} 
              conversation={adaptedConv} 
              isActive={currentConversationId === conv._id}
              onClick={() => router.push(`/chat/${conv._id}`)}
            />
          );
        })}
        {allIds.length === 0 && (
          <div style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Start conversation
          </div>
        )}
      </div>
    </div>
  );
}
