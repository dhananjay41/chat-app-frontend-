'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './chat.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchConversations } from '../../features/conversations/conversationsApi';
import { refresh, logout } from '../../features/auth/authApi';
import ConversationList from '../../components/ConversationList';
import { ConnectionBanner } from '../../components/ConnectionBanner';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDragForward } from '../../hooks/useDragForward';
import { ForwardConfirmationModal } from '../../components/ForwardConfirmationModal';
import { ForwardModal } from '../../components/ForwardModal';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { status, accessToken, displayName, username, avatarUrl } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const params = useParams();
  const hasConversation = !!params?.conversationId;
  const dispatch = useDispatch<AppDispatch>();
  const [isInitializing, setIsInitializing] = useState(true);

  const { onDragStart, onDragOver, onDragEnd, onDragCancel } = useDragForward();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const initAuth = async () => {
      if (!accessToken) {
        // Try to refresh token if we don't have one in memory
        const result = await dispatch(refresh());
        if (refresh.rejected.match(result)) {
          router.push('/login');
        }
      }
      setIsInitializing(false);
    };

    initAuth();
  }, [accessToken, dispatch, router]);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchConversations());
    }
  }, [accessToken, dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  if (isInitializing || status === 'authenticating') {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <div>Loading ChatApp...</div>
      </div>
    );
  }

  if (!accessToken) {
    return null; // Will redirect in useEffect
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
      <ConnectionBanner />
      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${hasConversation ? styles.hiddenOnMobile : ''}`}>
          {/* User Profile Header */}
          <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <img 
              src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=2E3342&color=F8FAFC`} 
              alt={displayName || ''} 
              style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)' }} 
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }} className="truncate">{displayName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{username}</div>
            </div>
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-secondary)', 
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--status-error)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Exit
            </button>
          </div>
          
          <ConversationList />
        </aside>
        <main className={`${styles.mainContent} ${!hasConversation ? styles.hiddenOnMobile : ''}`}>
          {children}
        </main>
      </div>
      <ForwardConfirmationModal />
      <ForwardModal />
    </DndContext>
  );
}
