import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchConversations, createConversation } from './conversationsApi';

export interface Conversation {
  _id: string;
  members: { _id: string; displayName: string; avatarUrl?: string }[];
  name?: string;
  lastMessage?: any;
  updatedAt: string;
  unreadCount?: number;
}

interface ConversationsState {
  byId: Record<string, Conversation>;
  allIds: string[];
  activeId: string | null;
}

const initialState: ConversationsState = {
  byId: {},
  allIds: [],
  activeId: null,
};

import { messageReceived, messageAcked, messageSendPending } from '../messages/messagesSlice';

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeId = action.payload;
    },
    incrementUnreadCount(state, action: PayloadAction<string>) {
      const conv = state.byId[action.payload];
      if (conv && state.activeId !== action.payload) {
        conv.unreadCount = (conv.unreadCount || 0) + 1;
      }
    },
    clearUnreadCount(state, action: PayloadAction<string>) {
      const conv = state.byId[action.payload];
      if (conv) {
        conv.unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(messageSendPending, (state, action) => {
      const msg = action.payload;
      const conv = state.byId[msg.conversationId];
      if (conv) {
        conv.lastMessage = msg;
        conv.updatedAt = msg.createdAt;
        state.allIds = state.allIds.filter(id => id !== conv._id);
        state.allIds.unshift(conv._id);
      }
    });
    builder.addCase(messageReceived, (state, action) => {
      const msg = action.payload;
      const conv = state.byId[msg.conversationId];
      if (conv) {
        conv.lastMessage = msg;
        conv.updatedAt = msg.createdAt;
        // Move to top of allIds to keep recent conversations first
        state.allIds = state.allIds.filter(id => id !== conv._id);
        state.allIds.unshift(conv._id);
      }
    });
    builder.addCase(messageAcked, (state, action) => {
      const { conversationId, timestamp, serverId, clientTempId } = action.payload;
      const conv = state.byId[conversationId];
      if (conv) {
        // We might not have the full message body here, but if the lastMessage is the same temp id we update it
        if (conv.lastMessage && conv.lastMessage._id === clientTempId) {
          conv.lastMessage._id = serverId;
          conv.lastMessage.createdAt = timestamp;
        }
        conv.updatedAt = timestamp;
        state.allIds = state.allIds.filter(id => id !== conv._id);
        state.allIds.unshift(conv._id);
      }
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      const conversations = action.payload as Conversation[];
      state.byId = {};
      state.allIds = [];
      conversations.forEach((conv) => {
        state.byId[conv._id] = conv;
        state.allIds.push(conv._id);
      });
    });
    builder.addCase(createConversation.fulfilled, (state, action) => {
      const conv = action.payload as Conversation;
      if (!state.byId[conv._id]) {
        state.byId[conv._id] = conv;
        // Prepend to maintain reverse chronological if desired, or let sorting handle it later.
        state.allIds.unshift(conv._id); 
      }
    });
  },
});

export const { setActiveConversation, incrementUnreadCount, clearUnreadCount } = conversationsSlice.actions;
export default conversationsSlice.reducer;
