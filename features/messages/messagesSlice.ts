import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchMessages, fetchMessagesSince } from './messagesApi';

export interface Attachment {
  secure_url: string;
  public_id: string;
  resource_type: string;
  bytes: number;
}

export interface Message {
  _id?: string;
  conversationId: string;
  senderId: string | { _id: string; displayName: string; avatarUrl?: string };
  body?: string;
  attachments: Attachment[];
  clientTempId?: string;
  createdAt: string;
  status: 'pending' | 'sent' | 'error';
  readBy?: { userId: string; readAt: string }[];
}

interface MessagesState {
  byConversationId: Record<
    string,
    {
      byId: Record<string, Message>;
      allIds: string[];
      cursor: string | null;
      hasMore: boolean;
    }
  >;
}

const initialState: MessagesState = {
  byConversationId: {},
};

const ensureConversationState = (state: MessagesState, conversationId: string) => {
  if (!state.byConversationId[conversationId]) {
    state.byConversationId[conversationId] = {
      byId: {},
      allIds: [],
      cursor: null,
      hasMore: true,
    };
  }
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    messageSendPending(state, action: PayloadAction<Message>) {
      console.log('[DEBUG] messageSendPending triggered:', action.payload);
      const msg = action.payload;
      ensureConversationState(state, msg.conversationId);
      const conv = state.byConversationId[msg.conversationId];
      // Optimistic insert
      conv.byId[msg.clientTempId!] = { ...msg };
      if (!conv.allIds.includes(msg.clientTempId!)) {
        conv.allIds.push(msg.clientTempId!);
      }
    },
    messageAcked(
      state,
      action: PayloadAction<{ clientTempId: string; serverId: string; timestamp: string; conversationId: string }>
    ) {
      console.log('[DEBUG] messageAcked triggered:', action.payload);
      const { clientTempId, serverId, timestamp, conversationId } = action.payload;
      ensureConversationState(state, conversationId);
      const conv = state.byConversationId[conversationId];

      if (conv.byId[clientTempId]) {
        if (conv.byId[serverId]) {
          console.log('[DEBUG] messageAcked: msg already handled by messageReceived, deleting temp msg.');
          // messageReceived already handled it
          delete conv.byId[clientTempId];
          conv.allIds = conv.allIds.filter(id => id !== clientTempId);
        } else {
          console.log('[DEBUG] messageAcked: updating temp msg to server msg.');
          const msg = conv.byId[clientTempId];
          msg.status = 'sent';
          msg._id = serverId;
          msg.createdAt = timestamp;

          // Re-key
          conv.byId[serverId] = msg;
          delete conv.byId[clientTempId];

          const index = conv.allIds.indexOf(clientTempId);
          if (index !== -1) {
            conv.allIds[index] = serverId;
          }
        }
      } else {
        console.log('[DEBUG] messageAcked: temp message not found in state!');
      }
    },
    messageReceived(state, action: PayloadAction<Message>) {
      console.log('[DEBUG] messageReceived triggered in slice:', action.payload);
      const msg = action.payload;
      ensureConversationState(state, msg.conversationId);
      const conv = state.byConversationId[msg.conversationId];

      if (msg._id && !conv.byId[msg._id]) {
        if (msg.clientTempId && conv.byId[msg.clientTempId]) {
          console.log('[DEBUG] messageReceived: temp msg exists, replacing it.');
          delete conv.byId[msg.clientTempId];
          const index = conv.allIds.indexOf(msg.clientTempId);
          if (index !== -1) {
            conv.allIds[index] = msg._id;
          } else {
            conv.allIds.push(msg._id);
          }
        } else {
          console.log('[DEBUG] messageReceived: adding new msg.');
          conv.allIds.push(msg._id);
        }
        const newMsg = { ...msg, status: 'sent' as const };
        conv.byId[msg._id] = newMsg;
      } else {
        console.log('[DEBUG] messageReceived: msg already exists in state.');
      }
    },
    messageReadAcked(state, action: PayloadAction<{ conversationId: string; messageId: string; userId: string; timestamp?: string }>) {
      const { conversationId, messageId, userId, timestamp } = action.payload;
      ensureConversationState(state, conversationId);
      const conv = state.byConversationId[conversationId];
      if (conv.byId[messageId]) {
        const msg = conv.byId[messageId];
        if (!msg.readBy) msg.readBy = [];
        if (!msg.readBy.some(r => r.userId === userId)) {
          msg.readBy.push({ userId, readAt: timestamp || new Date().toISOString() });
        }
      }
    },
    markConversationAsRead(state, action: PayloadAction<{ conversationId: string; userId: string; timestamp?: string }>) {
      const { conversationId, userId, timestamp } = action.payload;
      ensureConversationState(state, conversationId);
      const conv = state.byConversationId[conversationId];
      const now = timestamp || new Date().toISOString();
      conv.allIds.forEach(id => {
        const msg = conv.byId[id];
        const senderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id;
        if (senderId !== userId) {
          if (!msg.readBy) msg.readBy = [];
          if (!msg.readBy.some(r => r.userId === userId)) {
            msg.readBy.push({ userId, readAt: now });
          }
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      console.log('[DEBUG] fetchMessages.fulfilled triggered:', action.payload.messages.length, 'messages');
      const { messages, cursor, hasMore, conversationId } = action.payload;
      ensureConversationState(state, conversationId);
      const conv = state.byConversationId[conversationId];

      const newIds: string[] = [];
      messages.forEach((msg: Message) => {
        if (msg._id && !conv.byId[msg._id]) {
          conv.byId[msg._id] = { ...msg, status: 'sent' };
          newIds.push(msg._id);
        }
      });
      conv.allIds = [...newIds, ...conv.allIds];
      conv.cursor = cursor;
      conv.hasMore = hasMore;
    });

    builder.addCase(fetchMessagesSince.fulfilled, (state, action) => {
      const { messages, conversationId } = action.payload;
      ensureConversationState(state, conversationId);
      const conv = state.byConversationId[conversationId];

      messages.forEach((msg: Message) => {
        if (msg._id && !conv.byId[msg._id]) {
          conv.byId[msg._id] = { ...msg, status: 'sent' };
          conv.allIds.push(msg._id); // newer messages appended
        }
      });
    });
  },
});

export const { messageSendPending, messageAcked, messageReceived, messageReadAcked, markConversationAsRead } = messagesSlice.actions;
export default messagesSlice.reducer;
