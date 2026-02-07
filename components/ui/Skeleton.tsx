import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing } from '@/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton loading placeholder with shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = spacing.borderRadius.sm,
  style,
}: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({
  lines = 1,
  lastLineWidth = '60%',
  lineHeight = 16,
  gap = spacing.xs,
}: {
  lines?: number;
  lastLineWidth?: number | string;
  lineHeight?: number;
  gap?: number;
}) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </View>
  );
}

/**
 * Skeleton for cards
 */
export function SkeletonCard({
  height = 120,
  style,
}: {
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, { height }, style]}>
      <View style={styles.cardContent}>
        <Skeleton width={100} height={12} />
        <Skeleton width="70%" height={24} style={styles.cardTitle} />
        <View style={styles.cardFooter}>
          <Skeleton width={80} height={14} />
          <Skeleton width={60} height={14} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for list items
 */
export function SkeletonListItem({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.listItem, style]}>
      <Skeleton
        width={48}
        height={48}
        borderRadius={spacing.borderRadius.md}
      />
      <View style={styles.listItemContent}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} style={styles.listItemSubtitle} />
      </View>
      <Skeleton width={60} height={20} />
    </View>
  );
}

/**
 * Skeleton for circular avatars
 */
export function SkeletonCircle({
  size = 48,
  style,
}: {
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceHover,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },

  cardContent: {
    padding: spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },

  cardTitle: {
    marginTop: spacing.sm,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
  },

  listItemContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  listItemSubtitle: {
    marginTop: spacing.xs,
  },
});

export default Skeleton;
