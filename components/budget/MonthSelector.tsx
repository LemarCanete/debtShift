import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/theme';
import { formatMonth, getPreviousMonth, getNextMonth, getCurrentMonth } from '@/services/budget';

interface MonthSelectorProps {
  month: string;
  onMonthChange: (month: string) => void;
}

/**
 * Month/Year picker for budget screens
 * Shows current month with previous/next navigation
 */
export function MonthSelector({ month, onMonthChange }: MonthSelectorProps) {
  const currentMonth = getCurrentMonth();
  const isCurrentMonth = month === currentMonth;
  const isFutureMonth = month > currentMonth;

  const handlePrevious = () => {
    onMonthChange(getPreviousMonth(month));
  };

  const handleNext = () => {
    const nextMonth = getNextMonth(month);
    // Allow viewing up to 1 month in the future
    const maxMonth = getNextMonth(currentMonth);
    if (nextMonth <= maxMonth) {
      onMonthChange(nextMonth);
    }
  };

  const handleToday = () => {
    onMonthChange(currentMonth);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.arrow, pressed && styles.arrowPressed]}
        onPress={handlePrevious}
        accessibilityLabel="Previous month"
      >
        <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.monthButton, pressed && styles.monthButtonPressed]}
        onPress={handleToday}
        disabled={isCurrentMonth}
        accessibilityLabel={isCurrentMonth ? formatMonth(month) : `Go to current month`}
      >
        <Text style={styles.monthText}>{formatMonth(month)}</Text>
        {!isCurrentMonth && (
          <Text style={styles.todayHint}>Tap for today</Text>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.arrow,
          pressed && styles.arrowPressed,
          isFutureMonth && styles.arrowDisabled,
        ]}
        onPress={handleNext}
        disabled={isFutureMonth}
        accessibilityLabel="Next month"
      >
        <Ionicons
          name="chevron-forward"
          size={24}
          color={isFutureMonth ? colors.text.muted : colors.text.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.md,
  },
  arrow: {
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.full,
  },
  arrowPressed: {
    backgroundColor: colors.surfaceHover,
  },
  arrowDisabled: {
    opacity: 0.4,
  },
  monthButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  monthButtonPressed: {
    opacity: 0.7,
  },
  monthText: {
    ...typography.h3,
    color: colors.text.primary,
  },
  todayHint: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
});

export default MonthSelector;
