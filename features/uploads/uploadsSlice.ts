import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { uploadFile } from './uploadThunks';

export interface UploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  result?: {
    secure_url: string;
    public_id: string;
    resource_type: string;
    bytes: number;
  };
  error?: string;
}

interface UploadsSliceState {
  byId: Record<string, UploadState>;
}

const initialState: UploadsSliceState = {
  byId: {},
};

const uploadsSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    setUploadProgress(state, action: PayloadAction<{ id: string; progress: number }>) {
      const { id, progress } = action.payload;
      if (state.byId[id]) {
        state.byId[id].progress = progress;
      }
    },
    initUpload(state, action: PayloadAction<{ id: string; file: File }>) {
      const { id, file } = action.payload;
      state.byId[id] = {
        file,
        progress: 0,
        status: 'uploading',
      };
    },
    removeUpload(state, action: PayloadAction<string>) {
      delete state.byId[action.payload];
    },
    clearUploads(state) {
      state.byId = {};
    }
  },
  extraReducers: (builder) => {
    builder.addCase(uploadFile.fulfilled, (state, action) => {
      const { id, result } = action.payload;
      if (state.byId[id]) {
        state.byId[id].status = 'done';
        state.byId[id].progress = 100;
        state.byId[id].result = result;
      }
    });
    builder.addCase(uploadFile.rejected, (state, action) => {
      const { id } = action.meta.arg;
      if (state.byId[id]) {
        state.byId[id].status = 'error';
        state.byId[id].error = action.error.message || 'Upload failed';
      }
    });
  },
});

export const { setUploadProgress, initUpload, removeUpload, clearUploads } = uploadsSlice.actions;
export default uploadsSlice.reducer;
