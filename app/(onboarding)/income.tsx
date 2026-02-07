import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { INCOME_TYPES } from '@/utils/constants';
import { onboardingIncomeSchema } from '@/utils/validators';

type IncomeType = 'steady' | 'variable' | 'mixed';

/**
 * Onboarding Income Screen - Collect income type and range
 */
export default function OnboardingIncomeScreen() {
  const [incomeType, setIncomeType] = useState<IncomeType | null>(null);
  const [incomeMin, setIncomeMin] = useState('');
  const [incomeTypical, setIncomeTypical] = useState('');
  const [incomeMax, setIncomeMax] = useState('');
  const [errors, setErrors] = useState<{
    income_type?: string;
    income_min?: string;
    income_typical?: string;
    income_max?: string;
  }>({});

  const { updateProfile, isLoading } = useAuthStore();

  const validateForm = () => {
    if (!incomeType) {
      setErrors({ income_type: 'Please select your income type' });
      return false;
    }

    const result = onboardingIncomeSchema.safeParse({
      income_type: incomeType,
      income_min: parseFloat(incomeMin) || 0,
      income_typical: parseFloat(incomeTypical) || 0,
      income_max: parseFloat(incomeMax) || 0,
    });

    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    const success = await updateProfile({
      income_type: incomeType,
      income_min: parseFloat(incomeMin) || 0,
      income_typical: parseFloat(incomeTypical) || 0,
      income_max: parseFloat(incomeMax) || 0,
    });

    if (success) {
      router.push('/(onboarding)/expenses');
    }
  };

  // For steady income, set all values the same
  const handleSteadyIncomeChange = (value: string) => {
    setIncomeTypical(value);
    if (incomeType === 'steady') {
      setIncomeMin(value);
      setIncomeMax(value);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.step}>Step 1 of 4</Text>
        <Text style={styles.title}>Your Income</Text>
        <Text style={styles.subtitle}>
          Understanding your income helps us calculate how much you can safely put toward debt
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How would you describe your income?</Text>

        <View style={styles.optionsGrid}>
          {INCOME_TYPES.map((type) => (
            <Pressable
              key={type.value}
              onPress={() => {
                setIncomeType(type.value as IncomeType);
                if (errors.income_type) {
                  setErrors({ ...errors, income_type: undefined });
                }
              }}
            >
              <Card
                variant={incomeType === type.value ? 'elevated' : 'default'}
                style={[
                  styles.optionCard,
                  incomeType === type.value && styles.optionCardSelected,
                ]}
              >
                <Text style={styles.optionLabel}>{type.label}</Text>
                <Text style={styles.optionDescription}>{type.description}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        {errors.income_type && (
          <Text style={styles.error}>{errors.income_type}</Text>
        )}
      </View>

      {incomeType && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {incomeType === 'steady'
              ? 'What is your monthly income?'
              : 'What is your monthly income range?'}
          </Text>

          {incomeType === 'steady' ? (
            <Input
              label="Monthly Income (after taxes)"
              value={incomeTypical}
              onChangeText={handleSteadyIncomeChange}
              error={errors.income_typical}
              placeholder="0.00"
              isCurrency
            />
          ) : (
            <>
              <Input
                label="Minimum monthly income"
                value={incomeMin}
                onChangeText={(v) => {
                  setIncomeMin(v);
                  if (errors.income_min) setErrors({ ...errors, income_min: undefined });
                }}
                error={errors.income_min}
                placeholder="0.00"
                hint="Your lowest typical month"
                isCurrency
              />

              <Input
                label="Typical monthly income"
                value={incomeTypical}
                onChangeText={(v) => {
                  setIncomeTypical(v);
                  if (errors.income_typical)
                    setErrors({ ...errors, income_typical: undefined });
                }}
                error={errors.income_typical}
                placeholder="0.00"
                hint="What you usually make"
                isCurrency
              />

              <Input
                label="Maximum monthly income"
                value={incomeMax}
                onChangeText={(v) => {
                  setIncomeMax(v);
                  if (errors.income_max) setErrors({ ...errors, income_max: undefined });
                }}
                error={errors.income_max}
                placeholder="0.00"
                hint="Your best months"
                isCurrency
              />
            </>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Button
          onPress={handleContinue}
          isLoading={isLoading}
          isDisabled={!incomeType}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  step: {
    ...typography.small,
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  optionsGrid: {
    gap: spacing.sm,
  },
  optionCard: {
    padding: spacing.md,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  optionLabel: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  optionDescription: {
    ...typography.small,
    color: colors.text.secondary,
  },
  error: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
});
