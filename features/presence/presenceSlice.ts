import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PresenceState {
  onlineUserIds: string[];
  typingByConversation: Record<string, string[]>;
}

const initialState: PresenceState = {
  onlineUserIds: [],
  typingByConversation: {},
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    syncOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUserIds = action.payload;
    },
    userPresenceUpdated(state, action: PayloadAction<{ userId: string; status: 'active' | 'idle' | 'offline' }>) {
      const { userId, status } = action.payload;
      const index = state.onlineUserIds.indexOf(userId);

      if (status === 'offline') {
        if (index !== -1) {
          state.onlineUserIds.splice(index, 1);
        }
      } else {
        if (index === -1) {
          state.onlineUserIds.push(userId);
        }
      }
    },
    userTypingStarted(state, action: PayloadAction<{ conversationId: string; userId: string }>) {
      const { conversationId, userId } = action.payload;
      if (!state.typingByConversation[conversationId]) {
        state.typingByConversation[conversationId] = [];
      }
      if (!state.typingByConversation[conversationId].includes(userId)) {
        state.typingByConversation[conversationId].push(userId);
      }
    },
    userTypingStopped(state, action: PayloadAction<{ conversationId: string; userId: string }>) {
      const { conversationId, userId } = action.payload;
      if (state.typingByConversation[conversationId]) {
        state.typingByConversation[conversationId] = state.typingByConversation[conversationId].filter(
          (id) => id !== userId
        );
      }
    },
  },
});

export const {
  syncOnlineUsers,
  userPresenceUpdated,
  userTypingStarted,
  userTypingStopped,
} = presenceSlice.actions;

export default presenceSlice.reducer;
