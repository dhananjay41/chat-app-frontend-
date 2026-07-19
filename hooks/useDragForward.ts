import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { dragStarted, dragMoved, dragEnded, setPendingDragDropForward } from '../features/dragForward/dragForwardSlice';
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';

export function useDragForward() {
  const dispatch = useDispatch<AppDispatch>();
  const { activeMessageId, overTargetId } = useSelector((state: RootState) => state.dragForward);

  const onDragStart = useCallback((event: DragStartEvent) => {
    dispatch(dragStarted({ 
      messageId: event.active.id as string, 
      sourceConversationId: event.active.data.current?.conversationId 
    }));
  }, [dispatch]);

  const onDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id ? (event.over.id as string) : null;
    dispatch(dragMoved({ overTargetId: overId }));
  }, [dispatch]);

  const onDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id) {
      const targetConversationId = over.id as string;
      const originalMessageId = active.id as string;
      const srcConvId = active.data.current?.message?.conversationId || active.data.current?.conversationId;
      const message = active.data.current?.message;
      const targetName = over.data.current?.conversation?.name || 'Unknown';

      if (targetConversationId && originalMessageId && targetConversationId !== srcConvId && message) {
        dispatch(setPendingDragDropForward({
          message,
          targetConversationId,
          targetName
        }));
      }
    }

    dispatch(dragEnded());
  }, [dispatch]);

  const onDragCancel = useCallback(() => {
    dispatch(dragEnded());
  }, [dispatch]);

  return {
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    activeMessageId,
    overTargetId,
  };
}
