import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  sendMessage as sendMessageService,
  getChatHistory,
  clearChatHistory,
  getMessageUsage,
  buildUserContext,
  type ChatMessage,
  type SendMessageResponse,
} from '@/services/ai';
import { useChatStore } from '@/stores/useChatStore';
import { useDebts } from './useDebts';
import { useSafeToExtra } from './useBudget';
import { useAuthStore } from '@/stores/useAuthStore';
import { format } from 'date-fns';

/**
 * Chat Hooks for AI Companion
 * T096: Create hooks/useChat.ts with React Query mutation for sending messages
 */

// Query keys for caching
export const chatKeys = {
  all: ['chat'] as const,
  history: () => [...chatKeys.all, 'history'] as const,
  usage: () => [...chatKeys.all, 'usage'] as const,
};

/**
 * Hook to fetch and manage chat history
 */
export function useChatHistory() {
  const { setMessages, setLoading, setError } = useChatStore();

  const query = useQuery({
    queryKey: chatKeys.history(),
    queryFn: async () => {
      const result = await getChatHistory();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Sync query data with store
  useEffect(() => {
    if (query.data) {
      setMessages(query.data);
    }
  }, [query.data, setMessages]);

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    if (query.error) {
      setError(query.error.message);
    }
  }, [query.error, setError]);

  return query;
}

/**
 * Hook to get message usage stats
 */
export function useMessageUsage() {
  const { setUsage } = useChatStore();

  const query = useQuery({
    queryKey: chatKeys.usage(),
    queryFn: async () => {
      const result = await getMessageUsage();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      setUsage(query.data);
    }
  }, [query.data, setUsage]);

  return query;
}

/**
 * Hook to send messages to the AI companion
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { messages, addMessage, addOptimisticUserMessage, removeOptimisticMessage, setSending, setTyping, setError, setUsage } = useChatStore();
  const { data: debts = [] } = useDebts();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { data: safeToExtra } = useSafeToExtra(currentMonth);
  const user = useAuthStore((state) => state.user);

  const mutation = useMutation({
    mutationFn: async (messageText: string): Promise<{ tempId: string; response: SendMessageResponse }> => {
      const userContext = buildUserContext(debts, user, safeToExtra?.safeToExtra ?? null);
      const result = await sendMessageService(messageText, messages, userContext);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (!result.data) {
        throw new Error('No response received');
      }

      return { tempId: '', response: result.data };
    },
    onMutate: async (messageText) => {
      // Add optimistic user message
      const tempId = addOptimisticUserMessage(messageText);
      setSending(true);
      setTyping(true);
      return { tempId };
    },
    onSuccess: (data, _variables, context) => {
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response.message,
        created_at: new Date().toISOString(),
      };
      addMessage(assistantMessage);

      // Update usage
      setUsage({
        used: data.response.messagesUsed,
        limit: data.response.monthlyLimit,
        remaining: data.response.messagesRemaining,
        tier: 'unknown', // Will be refreshed on next usage query
        resetAt: null,
      });

      // Haptic feedback for response
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: chatKeys.history() });
      queryClient.invalidateQueries({ queryKey: chatKeys.usage() });
    },
    onError: (error, _variables, context) => {
      // Remove optimistic message on error
      if (context?.tempId) {
        removeOptimisticMessage(context.tempId);
      }
      setError(error.message);

      // Haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onSettled: () => {
      setSending(false);
      setTyping(false);
    },
  });

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      mutation.mutate(message);
    },
    [mutation]
  );

  return {
    sendMessage,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    reset: mutation.reset,
  };
}

/**
 * Hook to clear chat history
 */
export function useClearChatHistory() {
  const queryClient = useQueryClient();
  const { clearMessages, setError } = useChatStore();

  const mutation = useMutation({
    mutationFn: async () => {
      const result = await clearChatHistory();
      if (result.error) {
        throw new Error(result.error.message);
      }
    },
    onSuccess: () => {
      clearMessages();
      queryClient.invalidateQueries({ queryKey: chatKeys.history() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      setError(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  return mutation;
}

/**
 * Hook to check if user can send more messages
 */
export function useCanSendMessage() {
  const { usage } = useChatStore();

  if (!usage) return true; // Optimistic - allow until we know otherwise

  return usage.remaining > 0;
}

/**
 * Hook to check if user is at message limit
 */
export function useIsAtMessageLimit() {
  const { usage } = useChatStore();

  if (!usage) return false;

  return usage.remaining === 0;
}
