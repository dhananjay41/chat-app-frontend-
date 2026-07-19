/**
 * DEMO AUTH API
 *
 * INTENTIONAL DEVIATION FROM PRODUCTION AUTH (per client spec):
 * selectUser replaces login/register. No email or password is required.
 * fetchAvailableUsers fetches the seeded user list for the login screen.
 *
 * The JWT returned by selectUser is identical in structure and security
 * properties to a production login JWT — socket handshake auth and all
 * per-event re-authorization remain unchanged.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../lib/apiClient';

export interface SeedUser {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

/** Fetch the list of seeded demo users for the login select screen. */
export const fetchAvailableUsers = createAsyncThunk<SeedUser[]>(
  'auth/fetchAvailableUsers',
  async () => {
    const response = await apiClient.get('/auth/users');
    return response.data as SeedUser[];
  }
);

/** DEMO AUTH: Select a seeded user to log in as — no password required. */
export const selectUser = createAsyncThunk(
  'auth/selectUser',
  async (userId: string) => {
    const response = await apiClient.post('/auth/select-user', { userId });
    return response.data as {
      userId: string;
      accessToken: string;
      displayName: string;
      username: string;
      avatarUrl?: string;
    };
  }
);

/** Refresh the access token using the httpOnly refresh cookie. */
export const refresh = createAsyncThunk('auth/refresh', async () => {
  const response = await apiClient.post('/auth/refresh');
  return response.data as {
    userId: string;
    accessToken: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
});

/** Clear the refresh token cookie and reset auth state. */
export const logout = createAsyncThunk('auth/logout', async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
});
