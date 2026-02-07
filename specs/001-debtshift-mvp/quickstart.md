# Quickstart: DebtShift MVP

**Branch**: `001-debtshift-mvp` | **Date**: 2026-02-08

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Expo CLI: `npm install -g expo-cli`
- Supabase CLI: `npm install -g supabase`
- iOS Simulator (macOS) or Android Emulator
- Supabase account (free tier sufficient)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/debtshift.git
cd debtshift

# Install dependencies
npm install

# Install Expo dependencies
npx expo install
```

### 2. Environment Configuration

Create `.env.local` from template:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase (get from supabase.com dashboard)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Companion (for Edge Function)
ANTHROPIC_API_KEY=sk-ant-your-key

# Push Notifications (optional for development)
EXPO_PUBLIC_PUSH_TOKEN=your-expo-push-token
```

### 3. Supabase Setup

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed initial data (lessons, categories, creditors)
supabase db seed
```

### 4. Start Development

```bash
# Start Expo development server
npx expo start

# Press 'i' for iOS Simulator
# Press 'a' for Android Emulator
# Scan QR code with Expo Go app for physical device
```

## Project Structure Overview

```
debtshift/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login/signup flows
│   ├── (onboarding)/      # First-time user setup
│   ├── (tabs)/            # Main tab navigation
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── stores/                # Zustand state stores
├── services/              # API and business logic
├── hooks/                 # Custom React hooks
├── utils/                 # Utilities and helpers
├── theme/                 # Design tokens
├── supabase/              # Database and functions
│   ├── migrations/        # SQL migrations
│   └── functions/         # Edge Functions
└── tests/                 # Test files
```

## Key Commands

### Development

```bash
# Start development server
npx expo start

# Start with cache cleared
npx expo start -c

# Run on specific platform
npx expo run:ios
npx expo run:android
```

### Database

```bash
# Create new migration
supabase migration new add_feature_table

# Apply migrations locally
supabase db reset

# Push migrations to remote
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > types/database.ts
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run E2E tests (requires running app)
maestro test tests/e2e/onboarding.yaml
```

### Edge Functions

```bash
# Serve functions locally
supabase functions serve

# Deploy single function
supabase functions deploy ai-companion

# Deploy all functions
supabase functions deploy
```

### Build & Deploy

```bash
# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Create preview build (internal testing)
eas build --profile preview --platform all

# Create production build
eas build --profile production --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## Development Workflow

### 1. Creating a New Feature

```bash
# Create feature branch
git checkout -b feat/add-payment-reminder

# Make changes, commit often
git add .
git commit -m "feat: add payment reminder notification"

# Push and create PR
git push -u origin feat/add-payment-reminder
```

### 2. Adding a New Screen

1. Create file in `app/` directory following Expo Router conventions:
   ```typescript
   // app/new-screen.tsx
   export default function NewScreen() {
     return <View>...</View>
   }
   ```

2. Navigation is automatic based on file structure.

### 3. Adding a New Component

```typescript
// components/feature/MyComponent.tsx
import { View, Text } from 'react-native'
import { cn } from '@/utils/cn'

interface MyComponentProps {
  title: string
  isActive?: boolean
}

export function MyComponent({ title, isActive = false }: MyComponentProps) {
  return (
    <View className={cn('p-4 rounded-lg', isActive && 'bg-amber-500')}>
      <Text className="text-white">{title}</Text>
    </View>
  )
}
```

### 4. Working with Supabase Data

```typescript
// hooks/useDebts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'

export function useDebts() {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('is_active', true)
        .order('balance', { ascending: true })

      if (error) throw error
      return data
    }
  })
}

export function useCreateDebt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (debt: NewDebt) => {
      const { data, error } = await supabase
        .from('debts')
        .insert(debt)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
    }
  })
}
```

### 5. Adding a Database Migration

```bash
# Create migration
supabase migration new add_notification_preferences

# Edit supabase/migrations/[timestamp]_add_notification_preferences.sql
```

```sql
-- Add notification preferences to users
ALTER TABLE users ADD COLUMN notification_preferences jsonb DEFAULT '{
  "payment_reminders": true,
  "weekly_checkins": true,
  "milestone_celebrations": true
}'::jsonb;

-- Create index for filtering
CREATE INDEX idx_users_notification_prefs
ON users USING gin (notification_preferences);
```

## Common Tasks

### Reset Local Database

```bash
supabase db reset
```

### View Database Logs

```bash
supabase db logs
```

### Test Edge Function Locally

```bash
# Start function server
supabase functions serve ai-companion --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/ai-companion \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I pay off debt faster?"}'
```

### Debug React Query

Add React Query DevTools in development:

```typescript
// app/_layout.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {__DEV__ && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
```

## Troubleshooting

### "Metro bundler not starting"

```bash
npx expo start -c  # Clear cache
rm -rf node_modules && npm install  # Reinstall deps
```

### "Supabase connection failed"

1. Check `.env.local` has correct URL and anon key
2. Verify project is running: `supabase status`
3. Check RLS policies allow the operation

### "TypeScript errors after migration"

```bash
# Regenerate types
supabase gen types typescript --local > types/database.ts
```

### "Tests failing with 'act' warnings"

Wrap state updates in tests:

```typescript
await act(async () => {
  fireEvent.press(button)
})
```

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [NativeWind Documentation](https://www.nativewind.dev)
- [Maestro E2E Testing](https://maestro.mobile.dev)

## Support

- GitHub Issues: [github.com/your-org/debtshift/issues](https://github.com/your-org/debtshift/issues)
- Internal Slack: #debtshift-dev
