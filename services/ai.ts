import { supabase } from './supabase';
import type { Debt, User } from '@/types/database';

/**
 * AI Companion Service
 * T094: Create services/ai.ts with sendMessage function calling Edge Function
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface UserContext {
  debts: Array<{
    name: string;
    creditor: string;
    balance: number;
    original_balance: number;
    apr: number;
    minimum_payment: number;
  }>;
  totalDebt: number;
  totalOriginal: number;
  progressPercent: number;
  payoffStrategy: string;
  whyIStarted: string | null;
  safeToExtra: number | null;
}

export interface SendMessageResponse {
  message: string;
  messagesUsed: number;
  messagesRemaining: number;
  monthlyLimit: number;
}

export interface AIError {
  message: string;
  code?: string;
  limit?: number;
  used?: number;
  tier?: string;
  resetAt?: string;
}

export interface AIResult<T = void> {
  data: T | null;
  error: AIError | null;
}

/**
 * Build user context from debts and user profile
 */
export function buildUserContext(
  debts: Debt[],
  user: User | null,
  safeToExtra: number | null
): UserContext {
  const activeDebts = debts.filter((d) => d.is_active);
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalOriginal = activeDebts.reduce((sum, d) => sum + d.original_balance, 0);
  const progressPercent = totalOriginal > 0
    ? ((totalOriginal - totalDebt) / totalOriginal) * 100
    : 0;

  return {
    debts: activeDebts.map((d) => ({
      name: d.name,
      creditor: d.creditor,
      balance: d.balance,
      original_balance: d.original_balance,
      apr: d.apr,
      minimum_payment: d.minimum_payment,
    })),
    totalDebt,
    totalOriginal,
    progressPercent,
    payoffStrategy: user?.payoff_strategy || 'avalanche',
    whyIStarted: user?.why_i_started || null,
    safeToExtra,
  };
}

/**
 * Send a message to the AI companion
 */
export async function sendMessage(
  message: string,
  conversationHistory: ChatMessage[],
  userContext: UserContext
): Promise<AIResult<SendMessageResponse>> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-companion', {
      body: {
        message,
        conversationHistory: conversationHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        userContext,
      },
    });

    if (error) {
      return {
        data: null,
        error: { message: error.message, code: 'FUNCTION_ERROR' },
      };
    }

    // Check for rate limit error
    if (data.error) {
      return {
        data: null,
        error: {
          message: data.error,
          code: 'RATE_LIMIT',
          limit: data.limit,
          used: data.used,
          tier: data.tier,
          resetAt: data.resetAt,
        },
      };
    }

    return {
      data: {
        message: data.message,
        messagesUsed: data.messagesUsed,
        messagesRemaining: data.messagesRemaining,
        monthlyLimit: data.monthlyLimit,
      },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : 'Failed to send message',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

/**
 * Get chat history for the current user
 */
export async function getChatHistory(): Promise<AIResult<ChatMessage[]>> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: (data || []) as ChatMessage[],
    error: null,
  };
}

/**
 * Clear chat history for the current user
 */
export async function clearChatHistory(): Promise<AIResult<void>> {
  const { error } = await supabase.from('chat_messages').delete().neq('id', '');

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: undefined, error: null };
}

/**
 * Get AI message usage stats for the current user
 */
export async function getMessageUsage(): Promise<
  AIResult<{
    used: number;
    limit: number;
    remaining: number;
    tier: string;
    resetAt: string | null;
  }>
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
    };
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('subscription_tier, ai_messages_used, ai_messages_reset_at')
    .eq('id', user.id)
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  const tier = profile.subscription_tier || 'free';
  const limits: Record<string, number> = {
    free: 5,
    pro: 50,
    proplus: 200,
    family: 200,
  };
  const limit = limits[tier] || 5;

  // Check if we need to consider a reset
  const now = new Date();
  const resetAt = profile.ai_messages_reset_at
    ? new Date(profile.ai_messages_reset_at)
    : null;
  const shouldReset =
    !resetAt ||
    resetAt.getMonth() !== now.getMonth() ||
    resetAt.getFullYear() !== now.getFullYear();

  const used = shouldReset ? 0 : profile.ai_messages_used || 0;

  return {
    data: {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      tier,
      resetAt: profile.ai_messages_reset_at,
    },
    error: null,
  };
}

/**
 * Suggested questions for new users or conversation starters
 */
export const SUGGESTED_QUESTIONS = [
  {
    id: 'getting-started',
    text: 'What should I focus on first?',
    category: 'strategy',
  },
  {
    id: 'extra-payment',
    text: 'Where should I put extra money?',
    category: 'strategy',
  },
  {
    id: 'motivation',
    text: "I'm feeling overwhelmed. Help!",
    category: 'support',
  },
  {
    id: 'celebration',
    text: 'I just made an extra payment!',
    category: 'celebration',
  },
  {
    id: 'explain-strategy',
    text: 'Explain avalanche vs snowball',
    category: 'education',
  },
  {
    id: 'tough-month',
    text: "It's been a tough month...",
    category: 'support',
  },
];
