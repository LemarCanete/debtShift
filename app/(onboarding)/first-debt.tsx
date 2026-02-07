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
import { supabase } from '@/services/supabase';
import { DEBT_TYPES, getDebtColor } from '@/utils/constants';
import { debtCreateSchema } from '@/utils/validators';

type DebtType = typeof DEBT_TYPES[number]['value'];

/**
 * Onboarding First Debt Screen - Add the first debt to track
 */
export default function OnboardingFirstDebtScreen() {
  const [name, setName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [debtType, setDebtType] = useState<DebtType | null>(null);
  const [balance, setBalance] = useState('');
  const [originalBalance, setOriginalBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { updateProfile } = useAuthStore();

  const validateForm = () => {
    const data = {
      name: name.trim(),
      creditor: creditor.trim(),
      debt_type: debtType,
      balance: parseFloat(balance) || 0,
      original_balance: parseFloat(originalBalance || balance) || 0,
      apr: parseFloat(apr) || 0,
      minimum_payment: parseFloat(minimumPayment) || 0,
      due_day: parseInt(dueDay) || 1,
    };

    const result = debtCreateSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleAddDebt = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const debtTypeInfo = DEBT_TYPES.find((t) => t.value === debtType);

      const { error } = await supabase.from('debts').insert({
        user_id: user.id,
        name: name.trim(),
        creditor: creditor.trim(),
        debt_type: debtType,
        balance: parseFloat(balance),
        original_balance: parseFloat(originalBalance || balance),
        apr: parseFloat(apr) || 0,
        minimum_payment: parseFloat(minimumPayment),
        due_day: parseInt(dueDay) || 1,
        color: debtTypeInfo?.color || getDebtColor(0),
        is_active: true,
      });

      if (error) {
        setErrors({ submit: error.message });
        return;
      }

      // Mark onboarding as complete
      await updateProfile({ onboarding_completed: true });

      // Navigate to main app
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);

    try {
      await updateProfile({ onboarding_completed: true });
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.step}>Step 4 of 4</Text>
        <Text style={styles.title}>Add Your First Debt</Text>
        <Text style={styles.subtitle}>
          Let's start tracking your journey to debt-free
        </Text>
      </View>

      {errors.submit && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errors.submit}</Text>
        </View>
      )}

      {/* Debt Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type of Debt</Text>

        <View style={styles.typeGrid}>
          {DEBT_TYPES.map((type) => (
            <Pressable
              key={type.value}
              onPress={() => {
                setDebtType(type.value);
                if (errors.debt_type) {
                  setErrors({ ...errors, debt_type: '' });
                }
              }}
              style={styles.typeButton}
            >
              <Card
                style={[
                  styles.typeCard,
                  debtType === type.value && styles.typeCardSelected,
                  debtType === type.value && { borderColor: type.color },
                ]}
              >
                <View
                  style={[styles.typeIndicator, { backgroundColor: type.color }]}
                />
                <Text style={styles.typeName}>{type.label}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        {errors.debt_type && <Text style={styles.error}>{errors.debt_type}</Text>}
      </View>

      {/* Debt Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debt Details</Text>

        <Input
          label="Nickname"
          value={name}
          onChangeText={(v) => {
            setName(v);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          error={errors.name}
          placeholder="e.g., Chase Sapphire, Student Loan"
          hint="A name to identify this debt"
        />

        <Input
          label="Creditor / Lender"
          value={creditor}
          onChangeText={(v) => {
            setCreditor(v);
            if (errors.creditor) setErrors({ ...errors, creditor: '' });
          }}
          error={errors.creditor}
          placeholder="e.g., Chase, Navient, Capital One"
        />

        <Input
          label="Current Balance"
          value={balance}
          onChangeText={(v) => {
            setBalance(v);
            if (errors.balance) setErrors({ ...errors, balance: '' });
          }}
          error={errors.balance}
          placeholder="0.00"
          isCurrency
        />

        <Input
          label="Original Balance (optional)"
          value={originalBalance}
          onChangeText={setOriginalBalance}
          error={errors.original_balance}
          placeholder="0.00"
          hint="What you originally owed"
          isCurrency
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="APR %"
              value={apr}
              onChangeText={(v) => {
                setApr(v);
                if (errors.apr) setErrors({ ...errors, apr: '' });
              }}
              error={errors.apr}
              placeholder="0.00"
              keyboardType="decimal-pad"
              hint="Annual interest rate"
            />
          </View>

          <View style={styles.halfInput}>
            <Input
              label="Minimum Payment"
              value={minimumPayment}
              onChangeText={(v) => {
                setMinimumPayment(v);
                if (errors.minimum_payment) setErrors({ ...errors, minimum_payment: '' });
              }}
              error={errors.minimum_payment}
              placeholder="0.00"
              isCurrency
            />
          </View>
        </View>

        <Input
          label="Due Day of Month"
          value={dueDay}
          onChangeText={(v) => {
            setDueDay(v);
            if (errors.due_day) setErrors({ ...errors, due_day: '' });
          }}
          error={errors.due_day}
          placeholder="15"
          keyboardType="number-pad"
          hint="1-31"
        />
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleAddDebt}
          isLoading={isLoading}
          isDisabled={!debtType || !name || !creditor || !balance || !minimumPayment}
          fullWidth
          size="lg"
        >
          Add Debt & Start Tracking
        </Button>

        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </Pressable>
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
  },
  errorBanner: {
    backgroundColor: colors.error + '20',
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    width: '31%',
  },
  typeCard: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  typeCardSelected: {
    borderWidth: 2,
  },
  typeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  typeName: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
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
  skipButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.body,
    color: colors.text.muted,
  },
});
