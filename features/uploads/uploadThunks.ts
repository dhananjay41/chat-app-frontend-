import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/apiClient';
import { uploadToCloudinary } from '../../lib/cloudinaryClient';
import { setUploadProgress, initUpload } from './uploadsSlice';

export const uploadFile = createAsyncThunk(
  'uploads/uploadFile',
  async (
    { id, file }: { id: string; file: File },
    { dispatch }
  ) => {
    // 1. Init state
    dispatch(initUpload({ id, file }));

    // 2. Request signature from our backend
    const signResponse = await apiClient.post('/api/uploads/sign');
    const { signature, timestamp, cloudName, apiKey, folder, allowedFormats } = signResponse.data;

    // 3. Upload directly to Cloudinary using XHR to track progress
    const result = await uploadToCloudinary({
      file,
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
      allowedFormats,
      onProgress: (progress) => {
        dispatch(setUploadProgress({ id, progress }));
      },
    });

    return { id, result };
  }
);
