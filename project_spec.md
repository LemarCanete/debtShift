# DebtShift - Project Specification

## Overview
Mobile app helping users escape debt through adaptive planning, negotiation tactics, and emotional support.

**Target User:** 25-45, multiple debts ($10K-$75K), variable income, motivated but overwhelmed.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native (Expo) |
| Backend | Supabase (Auth, DB, Edge Functions) |
| State | Zustand |
| UI | Custom components + Reanimated |

---

## Database Schema (Core Tables)

```sql
users (
  id, email, income_type, income_min, income_typical, income_max,
  payoff_strategy, why_i_started, created_at
)

debts (
  id, user_id, name, creditor, debt_type, balance, original_balance,
  apr, minimum_payment, due_day, color, is_active, created_at
)

payments (
  id, user_id, debt_id, amount, payment_date, is_extra, created_at
)

income_logs (
  id, user_id, month, amount, source (primary/side_hustle/bonus/other),
  notes, created_at
)

expenses (
  id, user_id, category, name, amount, is_essential, is_recurring,
  due_day, created_at
)

expense_categories (
  id, name, icon, is_essential, sort_order
  -- Defaults: Rent/Mortgage, Utilities, Groceries, Transport, Insurance, 
  -- Subscriptions, Dining, Entertainment, Shopping, Other
)

monthly_budgets (
  id, user_id, month, total_income, total_essentials, total_minimums,
  safe_to_extra, actual_extra_paid, created_at
)

chat_messages (
  id, user_id, role (user/assistant), content, created_at
)

lessons (
  id, category, title, duration_mins, content, sort_order, is_premium
)

lesson_progress (
  id, user_id, lesson_id, completed_at, quiz_score
)

reminders (
  id, user_id, debt_id (optional), title, reminder_date, reminder_time,
  repeat (none/daily/weekly/monthly), is_completed, created_at
)

journal_entries (
  id, user_id, debt_id (optional), entry_type (reflection/win/setback/call_log),
  title, content, mood (1-5), created_at
)

planned_payments (
  id, user_id, debt_id, planned_date, planned_amount, is_extra,
  is_completed, completed_at, created_at
)

creditors (
  id, name, phone, best_call_times, hardship_program,
  rate_reduction_script, success_rate
)

milestones (
  id, user_id, type, value, achieved_at
)
```

---

## App Structure

```
/app
  (auth)/login, signup
  (onboarding)/income, expenses, goal, first-debt
  (tabs)/dashboard, budget, debts, companion, learn
  debt/[id]
  playbook/[id]
  income/log
  expense/[id]
  lesson/[id]
  planner
  reminders
  journal
  journal/new

/components
  /ui - Button, Card, Input, Modal
  /debt - DebtCard, DebtForm, PayoffChart
  /budget - IncomeCard, ExpenseList, SafeToPayCard, MonthSelector
  /dashboard - TotalDebtCard, ProgressRing, BudgetSnapshot
  /companion - ChatBubble, MessageInput, SuggestedQuestions
  /learn - LessonCard, ProgressBar, QuizQuestion
  /tactics - PlaybookCard, ScriptViewer
  /planner - CalendarView, PlannedPaymentCard, PayoffTimeline
  /reminders - ReminderCard, ReminderForm
  /journal - JournalEntry, CallLogForm, MoodSelector

/stores - useAuthStore, useDebtStore, usePaymentStore, useBudgetStore, useChatStore, useLearnStore, usePlannerStore, useJournalStore
/services - supabase, auth, debts, budget, calculator, ai, notifications
/utils - calculations, formatters
```

---

## Key Screens

1. **Dashboard** - Total debt, progress bar, debt-free date, upcoming payments, quick actions
2. **Debt List** - All debts with balance, APR, progress
3. **Debt Detail** - Balance, payoff projection, payment history, negotiate button
4. **Tactics** - Creditor playbooks with scripts, success rates, rebuttals
5. **Progress** - Milestones, streaks, achievements

---

## Design System

**Colors (Dark Theme)**
- Background: #0A0A0B
- Surface: #141416
- Primary: #F59E0B (amber)
- Success: #10B981
- Text: #FAFAFA / #A1A1AA

**Typography:** System fonts, 32px hero → 12px caption

**Principles:** Calm not clinical, progress over perfection, shame-free language

---

## MVP API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /auth/signup | POST | Register |
| /auth/login | POST | Login |
| /debts | GET/POST | List/create debts |
| /debts/:id | PATCH/DELETE | Update/delete debt |
| /payments | GET/POST | List/create payments |
| /income | GET/POST | List/log monthly income |
| /expenses | GET/POST | List/create expenses |
| /expenses/:id | PATCH/DELETE | Update/delete expense |
| /budget/:month | GET | Get monthly budget summary |
| /budget/safe-to-extra | GET | Calculate safe extra payment |
| /planner/payments | GET/POST | List/create planned payments |
| /planner/payments/:id | PATCH/DELETE | Update/delete planned payment |
| /planner/calendar/:month | GET | Get calendar view for month |
| /reminders | GET/POST | List/create reminders |
| /reminders/:id | PATCH/DELETE | Update/delete reminder |
| /journal | GET/POST | List/create journal entries |
| /journal/:id | PATCH/DELETE | Update/delete entry |
| /journal/call-logs | GET/POST | List/create call logs |
| /creditors | GET | List creditor playbooks |
| /calculator/payoff | POST | Calculate payoff plan |

---

## Security
- Row Level Security on all user data
- JWT auth via Supabase
- No financial credentials stored (manual entry for MVP)
- Plaid integration deferred to V2

---

## Success Metrics
- Downloads: 500
- Onboarding completion: 40%
- Week 1 retention: 30%
- Payment logged: 20%
- NPS: >40
