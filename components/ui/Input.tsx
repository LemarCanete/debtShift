import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Pressable,
} from 'react-native';
import { colors, typography, spacing } from '@/theme';
import { formatCurrency, parseCurrency } from '@/utils/formatters';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  isCurrency?: boolean;
  isDisabled?: boolean;
}

/**
 * Input component with label, error state, and currency mode
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      isCurrency = false,
      isDisabled = false,
      value,
      onChangeText,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChangeText = (text: string) => {
      if (isCurrency) {
        // Remove non-numeric characters except decimal point
        const cleaned = text.replace(/[^0-9.]/g, '');
        // Ensure only one decimal point
        const parts = cleaned.split('.');
        const formatted =
          parts.length > 2
            ? parts[0] + '.' + parts.slice(1).join('')
            : cleaned;
        onChangeText?.(formatted);
      } else {
        onChangeText?.(text);
      }
    };

    const displayValue = isCurrency && value && !isFocused
      ? formatCurrency(parseFloat(value) || 0, { showCents: true })
      : value;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            error && styles.inputContainerError,
            isDisabled && styles.inputContainerDisabled,
          ]}
        >
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

          {isCurrency && !leftIcon && (
            <Text style={styles.currencySymbol}>$</Text>
          )}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
              isCurrency && !leftIcon && styles.inputWithCurrency,
              inputStyle,
            ]}
            value={displayValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!isDisabled}
            placeholderTextColor={colors.text.muted}
            keyboardType={isCurrency ? 'decimal-pad' : props.keyboardType}
            {...props}
          />

          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },

  label: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.md,
    minHeight: 48,
  },

  inputContainerFocused: {
    borderColor: colors.primary,
  },

  inputContainerError: {
    borderColor: colors.error,
  },

  inputContainerDisabled: {
    opacity: 0.5,
    backgroundColor: colors.surfaceHover,
  },

  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  inputWithLeftIcon: {
    paddingLeft: 0,
  },

  inputWithRightIcon: {
    paddingRight: 0,
  },

  inputWithCurrency: {
    paddingLeft: spacing.xs,
  },

  currencySymbol: {
    ...typography.body,
    color: colors.text.muted,
    paddingLeft: spacing.md,
  },

  iconLeft: {
    paddingLeft: spacing.md,
  },

  iconRight: {
    paddingRight: spacing.md,
  },

  error: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.xs,
  },

  hint: {
    ...typography.small,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
});

export default Input;
