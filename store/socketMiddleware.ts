import { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { messageReceived, messageAcked, messageReadAcked } from '../features/messages/messagesSlice';
import { syncOnlineUsers, userPresenceUpdated, userTypingStarted, userTypingStopped } from '../features/presence/presenceSlice';
import { setConnectionStatus } from '../features/auth/authSlice';
import { fetchMessagesSince } from '../features/messages/messagesApi';
import type { RootState } from './index';

export const connectSocket = (token: string) => ({
  type: 'socket/connect',
  payload: { token },
});

export const disconnectSocket = () => ({
  type: 'socket/disconnect',
});

export const joinRoom = (conversationId: string) => ({
  type: 'socket/joinRoom',
  payload: { conversationId },
});

export const sendMessage = (payload: unknown) => ({
  type: 'socket/sendMessage',
  payload,
});

export const sendTypingStatus = (payload: { conversationId: string; isTyping: boolean }) => ({
  type: 'socket/sendTypingStatus',
  payload,
});

export const sendReadReceipt = (payload: { conversationId: string; messageId: string }) => ({
  type: 'socket/sendReadReceipt',
  payload,
});

export const forwardMessage = (payload: { originalMessage: any; targetConversationId: string; clientTempId: string }) => ({
  type: 'socket/forwardMessage',
  payload,
});

import { messageSendPending } from '../features/messages/messagesSlice';

export const socketMiddleware: Middleware = (store) => {
  let socket: Socket | null = null;
  let offlineQueue: { type: string; payload: unknown }[] = [];
  let isConnected = false;

  return (next) => (action: any) => {
    if (action.type === 'socket/connect') {
      if (socket) {
        socket.disconnect();
      }

      const { token } = action.payload;
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

      socket = io(`${socketUrl}/chat`, {
        auth: { token },
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('[DEBUG] Socket connected!');
        isConnected = true;
        store.dispatch(setConnectionStatus(true));
        
        // Re-sync gap for all active conversations
        const state = store.getState() as RootState;
        const messagesState = state.messages.byConversationId;
        for (const conversationId of Object.keys(messagesState)) {
          const conv = messagesState[conversationId];
          if (conv.allIds.length > 0) {
            // Get latest message by taking the last ID in the array
            const latestMsgId = conv.allIds[conv.allIds.length - 1];
            const latestMsg = conv.byId[latestMsgId];
            if (latestMsg && latestMsg.createdAt) {
              store.dispatch(fetchMessagesSince({ conversationId, since: latestMsg.createdAt }) as any);
            }
          }
        }

        // Flush offline queue in order
        while (offlineQueue.length > 0) {
          const queuedAction = offlineQueue.shift();
          if (queuedAction) {
            // For simplicity, just re-dispatch to the store which will run it through the middleware again
            // now that isConnected is true. We have to wrap it in a setTimeout or process it directly.
            store.dispatch(queuedAction);
          }
        }
      });

      socket.on('disconnect', () => {
        isConnected = false;
        store.dispatch(setConnectionStatus(false));
      });

      socket.on('presence:sync', (payload) => {
        store.dispatch(syncOnlineUsers(payload.onlineUserIds));
      });

      socket.on('presence:update', (payload) => {
        store.dispatch(userPresenceUpdated(payload));
      });

      socket.on('typing:start', (payload) => {
        store.dispatch(userTypingStarted(payload));
      });

      socket.on('typing:stop', (payload) => {
        store.dispatch(userTypingStopped(payload));
      });

      socket.on('message:new', (msg) => {
        console.log('[DEBUG] Socket received message:new', msg);
        store.dispatch(messageReceived(msg));
        
        const state = store.getState() as RootState;
        const currentUserId = state.auth.userId;
        const msgSenderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id;
        
        if (msgSenderId !== currentUserId) {
          import('../features/conversations/conversationsSlice').then(({ incrementUnreadCount }) => {
            store.dispatch(incrementUnreadCount(msg.conversationId));
          });
        }
      });

      socket.on('message:forwarded', (msg) => {
        store.dispatch(messageReceived(msg));
      });

      socket.on('message:read:ack', (payload) => {
        store.dispatch(messageReadAcked(payload));
      });

      socket.on('message:ack', () => {
        // Find which conversation this is for? 
        // We'd need to track it or have server send it back, or just let the callback handle it.
        // For simplicity and spec compliance, we let the direct callback handle it where possible,
        // or just use the ack payload.
        // Wait, the spec says "message:ack (temp->server ID) to the sender"
      });
    }

    if (action.type === 'socket/disconnect') {
      if (socket) {
        socket.disconnect();
        socket = null;
        isConnected = false;
        offlineQueue = [];
      }
    }

    if (action.type === 'socket/sendMessage') {
      console.log('[DEBUG] socketMiddleware intercepting socket/sendMessage', action.payload);
      const state = store.getState() as RootState;
      const { userId } = state.auth;
      const msgPayload = {
        conversationId: action.payload.conversationId,
        senderId: userId || '',
        body: action.payload.body,
        attachments: action.payload.attachments || [],
        clientTempId: action.payload.clientTempId,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
      };

      store.dispatch(messageSendPending(msgPayload as any));

      if (isConnected && socket) {
        console.log('[DEBUG] socketMiddleware emitting message:send');
        socket.emit('message:send', action.payload, (ack: { success: boolean; clientTempId: string; serverId: string; timestamp: string }) => {
          console.log('[DEBUG] socketMiddleware received message:send ack', ack);
          if (ack && ack.success) {
            store.dispatch(
              messageAcked({
                clientTempId: ack.clientTempId,
                serverId: ack.serverId,
                timestamp: ack.timestamp,
                conversationId: action.payload.conversationId,
              })
            );
          }
        });
      } else {
        // Queue for reconnect
        offlineQueue.push(action as { type: string; payload: unknown });
      }
    }

    if (action.type === 'socket/joinRoom') {
      if (isConnected && socket) {
        socket.emit('room:join', action.payload);
      } else {
        offlineQueue.push(action as { type: string; payload: unknown });
      }
    }

    if (action.type === 'socket/sendTypingStatus') {
      if (isConnected && socket) {
        const { conversationId, isTyping } = action.payload;
        socket.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
      }
    }

    if (action.type === 'socket/sendReadReceipt') {
      if (isConnected && socket) {
        socket.emit('message:read', action.payload);
      } else {
        offlineQueue.push(action as { type: string; payload: unknown });
      }
    }

    if (action.type === 'socket/forwardMessage') {
      const state = store.getState() as RootState;
      const { userId } = state.auth;
      const { originalMessage, targetConversationId, clientTempId } = action.payload;

      const msgPayload = {
        _id: clientTempId,
        conversationId: targetConversationId,
        senderId: userId || '',
        body: originalMessage.body,
        attachments: originalMessage.attachments || [],
        clientTempId,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
        forwardedFrom: {
          messageId: originalMessage._id,
          conversationId: originalMessage.conversationId,
          senderId: originalMessage.senderId,
        }
      };

      store.dispatch(messageSendPending(msgPayload as any));

      const emitPayload = {
        originalMessageId: originalMessage._id,
        targetConversationId,
        clientTempId,
      };

      if (isConnected && socket) {
        socket.emit('message:forward', emitPayload, (ack: { success: boolean; clientTempId: string; serverId: string; timestamp: string }) => {
          if (ack && ack.success) {
            store.dispatch(
              messageAcked({
                clientTempId: ack.clientTempId,
                serverId: ack.serverId,
                timestamp: ack.timestamp,
                conversationId: targetConversationId,
              })
            );
          }
        });
      } else {
        offlineQueue.push({ type: action.type, payload: emitPayload });
      }
    }

    return next(action);
  };
};
