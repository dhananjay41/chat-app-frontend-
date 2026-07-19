import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchAvailableUsers, selectUser, refresh, logout, SeedUser } from './authApi';

interface AuthState {
  userId: string | null;
  accessToken: string | null;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'error';
  isConnected: boolean;
  availableUsers: SeedUser[]; // For the demo login screen
}

const initialState: AuthState = {
  userId: null,
  accessToken: null,
  displayName: null,
  username: null,
  avatarUrl: null,
  status: 'idle',
  isConnected: true,
  availableUsers: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Available Users (Demo Login Screen)
    builder.addCase(fetchAvailableUsers.fulfilled, (state, action) => {
      state.availableUsers = action.payload;
    });

    // Select User (Demo Login)
    builder.addCase(selectUser.pending, (state) => {
      state.status = 'authenticating';
    });
    builder.addCase(selectUser.fulfilled, (state, action) => {
      state.status = 'authenticated';
      state.userId = action.payload.userId;
      state.accessToken = action.payload.accessToken;
      state.displayName = action.payload.displayName;
      state.username = action.payload.username;
      state.avatarUrl = action.payload.avatarUrl || null;
    });
    builder.addCase(selectUser.rejected, (state) => {
      state.status = 'error';
      state.userId = null;
      state.accessToken = null;
      state.displayName = null;
      state.username = null;
      state.avatarUrl = null;
    });

    // Refresh
    builder.addCase(refresh.pending, (state) => {
      state.status = 'authenticating';
    });
    builder.addCase(refresh.fulfilled, (state, action) => {
      state.status = 'authenticated';
      state.userId = action.payload.userId;
      state.accessToken = action.payload.accessToken;
      state.displayName = action.payload.displayName;
      state.username = action.payload.username;
      state.avatarUrl = action.payload.avatarUrl || null;
    });
    builder.addCase(refresh.rejected, (state) => {
      state.status = 'idle'; // Not 'error', just unauthenticated
      state.userId = null;
      state.accessToken = null;
      state.displayName = null;
      state.username = null;
      state.avatarUrl = null;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.status = 'idle';
      state.userId = null;
      state.accessToken = null;
      state.displayName = null;
      state.username = null;
      state.avatarUrl = null;
    });
  },
});

export const { setConnectionStatus } = authSlice.actions;
export default authSlice.reducer;
