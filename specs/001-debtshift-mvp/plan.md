# Implementation Plan: DebtShift MVP

**Branch**: `001-debtshift-mvp` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-debtshift-mvp/spec.md`

## Summary

DebtShift MVP is a mobile application helping users escape debt through adaptive planning, budgeting with "safe to pay extra" calculations, payment tracking, AI-powered guidance, and creditor negotiation tactics. The app targets users aged 25-45 with multiple debts ($10K-$75K) and variable income who feel overwhelmed but motivated.

**Technical Approach**: React Native with Expo for cross-platform mobile, Supabase for backend (PostgreSQL, Auth, Edge Functions), Zustand for state management, and Claude API for AI companion functionality.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**: React Native 0.73+, Expo SDK 50+, Zustand 4.x, React Query 5.x, NativeWind 4.x, Reanimated 3.x
**Storage**: Supabase PostgreSQL with Row Level Security; AsyncStorage for offline cache
**Testing**: Jest + React Native Testing Library (unit), Maestro (E2E), Vitest (Edge Functions)
**Target Platform**: iOS 15+, Android 10+ (API 29+)
**Project Type**: Mobile application with serverless backend
**Performance Goals**: FCP < 1.5s, API reads p95 < 200ms, writes p95 < 500ms, bundle < 200KB gzipped
**Constraints**: Offline-capable for read operations, decimal precision for financial calculations, WCAG 2.1 AA compliance
**Scale/Scope**: Initial target 500 users, ~15 screens, 13 database tables

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality First

| Requirement | Plan Compliance |
|-------------|-----------------|
| TypeScript strict mode | ✅ `strict: true` in tsconfig.json |
| Single responsibility (<300 lines) | ✅ Component-based architecture, services separated |
| Explicit dependencies | ✅ All deps via package.json, no hidden side effects |
| Naming conventions (is/has/can/should for booleans) | ✅ Enforced via ESLint rules |
| Error handling with logging | ✅ Sentry integration, user-friendly error messages |
| Code review required | ✅ PR workflow with 1+ reviewer |

### II. Testing as Verification

| Requirement | Plan Compliance |
|-------------|-----------------|
| 90% coverage on critical paths | ✅ Payment, balance, auth logic prioritized |
| 70% coverage on general features | ✅ Jest coverage thresholds configured |
| Unit tests for business logic | ✅ Calculation utilities, validators |
| Integration tests for API/DB | ✅ Supabase test helpers |
| E2E for critical journeys | ✅ Maestro flows for onboarding, payment logging |
| Test naming convention | ✅ ESLint rule for `should...when...` pattern |
| No flaky tests | ✅ CI fails on intermittent failures |
| Test data isolation | ✅ Factory functions, cleanup hooks |

### III. User Experience Consistency

| Requirement | Plan Compliance |
|-------------|-----------------|
| Design tokens only | ✅ NativeWind theme config, no hardcoded values |
| WCAG 2.1 AA | ✅ Accessibility props, screen reader testing |
| Loading states | ✅ Skeleton components, React Query suspense |
| Actionable error messages | ✅ Error boundary with user guidance |
| Responsive (320px+) | ✅ NativeWind responsive utilities |
| Haptic feedback | ✅ expo-haptics for confirmations |

### IV. Performance Requirements

| Requirement | Plan Compliance |
|-------------|-----------------|
| FCP < 1.5s | ✅ Lazy loading, minimal initial bundle |
| API reads p95 < 200ms | ✅ Supabase edge regions, indexed queries |
| API writes p95 < 500ms | ✅ Optimistic updates with rollback |
| Bundle < 200KB | ✅ Code splitting, tree shaking |
| No N+1 queries | ✅ Supabase joins, select specific columns |
| Pagination (max 50) | ✅ Cursor-based pagination helpers |
| Memory cleanup | ✅ useEffect cleanup, subscription management |
| Offline viewing | ✅ React Query persistence, AsyncStorage |

**Constitution Check Status**: ✅ PASS - All requirements addressed

## Project Structure

### Documentation (this feature)

```text
specs/001-debtshift-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - getting started guide
├── contracts/           # Phase 1 output - API specifications
│   ├── auth.yaml
│   ├── debts.yaml
│   ├── payments.yaml
│   ├── budget.yaml
│   ├── planner.yaml
│   ├── reminders.yaml
│   ├── journal.yaml
│   ├── learn.yaml
│   ├── companion.yaml
│   └── creditors.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   ├── login.tsx
│   └── signup.tsx
├── (onboarding)/
│   ├── income.tsx
│   ├── expenses.tsx
│   ├── goal.tsx
│   └── first-debt.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── dashboard.tsx
│   ├── budget.tsx
│   ├── debts.tsx
│   ├── companion.tsx
│   └── learn.tsx
├── debt/
│   └── [id].tsx
├── planner.tsx
├── reminders.tsx
├── journal/
│   ├── index.tsx
│   └── new.tsx
├── lesson/
│   └── [id].tsx
├── playbook/
│   └── [id].tsx
├── settings.tsx
└── _layout.tsx

components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Skeleton.tsx
│   └── index.ts
├── debt/
│   ├── DebtCard.tsx
│   ├── DebtForm.tsx
│   ├── PayoffChart.tsx
│   └── index.ts
├── budget/
│   ├── IncomeCard.tsx
│   ├── ExpenseList.tsx
│   ├── SafeToPayCard.tsx
│   ├── MonthSelector.tsx
│   └── index.ts
├── dashboard/
│   ├── TotalDebtCard.tsx
│   ├── ProgressRing.tsx
│   ├── BudgetSnapshot.tsx
│   ├── UpcomingPayments.tsx
│   ├── DailyQuote.tsx
│   └── index.ts
├── companion/
│   ├── ChatBubble.tsx
│   ├── MessageInput.tsx
│   ├── SuggestedQuestions.tsx
│   └── index.ts
├── learn/
│   ├── LessonCard.tsx
│   ├── ProgressBar.tsx
│   └── index.ts
├── tactics/
│   ├── PlaybookCard.tsx
│   ├── ScriptViewer.tsx
│   └── index.ts
├── planner/
│   ├── CalendarView.tsx
│   ├── PlannedPaymentCard.tsx
│   ├── PayoffTimeline.tsx
│   └── index.ts
├── reminders/
│   ├── ReminderCard.tsx
│   ├── ReminderForm.tsx
│   └── index.ts
├── journal/
│   ├── JournalEntry.tsx
│   ├── CallLogForm.tsx
│   ├── MoodSelector.tsx
│   └── index.ts
└── milestones/
    ├── MilestoneCard.tsx
    ├── CelebrationModal.tsx
    └── index.ts

stores/
├── useAuthStore.ts
├── useDebtStore.ts
├── usePaymentStore.ts
├── useBudgetStore.ts
├── useChatStore.ts
├── useLearnStore.ts
├── usePlannerStore.ts
├── useJournalStore.ts
├── useReminderStore.ts
└── index.ts

services/
├── supabase.ts
├── auth.ts
├── debts.ts
├── payments.ts
├── budget.ts
├── calculator.ts
├── ai.ts
├── notifications.ts
└── index.ts

utils/
├── calculations.ts
├── formatters.ts
├── validators.ts
├── constants.ts
└── index.ts

hooks/
├── useDebts.ts
├── usePayments.ts
├── useBudget.ts
├── useReminders.ts
├── useOffline.ts
└── index.ts

theme/
├── colors.ts
├── typography.ts
├── spacing.ts
└── index.ts

supabase/
├── migrations/
│   └── 001_initial_schema.sql
├── functions/
│   ├── calculate-payoff/
│   │   └── index.ts
│   ├── ai-companion/
│   │   └── index.ts
│   └── send-reminder/
│       └── index.ts
└── seed.sql

tests/
├── unit/
│   ├── calculations.test.ts
│   ├── validators.test.ts
│   └── formatters.test.ts
├── integration/
│   ├── debts.test.ts
│   ├── payments.test.ts
│   └── budget.test.ts
└── e2e/
    ├── onboarding.yaml
    ├── add-debt.yaml
    ├── log-payment.yaml
    └── budget-flow.yaml
```

**Structure Decision**: Mobile + Serverless architecture using Expo Router file-based routing with Supabase Edge Functions for backend logic. All user data protected by Row Level Security policies.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
