import { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import { format, addMonths } from 'date-fns';
import { colors, typography, spacing } from '@/theme';
import { borderRadius } from '@/theme/spacing';
import { formatCurrency } from '@/utils/formatters';
import type { Debt } from '@/types/database';

/**
 * Payoff Timeline Component
 * T108: Create components/planner/PayoffTimeline.tsx with projected balance chart over months
 */

interface PayoffTimelineProps {
  debts: Debt[];
  monthlyExtra?: number;
  monthsToProject?: number;
  isLoading?: boolean;
}

interface ProjectedBalance {
  month: Date;
  balance: number;
  label: string;
}

const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 20, bottom: 40, left: 60 };

export function PayoffTimeline({
  debts,
  monthlyExtra = 0,
  monthsToProject = 12,
  isLoading = false,
}: PayoffTimelineProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.md * 2 - CHART_PADDING.left - CHART_PADDING.right;

  const projectedBalances = useMemo(() => {
    const activeDebts = debts.filter((d) => d.is_active && d.balance > 0);
    if (activeDebts.length === 0) return [];

    const projections: ProjectedBalance[] = [];
    let currentBalances = activeDebts.map((d) => ({
      id: d.id,
      balance: d.balance,
      apr: d.apr,
      minimum: d.minimum_payment,
    }));

    const today = new Date();

    for (let i = 0; i <= monthsToProject; i++) {
      const month = addMonths(today, i);
      const totalBalance = currentBalances.reduce((sum, d) => sum + d.balance, 0);

      projections.push({
        month,
        balance: Math.max(0, totalBalance),
        label: format(month, 'MMM'),
      });

      // Calculate next month's balances
      if (totalBalance > 0) {
        let extraRemaining = monthlyExtra;

        currentBalances = currentBalances.map((debt) => {
          if (debt.balance <= 0) return { ...debt, balance: 0 };

          // Add monthly interest
          const monthlyRate = debt.apr / 100 / 12;
          let newBalance = debt.balance * (1 + monthlyRate);

          // Subtract minimum payment
          newBalance = Math.max(0, newBalance - debt.minimum);

          // Apply extra payment (using avalanche - highest APR first)
          if (extraRemaining > 0 && newBalance > 0) {
            const extraPayment = Math.min(extraRemaining, newBalance);
            newBalance -= extraPayment;
            extraRemaining -= extraPayment;
          }

          return { ...debt, balance: newBalance };
        });

        // Sort by APR for avalanche method
        currentBalances.sort((a, b) => b.apr - a.apr);
      }
    }

    return projections;
  }, [debts, monthlyExtra, monthsToProject]);

  if (isLoading || projectedBalances.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Payoff Timeline</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isLoading ? 'Loading...' : 'Add debts to see your payoff projection'}
          </Text>
        </View>
      </View>
    );
  }

  const maxBalance = Math.max(...projectedBalances.map((p) => p.balance));
  const minBalance = 0;
  const yRange = maxBalance - minBalance;

  const getX = (index: number) =>
    CHART_PADDING.left + (index / (projectedBalances.length - 1)) * chartWidth;

  const getY = (balance: number) =>
    CHART_PADDING.top +
    ((maxBalance - balance) / yRange) * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);

  // Create SVG path
  const pathData = projectedBalances
    .map((p, i) => {
      const x = getX(i);
      const y = getY(p.balance);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Create area path (for fill)
  const areaPath = `${pathData} L ${getX(projectedBalances.length - 1)} ${CHART_HEIGHT - CHART_PADDING.bottom} L ${CHART_PADDING.left} ${CHART_HEIGHT - CHART_PADDING.bottom} Z`;

  // Y-axis labels
  const yAxisLabels = [maxBalance, maxBalance * 0.5, 0].map((value) => ({
    value,
    y: getY(value),
    label: formatCurrency(value, true),
  }));

  // X-axis labels (show every 3 months)
  const xAxisLabels = projectedBalances
    .filter((_, i) => i % 3 === 0 || i === projectedBalances.length - 1)
    .map((p, _, arr) => ({
      month: p.month,
      label: p.label,
      x: getX(projectedBalances.indexOf(p)),
    }));

  const currentBalance = projectedBalances[0]?.balance || 0;
  const finalBalance = projectedBalances[projectedBalances.length - 1]?.balance || 0;
  const payoffMonth =
    finalBalance === 0
      ? projectedBalances.find((p) => p.balance === 0)?.month
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payoff Timeline</Text>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Now</Text>
          <Text style={styles.summaryValue}>{formatCurrency(currentBalance)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>In {monthsToProject} months</Text>
          <Text style={[styles.summaryValue, finalBalance === 0 && styles.summaryValueSuccess]}>
            {formatCurrency(finalBalance)}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg width={screenWidth - spacing.md * 2} height={CHART_HEIGHT}>
          {/* Grid lines */}
          {yAxisLabels.map((label, i) => (
            <Line
              key={i}
              x1={CHART_PADDING.left}
              y1={label.y}
              x2={CHART_PADDING.left + chartWidth}
              y2={label.y}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}

          {/* Area fill */}
          <Path
            d={areaPath}
            fill={colors.primary + '20'}
          />

          {/* Line */}
          <Path
            d={pathData}
            stroke={colors.primary}
            strokeWidth={2}
            fill="none"
          />

          {/* Start point */}
          <Circle
            cx={getX(0)}
            cy={getY(projectedBalances[0].balance)}
            r={4}
            fill={colors.primary}
          />

          {/* End point */}
          <Circle
            cx={getX(projectedBalances.length - 1)}
            cy={getY(finalBalance)}
            r={4}
            fill={finalBalance === 0 ? colors.success : colors.primary}
          />

          {/* Y-axis labels */}
          {yAxisLabels.map((label, i) => (
            <SvgText
              key={i}
              x={CHART_PADDING.left - 8}
              y={label.y + 4}
              fontSize={10}
              fill={colors.text.muted}
              textAnchor="end"
            >
              {label.label}
            </SvgText>
          ))}

          {/* X-axis labels */}
          {xAxisLabels.map((label, i) => (
            <SvgText
              key={i}
              x={label.x}
              y={CHART_HEIGHT - 10}
              fontSize={10}
              fill={colors.text.muted}
              textAnchor="middle"
            >
              {label.label}
            </SvgText>
          ))}
        </Svg>
      </View>

      {/* Payoff message */}
      {payoffMonth && (
        <View style={styles.payoffMessage}>
          <Text style={styles.payoffText}>
            Projected debt-free by {format(payoffMonth, 'MMMM yyyy')}!
          </Text>
        </View>
      )}

      {monthlyExtra > 0 && (
        <Text style={styles.extraNote}>
          *Projection includes ${monthlyExtra}/month in extra payments
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  title: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  summaryValueSuccess: {
    color: colors.success,
  },
  chartContainer: {
    marginHorizontal: -spacing.md,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
  },
  payoffMessage: {
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  payoffText: {
    ...typography.smallBold,
    color: colors.success,
  },
  extraNote: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
