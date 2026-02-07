import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/theme';

interface Quote {
  id: string;
  text: string;
  author: string;
  quote_type: 'quote' | 'verse';
}

interface DailyQuoteProps {
  quote: Quote | null;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

/**
 * DailyQuote - Motivational quote/verse display with refresh
 * T088: Create components/dashboard/DailyQuote.tsx
 */
export function DailyQuote({
  quote,
  isLoading = false,
  onRefresh,
}: DailyQuoteProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true);

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  if (!quote) {
    return null;
  }

  const isVerse = quote.quote_type === 'verse';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeIndicator}>
          <Text style={styles.typeText}>
            {isVerse ? 'Daily Verse' : 'Daily Quote'}
          </Text>
        </View>
        {onRefresh && (
          <Pressable
            onPress={handleRefresh}
            disabled={isRefreshing}
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.refreshButtonPressed,
            ]}
            accessibilityLabel="Get new quote"
            accessibilityRole="button"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.refreshIcon}>↻</Text>
            )}
          </Pressable>
        )}
      </View>

      <Text style={styles.quoteText}>"{quote.text}"</Text>

      <Text style={styles.author}>
        {isVerse ? quote.author : `— ${quote.author}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeIndicator: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  typeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonPressed: {
    opacity: 0.7,
  },
  refreshIcon: {
    fontSize: 18,
    color: colors.primary,
  },
  quoteText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  author: {
    ...typography.small,
    color: colors.text.muted,
    textAlign: 'right',
  },
  skeleton: {
    height: 80,
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.borderRadius.md,
  },
});
