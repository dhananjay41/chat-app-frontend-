'use client';

import { useEffect, useRef, use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { AppDispatch, RootState } from '../../../store';
import { connectSocket, disconnectSocket, sendReadReceipt, joinRoom } from '../../../store/socketMiddleware';
import { fetchMessages, sendAsyncMessage } from '../../../features/messages/messagesApi';
import { MessageBubble } from '../../../components/MessageBubble';
import { Composer } from '../../../components/Composer';
import DropzoneArea from '../../../components/DropzoneArea';
import { TypingIndicator } from '../../../components/TypingIndicator';
import { List } from 'react-window';


const MessageRow = ({ index, style, conversationState, userId, ariaAttributes }: any) => {

  const id = conversationState.allIds[index];
  const msg = conversationState.byId[id];

  const isOwn = typeof msg.senderId === 'string'
    ? msg.senderId === userId
    : msg.senderId._id === userId;

  return (
    <div style={style} {...ariaAttributes} className='ffff'>
      <AnimatePresence>
        <MessageBubble key={id} message={msg} isOwn={isOwn} />
      </AnimatePresence>
    </div>
  );
};
MessageRow.displayName = 'MessageRow';

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  // Use React.use to unwrap the Promise
  const resolvedParams = use(params);
  const { conversationId } = resolvedParams;

  const dispatch = useDispatch<AppDispatch>();
  const { accessToken, userId } = useSelector((state: RootState) => state.auth);
  const conversationState = useSelector((state: RootState) =>
    state.messages.byConversationId[conversationId]
  );



  const typingUsers = useSelector((state: RootState) =>
    state.presence.typingByConversation[conversationId] || []
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  // Connect socket and fetch messages
  useEffect(() => {
    if (!accessToken) return;



    dispatch(connectSocket(accessToken));
    dispatch(fetchMessages({ conversationId }));
    dispatch(joinRoom(conversationId));

    return () => {
      dispatch(disconnectSocket());
    };
  }, [conversationId, accessToken, dispatch]);

  // Scroll to bottom and handle read receipts
  useEffect(() => {
    if (scrollRef.current && conversationState?.allIds.length) {
      (scrollRef.current as any).scrollToRow({ index: conversationState.allIds.length - 1 });
    }

    // Mark all received messages as read
    if (conversationState && conversationState.allIds.length > 0 && userId) {
      const lastMsgId = conversationState.allIds[conversationState.allIds.length - 1];
      const lastMsg = conversationState.byId[lastMsgId];

      const isSender = typeof lastMsg.senderId === 'string'
        ? lastMsg.senderId === userId
        : lastMsg.senderId._id === userId;

      const hasRead = lastMsg.readBy?.some(r => r.userId === userId);

      if (!isSender && !hasRead && lastMsg._id) {
        dispatch(sendReadReceipt({ conversationId, messageId: lastMsg._id }));
      }
      
      // Mark conversation as read locally to clear unread badges instantly
      import('../../../features/conversations/conversationsSlice').then(({ clearUnreadCount }) => {
        dispatch(clearUnreadCount(conversationId));
      });
    }
  }, [conversationState, conversationId, userId, dispatch]);

  const getItemSize = (index: number) => {
    if (!conversationState) return 60;
    const id = conversationState.allIds[index];
    const msg = conversationState.byId[id];
    let height = 70; // Base padding/margin
    if (msg.body) {
      height += Math.ceil(msg.body.length / 40) * 20;
    }
    if (msg.attachments && msg.attachments.length > 0) {
      height += msg.attachments.length * 160;
    }
    return height;
  };

  return (
    <DropzoneArea>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            flex: 1,
            padding: '10px 20px',
            minHeight: 0,
          }}
        >
          {!conversationState || conversationState.allIds.length === 0 ? (
            <div style={{ margin: 'auto', color: '#666', textAlign: 'center', marginTop: '20px' }}>No messages yet.</div>
          ) : (
            <>
              <List
                rowCount={conversationState.allIds.length}
                rowHeight={getItemSize}
                style={{ height: '100%', width: '100%' }}
                listRef={scrollRef as any}
                rowComponent={MessageRow}
                rowProps={{ conversationState, userId }}
              />
            </>
          )}
        </div>
        <div style={{ padding: '0 20px' }}>
          {typingUsers.filter((id: string) => id !== userId).length > 0 && (
            <TypingIndicator />
          )}
        </div>

        <Composer conversationId={conversationId} onSend={(text, files) => {

          dispatch(sendAsyncMessage({
            conversationId,
            body: text,
            files,
            clientTempId: Math.random().toString()
          }));
        }} />
      </div>
    </DropzoneArea>
  );
}
