import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import { Card } from '@/components/ui';
import type { IncomeLog } from '@/types/database';
import { INCOME_SOURCES } from '@/utils/constants';

interface IncomeCardProps {
  incomeLogs: IncomeLog[];
  totalIncome: number;
  onAddIncome: () => void;
  onEditIncome?: (income: IncomeLog) => void;
}

const SOURCE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  primary: 'briefcase',
  side_hustle: 'flash',
  bonus: 'gift',
  other: 'wallet',
};

const SOURCE_COLORS: Record<string, string> = {
  primary: colors.success,
  side_hustle: colors.primary,
  bonus: colors.warning,
  other: colors.text.muted,
};

/**
 * Income card with breakdown by source and add button
 */
export function IncomeCard({
  incomeLogs,
  totalIncome,
  onAddIncome,
  onEditIncome,
}: IncomeCardProps) {
  // Group income by source
  const incomeBySource = incomeLogs.reduce(
    (acc, log) => {
      const source = log.source || 'other';
      if (!acc[source]) {
        acc[source] = { total: 0, logs: [] };
      }
      acc[source].total += log.amount;
      acc[source].logs.push(log);
      return acc;
    },
    {} as Record<string, { total: number; logs: IncomeLog[] }>
  );

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="trending-up" size={20} color={colors.success} />
          <Text style={styles.title}>Income</Text>
        </View>
        <Text style={styles.total}>{formatCurrency(totalIncome)}</Text>
      </View>

      {Object.entries(incomeBySource).length > 0 ? (
        <View style={styles.breakdown}>
          {Object.entries(incomeBySource).map(([source, data]) => (
            <Pressable
              key={source}
              style={({ pressed }) => [
                styles.sourceRow,
                pressed && onEditIncome && styles.sourceRowPressed,
              ]}
              onPress={() => {
                if (onEditIncome && data.logs[0]) {
                  onEditIncome(data.logs[0]);
                }
              }}
              disabled={!onEditIncome}
            >
              <View style={styles.sourceInfo}>
                <View
                  style={[
                    styles.sourceIcon,
                    { backgroundColor: SOURCE_COLORS[source] + '20' },
                  ]}
                >
                  <Ionicons
                    name={SOURCE_ICONS[source] || 'wallet'}
                    size={16}
                    color={SOURCE_COLORS[source]}
                  />
                </View>
                <Text style={styles.sourceName}>
                  {INCOME_SOURCES.find((s) => s.value === source)?.label ||
                    source}
                </Text>
              </View>
              <Text style={styles.sourceAmount}>
                {formatCurrency(data.total)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No income logged this month</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
        ]}
        onPress={onAddIncome}
        accessibilityLabel="Add income"
      >
        <Ionicons name="add-circle" size={20} color={colors.primary} />
        <Text style={styles.addButtonText}>Add Income</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  total: {
    ...typography.h3,
    color: colors.success,
    fontWeight: '700',
  },
  breakdown: {
    marginBottom: spacing.md,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sourceRowPressed: {
    backgroundColor: colors.surfaceHover,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourceIcon: {
    width: 32,
    height: 32,
    borderRadius: spacing.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceName: {
    ...typography.body,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  sourceAmount: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.muted,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default IncomeCard;
