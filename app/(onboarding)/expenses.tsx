import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { Button, Input, Card } from '@/components/ui';
import { supabase } from '@/services/supabase';

interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  is_essential: boolean;
  default_amount: number | null;
}

interface SelectedExpense {
  category_id: string;
  name: string;
  amount: string;
  is_essential: boolean;
}

/**
 * Onboarding Expenses Screen - Quick-add common expenses
 */
export default function OnboardingExpensesScreen() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<SelectedExpense[]>([]);
  const [customExpenseName, setCustomExpenseName] = useState('');
  const [customExpenseAmount, setCustomExpenseAmount] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('expense_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data) {
      setCategories(data);
    }
  };

  const toggleExpense = (category: ExpenseCategory) => {
    const existing = selectedExpenses.find((e) => e.category_id === category.id);

    if (existing) {
      setSelectedExpenses(selectedExpenses.filter((e) => e.category_id !== category.id));
    } else {
      setSelectedExpenses([
        ...selectedExpenses,
        {
          category_id: category.id,
          name: category.name,
          amount: category.default_amount?.toString() || '',
          is_essential: category.is_essential,
        },
      ]);
    }
  };

  const updateExpenseAmount = (categoryId: string, amount: string) => {
    setSelectedExpenses(
      selectedExpenses.map((e) =>
        e.category_id === categoryId ? { ...e, amount } : e
      )
    );
  };

  const addCustomExpense = () => {
    if (!customExpenseName || !customExpenseAmount) return;

    setSelectedExpenses([
      ...selectedExpenses,
      {
        category_id: `custom-${Date.now()}`,
        name: customExpenseName,
        amount: customExpenseAmount,
        is_essential: false,
      },
    ]);

    setCustomExpenseName('');
    setCustomExpenseAmount('');
    setShowCustomForm(false);
  };

  const removeExpense = (categoryId: string) => {
    setSelectedExpenses(selectedExpenses.filter((e) => e.category_id !== categoryId));
  };

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create expense records
      const expensesToCreate = selectedExpenses
        .filter((e) => e.amount && parseFloat(e.amount) > 0)
        .map((e) => ({
          user_id: user.id,
          name: e.name,
          amount: parseFloat(e.amount),
          category_id: e.category_id.startsWith('custom-') ? null : e.category_id,
          is_essential: e.is_essential,
          is_recurring: true,
        }));

      if (expensesToCreate.length > 0) {
        await supabase.from('expenses').insert(expensesToCreate);
      }

      router.push('/(onboarding)/goal');
    } finally {
      setIsLoading(false);
    }
  };

  const essentialCategories = categories.filter((c) => c.is_essential);
  const nonEssentialCategories = categories.filter((c) => !c.is_essential);

  const totalExpenses = selectedExpenses.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.step}>Step 2 of 4</Text>
        <Text style={styles.title}>Monthly Expenses</Text>
        <Text style={styles.subtitle}>
          Select your recurring monthly expenses. This helps us calculate your safe-to-pay-extra amount.
        </Text>
      </View>

      {/* Essential Expenses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Essential Expenses</Text>
        <Text style={styles.sectionSubtitle}>Bills you must pay every month</Text>

        <View style={styles.categoryGrid}>
          {essentialCategories.map((category) => {
            const isSelected = selectedExpenses.some(
              (e) => e.category_id === category.id
            );
            return (
              <Pressable
                key={category.id}
                onPress={() => toggleExpense(category)}
                style={styles.categoryButton}
              >
                <Card
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                  ]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Non-Essential Expenses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Expenses</Text>
        <Text style={styles.sectionSubtitle}>Nice to have, but could be cut if needed</Text>

        <View style={styles.categoryGrid}>
          {nonEssentialCategories.map((category) => {
            const isSelected = selectedExpenses.some(
              (e) => e.category_id === category.id
            );
            return (
              <Pressable
                key={category.id}
                onPress={() => toggleExpense(category)}
                style={styles.categoryButton}
              >
                <Card
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                  ]}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Selected Expenses with Amounts */}
      {selectedExpenses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Expenses</Text>
          <Text style={styles.sectionSubtitle}>Enter monthly amounts</Text>

          {selectedExpenses.map((expense) => (
            <View key={expense.category_id} style={styles.expenseRow}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                {expense.is_essential && (
                  <View style={styles.essentialBadge}>
                    <Text style={styles.essentialBadgeText}>Essential</Text>
                  </View>
                )}
              </View>
              <View style={styles.expenseInputContainer}>
                <Input
                  value={expense.amount}
                  onChangeText={(v) => updateExpenseAmount(expense.category_id, v)}
                  placeholder="0"
                  isCurrency
                  containerStyle={styles.expenseInput}
                />
                <Pressable
                  onPress={() => removeExpense(expense.category_id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Monthly Expenses</Text>
            <Text style={styles.totalAmount}>
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      )}

      {/* Custom Expense */}
      <View style={styles.section}>
        {showCustomForm ? (
          <Card style={styles.customForm}>
            <Input
              label="Expense Name"
              value={customExpenseName}
              onChangeText={setCustomExpenseName}
              placeholder="e.g., Pet food"
            />
            <Input
              label="Monthly Amount"
              value={customExpenseAmount}
              onChangeText={setCustomExpenseAmount}
              placeholder="0.00"
              isCurrency
            />
            <View style={styles.customFormButtons}>
              <Button
                variant="secondary"
                onPress={() => setShowCustomForm(false)}
                style={styles.customFormButton}
              >
                Cancel
              </Button>
              <Button
                onPress={addCustomExpense}
                isDisabled={!customExpenseName || !customExpenseAmount}
                style={styles.customFormButton}
              >
                Add
              </Button>
            </View>
          </Card>
        ) : (
          <Button variant="secondary" onPress={() => setShowCustomForm(true)} fullWidth>
            + Add Custom Expense
          </Button>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleContinue}
          isLoading={isLoading}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
        <Pressable onPress={() => router.push('/(onboarding)/goal')} style={styles.skipButton}>
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
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  sectionSubtitle: {
    ...typography.small,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    width: '30%',
  },
  categoryCard: {
    padding: spacing.sm,
    alignItems: 'center',
    position: 'relative',
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing.xxs,
  },
  categoryName: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  expenseInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expenseName: {
    ...typography.body,
    color: colors.text.primary,
  },
  essentialBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  essentialBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '500',
  },
  expenseInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expenseInput: {
    width: 120,
    marginBottom: 0,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.error,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  totalAmount: {
    ...typography.h3,
    color: colors.text.primary,
  },
  customForm: {
    padding: spacing.md,
  },
  customFormButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  customFormButton: {
    flex: 1,
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
