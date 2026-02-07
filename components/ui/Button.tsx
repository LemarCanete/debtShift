import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Button component with variants and loading state
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  haptic = true,
  style,
  textStyle,
  onPress,
  ...props
}: ButtonProps) {
  const handlePress = async (event: any) => {
    if (isLoading || isDisabled) return;

    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress?.(event);
  };

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    fullWidth && styles.fullWidth,
    (isDisabled || isLoading) && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (isDisabled || isLoading) && styles.disabledText,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <Pressable
      style={({ pressed }) => [
        ...containerStyles,
        pressed && !isDisabled && !isLoading && styles.pressed,
      ]}
      onPress={handlePress}
      disabled={isDisabled || isLoading}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled || isLoading }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.background : colors.primary}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={textStyles}>{children}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: spacing.borderRadius.md,
  },

  // Variants - Container
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: colors.error,
  },

  // Variants - Text
  primaryText: {
    color: colors.background,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  ghostText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.text.primary,
  },

  // Sizes - Container
  smContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 32,
  },
  mdContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  lgContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },

  // Sizes - Text
  smText: {
    ...typography.small,
    fontWeight: '600',
  },
  mdText: {
    ...typography.body,
    fontWeight: '600',
  },
  lgText: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },

  text: {
    textAlign: 'center',
  },

  fullWidth: {
    width: '100%',
  },

  disabled: {
    opacity: 0.5,
  },

  disabledText: {
    opacity: 0.7,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default Button;
