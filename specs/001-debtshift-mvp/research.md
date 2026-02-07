# Research: DebtShift MVP

**Branch**: `001-debtshift-mvp` | **Date**: 2026-02-08

## Technology Decisions

### 1. Mobile Framework: React Native with Expo

**Decision**: Use React Native with Expo SDK 50+ and Expo Router for navigation.

**Rationale**:
- Cross-platform (iOS + Android) from single codebase reduces development time by ~40%
- Expo provides managed workflow for builds, updates, and native modules
- Expo Router offers file-based routing matching Next.js patterns (developer familiarity)
- Active ecosystem with strong TypeScript support
- EAS Build handles iOS/Android builds without local environment setup

**Alternatives Considered**:
- Flutter: Rejected due to team familiarity with React ecosystem and Dart learning curve
- Native (Swift/Kotlin): Rejected due to 2x development cost for separate codebases
- PWA: Rejected due to limited offline capabilities and push notification restrictions on iOS

### 2. Backend: Supabase

**Decision**: Use Supabase (PostgreSQL, Auth, Edge Functions, Realtime).

**Rationale**:
- PostgreSQL provides ACID compliance critical for financial data
- Built-in Row Level Security (RLS) simplifies authorization
- Edge Functions run TypeScript (code sharing with frontend)
- Realtime subscriptions enable live balance updates
- Generous free tier (500MB database, 50K monthly active users)
- Hosted infrastructure reduces DevOps burden for MVP

**Alternatives Considered**:
- Firebase: Rejected due to NoSQL limitations for relational financial data
- Custom Node.js + PostgreSQL: Rejected due to infrastructure overhead for MVP
- AWS Amplify: Rejected due to complexity and AWS vendor lock-in

### 3. State Management: Zustand + React Query

**Decision**: Use Zustand for local state, React Query for server state.

**Rationale**:
- Zustand: Minimal boilerplate, TypeScript-first, <2KB bundle size
- React Query: Handles caching, background refetch, optimistic updates
- Clear separation: Zustand for UI state (modals, forms), React Query for API data
- React Query persistence plugin enables offline-first architecture

**Alternatives Considered**:
- Redux Toolkit: Rejected due to boilerplate overhead for MVP scope
- Jotai/Recoil: Similar to Zustand but less ecosystem support
- Context + useReducer: Rejected due to re-render performance at scale

### 4. Styling: NativeWind (Tailwind CSS)

**Decision**: Use NativeWind 4.x for styling with custom theme tokens.

**Rationale**:
- Tailwind-style utilities reduce context switching for web developers
- Theme tokens enforce design system compliance (Constitution III)
- CSS variables enable dark/light mode switching
- Smaller bundle than styled-components or Emotion

**Alternatives Considered**:
- StyleSheet.create: Rejected due to lack of design token enforcement
- Styled Components: Rejected due to bundle size (~12KB) and runtime cost
- Tamagui: Promising but less mature ecosystem

### 5. Animations: React Native Reanimated 3

**Decision**: Use Reanimated 3.x for all animations.

**Rationale**:
- Runs on UI thread (60fps guaranteed)
- Gesture Handler integration for swipe actions
- Layout animations for list operations
- Required for milestone celebrations and progress animations

**Alternatives Considered**:
- Animated API: Rejected due to JS thread bottleneck
- Moti: Built on Reanimated, adds unnecessary abstraction

### 6. AI Companion: Claude API via Edge Function

**Decision**: Use Claude API (claude-3-haiku) proxied through Supabase Edge Function.

**Rationale**:
- Claude's personality aligns with "calm, supportive" design principle
- Haiku model provides fast responses (<1s) at low cost (~$0.25/1M tokens)
- Edge Function proxy hides API key and enables rate limiting
- System prompt includes user's debt context for personalization

**Alternatives Considered**:
- GPT-4: Higher cost, less suitable personality for emotional support
- Local LLM: Rejected due to device memory constraints
- Anthropic SDK direct: Rejected due to API key exposure risk

### 7. Push Notifications: Expo Notifications + Supabase Edge

**Decision**: Use expo-notifications with Supabase Edge Function triggers.

**Rationale**:
- Expo handles push token management across iOS/Android
- Edge Functions can schedule and send notifications
- Supabase pg_cron extension for scheduled reminders
- No third-party service (OneSignal, Firebase) reduces complexity

**Alternatives Considered**:
- Firebase Cloud Messaging: Adds Google dependency
- OneSignal: Additional vendor, free tier limitations

### 8. Offline Support: React Query + AsyncStorage

**Decision**: Use React Query persistence with AsyncStorage.

**Rationale**:
- React Query's persistQueryClient caches all queries automatically
- AsyncStorage is built into Expo (no additional dependency)
- Optimistic updates + mutation queue for offline writes
- Constitution IV requires offline viewing capability

**Alternatives Considered**:
- WatermelonDB: Overkill for MVP scope, adds sync complexity
- MMKV: Faster but requires native module setup
- SQLite: Adds complexity without significant benefit for data size

### 9. Financial Calculations: Decimal.js

**Decision**: Use Decimal.js for all monetary calculations.

**Rationale**:
- Constitution requires decimal precision (not floating point)
- Prevents rounding errors in payment calculations
- Small bundle size (~8KB)
- Standard in financial applications

**Alternatives Considered**:
- Big.js: Similar but less precision options
- Native BigInt: Lacks decimal support
- Dinero.js: More opinionated, larger bundle

### 10. Testing Strategy

**Decision**: Jest (unit), Supabase local (integration), Maestro (E2E).

**Rationale**:
- Jest: Industry standard, excellent TypeScript support
- Supabase CLI: Local PostgreSQL instance for integration tests
- Maestro: Mobile-native E2E, YAML-based flows, no flakiness

**Alternatives Considered**:
- Detox: Complex setup, known flakiness issues
- Appium: Slower, more infrastructure overhead
- Cypress: Web-only, doesn't support React Native

## Resolved Clarifications

All technical decisions from the project specification have been validated:

| Topic | Decision | Source |
|-------|----------|--------|
| Mobile framework | React Native + Expo | project_spec.md |
| Backend | Supabase | project_spec.md |
| State management | Zustand | project_spec.md |
| UI animations | Reanimated | project_spec.md |
| AI provider | Claude API | spec.md assumptions |
| Offline support | React Query + AsyncStorage | Constitution IV |
| Financial precision | Decimal.js | Constitution Data Integrity |

## Best Practices Applied

### React Native + Expo

1. Use Expo Router for file-based navigation (matches Next.js patterns)
2. Implement skeleton screens for all async data loading
3. Use `expo-haptics` for tactile feedback on important actions
4. Configure `app.json` splash screen for fast perceived load time
5. Use EAS Build profiles for development, preview, and production

### Supabase

1. Enable RLS on all tables; default deny, explicit allow
2. Use database functions for complex calculations (payoff projections)
3. Create indexes on frequently queried columns (user_id, created_at)
4. Use `select()` with specific columns to minimize payload
5. Implement soft deletes (is_deleted flag) for audit trail

### TypeScript

1. Enable strict mode in tsconfig.json
2. Use Zod for runtime validation of API responses
3. Define shared types in `/types` directory
4. Use discriminated unions for state machines (auth, onboarding)
5. Avoid `any`; use `unknown` with type guards

### Performance

1. Lazy load screens using React.lazy with Suspense boundaries
2. Memoize expensive calculations with useMemo
3. Use React.memo for list item components
4. Implement virtualized lists for payments/history
5. Compress images at build time with expo-image

## Security Considerations

1. **API Keys**: All secrets in environment variables, never committed
2. **Authentication**: Supabase Auth with secure token refresh
3. **RLS Policies**: Every table query filtered by `auth.uid()`
4. **Input Validation**: Zod schemas on all user inputs
5. **Audit Logging**: Payment mutations logged with timestamp and user
6. **Rate Limiting**: Edge Function middleware for AI companion
