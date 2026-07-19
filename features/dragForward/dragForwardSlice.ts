import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../messages/messagesSlice';

interface DragForwardState {
  activeMessageId: string | null;
  sourceConversationId: string | null;
  overTargetId: string | null;
  pendingDragDropForward: { message: Message; targetConversationId: string; targetName: string } | null;
  fallbackForwardMessage: Message | null;
}

const initialState: DragForwardState = {
  activeMessageId: null,
  sourceConversationId: null,
  overTargetId: null,
  pendingDragDropForward: null,
  fallbackForwardMessage: null,
};

const dragForwardSlice = createSlice({
  name: 'dragForward',
  initialState,
  reducers: {
    dragStarted(state, action: PayloadAction<{ messageId: string; sourceConversationId: string }>) {
      state.activeMessageId = action.payload.messageId;
      state.sourceConversationId = action.payload.sourceConversationId;
    },
    dragMoved(state, action: PayloadAction<{ overTargetId: string | null }>) {
      state.overTargetId = action.payload.overTargetId;
    },
    dragEnded(state) {
      state.activeMessageId = null;
      state.sourceConversationId = null;
      state.overTargetId = null;
    },
    setPendingDragDropForward(state, action: PayloadAction<{ message: Message; targetConversationId: string; targetName: string } | null>) {
      state.pendingDragDropForward = action.payload;
    },
    setFallbackForwardMessage(state, action: PayloadAction<Message | null>) {
      state.fallbackForwardMessage = action.payload;
    }
  },
});

export const { dragStarted, dragMoved, dragEnded, setPendingDragDropForward, setFallbackForwardMessage } = dragForwardSlice.actions;
export default dragForwardSlice.reducer;
