export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'video' | 'file';
  name: string;
  size: number;
  progress?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: MessageStatus;
  attachments?: Attachment[];
  forwardedFrom?: {
    messageId: string;
    conversationId: string;
    senderId: string;
  };
}

export interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount: number;
  isOnline: boolean;
}

export const CURRENT_USER_ID = 'user-1';

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Alice Cooper',
    avatarUrl: 'https://i.pravatar.cc/150?u=alice',
    lastMessage: 'Sounds good! See you then.',
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'conv-2',
    name: 'Bob Marley',
    avatarUrl: 'https://i.pravatar.cc/150?u=bob',
    lastMessage: 'Can you forward that document?',
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'conv-3',
    name: 'Design Team',
    lastMessage: 'Charlie: Here is the latest mockup.',
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0,
    isOnline: true,
  },
];

export const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      body: 'Hey Alice, are we still on for the meeting?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'alice-id',
      body: 'Yes! Let me share the notes.',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'sent',
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'alice-id',
      body: 'Sounds good! See you then.',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'sent',
    }
  ],
  'conv-2': [
    {
      id: 'msg-10',
      conversationId: 'conv-2',
      senderId: 'bob-id',
      body: 'Can you forward that document?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'sent',
    }
  ],
  'conv-3': []
};
