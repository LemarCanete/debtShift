import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useEffect } from 'react';
import { colors, typography } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
}

/**
 * ProgressRing - Animated circular progress indicator
 * T085: Create components/dashboard/ProgressRing.tsx
 */
export function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 10,
  showPercentage = true,
  color = colors.success,
  backgroundColor = colors.border,
}: ProgressRingProps) {
  const animatedProgress = useSharedValue(0);

  // Calculate circle dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    // Animate to new progress value
    animatedProgress.value = withTiming(Math.min(100, Math.max(0, progress)), {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (animatedProgress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  // Determine color based on progress
  const getProgressColor = () => {
    if (progress >= 75) return colors.success;
    if (progress >= 50) return colors.successLight;
    if (progress >= 25) return colors.primary;
    return colors.primaryLight;
  };

  const progressColor = color || getProgressColor();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {showPercentage && (
        <View style={styles.labelContainer}>
          <Text style={styles.percentageText}>
            {Math.round(progress)}%
          </Text>
          <Text style={styles.paidText}>paid</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: '700',
  },
  paidText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: -2,
  },
});
