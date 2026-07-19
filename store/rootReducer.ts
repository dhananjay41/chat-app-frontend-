import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import conversationsReducer from '../features/conversations/conversationsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import uploadsReducer from '../features/uploads/uploadsSlice';
import presenceReducer from '../features/presence/presenceSlice';
import draftsReducer from '../features/drafts/draftsSlice';
import dragForwardReducer from '../features/dragForward/dragForwardSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  conversations: conversationsReducer,
  messages: messagesReducer,
  uploads: uploadsReducer,
  presence: presenceReducer,
  drafts: draftsReducer,
  dragForward: dragForwardReducer,
  // Other slices added in subsequent milestones
});

export type RootState = ReturnType<typeof rootReducer>;
