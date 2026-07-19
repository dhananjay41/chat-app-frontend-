import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/apiClient';
import { uploadToCloudinary } from '../../lib/cloudinaryClient';
import { messageSendPending } from './messagesSlice';
import { RootState } from '../../store';

export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async ({ conversationId, cursor }: { conversationId: string; cursor?: string | null }) => {
    console.log('[DEBUG] fetchMessages API called:', { conversationId, cursor });
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);

    const response = await apiClient.get(`/conversations/${conversationId}/messages?${params.toString()}`);
    console.log('[DEBUG] fetchMessages API response:', response.data);
    return { ...response.data, conversationId };
  }
);

export const fetchMessagesSince = createAsyncThunk(
  'messages/fetchSince',
  async ({ conversationId, since }: { conversationId: string; since: string }) => {
    const params = new URLSearchParams();
    params.append('since', since);

    const response = await apiClient.get(`/conversations/${conversationId}/messages?${params.toString()}`);
    return { ...response.data, conversationId };
  }
);

export const sendAsyncMessage = createAsyncThunk(
  'messages/sendAsync',
  async (
    { conversationId, body, files, clientTempId }: { conversationId: string; body: string; files: File[]; clientTempId: string },
    { dispatch, getState }
  ) => {
    const state = getState() as RootState;
    const userId = state.auth.userId;

    // 1. Optimistic UI: Create pending message with local Blob URLs
    const localAttachments = files.map(f => ({
      secure_url: URL.createObjectURL(f),
      public_id: 'local_' + Math.random(),
      resource_type: f.type.startsWith('image/') ? 'image' : 'video',
      bytes: f.size
    }));

    dispatch(messageSendPending({
      _id: clientTempId,
      conversationId,
      senderId: userId || '',
      body,
      attachments: localAttachments,
      clientTempId,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }));

    // 2. Upload to Cloudinary sequentially or in parallel
    const uploadedAttachments = await Promise.all(
      files.map(async (file) => {
        // Request signature
        const signResponse = await apiClient.post('/api/uploads/sign');
        const { signature, timestamp, cloudName, apiKey, folder, allowedFormats } = signResponse.data;

        // Upload
        const result = await uploadToCloudinary({
          file,
          signature,
          timestamp,
          cloudName,
          apiKey,
          folder,
          allowedFormats,
          onProgress: () => {}, // We could integrate this with UI if needed
        });
        
        return result;
      })
    );

    // 3. Dispatch actual socket event with final Cloudinary URLs
    dispatch({ 
      type: 'socket/sendMessage', 
      payload: { 
        conversationId, 
        body, 
        attachments: uploadedAttachments,
        clientTempId 
      } 
    });

    return { clientTempId, uploadedAttachments };
  }
);
