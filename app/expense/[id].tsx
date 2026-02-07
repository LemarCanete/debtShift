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
  Switch,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { Button, Input, Card, Skeleton } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import {
  useExpenses,
  useUpdateExpense,
  useDeleteExpense,
  useExpenseCategories,
} from '@/hooks/useBudget';
import type { Expense, ExpenseCategory } from '@/types/database';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Housing: 'home',
  Utilities: 'flash',
  Groceries: 'cart',
  Transport: 'car',
  Insurance: 'shield-checkmark',
  Subscriptions: 'refresh',
  Dining: 'restaurant',
  Entertainment: 'game-controller',
  Shopping: 'bag',
  Healthcare: 'medical',
  Other: 'ellipsis-horizontal',
};

/**
 * Edit Expense Screen - Edit or delete an existing expense
 */
export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Get existing expense
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const expense = expenses?.find((e) => e.id === id);

  // Data
  const { data: categories } = useExpenseCategories();

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isEssential, setIsEssential] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);
  const [dueDay, setDueDay] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const isLoading =
    updateExpenseMutation.isPending || deleteExpenseMutation.isPending;

  // Populate form when expense loads
  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setAmount(expense.amount.toString());
      setCategoryId(expense.category_id || null);
      setIsEssential(expense.is_essential || false);
      setIsRecurring(expense.is_recurring || true);
      setDueDay(expense.due_day?.toString() || '');
    }
  }, [expense]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (dueDay) {
      const day = parseInt(dueDay, 10);
      if (isNaN(day) || day < 1 || day > 31) {
        newErrors.dueDay = 'Due day must be between 1 and 31';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !id) return;

    try {
      await updateExpenseMutation.mutateAsync({
        id,
        updates: {
          name: name.trim(),
          amount: parseFloat(amount),
          category_id: categoryId,
          is_essential: isEssential,
          is_recurring: isRecurring,
          due_day: dueDay ? parseInt(dueDay, 10) : null,
        },
      });

      router.back();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update expense'
      );
    }
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpenseMutation.mutateAsync(id);
              router.back();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error
                  ? error.message
                  : 'Failed to delete expense'
              );
            }
          },
        },
      ]
    );
  };

  if (expensesLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Skeleton.Card />
          <Skeleton.Card />
        </View>
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>Expense not found</Text>
          <Button onPress={() => router.back()} variant="secondary">
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Expense',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
            </Pressable>
          ),
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
          {/* Name Input */}
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Rent, Netflix, Car Insurance"
            error={errors.name}
          />

          {/* Amount Input */}
          <Input
            label="Monthly Amount"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon="cash-outline"
            error={errors.amount}
            isCurrency
          />

          {/* Category Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {categories?.map((category) => (
                <Pressable
                  key={category.id}
                  style={({ pressed }) => [
                    styles.categoryOption,
                    categoryId === category.id && styles.categoryOptionSelected,
                    pressed && styles.categoryOptionPressed,
                  ]}
                  onPress={() => setCategoryId(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      categoryId === category.id && styles.categoryIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={CATEGORY_ICONS[category.name] || 'ellipsis-horizontal'}
                      size={18}
                      color={
                        categoryId === category.id
                          ? colors.background
                          : colors.text.muted
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      categoryId === category.id && styles.categoryLabelSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Toggle Options */}
          <Card style={styles.togglesCard}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={isEssential ? colors.warning : colors.text.muted}
                />
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleLabel}>Essential Expense</Text>
                  <Text style={styles.toggleHint}>
                    Rent, utilities, groceries, etc.
                  </Text>
                </View>
              </View>
              <Switch
                value={isEssential}
                onValueChange={setIsEssential}
                trackColor={{ false: colors.surfaceHover, true: colors.warning }}
                thumbColor={colors.background}
              />
            </View>

            <View style={styles.toggleDivider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Ionicons
                  name="refresh"
                  size={20}
                  color={isRecurring ? colors.primary : colors.text.muted}
                />
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleLabel}>Recurring Monthly</Text>
                  <Text style={styles.toggleHint}>
                    This expense repeats each month
                  </Text>
                </View>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: colors.surfaceHover, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </Card>

          {/* Due Day (optional) */}
          {isRecurring && (
            <Input
              label="Due Day (optional)"
              value={dueDay}
              onChangeText={setDueDay}
              placeholder="1-31"
              keyboardType="number-pad"
              leftIcon="calendar-outline"
              error={errors.dueDay}
            />
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            onPress={handleSave}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Save Changes
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
  loadingContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  categoryList: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryOption: {
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  categoryOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  categoryOptionPressed: {
    opacity: 0.7,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryIconSelected: {
    backgroundColor: colors.primary,
  },
  categoryLabel: {
    ...typography.small,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  togglesCard: {
    marginBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  toggleHint: {
    ...typography.small,
    color: colors.text.muted,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
