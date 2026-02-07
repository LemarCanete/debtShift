import { z } from 'zod';
import {
  DEBT_TYPES,
  INCOME_SOURCES,
  INCOME_TYPES,
  PAYOFF_STRATEGIES,
  JOURNAL_ENTRY_TYPES,
  REMINDER_REPEATS,
  LESSON_CATEGORIES,
  SUBSCRIPTION_TIERS,
  LIMITS,
} from './constants';

// ============================================
// Common schemas
// ============================================

export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

export const uuidSchema = z.string().uuid('Invalid ID format');

export const moneySchema = z
  .number()
  .min(0, 'Amount cannot be negative')
  .max(LIMITS.MAX_BALANCE, 'Amount is too large');

export const aprSchema = z
  .number()
  .min(0, 'APR cannot be negative')
  .max(LIMITS.MAX_APR, 'APR cannot exceed 100%');

export const dayOfMonthSchema = z
  .number()
  .int()
  .min(1, 'Day must be between 1 and 31')
  .max(31, 'Day must be between 1 and 31');

// ============================================
// User schemas
// ============================================

export const userProfileSchema = z.object({
  income_type: z.enum(['steady', 'variable', 'mixed']).nullable(),
  income_min: moneySchema.nullable(),
  income_typical: moneySchema.nullable(),
  income_max: moneySchema.nullable(),
  payoff_strategy: z.enum(['snowball', 'avalanche']).nullable(),
  why_i_started: z.string().max(1000).nullable(),
  onboarding_completed: z.boolean(),
});

export const onboardingIncomeSchema = z
  .object({
    income_type: z.enum(['steady', 'variable', 'mixed']),
    income_min: moneySchema,
    income_typical: moneySchema,
    income_max: moneySchema,
  })
  .refine(
    (data) => data.income_min <= data.income_typical,
    { message: 'Minimum income cannot exceed typical income', path: ['income_min'] }
  )
  .refine(
    (data) => data.income_typical <= data.income_max,
    { message: 'Typical income cannot exceed maximum income', path: ['income_typical'] }
  );

// ============================================
// Debt schemas
// ============================================

export const debtTypeSchema = z.enum([
  'credit_card',
  'student_loan',
  'personal_loan',
  'medical',
  'auto',
  'mortgage',
  'other',
]);

export const debtSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  creditor: z
    .string()
    .min(1, 'Creditor is required')
    .max(100, 'Creditor name is too long'),
  debt_type: debtTypeSchema,
  balance: moneySchema.refine((v) => v > 0, 'Balance must be greater than 0'),
  original_balance: moneySchema.refine(
    (v) => v > 0,
    'Original balance must be greater than 0'
  ),
  apr: aprSchema,
  minimum_payment: moneySchema.refine(
    (v) => v >= LIMITS.MIN_PAYMENT,
    'Minimum payment is required'
  ),
  due_day: dayOfMonthSchema,
  color: z.string().optional(),
});

export const debtCreateSchema = debtSchema.refine(
  (data) => data.balance <= data.original_balance,
  { message: 'Current balance cannot exceed original balance', path: ['balance'] }
);

export const debtUpdateSchema = debtSchema.partial();

// ============================================
// Payment schemas
// ============================================

export const paymentSchema = z.object({
  debt_id: uuidSchema,
  amount: moneySchema.refine(
    (v) => v >= LIMITS.MIN_PAYMENT,
    'Payment must be at least $0.01'
  ),
  payment_date: z.string().refine(
    (v) => !isNaN(Date.parse(v)),
    'Invalid date format'
  ),
  is_extra: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

// ============================================
// Expense schemas
// ============================================

export const expenseSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  amount: moneySchema,
  category_id: uuidSchema.optional().nullable(),
  is_essential: z.boolean().default(false),
  is_recurring: z.boolean().default(true),
  due_day: dayOfMonthSchema.optional().nullable(),
});

// ============================================
// Income schemas
// ============================================

export const incomeSourceSchema = z.enum(['primary', 'side_hustle', 'bonus', 'other']);

export const incomeLogSchema = z.object({
  month: z.string().refine(
    (v) => /^\d{4}-\d{2}-01$/.test(v),
    'Month must be in YYYY-MM-01 format'
  ),
  amount: moneySchema,
  source: incomeSourceSchema,
  notes: z.string().max(500).optional(),
});

// ============================================
// Budget schemas
// ============================================

export const monthlyBudgetSchema = z.object({
  month: z.string(),
  total_income: moneySchema,
  total_essentials: moneySchema,
  total_non_essentials: moneySchema,
  total_minimums: moneySchema,
  safe_to_extra: z.number(), // Can be negative
  actual_extra_paid: moneySchema,
});

// ============================================
// Planned payment schemas
// ============================================

export const plannedPaymentSchema = z.object({
  debt_id: uuidSchema,
  planned_date: z.string(),
  planned_amount: moneySchema.refine(
    (v) => v >= LIMITS.MIN_PAYMENT,
    'Planned amount must be at least $0.01'
  ),
  is_extra: z.boolean().default(false),
});

// ============================================
// Reminder schemas
// ============================================

export const reminderRepeatSchema = z.enum(['none', 'daily', 'weekly', 'monthly']);

export const reminderSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title is too long'),
  debt_id: uuidSchema.optional().nullable(),
  reminder_date: z.string(),
  reminder_time: z.string().optional().default('09:00:00'),
  repeat: reminderRepeatSchema.default('none'),
});

// ============================================
// Journal schemas
// ============================================

export const journalEntryTypeSchema = z.enum([
  'reflection',
  'win',
  'setback',
  'call_log',
]);

export const moodSchema = z.number().int().min(1).max(5);

export const journalEntrySchema = z.object({
  entry_type: journalEntryTypeSchema,
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  content: z.string().max(5000).optional(),
  debt_id: uuidSchema.optional().nullable(),
  mood: moodSchema.optional().nullable(),
  // Call log specific fields
  creditor_name: z.string().max(100).optional(),
  rep_name: z.string().max(100).optional(),
  call_outcome: z.string().max(500).optional(),
});

// ============================================
// Chat schemas
// ============================================

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
});

// ============================================
// Auth schemas
// ============================================

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// ============================================
// Type exports
// ============================================

export type UserProfile = z.infer<typeof userProfileSchema>;
export type OnboardingIncome = z.infer<typeof onboardingIncomeSchema>;
export type DebtInput = z.infer<typeof debtSchema>;
export type DebtCreate = z.infer<typeof debtCreateSchema>;
export type DebtUpdate = z.infer<typeof debtUpdateSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type IncomeLogInput = z.infer<typeof incomeLogSchema>;
export type PlannedPaymentInput = z.infer<typeof plannedPaymentSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
