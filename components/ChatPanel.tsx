'use client';
import { useState, useEffect } from 'react';
import { MessageThread } from './MessageThread';
import { Composer } from './Composer';
import { mockMessages, Message, CURRENT_USER_ID } from '../lib/mockData';

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const activeConversationId = 'conv-1'; // Hardcoded for this UI stub

  useEffect(() => {
    // Load initial mock messages
    setMessages(mockMessages[activeConversationId] || []);
  }, [activeConversationId]);

  const handleSend = (body: string) => {
    const newMsg: Message = {
      id: Math.random().toString(),
      conversationId: activeConversationId,
      senderId: CURRENT_USER_ID,
      body,
      createdAt: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, newMsg]);

    // Simulate server ack and reply
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'sent' } : m));
      
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const reply: Message = {
          id: Math.random().toString(),
          conversationId: activeConversationId,
          senderId: 'alice-id',
          body: 'I received your message!',
          createdAt: new Date().toISOString(),
          status: 'read'
        };
        setMessages(prev => [...prev, reply]);
      }, 1500);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Alice Cooper</h2>
      </div>
      
      <MessageThread messages={messages} isTyping={isTyping} />
      <Composer conversationId={activeConversationId} onSend={handleSend} />
    </div>
  );
}
