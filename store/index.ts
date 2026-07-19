import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { socketMiddleware } from './socketMiddleware';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// Fallback for SSR where window is undefined
const createNoopStorage = () => {
  return {
    getItem() { return Promise.resolve(null); },
    setItem(_key: string, value: unknown) { return Promise.resolve(value); },
    removeItem() { return Promise.resolve(); },
  };
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['drafts', 'auth'], // Persist auth to prevent logout on refresh
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(socketMiddleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;

export const persistor = persistStore(store);

import { injectStore } from '../lib/apiClient';
injectStore(store);
