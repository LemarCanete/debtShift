import Decimal from 'decimal.js';
import { addMonths, differenceInMonths, startOfMonth } from 'date-fns';
import type { Debt, Expense, IncomeLog } from '@/types/database';

// Configure Decimal.js for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Calculate progress percentage for a single debt
 */
export function calculateDebtProgress(
  balance: number | string,
  originalBalance: number | string
): number {
  const current = new Decimal(balance);
  const original = new Decimal(originalBalance);

  if (original.isZero()) {
    return 0;
  }

  const paid = original.minus(current);
  const progress = paid.dividedBy(original).times(100);

  return Math.max(0, Math.min(100, progress.toDecimalPlaces(2).toNumber()));
}

/**
 * Calculate total progress across all debts
 */
export function calculateTotalProgress(debts: Debt[]): number {
  const activeDebts = debts.filter((d) => d.is_active);

  if (activeDebts.length === 0) {
    return 0;
  }

  const totalOriginal = activeDebts.reduce(
    (sum, d) => sum.plus(new Decimal(d.original_balance)),
    new Decimal(0)
  );

  const totalCurrent = activeDebts.reduce(
    (sum, d) => sum.plus(new Decimal(d.balance)),
    new Decimal(0)
  );

  if (totalOriginal.isZero()) {
    return 0;
  }

  const paid = totalOriginal.minus(totalCurrent);
  const progress = paid.dividedBy(totalOriginal).times(100);

  return Math.max(0, Math.min(100, progress.toDecimalPlaces(2).toNumber()));
}

/**
 * Calculate the safe-to-extra amount for a month
 */
export function calculateSafeToExtra(
  income: number | IncomeLog[],
  essentialExpenses: number | Expense[],
  nonEssentialExpenses: number | Expense[],
  minimumPayments: number | Debt[]
): number {
  // Handle income
  let totalIncome: Decimal;
  if (typeof income === 'number') {
    totalIncome = new Decimal(income);
  } else {
    totalIncome = income.reduce(
      (sum, log) => sum.plus(new Decimal(log.amount)),
      new Decimal(0)
    );
  }

  // Handle essential expenses
  let totalEssentials: Decimal;
  if (typeof essentialExpenses === 'number') {
    totalEssentials = new Decimal(essentialExpenses);
  } else {
    totalEssentials = essentialExpenses
      .filter((e) => e.is_essential)
      .reduce((sum, e) => sum.plus(new Decimal(e.amount)), new Decimal(0));
  }

  // Handle non-essential expenses
  let totalNonEssentials: Decimal;
  if (typeof nonEssentialExpenses === 'number') {
    totalNonEssentials = new Decimal(nonEssentialExpenses);
  } else {
    totalNonEssentials = nonEssentialExpenses
      .filter((e) => !e.is_essential)
      .reduce((sum, e) => sum.plus(new Decimal(e.amount)), new Decimal(0));
  }

  // Handle minimum payments
  let totalMinimums: Decimal;
  if (typeof minimumPayments === 'number') {
    totalMinimums = new Decimal(minimumPayments);
  } else {
    totalMinimums = minimumPayments
      .filter((d) => d.is_active)
      .reduce((sum, d) => sum.plus(new Decimal(d.minimum_payment)), new Decimal(0));
  }

  // Calculate safe to extra (can be negative for "tough month")
  const safeToExtra = totalIncome
    .minus(totalEssentials)
    .minus(totalNonEssentials)
    .minus(totalMinimums);

  return safeToExtra.toDecimalPlaces(2).toNumber();
}

/**
 * Calculate estimated payoff date for a single debt
 */
export function calculatePayoffDate(
  balance: number | string,
  apr: number | string,
  monthlyPayment: number | string,
  startDate: Date = new Date()
): Date | null {
  const currentBalance = new Decimal(balance);
  const annualRate = new Decimal(apr).dividedBy(100);
  const payment = new Decimal(monthlyPayment);

  if (currentBalance.isZero()) {
    return startDate;
  }

  if (payment.isZero()) {
    return null; // Cannot pay off with $0 payments
  }

  // Monthly interest rate
  const monthlyRate = annualRate.dividedBy(12);

  // Calculate number of months to pay off
  // Using the formula: n = -log(1 - (r * P) / M) / log(1 + r)
  // where n = months, r = monthly rate, P = principal, M = payment

  if (monthlyRate.isZero()) {
    // No interest - simple division
    const months = currentBalance.dividedBy(payment).ceil().toNumber();
    return addMonths(startOfMonth(startDate), months);
  }

  const interestPortion = monthlyRate.times(currentBalance);

  // Check if payment covers interest
  if (payment.lessThanOrEqualTo(interestPortion)) {
    return null; // Payment doesn't cover interest - will never pay off
  }

  const numerator = Decimal.log(
    new Decimal(1).minus(monthlyRate.times(currentBalance).dividedBy(payment))
  );
  const denominator = Decimal.log(new Decimal(1).plus(monthlyRate));

  const months = numerator.dividedBy(denominator).negated().ceil().toNumber();

  // Cap at reasonable maximum (50 years)
  if (months > 600) {
    return null;
  }

  return addMonths(startOfMonth(startDate), months);
}

/**
 * Calculate months until debt-free for all debts
 */
export function calculateMonthsUntilDebtFree(
  debts: Debt[],
  extraMonthlyPayment: number = 0,
  strategy: 'avalanche' | 'snowball' = 'avalanche'
): number {
  const activeDebts = debts.filter((d) => d.is_active && d.balance > 0);

  if (activeDebts.length === 0) {
    return 0;
  }

  // Sort debts by strategy
  const sortedDebts = [...activeDebts].sort((a, b) => {
    if (strategy === 'avalanche') {
      return b.apr - a.apr; // Highest APR first
    } else {
      return a.balance - b.balance; // Lowest balance first
    }
  });

  // Simulate payoff month by month
  let months = 0;
  const balances = sortedDebts.map((d) => new Decimal(d.balance));
  const aprs = sortedDebts.map((d) => new Decimal(d.apr).dividedBy(100).dividedBy(12));
  const minimums = sortedDebts.map((d) => new Decimal(d.minimum_payment));
  let extra = new Decimal(extraMonthlyPayment);

  const maxMonths = 600; // 50 year cap

  while (months < maxMonths) {
    // Check if all debts are paid off
    const totalBalance = balances.reduce((sum, b) => sum.plus(b), new Decimal(0));
    if (totalBalance.lessThanOrEqualTo(0)) {
      break;
    }

    months++;

    // Apply interest and payments
    for (let i = 0; i < balances.length; i++) {
      if (balances[i].lessThanOrEqualTo(0)) continue;

      // Add interest
      balances[i] = balances[i].plus(balances[i].times(aprs[i]));

      // Apply minimum payment
      const minPayment = Decimal.min(minimums[i], balances[i]);
      balances[i] = balances[i].minus(minPayment);
    }

    // Apply extra payment to target debt (first unpaid in sorted order)
    let remainingExtra = extra;
    for (let i = 0; i < balances.length; i++) {
      if (balances[i].greaterThan(0) && remainingExtra.greaterThan(0)) {
        const extraPayment = Decimal.min(remainingExtra, balances[i]);
        balances[i] = balances[i].minus(extraPayment);
        remainingExtra = remainingExtra.minus(extraPayment);

        // Once this debt is paid, cascade the minimum to next debt
        if (balances[i].lessThanOrEqualTo(0)) {
          remainingExtra = remainingExtra.plus(minimums[i]);
        }
        break; // Extra goes to one debt at a time
      }
    }
  }

  return months;
}

/**
 * Calculate total interest paid over life of debt
 */
export function calculateTotalInterest(
  balance: number | string,
  apr: number | string,
  monthlyPayment: number | string
): number {
  const principal = new Decimal(balance);
  const monthlyRate = new Decimal(apr).dividedBy(100).dividedBy(12);
  const payment = new Decimal(monthlyPayment);

  if (principal.isZero() || payment.isZero()) {
    return 0;
  }

  let remaining = principal;
  let totalInterest = new Decimal(0);
  let months = 0;
  const maxMonths = 600;

  while (remaining.greaterThan(0) && months < maxMonths) {
    months++;
    const interest = remaining.times(monthlyRate);
    totalInterest = totalInterest.plus(interest);
    remaining = remaining.plus(interest).minus(payment);

    if (remaining.lessThan(0)) {
      remaining = new Decimal(0);
    }
  }

  return totalInterest.toDecimalPlaces(2).toNumber();
}

/**
 * Calculate interest saved by making extra payment
 */
export function calculateInterestSaved(
  balance: number,
  apr: number,
  minimumPayment: number,
  extraPayment: number
): number {
  const interestWithMinimum = calculateTotalInterest(balance, apr, minimumPayment);
  const interestWithExtra = calculateTotalInterest(
    balance,
    apr,
    minimumPayment + extraPayment
  );

  return Math.max(0, interestWithMinimum - interestWithExtra);
}

/**
 * Calculate which debt to pay extra towards based on strategy
 */
export function getTargetDebt(
  debts: Debt[],
  strategy: 'avalanche' | 'snowball'
): Debt | null {
  const activeDebts = debts.filter((d) => d.is_active && d.balance > 0);

  if (activeDebts.length === 0) {
    return null;
  }

  if (strategy === 'avalanche') {
    return activeDebts.reduce((max, d) => (d.apr > max.apr ? d : max));
  } else {
    return activeDebts.reduce((min, d) => (d.balance < min.balance ? d : min));
  }
}

/**
 * Calculate monthly payment needed to pay off debt by target date
 */
export function calculateRequiredPayment(
  balance: number | string,
  apr: number | string,
  targetMonths: number
): number {
  const principal = new Decimal(balance);
  const monthlyRate = new Decimal(apr).dividedBy(100).dividedBy(12);

  if (principal.isZero()) {
    return 0;
  }

  if (monthlyRate.isZero()) {
    return principal.dividedBy(targetMonths).toDecimalPlaces(2).toNumber();
  }

  // PMT formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const onePlusR = new Decimal(1).plus(monthlyRate);
  const onePlusRtoN = onePlusR.pow(targetMonths);

  const payment = principal
    .times(monthlyRate.times(onePlusRtoN))
    .dividedBy(onePlusRtoN.minus(1));

  return payment.toDecimalPlaces(2).toNumber();
}
