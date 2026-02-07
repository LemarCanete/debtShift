import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, shadows } from '@/theme';

interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  haptic?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

/**
 * Card component with surface styling and optional press handler
 */
export function Card({
  children,
  variant = 'default',
  onPress,
  haptic = true,
  style,
  contentStyle,
  ...props
}: CardProps) {
  const handlePress = async () => {
    if (!onPress) return;

    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    style,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...containerStyles,
          pressed && styles.pressed,
        ]}
        onPress={handlePress}
        accessibilityRole="button"
        {...props}
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </Pressable>
    );
  }

  return (
    <View style={containerStyles} {...props}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },

  default: {
    backgroundColor: colors.surface,
  },

  elevated: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },

  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },

  content: {
    padding: spacing.md,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});

export default Card;
