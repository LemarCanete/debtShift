import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/theme';
import { borderRadius } from '@/theme/spacing';
import type { PlannedPaymentWithDebt } from '@/services/planner';

/**
 * Calendar View Component
 * T106: Create components/planner/CalendarView.tsx with month grid and event dots
 */

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (month: string) => void;
  calendarData: Record<string, PlannedPaymentWithDebt[]>;
  isLoading?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarView({
  selectedDate,
  onSelectDate,
  onMonthChange,
  calendarData,
  isLoading = false,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const handlePrevMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prevMonth = subMonths(currentMonth, 1);
    setCurrentMonth(prevMonth);
    onMonthChange(format(prevMonth, 'yyyy-MM'));
  }, [currentMonth, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextMonth = addMonths(currentMonth, 1);
    setCurrentMonth(nextMonth);
    onMonthChange(format(nextMonth, 'yyyy-MM'));
  }, [currentMonth, onMonthChange]);

  const handleSelectDay = useCallback(
    (day: Date) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelectDate(day);
    },
    [onSelectDate]
  );

  const getPaymentsForDay = (day: Date): PlannedPaymentWithDebt[] => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return calendarData[dateKey] || [];
  };

  const renderDay = (day: Date, index: number) => {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isSelected = isSameDay(day, selectedDate);
    const isToday = isSameDay(day, new Date());
    const payments = getPaymentsForDay(day);
    const hasPayments = payments.length > 0;
    const hasCompletedPayments = payments.some((p) => p.is_completed);
    const hasPendingPayments = payments.some((p) => !p.is_completed);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          isSelected && styles.dayCellSelected,
          isToday && !isSelected && styles.dayCellToday,
        ]}
        onPress={() => handleSelectDay(day)}
        disabled={!isCurrentMonth}
        accessibilityLabel={`${format(day, 'MMMM d, yyyy')}${hasPayments ? `, ${payments.length} payments` : ''}`}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.dayTextMuted,
            isSelected && styles.dayTextSelected,
            isToday && !isSelected && styles.dayTextToday,
          ]}
        >
          {format(day, 'd')}
        </Text>
        {hasPayments && (
          <View style={styles.dotsContainer}>
            {hasPendingPayments && <View style={[styles.dot, styles.dotPending]} />}
            {hasCompletedPayments && <View style={[styles.dot, styles.dotCompleted]} />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.navButton}
          accessibilityLabel="Previous month"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.navButton}
          accessibilityLabel="Next month"
        >
          <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {days.map((day, index) => renderDay(day, index))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotPending]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotCompleted]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    padding: spacing.sm,
  },
  monthTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekdayText: {
    ...typography.caption,
    color: colors.text.muted,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  dayText: {
    ...typography.body,
    color: colors.text.primary,
  },
  dayTextMuted: {
    color: colors.text.muted,
  },
  dayTextSelected: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotPending: {
    backgroundColor: colors.primary,
  },
  dotCompleted: {
    backgroundColor: colors.success,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
