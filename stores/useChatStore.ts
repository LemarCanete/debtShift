import { create } from 'zustand';
import type { ChatMessage } from '@/services/ai';

/**
 * Chat Store for AI Companion
 * T095: Create stores/useChatStore.ts with messages state and sendMessage action
 */

interface MessageUsage {
  used: number;
  limit: number;
  remaining: number;
  tier: string;
  resetAt: string | null;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  usage: MessageUsage | null;
  isTyping: boolean;
}

interface ChatActions {
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  addOptimisticUserMessage: (content: string) => string;
  updateOptimisticMessage: (tempId: string, actualMessage: ChatMessage) => void;
  removeOptimisticMessage: (tempId: string) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  setUsage: (usage: MessageUsage | null) => void;
  clearMessages: () => void;
  clearError: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  usage: null,
  isTyping: false,

  // Actions
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  addOptimisticUserMessage: (content) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));
    return tempId;
  },

  updateOptimisticMessage: (tempId, actualMessage) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === tempId ? actualMessage : m
      ),
    })),

  removeOptimisticMessage: (tempId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== tempId),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setSending: (sending) => set({ isSending: sending }),

  setTyping: (typing) => set({ isTyping: typing }),

  setError: (error) => set({ error }),

  setUsage: (usage) => set({ usage }),

  clearMessages: () => set({ messages: [] }),

  clearError: () => set({ error: null }),
}));

// Selector hooks for common use cases
export const useChatMessages = () => useChatStore((state) => state.messages);
export const useChatLoading = () => useChatStore((state) => state.isLoading);
export const useChatSending = () => useChatStore((state) => state.isSending);
export const useChatTyping = () => useChatStore((state) => state.isTyping);
export const useChatError = () => useChatStore((state) => state.error);
export const useChatUsage = () => useChatStore((state) => state.usage);
export const useHasMessages = () =>
  useChatStore((state) => state.messages.length > 0);
