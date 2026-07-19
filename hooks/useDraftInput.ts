import { useState, useEffect, useCallback } from 'react';

// Stub hook to simulate Redux-persist draft behavior per Part 2 §2.3
// This debounces the write (~300ms) to a local storage mock for now.

export function useDraftInput(conversationId: string, userId: string) {
  const [draft, setDraft] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  const draftKey = `draft_${userId}_${conversationId}`;

  // Rehydrate before first paint/interaction (Part 2 §2.3)
  useEffect(() => {
    if (!userId) return;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setDraft(savedDraft);
    } else {
      setDraft('');
    }
    setIsReady(true);
  }, [draftKey, userId]);

  // Debounced save
  useEffect(() => {
    if (!isReady || !userId) return;
    
    const handler = setTimeout(() => {
      if (draft.trim() === '') {
        localStorage.removeItem(draftKey);
      } else {
        localStorage.setItem(draftKey, draft);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [draft, draftKey, isReady, userId]);

  const clearDraft = useCallback(() => {
    setDraft('');
    localStorage.removeItem(draftKey);
  }, [draftKey]);

  return {
    draft,
    setDraft,
    clearDraft,
    isReady
  };
}
