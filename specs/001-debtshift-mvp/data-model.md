# Data Model: DebtShift MVP

**Branch**: `001-debtshift-mvp` | **Date**: 2026-02-08

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │───┬───│    debts    │───────│  payments   │
└─────────────┘   │   └─────────────┘       └─────────────┘
       │          │          │
       │          │          │
       │          │   ┌──────┴──────┐
       │          │   │             │
       │          │   ▼             ▼
       │          │ ┌─────────┐ ┌────────────────┐
       │          │ │reminders│ │planned_payments│
       │          │ └─────────┘ └────────────────┘
       │          │
       │          ├───│  expenses   │
       │          │   └─────────────┘
       │          │
       │          ├───│ income_logs │
       │          │   └─────────────┘
       │          │
       │          ├───│monthly_budgets│
       │          │   └───────────────┘
       │          │
       │          ├───│journal_entries│
       │          │   └───────────────┘
       │          │
       │          ├───│chat_messages │
       │          │   └──────────────┘
       │          │
       │          ├───│lesson_progress│
       │          │   └───────────────┘
       │          │
       │          └───│  milestones  │
       │              └──────────────┘
       │
       ▼
┌──────────────────┐
│expense_categories│ (reference data)
└──────────────────┘

┌─────────────┐
│  creditors  │ (reference data)
└─────────────┘

┌─────────────┐
│   lessons   │ (reference data)
└─────────────┘

┌──────────────┐
│daily_quotes │ (reference data)
└──────────────┘
```

## Entity Definitions

### users

User account and profile information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| email | text | UNIQUE, NOT NULL | Login email |
| income_type | text | CHECK (steady, variable, mixed) | Income stability type |
| income_min | decimal(12,2) | >= 0 | Minimum expected monthly income |
| income_typical | decimal(12,2) | >= 0 | Typical monthly income |
| income_max | decimal(12,2) | >= 0 | Maximum expected monthly income |
| payoff_strategy | text | CHECK (snowball, avalanche), default 'avalanche' | Debt payoff method |
| why_i_started | text | | User's motivation statement |
| onboarding_completed | boolean | default false | Whether onboarding is done |
| subscription_tier | text | CHECK (free, pro, proplus, family), default 'free' | Subscription level |
| ai_messages_used | integer | default 0 | AI messages used this month |
| ai_messages_reset_at | timestamptz | | When AI counter resets |
| created_at | timestamptz | default now() | Account creation time |
| updated_at | timestamptz | default now() | Last update time |

**RLS Policy**: Users can only read/write their own row.

### debts

Individual debt accounts tracked by user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| name | text | NOT NULL | User-friendly name |
| creditor | text | NOT NULL | Creditor/lender name |
| debt_type | text | CHECK (credit_card, student_loan, personal_loan, medical, auto, mortgage, other) | Category |
| balance | decimal(12,2) | >= 0, NOT NULL | Current balance |
| original_balance | decimal(12,2) | >= 0, NOT NULL | Starting balance |
| apr | decimal(5,2) | >= 0, NOT NULL | Annual percentage rate |
| minimum_payment | decimal(12,2) | >= 0, NOT NULL | Minimum monthly payment |
| due_day | integer | CHECK (1-31), NOT NULL | Day of month payment due |
| color | text | default '#6366f1' | UI color for charts |
| is_active | boolean | default true | Whether debt is being tracked |
| paid_off_at | timestamptz | | When balance reached 0 |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last update time |

**RLS Policy**: Users can only access their own debts.
**Index**: (user_id, is_active) for dashboard queries.

### payments

Payment records for debt accounts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| debt_id | uuid | FK → debts(id), NOT NULL | Target debt |
| amount | decimal(12,2) | > 0, NOT NULL | Payment amount |
| payment_date | date | NOT NULL | Date payment was made |
| is_extra | boolean | default false | Whether this exceeds minimum |
| notes | text | | Optional notes |
| created_at | timestamptz | default now() | Record creation time |

**RLS Policy**: Users can only access their own payments.
**Index**: (debt_id, payment_date DESC) for payment history.
**Trigger**: After INSERT, update debt.balance -= amount.

### expenses

Recurring and one-time expenses.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| category_id | uuid | FK → expense_categories(id) | Category reference |
| name | text | NOT NULL | Expense description |
| amount | decimal(12,2) | >= 0, NOT NULL | Monthly amount |
| is_essential | boolean | default false | Essential vs discretionary |
| is_recurring | boolean | default true | Recurring vs one-time |
| due_day | integer | CHECK (1-31) | Day of month if applicable |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last update time |

**RLS Policy**: Users can only access their own expenses.

### expense_categories

Reference data for expense categorization.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| name | text | UNIQUE, NOT NULL | Category name |
| icon | text | NOT NULL | Icon identifier |
| is_essential | boolean | default false | Default essential flag |
| sort_order | integer | default 0 | Display order |

**Seed Data**: Rent/Mortgage, Utilities, Groceries, Transport, Insurance, Subscriptions, Dining, Entertainment, Shopping, Other.

### income_logs

Monthly income entries supporting variable income.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| month | date | NOT NULL | First day of month (YYYY-MM-01) |
| amount | decimal(12,2) | >= 0, NOT NULL | Income amount |
| source | text | CHECK (primary, side_hustle, bonus, other), NOT NULL | Income source |
| notes | text | | Optional description |
| created_at | timestamptz | default now() | Creation time |

**RLS Policy**: Users can only access their own income logs.
**Index**: (user_id, month) for budget calculations.
**Unique**: (user_id, month, source) prevents duplicates.

### monthly_budgets

Calculated monthly budget summaries.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| month | date | NOT NULL | First day of month (YYYY-MM-01) |
| total_income | decimal(12,2) | >= 0 | Sum of income_logs |
| total_essentials | decimal(12,2) | >= 0 | Sum of essential expenses |
| total_non_essentials | decimal(12,2) | >= 0 | Sum of non-essential expenses |
| total_minimums | decimal(12,2) | >= 0 | Sum of debt minimums |
| safe_to_extra | decimal(12,2) | | income - essentials - minimums - non_essentials |
| actual_extra_paid | decimal(12,2) | default 0 | Sum of extra payments made |
| created_at | timestamptz | default now() | Creation time |
| updated_at | timestamptz | default now() | Last update time |

**RLS Policy**: Users can only access their own budgets.
**Unique**: (user_id, month) one budget per month.
**Note**: Recalculated via database function when income/expenses change.

### planned_payments

Scheduled future payments.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| debt_id | uuid | FK → debts(id), NOT NULL | Target debt |
| planned_date | date | NOT NULL | Scheduled date |
| planned_amount | decimal(12,2) | > 0, NOT NULL | Planned amount |
| is_extra | boolean | default false | Extra payment flag |
| is_completed | boolean | default false | Whether executed |
| completed_at | timestamptz | | When marked complete |
| created_at | timestamptz | default now() | Creation time |

**RLS Policy**: Users can only access their own planned payments.
**Index**: (user_id, planned_date) for calendar view.

### reminders

User-configurable reminders and notifications.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| debt_id | uuid | FK → debts(id) | Optional debt link |
| title | text | NOT NULL | Reminder title |
| reminder_date | date | NOT NULL | Date to trigger |
| reminder_time | time | default '09:00:00' | Time to trigger |
| repeat | text | CHECK (none, daily, weekly, monthly), default 'none' | Recurrence |
| is_completed | boolean | default false | Dismissed/completed |
| push_token | text | | Device push token |
| created_at | timestamptz | default now() | Creation time |

**RLS Policy**: Users can only access their own reminders.
**Index**: (user_id, reminder_date, is_completed) for pending reminders.

### journal_entries

User journal for debt journey documentation.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| debt_id | uuid | FK → debts(id) | Optional debt link |
| entry_type | text | CHECK (reflection, win, setback, call_log), NOT NULL | Entry category |
| title | text | NOT NULL | Entry title |
| content | text | | Entry body |
| mood | integer | CHECK (1-5) | Mood rating |
| creditor_name | text | | For call_log: creditor called |
| rep_name | text | | For call_log: representative name |
| call_outcome | text | | For call_log: result of call |
| created_at | timestamptz | default now() | Creation time |

**RLS Policy**: Users can only access their own entries.
**Index**: (user_id, created_at DESC) for journal list.

### chat_messages

AI companion conversation history.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| role | text | CHECK (user, assistant), NOT NULL | Message sender |
| content | text | NOT NULL | Message text |
| created_at | timestamptz | default now() | Send time |

**RLS Policy**: Users can only access their own messages.
**Index**: (user_id, created_at DESC) for chat history.
**Retention**: Consider pruning after 30 days for storage.

### lessons

Educational content (reference data).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| category | text | CHECK (basics, budgeting, negotiation, mindset), NOT NULL | Topic category |
| title | text | NOT NULL | Lesson title |
| duration_mins | integer | > 0, NOT NULL | Estimated read time |
| content | text | NOT NULL | Lesson content (markdown) |
| sort_order | integer | default 0 | Display order |
| is_premium | boolean | default false | Pro-only content |
| created_at | timestamptz | default now() | Creation time |

**RLS Policy**: Public read access.

### lesson_progress

User's progress through lessons.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| lesson_id | uuid | FK → lessons(id), NOT NULL | Completed lesson |
| completed_at | timestamptz | default now() | Completion time |
| quiz_score | integer | CHECK (0-100) | Optional quiz result |

**RLS Policy**: Users can only access their own progress.
**Unique**: (user_id, lesson_id) one completion per lesson.

### creditors

Creditor playbook reference data.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| name | text | UNIQUE, NOT NULL | Creditor name |
| phone | text | | Customer service phone |
| best_call_times | text | | Recommended call windows |
| hardship_program | text | | Hardship program info |
| rate_reduction_script | text | | Sample negotiation script |
| settlement_script | text | | Settlement negotiation script |
| success_rate | integer | CHECK (0-100) | Reported success rate |
| created_at | timestamptz | default now() | Creation time |

**RLS Policy**: Public read access.

### milestones

Achievement records.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| user_id | uuid | FK → users(id), NOT NULL | Owner |
| milestone_type | text | CHECK (progress_10, progress_25, progress_50, progress_75, progress_100, payment_streak, first_payment, first_extra), NOT NULL | Achievement type |
| value | integer | | Associated value (streak count, etc.) |
| achieved_at | timestamptz | default now() | Achievement time |

**RLS Policy**: Users can only access their own milestones.
**Unique**: (user_id, milestone_type) one per type (except streaks).

### daily_quotes

Motivational quotes reference data.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| quote_type | text | CHECK (quote, verse), NOT NULL | Content type |
| text | text | NOT NULL | Quote/verse text |
| author | text | NOT NULL | Attribution |
| created_at | timestamptz | default now() | Creation time |

**RLS Policy**: Public read access.

## Validation Rules

### Business Logic Constraints

1. **Debt Balance**: Must never go negative. Payment trigger caps at remaining balance.
2. **Safe to Extra**: Can be negative (tough month indicator).
3. **APR Range**: 0-100% to accommodate various debt types.
4. **Due Day**: 1-31; system adjusts for short months (Feb, etc.).
5. **Minimum Payment**: Must be > 0 for active debts.
6. **Original Balance**: Must be >= current balance (no retroactive increases).

### State Transitions

#### Debt Lifecycle

```
ACTIVE (is_active=true, balance>0)
  ↓ [payment reduces balance to 0]
PAID_OFF (is_active=true, balance=0, paid_off_at set)
  ↓ [user archives]
ARCHIVED (is_active=false)
```

#### Planned Payment Lifecycle

```
SCHEDULED (is_completed=false)
  ↓ [user marks complete]
COMPLETED (is_completed=true, completed_at set)
  → Triggers: INSERT into payments table
```

#### Reminder Lifecycle

```
PENDING (is_completed=false, reminder_date >= today)
  ↓ [date passes or user dismisses]
COMPLETED (is_completed=true)
  ↓ [if repeat != 'none']
  → Next reminder created automatically
```

## Database Functions

### calculate_safe_to_extra(user_id, month)

Calculates the safe-to-extra amount for a given month.

```sql
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
```

### calculate_debt_progress(user_id)

Calculates overall debt payoff progress percentage.

```sql
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
```

### check_milestone_achievement(user_id)

Checks and awards milestones after payment.

```sql
CREATE OR REPLACE FUNCTION check_milestone_achievement()
RETURNS TRIGGER AS $$
DECLARE
  v_progress decimal(5,2);
  v_milestone_types text[] := ARRAY['progress_10', 'progress_25', 'progress_50', 'progress_75', 'progress_100'];
  v_milestone_thresholds int[] := ARRAY[10, 25, 50, 75, 100];
  i int;
BEGIN
  v_progress := calculate_debt_progress(NEW.user_id);

  FOR i IN 1..array_length(v_milestone_types, 1) LOOP
    IF v_progress >= v_milestone_thresholds[i] THEN
      INSERT INTO milestones (user_id, milestone_type)
      VALUES (NEW.user_id, v_milestone_types[i])
      ON CONFLICT (user_id, milestone_type) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_milestone_check
AFTER INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION check_milestone_achievement();
```
