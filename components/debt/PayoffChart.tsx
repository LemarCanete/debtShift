import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import { getPayoffChartData } from '@/services/calculator';

interface PayoffChartProps {
  balance: number;
  apr: number;
  minimumPayment: number;
  color?: string;
  extraPayment?: number;
  height?: number;
}

/**
 * Simple payoff chart showing projected balance over time
 */
export function PayoffChart({
  balance,
  apr,
  minimumPayment,
  color = colors.primary,
  extraPayment = 0,
  height = 150,
}: PayoffChartProps) {
  // If payment is less than monthly interest, payoff is impossible
  const monthlyInterest = (balance * apr) / 100 / 12;
  if (minimumPayment <= monthlyInterest) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.impossibleContainer}>
          <Text style={styles.impossibleText}>
            Payment doesn't cover interest
          </Text>
          <Text style={styles.impossibleHint}>
            Minimum payment needs to be at least{' '}
            {formatCurrency(monthlyInterest + 1)}
          </Text>
        </View>
      </View>
    );
  }

  const chartData = getPayoffChartData(
    balance,
    apr,
    minimumPayment + extraPayment,
    8
  );

  if (chartData.length === 0) {
    return null;
  }

  const maxBalance = Math.max(...chartData.map((d) => d.balance), balance);
  const chartWidth = Dimensions.get('window').width - spacing.lg * 4;
  const chartHeight = height - 40; // Leave room for labels

  // Calculate points for the path
  const points = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - (point.balance / maxBalance) * chartHeight;
    return { x, y, ...point };
  });

  // Add starting point
  const startY = chartHeight - (balance / maxBalance) * chartHeight;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chart}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{formatCurrency(maxBalance, { compact: true })}</Text>
          <Text style={styles.axisLabel}>{formatCurrency(maxBalance / 2, { compact: true })}</Text>
          <Text style={styles.axisLabel}>$0</Text>
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: chartHeight / 2 }]} />
          <View style={[styles.gridLine, { top: chartHeight }]} />

          {/* Data line using View elements */}
          <View style={styles.lineContainer}>
            {points.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = points[index - 1];
              const dx = point.x - prevPoint.x;
              const dy = point.y - prevPoint.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);

              return (
                <View
                  key={index}
                  style={[
                    styles.lineSegment,
                    {
                      left: prevPoint.x,
                      top: prevPoint.y,
                      width: length,
                      backgroundColor: color,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}

            {/* Data points */}
            {points.map((point, index) => (
              <View
                key={`point-${index}`}
                style={[
                  styles.dataPoint,
                  {
                    left: point.x - 4,
                    top: point.y - 4,
                    backgroundColor: color,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        <Text style={styles.axisLabel}>Now</Text>
        {chartData.length > 2 && (
          <Text style={styles.axisLabel}>
            {Math.floor(chartData[Math.floor(chartData.length / 2)].month / 12)}y{' '}
            {chartData[Math.floor(chartData.length / 2)].month % 12}m
          </Text>
        )}
        <Text style={styles.axisLabel}>
          {Math.floor(chartData[chartData.length - 1].month / 12)}y{' '}
          {chartData[chartData.length - 1].month % 12}m
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  impossibleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
  },
  impossibleText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  impossibleHint: {
    ...typography.small,
    color: colors.text.muted,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    flex: 1,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 50,
    paddingTop: spacing.xs,
  },
  axisLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
});

export default PayoffChart;
