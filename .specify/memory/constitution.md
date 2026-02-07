<!--
=== SYNC IMPACT REPORT ===
Version change: N/A → 1.0.0
Added sections:
  - Core Principles (4 principles)
  - Technology Standards
  - Development Workflow
  - Governance
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (already compatible)
  - .specify/templates/spec-template.md ✅ (already compatible)
  - .specify/templates/tasks-template.md ✅ (already compatible)
Follow-up TODOs: None
========================
-->

# DebtShift Constitution

## Core Principles

### I. Code Quality First

All code MUST adhere to consistent, maintainable standards that prioritize clarity over cleverness.

- **TypeScript Strict Mode**: All TypeScript code MUST compile with `strict: true` - no `any` types except with explicit justification
- **Single Responsibility**: Each function/component MUST do one thing well; files MUST NOT exceed 300 lines without architectural justification
- **Explicit over Implicit**: Dependencies MUST be explicitly declared; no hidden side effects in functions
- **Naming Conventions**: Variables/functions MUST use descriptive names; boolean variables MUST start with `is`, `has`, `can`, or `should`
- **Error Handling**: All errors MUST be caught, logged, and handled gracefully; never swallow errors silently
- **Code Review Required**: All PRs MUST pass review before merge; reviewers MUST verify principle compliance

**Rationale**: Debt management software handles sensitive financial data. Code quality directly impacts user trust and system reliability.

### II. Testing as Verification

Testing MUST validate that features work correctly and continue working as the codebase evolves.

- **Test Coverage Targets**: Critical paths (payments, balances, user auth) MUST have 90%+ coverage; general features MUST have 70%+ coverage
- **Test Types Required**:
  - Unit tests for business logic and utilities
  - Integration tests for API endpoints and database operations
  - E2E tests for critical user journeys (debt creation, payment tracking, reports)
- **Test Naming**: Tests MUST describe behavior: `should [expected behavior] when [condition]`
- **No Flaky Tests**: Tests that fail intermittently MUST be fixed immediately or quarantined with tracked issue
- **Test Data Isolation**: Each test MUST create its own data; tests MUST NOT depend on execution order

**Rationale**: Financial calculations and payment tracking cannot tolerate regressions. Comprehensive testing protects users from incorrect debt information.

### III. User Experience Consistency

Every interaction MUST feel cohesive, accessible, and predictable across all surfaces.

- **Design System Compliance**: All UI MUST use established design tokens (colors, typography, spacing); no hardcoded values
- **Accessibility Requirements**: All features MUST meet WCAG 2.1 AA standards; interactive elements MUST be keyboard navigable
- **Loading States**: All async operations MUST show loading indicators; users MUST never see blank screens during data fetches
- **Error Feedback**: User-facing errors MUST be actionable ("Payment failed. Check your connection and try again."); never show raw technical errors
- **Responsive Design**: All screens MUST work on mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Haptic/Audio Feedback**: Payment confirmations and milestone achievements MUST provide appropriate feedback

**Rationale**: Users managing debt are often stressed. Consistent, reassuring UX reduces cognitive load and builds trust in the application.

### IV. Performance Requirements

The application MUST be fast and responsive to maintain user engagement and trust.

- **Initial Load**: First contentful paint MUST occur within 1.5 seconds on 4G connections
- **API Response Times**:
  - Read operations: p95 < 200ms
  - Write operations: p95 < 500ms
  - Report generation: p95 < 3 seconds
- **Bundle Size**: Main JavaScript bundle MUST NOT exceed 200KB gzipped; lazy-load non-critical features
- **Database Queries**: No N+1 queries; all list queries MUST be paginated with max 50 items default
- **Memory Management**: No memory leaks; components MUST clean up subscriptions and timers on unmount
- **Offline Capability**: Core debt viewing MUST work offline; sync queue for offline modifications

**Rationale**: Users often check debt status in quick moments (waiting in line, between tasks). Fast performance respects their time and encourages regular engagement.

## Technology Standards

### Stack Requirements

- **Frontend**: React Native with Expo for mobile; Next.js for web admin (if applicable)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **Language**: TypeScript for all application code; SQL for database operations
- **Styling**: NativeWind (Tailwind for React Native) with design tokens

### Security Standards

- All API calls MUST use authenticated sessions via Supabase Auth
- Row Level Security (RLS) MUST be enabled on all tables containing user data
- PII MUST be encrypted at rest; sensitive operations MUST be logged for audit
- No secrets in code; all credentials via environment variables

### Data Integrity

- All financial calculations MUST use decimal types (not floating point)
- All mutations MUST be idempotent where possible
- Audit trail MUST exist for payment records and debt modifications

## Development Workflow

### Branch Strategy

- `main`: Production-ready code only
- `develop`: Integration branch for features
- Feature branches: `feat/[description]` or `[issue-number]-[description]`

### Quality Gates

Every PR MUST pass before merge:
1. All tests pass (unit, integration, E2E where applicable)
2. No TypeScript errors
3. Linting passes (ESLint, Prettier)
4. Bundle size check (if frontend changes)
5. Code review approval (1+ reviewer)

### Commit Standards

- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Reference issue numbers where applicable
- Keep commits atomic and focused

## Governance

This Constitution supersedes all other development practices for the DebtShift project.

### Amendment Process

1. Propose changes via PR to this document
2. Changes require discussion and approval from project maintainers
3. Breaking changes (principle modifications/removals) require MAJOR version bump
4. All dependent templates MUST be updated to reflect constitutional changes

### Compliance Verification

- All code reviews MUST verify compliance with these principles
- Violations MUST be documented if approved (in Complexity Tracking section of plan.md)
- Quarterly review of constitution relevance and effectiveness

### Runtime Guidance

For day-to-day development decisions, consult:
- `.specify/` templates for feature specification workflows
- `CLAUDE.md` (when created) for agent-specific development guidance

**Version**: 1.0.0 | **Ratified**: 2026-02-08 | **Last Amended**: 2026-02-08
