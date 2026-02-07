# Tasks: DebtShift MVP

**Input**: Design documents from `/specs/001-debtshift-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Expo project with TypeScript template using `npx create-expo-app@latest debtshift --template expo-template-blank-typescript`
- [x] T002 Install core dependencies: `expo install expo-router react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context`
- [x] T003 [P] Install state management: `npm install zustand @tanstack/react-query @tanstack/react-query-persist-client`
- [x] T004 [P] Install Supabase client: `npm install @supabase/supabase-js`
- [x] T005 [P] Install NativeWind and Tailwind: `npm install nativewind tailwindcss` and configure in tailwind.config.js
- [x] T006 [P] Install utilities: `npm install decimal.js date-fns zod expo-haptics expo-clipboard`
- [x] T007 Configure TypeScript strict mode in tsconfig.json with `strict: true`
- [x] T008 [P] Configure ESLint with TypeScript rules in .eslintrc.js
- [x] T009 [P] Configure Prettier in .prettierrc
- [x] T010 Create app/_layout.tsx with providers (QueryClient, Supabase, Theme)
- [x] T011 Create theme/colors.ts with design tokens (background: #0A0A0B, surface: #141416, primary: #F59E0B, success: #10B981)
- [x] T012 [P] Create theme/typography.ts with font scale (hero: 32px to caption: 12px)
- [x] T013 [P] Create theme/spacing.ts with spacing scale
- [x] T014 Create theme/index.ts barrel export
- [x] T015 Create .env.example with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY placeholders

**Checkpoint**: Project scaffolding complete, ready for infrastructure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema

- [x] T016 Create supabase/migrations/001_initial_schema.sql with users table (id, email, income_type, income_min, income_typical, income_max, payoff_strategy, why_i_started, onboarding_completed, subscription_tier, ai_messages_used, created_at, updated_at)
- [x] T017 Add debts table to migration (id, user_id, name, creditor, debt_type, balance, original_balance, apr, minimum_payment, due_day, color, is_active, paid_off_at, created_at, updated_at)
- [x] T018 Add payments table to migration (id, user_id, debt_id, amount, payment_date, is_extra, notes, created_at)
- [x] T019 Add expenses and expense_categories tables to migration
- [x] T020 Add income_logs and monthly_budgets tables to migration
- [x] T021 Add planned_payments and reminders tables to migration
- [x] T022 Add journal_entries and chat_messages tables to migration
- [x] T023 Add lessons, lesson_progress, creditors, milestones, daily_quotes tables to migration
- [x] T024 Add RLS policies for all user-owned tables (users can only access their own data)
- [x] T025 Add database functions: calculate_safe_to_extra, calculate_debt_progress, check_milestone_achievement
- [x] T026 Create supabase/seed.sql with expense_categories, lessons, creditors, daily_quotes seed data
- [x] T027 Apply migration to Supabase project

### Core Services

- [x] T028 Create services/supabase.ts with client initialization and types
- [x] T029 Create services/auth.ts with signUp, signIn, signOut, resetPassword, getCurrentUser functions
- [x] T030 Create stores/useAuthStore.ts with user state, isAuthenticated, isLoading, actions
- [x] T031 Create utils/constants.ts with app-wide constants (DEBT_TYPES, INCOME_SOURCES, EXPENSE_CATEGORIES, etc.)
- [x] T032 [P] Create utils/formatters.ts with formatCurrency, formatDate, formatPercent functions
- [x] T033 [P] Create utils/validators.ts with Zod schemas for all entities
- [x] T034 Create utils/calculations.ts with calculateProgress, calculatePayoffDate, calculateSafeToExtra functions using Decimal.js
- [x] T035 Create hooks/useOffline.ts with React Query persistence and network detection

### Base UI Components

- [x] T036 Create components/ui/Button.tsx with variants (primary, secondary, ghost, danger) and loading state
- [x] T037 [P] Create components/ui/Card.tsx with surface styling and optional press handler
- [x] T038 [P] Create components/ui/Input.tsx with label, error state, and currency input mode
- [x] T039 [P] Create components/ui/Modal.tsx with backdrop and slide-up animation
- [x] T040 [P] Create components/ui/Skeleton.tsx for loading states
- [x] T041 Create components/ui/index.ts barrel export

### Navigation Shell

- [x] T042 Create app/(auth)/_layout.tsx with auth stack navigator
- [x] T043 Create app/(onboarding)/_layout.tsx with onboarding stack navigator
- [x] T044 Create app/(tabs)/_layout.tsx with bottom tab navigator (Home, Budget, Debts, Shift, More)
- [x] T045 Update app/_layout.tsx with auth state routing (auth → onboarding → tabs)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Initial Setup & Debt Entry (Priority: P1) 🎯 MVP

**Goal**: New user can sign up, complete onboarding, add their first debt, and see debt-free date projection

**Independent Test**: Complete signup → onboarding → add debt → view dashboard with projection

### Implementation for User Story 1

- [x] T046 [US1] Create app/(auth)/login.tsx with email/password form, validation, and error handling
- [x] T047 [US1] Create app/(auth)/signup.tsx with email/password form, terms checkbox, and navigation to onboarding
- [x] T048 [US1] Create app/(onboarding)/income.tsx with income type selector (steady/variable/mixed) and range inputs
- [x] T049 [US1] Create app/(onboarding)/expenses.tsx with common expense quick-add and custom expense form
- [x] T050 [US1] Create app/(onboarding)/goal.tsx with goal selector (debt-free ASAP, emergency fund, both) and why_i_started text input
- [x] T051 [US1] Create app/(onboarding)/first-debt.tsx with debt form (name, creditor, balance, APR, minimum, due_day)
- [x] T052 [US1] Create services/debts.ts with createDebt, getDebts, getDebt, updateDebt, deleteDebt functions
- [x] T053 [US1] Create stores/useDebtStore.ts with debts state and CRUD actions
- [x] T054 [US1] Create hooks/useDebts.ts with React Query hooks (useDebts, useDebt, useCreateDebt, useUpdateDebt, useDeleteDebt)
- [x] T055 [US1] Create components/debt/DebtForm.tsx with validation and submission
- [x] T056 [US1] Create components/debt/DebtCard.tsx with balance, APR, progress bar, color indicator
- [x] T057 [US1] Create app/(tabs)/debts.tsx with debt list, FAB to add debt, empty state
- [x] T058 [US1] Create app/debt/[id].tsx with debt detail, payment history, edit/delete actions
- [x] T059 [US1] Create services/calculator.ts with calculatePayoffDate function using snowball/avalanche strategies
- [x] T060 [US1] Create components/debt/PayoffChart.tsx with projected balance over time visualization
- [x] T061 [US1] Add payoff projection display to app/debt/[id].tsx
- [x] T062 [US1] Update stores/useAuthStore.ts to track onboarding_completed and redirect appropriately

**Checkpoint**: User can sign up, onboard, add debt, and see debt-free date. MVP functional.

---

## Phase 4: User Story 2 - Monthly Budget & Safe to Pay Extra (Priority: P1)

**Goal**: User can log income, see expenses, and know exactly how much is safe to put toward debt

**Independent Test**: Log monthly income → view budget breakdown → see safe-to-extra amount

### Implementation for User Story 2

- [x] T063 [US2] Create services/budget.ts with getMonthlyBudget, logIncome, getIncomeForMonth, getExpenses, createExpense, updateExpense, deleteExpense functions
- [x] T064 [US2] Create stores/useBudgetStore.ts with income, expenses, monthlyBudget state and actions
- [x] T065 [US2] Create hooks/useBudget.ts with React Query hooks for budget operations
- [x] T066 [US2] Create components/budget/MonthSelector.tsx with month/year picker
- [x] T067 [US2] Create components/budget/IncomeCard.tsx with income by source breakdown and add income button
- [x] T068 [US2] Create components/budget/ExpenseList.tsx with grouped expenses (essential vs non-essential)
- [x] T069 [US2] Create components/budget/SafeToPayCard.tsx with prominent safe-to-extra amount and suggested debt
- [x] T070 [US2] Create app/(tabs)/budget.tsx with MonthSelector, IncomeCard, ExpenseList, SafeToPayCard
- [x] T071 [US2] Create app/income/log.tsx modal for logging income (amount, source, notes)
- [x] T072 [US2] Create app/expense/[id].tsx for creating/editing individual expenses
- [x] T073 [US2] Add compassionate "tough month" message when safe-to-extra is negative in SafeToPayCard.tsx
- [x] T074 [US2] Add debt suggestion logic to SafeToPayCard.tsx based on user's payoff strategy

**Checkpoint**: User can manage budget and see safe-to-extra. Core value delivered.

---

## Phase 5: User Story 3 - Payment Tracking & Progress (Priority: P1)

**Goal**: User can log payments, see balance update, and track overall progress

**Independent Test**: Log a payment → see balance decrease → see progress percentage increase

### Implementation for User Story 3

- [x] T075 [US3] Create services/payments.ts with logPayment, getPayments, getPaymentsForDebt functions
- [x] T076 [US3] Create stores/usePaymentStore.ts with payments state and actions
- [x] T077 [US3] Create hooks/usePayments.ts with React Query hooks and optimistic updates
- [x] T078 [US3] Add payment logging form to app/debt/[id].tsx with amount, date, is_extra toggle
- [x] T079 [US3] Add payment history list to app/debt/[id].tsx with date, amount, extra badge
- [x] T080 [US3] Create Supabase trigger to update debt.balance on payment insert
- [x] T081 [US3] Add haptic feedback (expo-haptics) on successful payment logging
- [x] T082 [US3] Update useDebtStore to recalculate totalDebt and progress after payment
- [x] T083 [US3] Add "extra payment" celebration toast when is_extra is true

**Checkpoint**: Core P1 stories complete. Full MVP functionality delivered.

---

## Phase 6: User Story 4 - Dashboard Overview (Priority: P2)

**Goal**: User sees complete financial picture at a glance when opening the app

**Independent Test**: Open app → see total debt, progress, debt-free date, budget snapshot, upcoming payments, daily quote

### Implementation for User Story 4

- [x] T084 [US4] Create components/dashboard/TotalDebtCard.tsx with total debt amount and progress percentage
- [x] T085 [US4] Create components/dashboard/ProgressRing.tsx with animated circular progress indicator
- [x] T086 [US4] Create components/dashboard/BudgetSnapshot.tsx with income, expenses, safe-to-extra summary
- [x] T087 [US4] Create components/dashboard/UpcomingPayments.tsx with next 7 days of due dates
- [x] T088 [US4] Create components/dashboard/DailyQuote.tsx with quote/verse display and refresh button
- [x] T089 [US4] Create app/(tabs)/dashboard.tsx composing all dashboard components
- [x] T090 [US4] Add pull-to-refresh functionality to dashboard
- [x] T091 [US4] Create services/quotes.ts with getDailyQuote function (rotate based on date)

**Checkpoint**: Dashboard provides at-a-glance value

---

## Phase 7: User Story 5 - AI Companion "Shift" (Priority: P2)

**Goal**: User can chat with Shift for personalized debt advice and emotional support

**Independent Test**: Open companion → see greeting → send message → receive personalized response

### Implementation for User Story 5

- [ ] T092 [US5] Create supabase/functions/ai-companion/index.ts Edge Function with Claude API integration
- [ ] T093 [US5] Add system prompt to ai-companion with user context injection (debts, balances, strategy)
- [ ] T094 [US5] Create services/ai.ts with sendMessage function calling Edge Function
- [ ] T095 [US5] Create stores/useChatStore.ts with messages state and sendMessage action
- [ ] T096 [US5] Create hooks/useChat.ts with React Query mutation for sending messages
- [ ] T097 [US5] Create components/companion/ChatBubble.tsx with user/assistant styling
- [ ] T098 [US5] Create components/companion/MessageInput.tsx with text input and send button
- [ ] T099 [US5] Create components/companion/SuggestedQuestions.tsx with tap-to-ask quick questions
- [ ] T100 [US5] Create app/(tabs)/companion.tsx with chat interface
- [ ] T101 [US5] Add AI message limit tracking (5/month for free tier) with upgrade prompt
- [ ] T102 [US5] Add loading state with typing indicator during AI response

**Checkpoint**: AI companion provides personalized guidance

---

## Phase 8: User Story 6 - Payment Planner & Calendar (Priority: P2)

**Goal**: User can plan payments ahead and visualize their debt-free journey

**Independent Test**: Schedule a planned payment → see it on calendar → mark complete → payment logged

### Implementation for User Story 6

- [ ] T103 [US6] Create services/planner.ts with getPlannedPayments, createPlannedPayment, updatePlannedPayment, markComplete, deletePlannedPayment functions
- [ ] T104 [US6] Create stores/usePlannerStore.ts with plannedPayments state and actions
- [ ] T105 [US6] Create hooks/usePlanner.ts with React Query hooks
- [ ] T106 [US6] Create components/planner/CalendarView.tsx with month grid and event dots
- [ ] T107 [US6] Create components/planner/PlannedPaymentCard.tsx with debt, amount, date, complete button
- [ ] T108 [US6] Create components/planner/PayoffTimeline.tsx with projected balance chart over months
- [ ] T109 [US6] Create app/planner.tsx with CalendarView, PlannedPaymentCard list, add button
- [ ] T110 [US6] Add markComplete action that creates actual payment record and updates debt balance
- [ ] T111 [US6] Create supabase/functions/calculate-payoff/index.ts for complex payoff projections

**Checkpoint**: Users can plan ahead and visualize progress

---

## Phase 9: User Story 7 - Reminders & Notifications (Priority: P2)

**Goal**: User receives timely reminders for payments and custom events

**Independent Test**: Create reminder → receive push notification at scheduled time → tap to navigate

### Implementation for User Story 7

- [ ] T112 [US7] Install and configure expo-notifications
- [ ] T113 [US7] Create services/notifications.ts with registerForPushNotifications, schedulePushNotification, cancelNotification functions
- [ ] T114 [US7] Create stores/useReminderStore.ts with reminders state and CRUD actions
- [ ] T115 [US7] Create hooks/useReminders.ts with React Query hooks
- [ ] T116 [US7] Create components/reminders/ReminderCard.tsx with title, date, repeat badge, complete/delete actions
- [ ] T117 [US7] Create components/reminders/ReminderForm.tsx with title, date picker, time picker, repeat selector
- [ ] T118 [US7] Create app/reminders.tsx with reminder list and add button
- [ ] T119 [US7] Create supabase/functions/send-reminder/index.ts Edge Function for scheduled notifications
- [ ] T120 [US7] Add automatic payment due date reminders when debt is created
- [ ] T121 [US7] Add notification tap handler to navigate to relevant screen

**Checkpoint**: Users never miss a payment

---

## Phase 10: User Story 8 - Journal & Call Logs (Priority: P3)

**Goal**: User can document their debt journey and track creditor interactions

**Independent Test**: Create journal entry → view in list → create call log → see creditor outcome recorded

### Implementation for User Story 8

- [ ] T122 [US8] Create services/journal.ts with getJournalEntries, createEntry, updateEntry, deleteEntry functions
- [ ] T123 [US8] Create stores/useJournalStore.ts with entries state and CRUD actions
- [ ] T124 [US8] Create hooks/useJournal.ts with React Query hooks
- [ ] T125 [US8] Create components/journal/JournalEntry.tsx with type icon, title, mood, date
- [ ] T126 [US8] Create components/journal/MoodSelector.tsx with 1-5 mood rating
- [ ] T127 [US8] Create components/journal/CallLogForm.tsx with creditor, rep name, outcome fields
- [ ] T128 [US8] Create app/journal/index.tsx with entry list filtered by type
- [ ] T129 [US8] Create app/journal/new.tsx with entry type selector and dynamic form
- [ ] T130 [US8] Add "Why I Started" display button that shows user's motivation statement

**Checkpoint**: Emotional journaling supports long-term commitment

---

## Phase 11: User Story 9 - Learn Center (Priority: P3)

**Goal**: User can learn debt management skills through bite-sized lessons

**Independent Test**: Open Learn → view lessons by category → complete lesson → see progress/streak update

### Implementation for User Story 9

- [ ] T131 [US9] Create services/learn.ts with getLessons, getLesson, markLessonComplete, getLearningStreak functions
- [ ] T132 [US9] Create stores/useLearnStore.ts with lessons, progress, streak state and actions
- [ ] T133 [US9] Create hooks/useLearn.ts with React Query hooks
- [ ] T134 [US9] Create components/learn/LessonCard.tsx with title, duration, completion badge, premium lock
- [ ] T135 [US9] Create components/learn/ProgressBar.tsx with category progress visualization
- [ ] T136 [US9] Create app/(tabs)/learn.tsx with lessons grouped by category
- [ ] T137 [US9] Create app/lesson/[id].tsx with lesson content display and complete button
- [ ] T138 [US9] Add streak tracking logic with 48-hour reset window
- [ ] T139 [US9] Add premium lesson gate with upgrade prompt for free users

**Checkpoint**: Education empowers behavior change

---

## Phase 12: User Story 10 - Negotiation Tactics & Creditor Scripts (Priority: P3)

**Goal**: User can access negotiation playbooks and copy scripts for creditor calls

**Independent Test**: View debt → tap Negotiate → see playbook with phone/times/script → copy script

### Implementation for User Story 10

- [ ] T140 [US10] Create services/creditors.ts with getCreditors, getCreditor, matchCreditorByName functions
- [ ] T141 [US10] Create components/tactics/PlaybookCard.tsx with creditor name, phone, success rate
- [ ] T142 [US10] Create components/tactics/ScriptViewer.tsx with script text and copy button
- [ ] T143 [US10] Create app/playbook/[id].tsx with full playbook (phone, times, scripts, success rate)
- [ ] T144 [US10] Add "Negotiate" button to app/debt/[id].tsx linking to matched playbook
- [ ] T145 [US10] Add copy-to-clipboard functionality using expo-clipboard with haptic feedback
- [ ] T146 [US10] Add "Log Call Outcome" button in playbook that creates call_log journal entry

**Checkpoint**: Scripts reduce negotiation friction

---

## Phase 13: User Story 11 - Milestones & Achievements (Priority: P3)

**Goal**: User receives celebration when hitting progress milestones or maintaining streaks

**Independent Test**: Log payment that crosses 25% → see celebration modal → view milestone history

### Implementation for User Story 11

- [ ] T147 [US11] Create services/milestones.ts with getMilestones, checkAndAwardMilestone functions
- [ ] T148 [US11] Create components/milestones/MilestoneCard.tsx with icon, title, achieved date
- [ ] T149 [US11] Create components/milestones/CelebrationModal.tsx with animation and confetti
- [ ] T150 [US11] Add milestone check trigger after payment logging in usePayments.ts
- [ ] T151 [US11] Add CelebrationModal display when new milestone achieved
- [ ] T152 [US11] Create milestone history section in app/settings.tsx or dedicated progress screen

**Checkpoint**: Celebrations maintain motivation

---

## Phase 14: User Story 12 - Settings & Profile (Priority: P3)

**Goal**: User can manage profile, preferences, and app settings

**Independent Test**: Open settings → change payoff strategy → see dashboard update to reflect new strategy

### Implementation for User Story 12

- [ ] T153 [US12] Create app/settings.tsx with profile section, notification preferences, payoff strategy selector
- [ ] T154 [US12] Add payoff strategy picker (snowball/avalanche) with explanation
- [ ] T155 [US12] Add notification toggles (payment reminders, weekly check-ins, milestone celebrations)
- [ ] T156 [US12] Add theme toggle (dark/light) - persist to AsyncStorage
- [ ] T157 [US12] Add data export functionality (JSON download of user data)
- [ ] T158 [US12] Add sign out button with confirmation
- [ ] T159 [US12] Add delete account flow with data deletion confirmation
- [ ] T160 [US12] Add subscription status display with upgrade button for free users

**Checkpoint**: All user stories complete

---

## Phase 15: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T161 [P] Add Sentry error tracking initialization in app/_layout.tsx
- [ ] T162 [P] Add analytics tracking for key events (signup, payment_logged, milestone_achieved)
- [ ] T163 [P] Create empty state components for all list screens
- [ ] T164 [P] Add pull-to-refresh to all list screens
- [ ] T165 [P] Implement offline queue for mutations (payments, expenses, reminders)
- [ ] T166 [P] Add app icon and splash screen assets
- [ ] T167 Add accessibility labels to all interactive elements
- [ ] T168 Run WCAG 2.1 AA audit and fix issues
- [ ] T169 Performance audit: ensure FCP < 1.5s, bundle < 200KB
- [ ] T170 Create README.md with setup instructions
- [ ] T171 Configure EAS Build profiles (development, preview, production)
- [ ] T172 Run quickstart.md validation to ensure setup guide is accurate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-14)**: All depend on Foundational phase completion
  - P1 stories (US1-3) should complete before P2 stories
  - P2 stories (US4-7) can proceed in parallel after P1
  - P3 stories (US8-12) can proceed in parallel after P2
- **Polish (Phase 15)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies - foundation only
- **US2 (P1)**: Requires US1 (debts and expenses exist)
- **US3 (P1)**: Requires US1 (debts exist to log payments against)
- **US4 (P2)**: Requires US1-3 (data to display)
- **US5 (P2)**: Requires US1 (debt context for AI)
- **US6 (P2)**: Requires US1 (debts exist) and US3 (payment integration)
- **US7 (P2)**: Requires US1 (debts for due date reminders)
- **US8 (P3)**: Requires US1 (optional debt linking)
- **US9 (P3)**: No story dependencies (standalone)
- **US10 (P3)**: Requires US1 (debt-creditor matching) and US8 (call log)
- **US11 (P3)**: Requires US3 (payments trigger milestones)
- **US12 (P3)**: Requires US1 (profile data)

### Parallel Opportunities

Phase 1 parallel tasks: T003, T004, T005, T006, T008, T009, T012, T013
Phase 2 parallel tasks: T032, T033, T037, T038, T039, T040
Phase 15 parallel tasks: T161, T162, T163, T164, T165, T166

---

## Parallel Example: User Story 1

```bash
# After Foundational phase, launch these in parallel:
Task T046: "Create app/(auth)/login.tsx"
Task T047: "Create app/(auth)/signup.tsx"

# Then these in parallel:
Task T048: "Create app/(onboarding)/income.tsx"
Task T049: "Create app/(onboarding)/expenses.tsx"
Task T050: "Create app/(onboarding)/goal.tsx"

# Then service layer:
Task T052: "Create services/debts.ts"
Task T053: "Create stores/useDebtStore.ts"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (~15 tasks)
2. Complete Phase 2: Foundational (~30 tasks)
3. Complete Phase 3: US1 - Initial Setup & Debt Entry (~17 tasks)
4. Complete Phase 4: US2 - Budget & Safe to Extra (~12 tasks)
5. Complete Phase 5: US3 - Payment Tracking (~9 tasks)
6. **STOP and VALIDATE**: Core MVP is complete, test independently
7. Deploy to TestFlight/Internal Testing

### Incremental Delivery

1. **MVP (P1)**: Setup + Foundation + US1-3 → Core debt tracking works
2. **+P2 Features**: US4-7 → Dashboard, AI, Planner, Reminders
3. **+P3 Features**: US8-12 → Journal, Learn, Tactics, Milestones, Settings
4. **Polish**: Phase 15 → Production-ready

### Task Count Summary

| Phase | Story | Tasks |
|-------|-------|-------|
| 1 | Setup | 15 |
| 2 | Foundational | 30 |
| 3 | US1 (P1) | 17 |
| 4 | US2 (P1) | 12 |
| 5 | US3 (P1) | 9 |
| 6 | US4 (P2) | 8 |
| 7 | US5 (P2) | 11 |
| 8 | US6 (P2) | 9 |
| 9 | US7 (P2) | 10 |
| 10 | US8 (P3) | 9 |
| 11 | US9 (P3) | 9 |
| 12 | US10 (P3) | 7 |
| 13 | US11 (P3) | 6 |
| 14 | US12 (P3) | 8 |
| 15 | Polish | 12 |
| **Total** | | **172** |

---

## Notes

- [P] tasks = different files, no dependencies
- [US#] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Supabase MCP can be used to apply migrations directly
