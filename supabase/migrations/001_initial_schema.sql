-- DebtShift MVP Initial Schema
-- Version: 001
-- Created: 2026-02-08

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Reference Tables (no user ownership)
-- ============================================

-- Expense categories (reference data)
CREATE TABLE expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  is_essential boolean DEFAULT false,
  sort_order integer DEFAULT 0
);

-- Lessons (educational content)
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('basics', 'budgeting', 'negotiation', 'mindset')),
  title text NOT NULL,
  duration_mins integer NOT NULL CHECK (duration_mins > 0),
  content text NOT NULL,
  sort_order integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Creditors (playbook reference data)
CREATE TABLE creditors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  phone text,
  best_call_times text,
  hardship_program text,
  rate_reduction_script text,
  settlement_script text,
  success_rate integer CHECK (success_rate >= 0 AND success_rate <= 100),
  created_at timestamptz DEFAULT now()
);

-- Daily quotes (motivational content)
CREATE TABLE daily_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_type text NOT NULL CHECK (quote_type IN ('quote', 'verse')),
  text text NOT NULL,
  author text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- User-owned Tables
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  income_type text CHECK (income_type IN ('steady', 'variable', 'mixed')),
  income_min decimal(12,2) CHECK (income_min >= 0),
  income_typical decimal(12,2) CHECK (income_typical >= 0),
  income_max decimal(12,2) CHECK (income_max >= 0),
  payoff_strategy text DEFAULT 'avalanche' CHECK (payoff_strategy IN ('snowball', 'avalanche')),
  why_i_started text,
  onboarding_completed boolean DEFAULT false,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'proplus', 'family')),
  ai_messages_used integer DEFAULT 0,
  ai_messages_reset_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Debts table
CREATE TABLE debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  creditor text NOT NULL,
  debt_type text NOT NULL CHECK (debt_type IN ('credit_card', 'student_loan', 'personal_loan', 'medical', 'auto', 'mortgage', 'other')),
  balance decimal(12,2) NOT NULL CHECK (balance >= 0),
  original_balance decimal(12,2) NOT NULL CHECK (original_balance >= 0),
  apr decimal(5,2) NOT NULL CHECK (apr >= 0 AND apr <= 100),
  minimum_payment decimal(12,2) NOT NULL CHECK (minimum_payment >= 0),
  due_day integer NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  color text DEFAULT '#6366f1',
  is_active boolean DEFAULT true,
  paid_off_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for dashboard queries
CREATE INDEX idx_debts_user_active ON debts(user_id, is_active);

-- Payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  debt_id uuid NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL,
  is_extra boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Index for payment history
CREATE INDEX idx_payments_debt_date ON payments(debt_id, payment_date DESC);

-- Expenses table
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES expense_categories(id),
  name text NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount >= 0),
  is_essential boolean DEFAULT false,
  is_recurring boolean DEFAULT true,
  due_day integer CHECK (due_day >= 1 AND due_day <= 31),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Income logs table
CREATE TABLE income_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month date NOT NULL, -- First day of month (YYYY-MM-01)
  amount decimal(12,2) NOT NULL CHECK (amount >= 0),
  source text NOT NULL CHECK (source IN ('primary', 'side_hustle', 'bonus', 'other')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Index and unique constraint for budget calculations
CREATE INDEX idx_income_logs_user_month ON income_logs(user_id, month);
CREATE UNIQUE INDEX idx_income_logs_unique ON income_logs(user_id, month, source);

-- Monthly budgets table
CREATE TABLE monthly_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month date NOT NULL,
  total_income decimal(12,2) DEFAULT 0,
  total_essentials decimal(12,2) DEFAULT 0,
  total_non_essentials decimal(12,2) DEFAULT 0,
  total_minimums decimal(12,2) DEFAULT 0,
  safe_to_extra decimal(12,2),
  actual_extra_paid decimal(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unique constraint for one budget per month
CREATE UNIQUE INDEX idx_monthly_budgets_unique ON monthly_budgets(user_id, month);

-- Planned payments table
CREATE TABLE planned_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  debt_id uuid NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  planned_date date NOT NULL,
  planned_amount decimal(12,2) NOT NULL CHECK (planned_amount > 0),
  is_extra boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index for calendar view
CREATE INDEX idx_planned_payments_user_date ON planned_payments(user_id, planned_date);

-- Reminders table
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  debt_id uuid REFERENCES debts(id) ON DELETE SET NULL,
  title text NOT NULL,
  reminder_date date NOT NULL,
  reminder_time time DEFAULT '09:00:00',
  repeat text DEFAULT 'none' CHECK (repeat IN ('none', 'daily', 'weekly', 'monthly')),
  is_completed boolean DEFAULT false,
  push_token text,
  created_at timestamptz DEFAULT now()
);

-- Index for pending reminders
CREATE INDEX idx_reminders_pending ON reminders(user_id, reminder_date, is_completed);

-- Journal entries table
CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  debt_id uuid REFERENCES debts(id) ON DELETE SET NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('reflection', 'win', 'setback', 'call_log')),
  title text NOT NULL,
  content text,
  mood integer CHECK (mood >= 1 AND mood <= 5),
  creditor_name text,
  rep_name text,
  call_outcome text,
  created_at timestamptz DEFAULT now()
);

-- Index for journal list
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, created_at DESC);

-- Chat messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for chat history
CREATE INDEX idx_chat_messages_user_date ON chat_messages(user_id, created_at DESC);

-- Lesson progress table
CREATE TABLE lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  quiz_score integer CHECK (quiz_score >= 0 AND quiz_score <= 100)
);

-- Unique constraint for one completion per lesson
CREATE UNIQUE INDEX idx_lesson_progress_unique ON lesson_progress(user_id, lesson_id);

-- Milestones table
CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_type text NOT NULL CHECK (milestone_type IN (
    'progress_10', 'progress_25', 'progress_50', 'progress_75', 'progress_100',
    'payment_streak', 'first_payment', 'first_extra'
  )),
  value integer,
  achieved_at timestamptz DEFAULT now()
);

-- Unique constraint for progress milestones (one per type except streaks)
CREATE UNIQUE INDEX idx_milestones_unique ON milestones(user_id, milestone_type)
WHERE milestone_type != 'payment_streak';

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all user-owned tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Debts table policies
CREATE POLICY "Users can view own debts"
  ON debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own debts"
  ON debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts"
  ON debts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts"
  ON debts FOR DELETE
  USING (auth.uid() = user_id);

-- Payments table policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments"
  ON payments FOR DELETE
  USING (auth.uid() = user_id);

-- Expenses table policies
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Income logs table policies
CREATE POLICY "Users can view own income logs"
  ON income_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own income logs"
  ON income_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income logs"
  ON income_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own income logs"
  ON income_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Monthly budgets table policies
CREATE POLICY "Users can view own monthly budgets"
  ON monthly_budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own monthly budgets"
  ON monthly_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly budgets"
  ON monthly_budgets FOR UPDATE
  USING (auth.uid() = user_id);

-- Planned payments table policies
CREATE POLICY "Users can view own planned payments"
  ON planned_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own planned payments"
  ON planned_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planned payments"
  ON planned_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planned payments"
  ON planned_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Reminders table policies
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Journal entries table policies
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Chat messages table policies
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Lesson progress table policies
CREATE POLICY "Users can view own lesson progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lesson progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Milestones table policies
CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public read access for reference tables
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE creditors ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for expense_categories"
  ON expense_categories FOR SELECT
  USING (true);

CREATE POLICY "Public read access for lessons"
  ON lessons FOR SELECT
  USING (true);

CREATE POLICY "Public read access for creditors"
  ON creditors FOR SELECT
  USING (true);

CREATE POLICY "Public read access for daily_quotes"
  ON daily_quotes FOR SELECT
  USING (true);

-- ============================================
-- Database Functions
-- ============================================

-- Calculate safe-to-extra amount for a given month
CREATE OR REPLACE FUNCTION calculate_safe_to_extra(
  p_user_id uuid,
  p_month date
) RETURNS decimal(12,2) AS $$
DECLARE
  v_income decimal(12,2);
  v_essentials decimal(12,2);
  v_non_essentials decimal(12,2);
  v_minimums decimal(12,2);
BEGIN
  -- Sum income for month
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM income_logs
  WHERE user_id = p_user_id AND month = p_month;

  -- Sum essential expenses
  SELECT COALESCE(SUM(amount), 0) INTO v_essentials
  FROM expenses
  WHERE user_id = p_user_id AND is_essential = true;

  -- Sum non-essential expenses
  SELECT COALESCE(SUM(amount), 0) INTO v_non_essentials
  FROM expenses
  WHERE user_id = p_user_id AND is_essential = false;

  -- Sum minimum payments
  SELECT COALESCE(SUM(minimum_payment), 0) INTO v_minimums
  FROM debts
  WHERE user_id = p_user_id AND is_active = true;

  RETURN v_income - v_essentials - v_non_essentials - v_minimums;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate overall debt payoff progress percentage
CREATE OR REPLACE FUNCTION calculate_debt_progress(
  p_user_id uuid
) RETURNS decimal(5,2) AS $$
DECLARE
  v_original decimal(12,2);
  v_current decimal(12,2);
BEGIN
  SELECT
    COALESCE(SUM(original_balance), 0),
    COALESCE(SUM(balance), 0)
  INTO v_original, v_current
  FROM debts
  WHERE user_id = p_user_id AND is_active = true;

  IF v_original = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND(((v_original - v_current) / v_original) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and award milestones after payment
CREATE OR REPLACE FUNCTION check_milestone_achievement()
RETURNS TRIGGER AS $$
DECLARE
  v_progress decimal(5,2);
  v_milestone_types text[] := ARRAY['progress_10', 'progress_25', 'progress_50', 'progress_75', 'progress_100'];
  v_milestone_thresholds int[] := ARRAY[10, 25, 50, 75, 100];
  i int;
  v_payment_count int;
BEGIN
  -- Calculate current progress
  v_progress := calculate_debt_progress(NEW.user_id);

  -- Check progress milestones
  FOR i IN 1..array_length(v_milestone_types, 1) LOOP
    IF v_progress >= v_milestone_thresholds[i] THEN
      INSERT INTO milestones (user_id, milestone_type)
      VALUES (NEW.user_id, v_milestone_types[i])
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Check first payment milestone
  SELECT COUNT(*) INTO v_payment_count
  FROM payments
  WHERE user_id = NEW.user_id;

  IF v_payment_count = 1 THEN
    INSERT INTO milestones (user_id, milestone_type)
    VALUES (NEW.user_id, 'first_payment')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Check first extra payment milestone
  IF NEW.is_extra = true THEN
    INSERT INTO milestones (user_id, milestone_type)
    VALUES (NEW.user_id, 'first_extra')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for milestone checking
CREATE TRIGGER payment_milestone_check
AFTER INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION check_milestone_achievement();

-- Update debt balance after payment
CREATE OR REPLACE FUNCTION update_debt_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_new_balance decimal(12,2);
BEGIN
  -- Calculate new balance (never go below 0)
  SELECT GREATEST(0, balance - NEW.amount) INTO v_new_balance
  FROM debts
  WHERE id = NEW.debt_id;

  -- Update the debt balance
  UPDATE debts
  SET
    balance = v_new_balance,
    updated_at = now(),
    paid_off_at = CASE WHEN v_new_balance = 0 THEN now() ELSE paid_off_at END
  WHERE id = NEW.debt_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for balance update
CREATE TRIGGER payment_balance_update
AFTER INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION update_debt_balance();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER monthly_budgets_updated_at
  BEFORE UPDATE ON monthly_budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
