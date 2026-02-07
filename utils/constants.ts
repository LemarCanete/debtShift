/**
 * Debt type options
 */
export const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card', color: '#6366F1' },
  { value: 'student_loan', label: 'Student Loan', color: '#10B981' },
  { value: 'personal_loan', label: 'Personal Loan', color: '#F59E0B' },
  { value: 'medical', label: 'Medical', color: '#EF4444' },
  { value: 'auto', label: 'Auto Loan', color: '#8B5CF6' },
  { value: 'mortgage', label: 'Mortgage', color: '#3B82F6' },
  { value: 'other', label: 'Other', color: '#6B7280' },
] as const;

export type DebtType = (typeof DEBT_TYPES)[number]['value'];

/**
 * Income source options
 */
export const INCOME_SOURCES = [
  { value: 'primary', label: 'Primary Job', icon: 'briefcase' },
  { value: 'side_hustle', label: 'Side Hustle', icon: 'trending-up' },
  { value: 'bonus', label: 'Bonus', icon: 'gift' },
  { value: 'other', label: 'Other', icon: 'more-horizontal' },
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number]['value'];

/**
 * Income type options
 */
export const INCOME_TYPES = [
  {
    value: 'steady',
    label: 'Steady',
    description: 'Same amount every month',
    icon: 'trending-up',
  },
  {
    value: 'variable',
    label: 'Variable',
    description: 'Changes month to month',
    icon: 'activity',
  },
  {
    value: 'mixed',
    label: 'Mixed',
    description: 'Some steady, some variable',
    icon: 'shuffle',
  },
] as const;

export type IncomeType = (typeof INCOME_TYPES)[number]['value'];

/**
 * Payoff strategy options
 */
export const PAYOFF_STRATEGIES = [
  {
    value: 'avalanche',
    label: 'Avalanche',
    description: 'Pay highest APR first (saves the most money)',
    icon: 'trending-down',
  },
  {
    value: 'snowball',
    label: 'Snowball',
    description: 'Pay smallest balance first (quick wins)',
    icon: 'target',
  },
] as const;

export type PayoffStrategy = (typeof PAYOFF_STRATEGIES)[number]['value'];

/**
 * Subscription tier options
 */
export const SUBSCRIPTION_TIERS = [
  {
    value: 'free',
    label: 'Free',
    aiMessages: 5,
    features: ['Basic tracking', 'Budget calculator', '5 AI messages/month'],
  },
  {
    value: 'pro',
    label: 'Pro',
    aiMessages: 50,
    features: [
      'Unlimited debts',
      'Payment reminders',
      '50 AI messages/month',
      'All lessons',
    ],
  },
  {
    value: 'proplus',
    label: 'Pro+',
    aiMessages: -1, // unlimited
    features: [
      'Everything in Pro',
      'Unlimited AI messages',
      'Priority support',
      'Export data',
    ],
  },
  {
    value: 'family',
    label: 'Family',
    aiMessages: -1, // unlimited
    features: [
      'Everything in Pro+',
      'Up to 5 family members',
      'Shared goals',
      'Family dashboard',
    ],
  },
] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]['value'];

/**
 * Journal entry type options
 */
export const JOURNAL_ENTRY_TYPES = [
  { value: 'reflection', label: 'Reflection', icon: 'book-open' },
  { value: 'win', label: 'Win', icon: 'award' },
  { value: 'setback', label: 'Setback', icon: 'alert-circle' },
  { value: 'call_log', label: 'Call Log', icon: 'phone' },
] as const;

export type JournalEntryType = (typeof JOURNAL_ENTRY_TYPES)[number]['value'];

/**
 * Reminder repeat options
 */
export const REMINDER_REPEATS = [
  { value: 'none', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

export type ReminderRepeat = (typeof REMINDER_REPEATS)[number]['value'];

/**
 * Lesson category options
 */
export const LESSON_CATEGORIES = [
  { value: 'basics', label: 'Basics', icon: 'book' },
  { value: 'budgeting', label: 'Budgeting', icon: 'pie-chart' },
  { value: 'negotiation', label: 'Negotiation', icon: 'message-circle' },
  { value: 'mindset', label: 'Mindset', icon: 'heart' },
] as const;

export type LessonCategory = (typeof LESSON_CATEGORIES)[number]['value'];

/**
 * Milestone type options
 */
export const MILESTONE_TYPES = [
  { value: 'progress_10', label: '10% Paid Off', threshold: 10 },
  { value: 'progress_25', label: '25% Paid Off', threshold: 25 },
  { value: 'progress_50', label: '50% Paid Off', threshold: 50 },
  { value: 'progress_75', label: '75% Paid Off', threshold: 75 },
  { value: 'progress_100', label: 'Debt Free!', threshold: 100 },
  { value: 'payment_streak', label: 'Payment Streak', threshold: null },
  { value: 'first_payment', label: 'First Payment', threshold: null },
  { value: 'first_extra', label: 'First Extra Payment', threshold: null },
] as const;

export type MilestoneType = (typeof MILESTONE_TYPES)[number]['value'];

/**
 * Mood options for journal entries
 */
export const MOODS = [
  { value: 1, label: 'Struggling', emoji: '😔' },
  { value: 2, label: 'Worried', emoji: '😟' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Hopeful', emoji: '🙂' },
  { value: 5, label: 'Motivated', emoji: '😊' },
] as const;

/**
 * App-wide limits and thresholds
 */
export const LIMITS = {
  MAX_DEBTS_FREE: 5,
  MAX_DEBTS_PAID: 50,
  AI_MESSAGES_FREE: 5,
  AI_MESSAGES_PRO: 50,
  PAYMENT_STREAK_RESET_HOURS: 48,
  QUOTE_ROTATION_DAYS: 1,
  MAX_BALANCE: 999999999.99,
  MAX_APR: 100,
  MIN_PAYMENT: 0.01,
} as const;

/**
 * Default colors for debt visualization
 */
export const DEBT_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#14B8A6', // Teal
] as const;

/**
 * Get a color for a debt based on its index
 */
export function getDebtColor(index: number): string {
  return DEBT_COLORS[index % DEBT_COLORS.length];
}

/**
 * Get label for a debt type
 */
export function getDebtTypeLabel(type: DebtType): string {
  return DEBT_TYPES.find((t) => t.value === type)?.label ?? 'Unknown';
}

/**
 * Get label for an income source
 */
export function getIncomeSourceLabel(source: IncomeSource): string {
  return INCOME_SOURCES.find((s) => s.value === source)?.label ?? 'Unknown';
}
