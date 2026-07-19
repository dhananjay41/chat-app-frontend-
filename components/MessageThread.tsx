'use client';
import { AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Message } from '../lib/mockData';

interface Props {
  messages: Message[];
  isTyping?: boolean;
}

export function MessageThread({ messages, isTyping }: Props) {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: 'var(--space-6) var(--space-4)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ flex: 1 }} /> {/* Push messages to bottom */}
      
      <AnimatePresence initial={false}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg as any} />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {isTyping && <TypingIndicator />}
      </AnimatePresence>
    </div>
  );
}
