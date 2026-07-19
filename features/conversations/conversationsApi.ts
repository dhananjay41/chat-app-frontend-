import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/apiClient';

export const fetchConversations = createAsyncThunk('conversations/fetchAll', async () => {
  const response = await apiClient.get('/conversations');
  return response.data;
});

export const createConversation = createAsyncThunk(
  'conversations/create',
  async (targetUserId: string) => {
    const response = await apiClient.post('/conversations', { targetUserId });
    return response.data;
  }
);
