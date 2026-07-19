import axios from 'axios';
import { RootState } from '../store';

import { Store } from '@reduxjs/toolkit';

let store: Store;

export const injectStore = (_store: Store) => {
  store = _store;
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  withCredentials: true, // required for refresh token cookie
});

apiClient.interceptors.request.use((config) => {
  if (store) {
    const token = (store.getState() as RootState).auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
