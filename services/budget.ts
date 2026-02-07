import { supabase } from './supabase';
import type {
  Expense,
  ExpenseCategory,
  IncomeLog,
  MonthlyBudget,
  TablesInsert,
  TablesUpdate,
  Debt,
} from '@/types/database';

export interface BudgetError {
  message: string;
  code?: string;
}

export interface BudgetResult<T = void> {
  data: T | null;
  error: BudgetError | null;
}

// ============================================
// Income Functions
// ============================================

/**
 * Log income for a specific month
 */
export async function logIncome(
  income: Omit<TablesInsert<'income_logs'>, 'user_id'>
): Promise<BudgetResult<IncomeLog>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated' },
    };
  }

  const { data, error } = await supabase
    .from('income_logs')
    .insert({ ...income, user_id: user.id })
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data, error: null };
}

/**
 * Get all income logs for a specific month
 */
export async function getIncomeForMonth(
  month: string
): Promise<BudgetResult<IncomeLog[]>> {
  const { data, error } = await supabase
    .from('income_logs')
    .select('*')
    .eq('month', month)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data || [], error: null };
}

/**
 * Update an income log
 */
export async function updateIncome(
  id: string,
  updates: TablesUpdate<'income_logs'>
): Promise<BudgetResult<IncomeLog>> {
  const { data, error } = await supabase
    .from('income_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data, error: null };
}

/**
 * Delete an income log
 */
export async function deleteIncome(id: string): Promise<BudgetResult> {
  const { error } = await supabase.from('income_logs').delete().eq('id', id);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

// ============================================
// Expense Functions
// ============================================

/**
 * Get all expense categories
 */
export async function getExpenseCategories(): Promise<
  BudgetResult<ExpenseCategory[]>
> {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data || [], error: null };
}

/**
 * Get all expenses for the current user
 */
export async function getExpenses(): Promise<BudgetResult<Expense[]>> {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      category:expense_categories(*)
    `)
    .order('is_essential', { ascending: false })
    .order('amount', { ascending: false });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data || [], error: null };
}

/**
 * Create a new expense
 */
export async function createExpense(
  expense: Omit<TablesInsert<'expenses'>, 'user_id'>
): Promise<BudgetResult<Expense>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated' },
    };
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expense, user_id: user.id })
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data, error: null };
}

/**
 * Update an expense
 */
export async function updateExpense(
  id: string,
  updates: TablesUpdate<'expenses'>
): Promise<BudgetResult<Expense>> {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data, error: null };
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<BudgetResult> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

// ============================================
// Budget Calculation Functions
// ============================================

export interface MonthlyBudgetSummary extends MonthlyBudget {
  incomeBySource: {
    source: string;
    amount: number;
  }[];
  expensesByCategory: {
    categoryId: string | null;
    categoryName: string;
    amount: number;
    isEssential: boolean;
  }[];
  suggestedDebt: {
    id: string;
    name: string;
    reason: string;
  } | null;
}

/**
 * Get or calculate monthly budget for a specific month
 */
export async function getMonthlyBudget(
  month: string
): Promise<BudgetResult<MonthlyBudgetSummary>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated' },
    };
  }

  // Fetch all required data in parallel
  const [incomeResult, expensesResult, debtsResult, userResult] =
    await Promise.all([
      getIncomeForMonth(month),
      getExpenses(),
      supabase
        .from('debts')
        .select('id, name, balance, apr, minimum_payment')
        .eq('is_active', true)
        .order('apr', { ascending: false }),
      supabase
        .from('users')
        .select('payoff_strategy')
        .eq('id', user.id)
        .single(),
    ]);

  if (incomeResult.error) {
    return { data: null, error: incomeResult.error };
  }
  if (expensesResult.error) {
    return { data: null, error: expensesResult.error };
  }
  if (debtsResult.error) {
    return {
      data: null,
      error: { message: debtsResult.error.message, code: debtsResult.error.code },
    };
  }

  const income = incomeResult.data || [];
  const expenses = expensesResult.data || [];
  const debts = debtsResult.data || [];
  const payoffStrategy = userResult.data?.payoff_strategy || 'avalanche';

  // Calculate totals
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);

  const totalEssentials = expenses
    .filter((e) => e.is_essential)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalNonEssentials = expenses
    .filter((e) => !e.is_essential)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalMinimums = debts.reduce((sum, d) => sum + d.minimum_payment, 0);

  const safeToExtra =
    totalIncome - totalEssentials - totalNonEssentials - totalMinimums;

  // Group income by source
  const incomeBySource = income.reduce(
    (acc, i) => {
      const existing = acc.find((item) => item.source === i.source);
      if (existing) {
        existing.amount += i.amount;
      } else {
        acc.push({ source: i.source, amount: i.amount });
      }
      return acc;
    },
    [] as { source: string; amount: number }[]
  );

  // Group expenses by category
  const expensesByCategory = expenses.reduce(
    (acc, e) => {
      const categoryId = e.category_id;
      const existing = acc.find((item) => item.categoryId === categoryId);
      if (existing) {
        existing.amount += e.amount;
      } else {
        acc.push({
          categoryId,
          categoryName: (e as any).category?.name || 'Other',
          amount: e.amount,
          isEssential: e.is_essential || false,
        });
      }
      return acc;
    },
    [] as {
      categoryId: string | null;
      categoryName: string;
      amount: number;
      isEssential: boolean;
    }[]
  );

  // Determine suggested debt based on strategy
  let suggestedDebt: MonthlyBudgetSummary['suggestedDebt'] = null;
  if (debts.length > 0 && safeToExtra > 0) {
    const sortedDebts =
      payoffStrategy === 'avalanche'
        ? [...debts].sort((a, b) => b.apr - a.apr)
        : [...debts].sort((a, b) => a.balance - b.balance);

    const suggested = sortedDebts[0];
    suggestedDebt = {
      id: suggested.id,
      name: suggested.name,
      reason:
        payoffStrategy === 'avalanche'
          ? `Highest APR (${suggested.apr}%)`
          : `Smallest balance ($${suggested.balance.toLocaleString()})`,
    };
  }

  // Try to get or create the monthly budget record
  const { data: existingBudget } = await supabase
    .from('monthly_budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .single();

  let budgetRecord: MonthlyBudget;

  if (existingBudget) {
    // Update existing budget
    const { data: updatedBudget, error: updateError } = await supabase
      .from('monthly_budgets')
      .update({
        total_income: totalIncome,
        total_essentials: totalEssentials,
        total_non_essentials: totalNonEssentials,
        total_minimums: totalMinimums,
        safe_to_extra: safeToExtra,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingBudget.id)
      .select()
      .single();

    if (updateError) {
      return {
        data: null,
        error: { message: updateError.message, code: updateError.code },
      };
    }
    budgetRecord = updatedBudget;
  } else {
    // Create new budget
    const { data: newBudget, error: insertError } = await supabase
      .from('monthly_budgets')
      .insert({
        user_id: user.id,
        month,
        total_income: totalIncome,
        total_essentials: totalEssentials,
        total_non_essentials: totalNonEssentials,
        total_minimums: totalMinimums,
        safe_to_extra: safeToExtra,
        actual_extra_paid: 0,
      })
      .select()
      .single();

    if (insertError) {
      return {
        data: null,
        error: { message: insertError.message, code: insertError.code },
      };
    }
    budgetRecord = newBudget;
  }

  return {
    data: {
      ...budgetRecord,
      incomeBySource,
      expensesByCategory,
      suggestedDebt,
    },
    error: null,
  };
}

/**
 * Quick calculation of safe-to-extra for current month
 */
export async function getSafeToExtra(): Promise<
  BudgetResult<{
    safeToExtra: number;
    suggestedDebt: {
      id: string;
      name: string;
      reason: string;
    } | null;
  }>
> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const budget = await getMonthlyBudget(month);

  if (budget.error) {
    return { data: null, error: budget.error };
  }

  return {
    data: {
      safeToExtra: budget.data?.safe_to_extra || 0,
      suggestedDebt: budget.data?.suggestedDebt || null,
    },
    error: null,
  };
}

/**
 * Get the current month in YYYY-MM-01 format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Get the previous month in YYYY-MM-01 format
 */
export function getPreviousMonth(month: string): string {
  const date = new Date(month);
  date.setMonth(date.getMonth() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Get the next month in YYYY-MM-01 format
 */
export function getNextMonth(month: string): string {
  const date = new Date(month);
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * Format month string to display format
 */
export function formatMonth(month: string): string {
  const date = new Date(month);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
