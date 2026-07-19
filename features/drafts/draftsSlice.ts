import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// State is just a map from conversationId to draft string
type DraftsState = Record<string, string>;

const initialState: DraftsState = {};

const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    updateDraft(state, action: PayloadAction<{ userId: string; conversationId: string; text: string }>) {
      const { userId, conversationId, text } = action.payload;
      const key = `${userId}:${conversationId}`;
      if (text.trim() === '') {
        delete state[key];
      } else {
        state[key] = text;
      }
    },
    clearDraft(state, action: PayloadAction<{ userId: string; conversationId: string }>) {
      const { userId, conversationId } = action.payload;
      const key = `${userId}:${conversationId}`;
      delete state[key];
    },
  },
});

export const { updateDraft, clearDraft } = draftsSlice.actions;
export default draftsSlice.reducer;
