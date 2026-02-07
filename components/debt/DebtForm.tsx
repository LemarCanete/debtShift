import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import { Button, Input, Card } from '@/components/ui';
import { DEBT_TYPES, getDebtColor } from '@/utils/constants';
import { debtCreateSchema, debtUpdateSchema } from '@/utils/validators';
import type { Debt, TablesInsert, TablesUpdate } from '@/types/database';

type DebtType = typeof DEBT_TYPES[number]['value'];

interface DebtFormProps {
  initialData?: Debt | null;
  onSubmit: (
    data: Omit<TablesInsert<'debts'>, 'user_id'> | TablesUpdate<'debts'>
  ) => Promise<boolean>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

/**
 * Form for creating or editing a debt
 */
export function DebtForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save',
}: DebtFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [creditor, setCreditor] = useState(initialData?.creditor || '');
  const [debtType, setDebtType] = useState<DebtType | null>(
    (initialData?.debt_type as DebtType) || null
  );
  const [balance, setBalance] = useState(initialData?.balance?.toString() || '');
  const [originalBalance, setOriginalBalance] = useState(
    initialData?.original_balance?.toString() || ''
  );
  const [apr, setApr] = useState(initialData?.apr?.toString() || '');
  const [minimumPayment, setMinimumPayment] = useState(
    initialData?.minimum_payment?.toString() || ''
  );
  const [dueDay, setDueDay] = useState(initialData?.due_day?.toString() || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!initialData;

  const validate = () => {
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

    const schema = isEditing ? debtUpdateSchema : debtCreateSchema;
    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return null;
    }

    setErrors({});
    return data;
  };

  const handleSubmit = async () => {
    const data = validate();
    if (!data) return;

    const debtTypeInfo = DEBT_TYPES.find((t) => t.value === debtType);

    const submitData = {
      ...data,
      color: initialData?.color || debtTypeInfo?.color || getDebtColor(0),
    };

    await onSubmit(submitData);
  };

  const isFormValid =
    name.trim() && creditor.trim() && debtType && balance && minimumPayment;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
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
                if (errors.minimum_payment)
                  setErrors({ ...errors, minimum_payment: '' });
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

      {/* Actions */}
      <View style={styles.actions}>
        {onCancel && (
          <Button
            variant="secondary"
            onPress={onCancel}
            style={styles.actionButton}
          >
            Cancel
          </Button>
        )}
        <Button
          onPress={handleSubmit}
          isLoading={isLoading}
          isDisabled={!isFormValid}
          style={[styles.actionButton, !onCancel && styles.fullWidthButton]}
        >
          {submitLabel}
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
});

export default DebtForm;
