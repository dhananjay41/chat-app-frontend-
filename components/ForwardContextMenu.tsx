
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { forwardMessage } from '../store/socketMiddleware';
import { Message } from '../features/messages/messagesSlice';

export default function ForwardContextMenu({ 
  message, 
  availableConversations, 
  onClose 
}: { 
  message: Message; 
  availableConversations: { id: string; name: string }[];
  onClose: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const handleForward = (targetConversationId: string) => {
    if (message._id) {
      // eslint-disable-next-line
      const clientTempId = `temp_fwd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      dispatch(forwardMessage({ 
        originalMessage: message, 
        targetConversationId, 
        clientTempId 
      }));
    }
    onClose();
  };

  return (
    <div style={{
      position: 'absolute',
      background: '#222',
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '10px',
      zIndex: 100,
      minWidth: '200px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      // Note: for a true context menu, we'd position this at the pointer coordinates.
      // For this MVP, we position it relative to the message bubble.
      bottom: '100%',
      right: 0,
      marginBottom: '5px'
    }}>
      <div style={{ fontSize: '0.85em', color: '#888', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #444' }}>
        Forward to...
      </div>
      <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
        {availableConversations.length === 0 ? (
          <div style={{ padding: '8px', color: '#666', fontSize: '0.9em' }}>No other conversations</div>
        ) : (
          availableConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => handleForward(conv.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleForward(conv.id);
                }
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: 'white',
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '4px',
                outline: 'none',
              }}
              className="focus-ring"
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onFocus={(e) => e.currentTarget.style.background = '#333'}
              onBlur={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {conv.name}
            </button>
          ))
        )}
      </div>
      <button 
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
        className="focus-ring"
        style={{
          display: 'block', width: '100%', marginTop: '8px', padding: '6px',
          background: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
          outline: 'none',
        }}
      >
        Cancel
      </button>
    </div>
  );
}
