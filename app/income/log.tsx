import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { Button, Input, Card } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import {
  useLogIncome,
  useUpdateIncome,
  useDeleteIncome,
  useIncomeForMonth,
} from '@/hooks/useBudget';
import { formatMonth, getCurrentMonth } from '@/services/budget';
import { INCOME_SOURCES } from '@/utils/constants';
import { incomeLogSchema } from '@/utils/validators';
import type { IncomeLog } from '@/types/database';

type IncomeSource = 'primary' | 'side_hustle' | 'bonus' | 'other';

const SOURCE_ICONS: Record<IncomeSource, keyof typeof Ionicons.glyphMap> = {
  primary: 'briefcase',
  side_hustle: 'flash',
  bonus: 'gift',
  other: 'wallet',
};

/**
 * Income Log Modal - Log or edit income for a specific month
 */
export default function IncomeLogScreen() {
  const params = useLocalSearchParams<{ id?: string; month?: string }>();
  const isEditing = !!params.id;
  const month = params.month || getCurrentMonth();

  // Get existing income if editing
  const { data: existingIncome } = useIncomeForMonth(month);
  const incomeToEdit = existingIncome?.find((i) => i.id === params.id);

  // Form state
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<IncomeSource>('primary');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const logIncomeMutation = useLogIncome();
  const updateIncomeMutation = useUpdateIncome();
  const deleteIncomeMutation = useDeleteIncome();

  const isLoading =
    logIncomeMutation.isPending ||
    updateIncomeMutation.isPending ||
    deleteIncomeMutation.isPending;

  // Populate form when editing
  useEffect(() => {
    if (incomeToEdit) {
      setAmount(incomeToEdit.amount.toString());
      setSource(incomeToEdit.source as IncomeSource);
      setNotes(incomeToEdit.notes || '');
    }
  }, [incomeToEdit]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!source) {
      newErrors.source = 'Please select an income source';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (isEditing && params.id) {
        await updateIncomeMutation.mutateAsync({
          id: params.id,
          updates: {
            amount: parseFloat(amount),
            source,
            notes: notes || null,
          },
          month,
        });
      } else {
        await logIncomeMutation.mutateAsync({
          month,
          amount: parseFloat(amount),
          source,
          notes: notes || undefined,
        });
      }

      router.back();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save income'
      );
    }
  };

  const handleDelete = () => {
    if (!params.id) return;

    Alert.alert(
      'Delete Income',
      'Are you sure you want to delete this income entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncomeMutation.mutateAsync({ id: params.id!, month });
              router.back();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error
                  ? error.message
                  : 'Failed to delete income'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Income' : 'Log Income',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          ),
          headerRight: isEditing
            ? () => (
                <Pressable onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={24} color={colors.error} />
                </Pressable>
              )
            : undefined,
          presentation: 'modal',
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Month Display */}
          <View style={styles.monthBadge}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
            <Text style={styles.monthText}>{formatMonth(month)}</Text>
          </View>

          {/* Amount Input */}
          <Input
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon="cash-outline"
            error={errors.amount}
            isCurrency
          />

          {/* Source Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Source</Text>
            {errors.source && (
              <Text style={styles.errorText}>{errors.source}</Text>
            )}
            <View style={styles.sourceGrid}>
              {INCOME_SOURCES.map((s) => (
                <Pressable
                  key={s.value}
                  style={({ pressed }) => [
                    styles.sourceOption,
                    source === s.value && styles.sourceOptionSelected,
                    pressed && styles.sourceOptionPressed,
                  ]}
                  onPress={() => setSource(s.value as IncomeSource)}
                >
                  <View
                    style={[
                      styles.sourceIcon,
                      source === s.value && styles.sourceIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={SOURCE_ICONS[s.value as IncomeSource]}
                      size={20}
                      color={
                        source === s.value
                          ? colors.background
                          : colors.text.muted
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.sourceLabel,
                      source === s.value && styles.sourceLabelSelected,
                    ]}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Notes Input */}
          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Regular paycheck, Freelance project"
            multiline
            numberOfLines={2}
          />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            onPress={handleSave}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? 'Save Changes' : 'Log Income'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </>
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
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.primary + '15',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    marginBottom: spacing.lg,
  },
  monthText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.small,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sourceOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sourceOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  sourceOptionPressed: {
    opacity: 0.7,
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceIconSelected: {
    backgroundColor: colors.primary,
  },
  sourceLabel: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  sourceLabelSelected: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
