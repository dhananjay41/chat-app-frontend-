'use client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setPendingDragDropForward } from '../features/dragForward/dragForwardSlice';
import { forwardMessage } from '../store/socketMiddleware';

export function ForwardConfirmationModal() {
  const dispatch = useDispatch<AppDispatch>();
  const pendingForward = useSelector((state: RootState) => state.dragForward.pendingDragDropForward);

  if (!pendingForward) return null;

  const { message, targetConversationId, targetName } = pendingForward;

  const handleConfirm = () => {
    const clientTempId = `temp_fwd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    dispatch(forwardMessage({
      originalMessage: message,
      targetConversationId,
      clientTempId
    }));
    
    dispatch(setPendingDragDropForward(null));
  };

  const handleCancel = () => {
    dispatch(setPendingDragDropForward(null));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
          Confirm Forward
        </h3>
        <p style={{ marginBottom: 'var(--space-6)', color: 'var(--text-secondary)' }}>
          Forward this message to <strong>{targetName}</strong>?
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button
            onClick={handleCancel}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
