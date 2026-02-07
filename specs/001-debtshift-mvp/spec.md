# Feature Specification: DebtShift MVP

**Feature Branch**: `001-debtshift-mvp`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Mobile app helping users escape debt through adaptive planning, negotiation tactics, and emotional support

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial Setup & Debt Entry (Priority: P1)

A new user downloads DebtShift, creates an account, completes onboarding to describe their income situation, and adds their first debt. They immediately see their total debt balance and a projected debt-free date.

**Why this priority**: This is the foundation of the entire app. Users cannot benefit from any other feature without first entering their financial situation. A user who completes onboarding and adds one debt has already received value.

**Independent Test**: Can be fully tested by completing signup, onboarding flow, and adding one debt. Delivers immediate value by showing total debt and projected payoff timeline.

**Acceptance Scenarios**:

1. **Given** a new user opens the app, **When** they complete signup with email and password, **Then** they are directed to the onboarding flow
2. **Given** a user is in onboarding, **When** they select their income type (steady/variable/mixed) and income range, **Then** their selection is saved and they proceed to the next step
3. **Given** a user completes income setup, **When** they enter essential expenses (rent, utilities, groceries, transport), **Then** the expenses are saved with their essential/recurring flags
4. **Given** a user completes expense setup, **When** they select their goal (debt-free ASAP, build emergency fund, both), **Then** they proceed to add their first debt
5. **Given** a user is adding their first debt, **When** they enter name, creditor, balance, APR, and minimum payment, **Then** the debt is saved and they see the dashboard with their debt-free date projection

---

### User Story 2 - Monthly Budget & "Safe to Pay Extra" (Priority: P1)

A user with variable income logs their actual income for the month. The system calculates how much they can safely put toward extra debt payments after covering essentials and minimum payments.

**Why this priority**: This is the core value proposition for the target user (variable income, overwhelmed). Knowing exactly what's "safe" removes anxiety and decision fatigue.

**Independent Test**: Can be fully tested by logging monthly income and viewing the calculated "safe to pay extra" amount. Delivers immediate actionable guidance.

**Acceptance Scenarios**:

1. **Given** a user has set up debts and expenses, **When** they navigate to the budget screen, **Then** they see their total essentials, total minimums, and current safe-to-extra amount
2. **Given** a user with variable income, **When** they log their actual income for the current month (including source: primary, side hustle, bonus), **Then** the safe-to-extra amount updates immediately
3. **Given** a user's safe-to-extra amount is calculated, **When** the amount is negative or zero, **Then** the system displays a compassionate message and suggests reviewing non-essential expenses
4. **Given** a user has a positive safe-to-extra amount, **When** they view the dashboard, **Then** they see this amount prominently displayed with a suggestion for which debt to apply it to

---

### User Story 3 - Payment Tracking & Progress (Priority: P1)

A user logs a payment they made to one of their debts. The system updates the balance, recalculates the debt-free date, and shows their progress toward being debt-free.

**Why this priority**: Logging payments and seeing progress is essential for motivation. Users need immediate feedback that their actions are making a difference.

**Independent Test**: Can be fully tested by logging a payment and observing the balance decrease and progress percentage increase. Delivers dopamine hit of visible progress.

**Acceptance Scenarios**:

1. **Given** a user has at least one debt, **When** they navigate to a debt detail screen, **Then** they see current balance, original balance, APR, minimum payment, and payment history
2. **Given** a user is on a debt detail screen, **When** they log a payment (amount, date, extra or minimum flag), **Then** the payment is recorded and the balance is reduced
3. **Given** a payment is logged, **When** the user returns to the dashboard, **Then** the total debt, progress percentage, and debt-free date are all updated
4. **Given** a user logs a payment that exceeds the minimum, **When** the payment is saved, **Then** it is flagged as an "extra payment" for celebration purposes

---

### User Story 4 - Dashboard Overview (Priority: P2)

A user opens the app and immediately sees their complete financial picture: total debt, progress percentage, debt-free date, this month's budget snapshot, upcoming payments, and a daily motivational message.

**Why this priority**: The dashboard is the most frequently visited screen. It must provide value at a glance without requiring navigation.

**Independent Test**: Can be tested by viewing dashboard after data is populated. Delivers quick status check in under 10 seconds.

**Acceptance Scenarios**:

1. **Given** a user has debts and budget data, **When** they open the dashboard, **Then** they see total debt balance, progress percentage, and projected debt-free date
2. **Given** it's a new day, **When** the user opens the dashboard, **Then** they see a new daily motivational quote or verse (rotated daily)
3. **Given** the user has upcoming payments due this week, **When** they view the dashboard, **Then** they see a list of upcoming payments with amounts and due dates
4. **Given** the user has budget data, **When** they view the dashboard, **Then** they see a snapshot showing monthly income, expenses, and safe-to-extra amount

---

### User Story 5 - AI Companion "Shift" (Priority: P2)

A user who has a question about debt strategy, needs motivation, or wants guidance on their next steps chats with Shift, the AI companion. Shift provides personalized advice based on the user's actual debt situation.

**Why this priority**: Personalized guidance differentiates DebtShift from spreadsheet tracking. Emotional support during hard times prevents app abandonment.

**Independent Test**: Can be tested by sending a message and receiving a relevant, personalized response. Delivers emotional value through connection.

**Acceptance Scenarios**:

1. **Given** a user navigates to the Companion tab, **When** the screen loads, **Then** they see a chat interface with Shift's greeting and suggested questions
2. **Given** a user types a question, **When** they send it, **Then** Shift responds with personalized advice based on their debt data
3. **Given** a user asks about debt strategy (e.g., "Should I pay off Chase or Discover first?"), **When** Shift responds, **Then** the response references their actual balances and APRs
4. **Given** the user is on the free plan with limited AI messages, **When** they exceed their monthly limit, **Then** they see a message about upgrading for unlimited access

---

### User Story 6 - Payment Planner & Calendar (Priority: P2)

A user plans out their payments for the month, scheduling both minimum payments on due dates and extra payments when they have cash available. They can see a visual timeline of their debt-free journey.

**Why this priority**: Planning ahead reduces cognitive load and missed payments. The visual timeline maintains motivation for the long haul.

**Independent Test**: Can be tested by scheduling a planned payment and viewing it on the calendar. Delivers peace of mind through planning.

**Acceptance Scenarios**:

1. **Given** a user navigates to the Planner tab, **When** the screen loads, **Then** they see a monthly calendar view with payment due dates marked
2. **Given** a user wants to schedule an extra payment, **When** they create a planned payment (debt, amount, date, extra flag), **Then** it appears on the calendar
3. **Given** a planned payment date arrives, **When** the user marks it complete, **Then** the payment is logged to the debt and the planned payment is marked done
4. **Given** a user views the payoff timeline, **When** they see the visualization, **Then** it shows projected balance over time and the debt-free target date

---

### User Story 7 - Reminders & Notifications (Priority: P2)

A user sets up reminders for payment due dates, weekly check-ins, and custom reminders (like calling a creditor back). They receive push notifications at the scheduled times.

**Why this priority**: Preventing missed payments is critical for users already struggling. Push notifications drive engagement and habit formation.

**Independent Test**: Can be tested by creating a reminder and receiving notification at the scheduled time. Delivers peace of mind about never missing a payment.

**Acceptance Scenarios**:

1. **Given** a user has debts with due dates, **When** they enable payment reminders, **Then** they can set reminder lead time (1, 3, or 7 days before due)
2. **Given** a user creates a custom reminder, **When** the reminder time arrives, **Then** they receive a push notification with the reminder title
3. **Given** a user receives a reminder notification, **When** they tap it, **Then** they are taken to the relevant screen (debt detail, planner, or journal)
4. **Given** weekly check-in is enabled, **When** Sunday arrives, **Then** the user receives a prompt to log their weekly income and review progress

---

### User Story 8 - Journal & Call Logs (Priority: P3)

A user documents their debt journey through journal entries: wins, setbacks, reflections, and creditor call logs. Their "Why I Started" statement is saved and shown during difficult moments.

**Why this priority**: Emotional journaling supports long-term commitment. Call logs preserve negotiation history for future reference.

**Independent Test**: Can be tested by creating a journal entry and viewing it in the journal list. Delivers emotional outlet and historical record.

**Acceptance Scenarios**:

1. **Given** a user navigates to Journal, **When** the screen loads, **Then** they see their past entries sorted by date with entry type icons
2. **Given** a user creates a new entry, **When** they select entry type (win, setback, reflection, call log), **Then** the form adapts to show relevant fields
3. **Given** a user logs a creditor call, **When** they save it, **Then** it includes date, creditor name, rep name (optional), outcome, and notes
4. **Given** a user's balance increased or they felt discouraged, **When** they view their "Why I Started" statement, **Then** they see the motivation they wrote during onboarding

---

### User Story 9 - Learn Center (Priority: P3)

A user accesses bite-sized educational lessons about debt management, budgeting, negotiation tactics, and financial mindset. They track their progress and earn streaks for consistent learning.

**Why this priority**: Education empowers long-term behavior change. Streaks create habit formation.

**Independent Test**: Can be tested by completing a lesson and seeing progress update. Delivers knowledge and sense of accomplishment.

**Acceptance Scenarios**:

1. **Given** a user navigates to Learn, **When** the screen loads, **Then** they see lessons organized by category with completion status
2. **Given** a user starts a lesson, **When** they complete reading/watching, **Then** the lesson is marked complete and progress updates
3. **Given** a user completes lessons on consecutive days, **When** they view their streak, **Then** they see their current streak count
4. **Given** some lessons are marked as premium, **When** a free user tries to access them, **Then** they see an upgrade prompt

---

### User Story 10 - Negotiation Tactics & Creditor Scripts (Priority: P3)

A user preparing to call their creditor accesses a playbook with phone numbers, best call times, sample scripts, and success rates. They can copy scripts and log the outcome of their call.

**Why this priority**: Negotiation is a high-value action (can save hundreds) but intimidating. Scripts reduce friction.

**Independent Test**: Can be tested by viewing a creditor playbook and copying a script. Delivers confidence to take action.

**Acceptance Scenarios**:

1. **Given** a user views a debt detail screen, **When** they tap "Negotiate," **Then** they see the creditor playbook with phone number and best times to call
2. **Given** a user views the playbook, **When** they see the sample script, **Then** they can copy it to their clipboard with one tap
3. **Given** a user completes a call, **When** they log the outcome, **Then** it is saved as a journal entry of type "call_log"
4. **Given** playbooks exist for multiple creditors, **When** a user's creditor matches a known playbook, **Then** the playbook shows that creditor's specific scripts and success rates

---

### User Story 11 - Milestones & Achievements (Priority: P3)

A user reaches a milestone (10%, 25%, 50%, 75%, or 100% paid off) or maintains a payment streak. They receive celebration feedback and the milestone is recorded.

**Why this priority**: Celebrations reinforce positive behavior and maintain motivation for the long journey.

**Independent Test**: Can be tested by logging a payment that crosses a milestone threshold. Delivers dopamine reward.

**Acceptance Scenarios**:

1. **Given** a user's progress crosses a milestone threshold, **When** the payment is logged, **Then** they see a celebration animation and message
2. **Given** a user logs payments on time for consecutive months, **When** they view their profile, **Then** they see their current payment streak
3. **Given** a user achieves a milestone, **When** they view the Progress screen, **Then** they see all achieved milestones with dates

---

### User Story 12 - Settings & Profile (Priority: P3)

A user manages their profile, notification preferences, payoff strategy (snowball vs avalanche), display preferences, and account settings.

**Why this priority**: Users need control over their experience, but settings are lower priority than core features.

**Independent Test**: Can be tested by changing a setting and observing the change take effect. Delivers customization.

**Acceptance Scenarios**:

1. **Given** a user navigates to Settings, **When** the screen loads, **Then** they see profile, notifications, strategy, display, and account sections
2. **Given** a user changes their payoff strategy, **When** they save, **Then** the dashboard and recommendations reflect the new strategy
3. **Given** a user changes notification preferences, **When** they save, **Then** future notifications respect those preferences
4. **Given** a user wants to export their data, **When** they tap "Export Data," **Then** they receive their data in a downloadable format

---

### Edge Cases

- What happens when a user has no debts entered? (Show empty state with prompt to add first debt)
- What happens when income - expenses - minimums is negative? (Show compassionate "tough month" message with suggestions)
- What happens when a payment exceeds the remaining balance? (Cap at remaining balance, mark debt as paid off, celebrate)
- What happens when all debts are paid off? (Major celebration, option to stay for emergency fund tracking)
- What happens when AI companion can't answer a question? (Graceful fallback with general guidance and support)
- What happens when push notification permission is denied? (In-app reminders with prompt to enable notifications)
- What happens when the user has no internet? (Allow viewing cached data, queue payments/entries for sync)

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Onboarding**
- **FR-001**: System MUST allow users to create accounts using email and password
- **FR-002**: System MUST support password reset via email
- **FR-003**: System MUST collect income type (steady/variable/mixed) during onboarding
- **FR-004**: System MUST collect income range (min/typical/max for variable income) during onboarding
- **FR-005**: System MUST allow users to add essential expenses during onboarding
- **FR-006**: System MUST save user's "Why I Started" motivation statement

**Debt Management**
- **FR-007**: System MUST allow users to add debts with name, creditor, balance, original balance, APR, minimum payment, and due day
- **FR-008**: System MUST allow users to edit and delete debts
- **FR-009**: System MUST calculate and display projected debt-free date based on current strategy
- **FR-010**: System MUST support snowball (lowest balance first) and avalanche (highest APR first) payoff strategies

**Payment Tracking**
- **FR-011**: System MUST allow users to log payments with amount, date, and extra/minimum flag
- **FR-012**: System MUST automatically reduce debt balance when payment is logged
- **FR-013**: System MUST track payment history per debt
- **FR-014**: System MUST calculate and display total progress percentage

**Budgeting**
- **FR-015**: System MUST allow users to log monthly income with source (primary, side hustle, bonus, other)
- **FR-016**: System MUST allow users to add, edit, and delete expenses
- **FR-017**: System MUST categorize expenses as essential or non-essential
- **FR-018**: System MUST calculate "safe to pay extra" as: income - essentials - minimums - non-essentials
- **FR-019**: System MUST generate monthly budget summary

**Planner**
- **FR-020**: System MUST display monthly calendar with payment due dates
- **FR-021**: System MUST allow users to schedule planned payments (debt, amount, date, extra flag)
- **FR-022**: System MUST allow marking planned payments as complete (which logs the actual payment)
- **FR-023**: System MUST display payoff timeline visualization

**Reminders**
- **FR-024**: System MUST send push notifications for payment due dates
- **FR-025**: System MUST allow customizable reminder lead time (1, 3, 7 days)
- **FR-026**: System MUST support recurring reminders (daily, weekly, monthly)
- **FR-027**: System MUST allow custom one-time reminders

**Journal**
- **FR-028**: System MUST allow journal entries of types: win, setback, reflection, call_log
- **FR-029**: System MUST allow optional mood rating (1-5) on entries
- **FR-030**: System MUST attach journal entries to specific debts when applicable
- **FR-031**: System MUST display user's "Why I Started" statement on demand

**AI Companion**
- **FR-032**: System MUST provide chat interface for AI companion "Shift"
- **FR-033**: System MUST personalize AI responses based on user's debt data
- **FR-034**: Free plan MUST limit AI messages to 5 per month
- **FR-035**: System MUST display suggested questions for users who don't know what to ask

**Learn Center**
- **FR-036**: System MUST organize lessons by category (Basics, Budgeting, Negotiation, Mindset)
- **FR-037**: System MUST track lesson completion progress
- **FR-038**: System MUST support learning streaks for consecutive-day completion
- **FR-039**: System MUST support premium-only lessons

**Negotiation**
- **FR-040**: System MUST provide creditor playbooks with phone, best times, scripts
- **FR-041**: System MUST allow one-tap copy of negotiation scripts
- **FR-042**: System MUST display success rates for negotiation tactics where available

**Milestones**
- **FR-043**: System MUST detect and celebrate milestone achievements (10, 25, 50, 75, 100%)
- **FR-044**: System MUST track payment streaks
- **FR-045**: System MUST display milestone history with achievement dates

**Dashboard**
- **FR-046**: System MUST display total debt, progress, and debt-free date
- **FR-047**: System MUST display daily motivational quote or verse
- **FR-048**: System MUST display upcoming payments
- **FR-049**: System MUST display budget snapshot

**Subscription**
- **FR-050**: System MUST support free plan with 3 debt limit and 5 AI messages/month
- **FR-051**: System MUST support Pro plan ($9.99/month) with unlimited debts and AI
- **FR-052**: System MUST offer 7-day free trial for paid plans

### Key Entities

- **User**: Account holder with profile, income settings, payoff strategy preference, and "Why I Started" statement
- **Debt**: Individual debt instrument with creditor, balance, APR, minimum payment, due date, and payment history
- **Payment**: Single payment record linked to a debt, with amount, date, and extra/minimum classification
- **Expense**: Recurring or one-time expense with category, amount, and essential/non-essential flag
- **Income Log**: Monthly income entry with amount, source type, and optional notes
- **Monthly Budget**: Calculated summary for a month with totals and safe-to-extra amount
- **Planned Payment**: Scheduled future payment with debt, amount, date, and completion status
- **Reminder**: Scheduled notification with title, date/time, repeat settings, and completion status
- **Journal Entry**: User-written entry with type, title, content, optional mood, and optional debt link
- **Lesson**: Educational content with category, title, duration, content, and premium flag
- **Lesson Progress**: User's completion status for a lesson with date and optional quiz score
- **Creditor**: Known creditor with phone, best call times, hardship programs, and success rates
- **Milestone**: Achievement record with type (percentage or streak), value, and achievement date
- **Chat Message**: AI conversation record with role (user/assistant) and content

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Adoption**
- **SC-001**: 40% of users who download the app complete the full onboarding flow
- **SC-002**: 80% of users who complete onboarding add at least one debt within 24 hours
- **SC-003**: 500 users complete onboarding within the first 8 weeks of launch

**Engagement**
- **SC-004**: 30% of users return to the app at least once within their first week
- **SC-005**: 20% of users log at least one payment within their first month
- **SC-006**: Users can check their debt status in under 10 seconds from app open
- **SC-007**: 50 users view negotiation scripts within the first 8 weeks

**Core Value Delivery**
- **SC-008**: Users can add a new debt in under 2 minutes
- **SC-009**: Users can log a payment in under 30 seconds
- **SC-010**: Users can calculate their safe-to-extra amount in under 60 seconds
- **SC-011**: Budget calculation updates reflect within 2 seconds of income/expense changes

**Satisfaction**
- **SC-012**: Net Promoter Score (NPS) exceeds 40 in user surveys
- **SC-013**: App store rating averages 4.0 stars or higher
- **SC-014**: Support tickets related to confusion average less than 5% of active users per month

**Business**
- **SC-015**: 10% of users who complete a 7-day trial convert to paid subscription

## Assumptions

The following reasonable defaults were applied based on industry standards and the project context:

1. **Authentication**: Email/password authentication with standard password reset flow (no SSO for MVP)
2. **Data Retention**: User data retained indefinitely while account is active; 30-day grace period after account deletion request
3. **Performance**: Standard mobile app expectations (screens load within 1.5 seconds, interactions respond within 200ms)
4. **Currency**: US dollars for MVP; localization deferred to future versions
5. **Offline Support**: Read-only offline access with sync queue for writes when connectivity returns
6. **AI Provider**: Claude API for AI companion (based on project context)
7. **Notification Timing**: Default reminder at 9:00 AM local time unless user specifies otherwise
8. **Streak Reset**: Learning streaks reset after 48 hours of no lesson completion (allowing for timezone variations)
9. **Free Trial**: 7-day trial grants full Pro access, no credit card required upfront
10. **Decimal Precision**: All financial calculations use 2 decimal places, stored as decimal types (not floating point)
