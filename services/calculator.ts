import Decimal from 'decimal.js';
import type { Debt } from '@/types/database';

// Configure Decimal for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

interface PayoffProjection {
  month: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

interface PayoffResult {
  payoffDate: Date;
  totalMonths: number;
  totalPayments: number;
  totalInterest: number;
  projections: PayoffProjection[];
}

/**
 * Calculate payoff projections for a single debt
 */
export function calculateDebtPayoff(
  balance: number,
  apr: number,
  minimumPayment: number,
  extraPayment: number = 0
): PayoffResult {
  const monthlyRate = new Decimal(apr).div(100).div(12);
  let currentBalance = new Decimal(balance);
  const payment = new Decimal(minimumPayment).plus(extraPayment);

  const projections: PayoffProjection[] = [];
  let month = 0;
  let totalPayments = new Decimal(0);
  let totalInterest = new Decimal(0);

  const startDate = new Date();

  while (currentBalance.gt(0) && month < 600) {
    // Cap at 50 years
    month++;

    const monthlyInterest = currentBalance.mul(monthlyRate);
    const actualPayment = Decimal.min(payment, currentBalance.plus(monthlyInterest));
    const principal = actualPayment.minus(monthlyInterest);

    currentBalance = currentBalance.minus(principal);
    if (currentBalance.lt(0.01)) currentBalance = new Decimal(0);

    totalPayments = totalPayments.plus(actualPayment);
    totalInterest = totalInterest.plus(monthlyInterest);

    const projectionDate = new Date(startDate);
    projectionDate.setMonth(projectionDate.getMonth() + month);

    projections.push({
      month,
      date: projectionDate,
      payment: actualPayment.toNumber(),
      principal: principal.toNumber(),
      interest: monthlyInterest.toNumber(),
      remainingBalance: currentBalance.toNumber(),
    });
  }

  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    payoffDate,
    totalMonths: month,
    totalPayments: totalPayments.toNumber(),
    totalInterest: totalInterest.toNumber(),
    projections,
  };
}

/**
 * Calculate payoff for multiple debts using snowball strategy
 * (smallest balance first)
 */
export function calculateSnowballPayoff(
  debts: Debt[],
  extraPayment: number = 0
): {
  payoffDate: Date;
  totalMonths: number;
  totalInterest: number;
  debtOrder: string[];
} {
  // Sort by balance ascending (snowball)
  const sortedDebts = [...debts].sort((a, b) => (a.balance || 0) - (b.balance || 0));

  return calculateMultiDebtPayoff(sortedDebts, extraPayment);
}

/**
 * Calculate payoff for multiple debts using avalanche strategy
 * (highest APR first)
 */
export function calculateAvalanchePayoff(
  debts: Debt[],
  extraPayment: number = 0
): {
  payoffDate: Date;
  totalMonths: number;
  totalInterest: number;
  debtOrder: string[];
} {
  // Sort by APR descending (avalanche)
  const sortedDebts = [...debts].sort((a, b) => (b.apr || 0) - (a.apr || 0));

  return calculateMultiDebtPayoff(sortedDebts, extraPayment);
}

/**
 * Internal function to calculate multi-debt payoff
 */
function calculateMultiDebtPayoff(
  orderedDebts: Debt[],
  extraPayment: number
): {
  payoffDate: Date;
  totalMonths: number;
  totalInterest: number;
  debtOrder: string[];
} {
  interface DebtState {
    id: string;
    name: string;
    balance: Decimal;
    monthlyRate: Decimal;
    minimumPayment: Decimal;
    isPaidOff: boolean;
  }

  let debtStates: DebtState[] = orderedDebts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: new Decimal(d.balance || 0),
    monthlyRate: new Decimal(d.apr || 0).div(100).div(12),
    minimumPayment: new Decimal(d.minimum_payment || 0),
    isPaidOff: false,
  }));

  let month = 0;
  let totalInterest = new Decimal(0);
  let availableExtra = new Decimal(extraPayment);
  const debtOrder: string[] = [];
  const startDate = new Date();

  while (debtStates.some((d) => !d.isPaidOff) && month < 600) {
    month++;

    // Calculate interest and apply minimum payments
    for (const debt of debtStates) {
      if (debt.isPaidOff) continue;

      const interest = debt.balance.mul(debt.monthlyRate);
      totalInterest = totalInterest.plus(interest);

      const payment = Decimal.min(debt.minimumPayment, debt.balance.plus(interest));
      debt.balance = debt.balance.plus(interest).minus(payment);

      if (debt.balance.lte(0.01)) {
        debt.balance = new Decimal(0);
        debt.isPaidOff = true;
        debtOrder.push(debt.name);
        // Freed up payment goes to next debt
        availableExtra = availableExtra.plus(debt.minimumPayment);
      }
    }

    // Apply extra payment to target debt (first non-paid-off)
    const targetDebt = debtStates.find((d) => !d.isPaidOff);
    if (targetDebt && availableExtra.gt(0)) {
      const extraToApply = Decimal.min(availableExtra, targetDebt.balance);
      targetDebt.balance = targetDebt.balance.minus(extraToApply);

      if (targetDebt.balance.lte(0.01)) {
        targetDebt.balance = new Decimal(0);
        targetDebt.isPaidOff = true;
        debtOrder.push(targetDebt.name);
        availableExtra = availableExtra.plus(targetDebt.minimumPayment);
      }
    }
  }

  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    payoffDate,
    totalMonths: month,
    totalInterest: totalInterest.toNumber(),
    debtOrder,
  };
}

/**
 * Compare snowball vs avalanche strategies
 */
export function compareStrategies(
  debts: Debt[],
  extraPayment: number = 0
): {
  snowball: { payoffDate: Date; totalMonths: number; totalInterest: number };
  avalanche: { payoffDate: Date; totalMonths: number; totalInterest: number };
  interestSaved: number;
  timeSaved: number;
  recommendedStrategy: 'snowball' | 'avalanche';
} {
  const snowball = calculateSnowballPayoff(debts, extraPayment);
  const avalanche = calculateAvalanchePayoff(debts, extraPayment);

  const interestSaved = snowball.totalInterest - avalanche.totalInterest;
  const timeSaved = snowball.totalMonths - avalanche.totalMonths;

  // Recommend avalanche if it saves significant money, otherwise snowball for motivation
  const recommendedStrategy =
    interestSaved > 100 ? 'avalanche' : 'snowball';

  return {
    snowball: {
      payoffDate: snowball.payoffDate,
      totalMonths: snowball.totalMonths,
      totalInterest: snowball.totalInterest,
    },
    avalanche: {
      payoffDate: avalanche.payoffDate,
      totalMonths: avalanche.totalMonths,
      totalInterest: avalanche.totalInterest,
    },
    interestSaved,
    timeSaved,
    recommendedStrategy,
  };
}

/**
 * Get chart data points for visualization
 */
export function getPayoffChartData(
  balance: number,
  apr: number,
  minimumPayment: number,
  numPoints: number = 12
): { month: number; balance: number }[] {
  const result = calculateDebtPayoff(balance, apr, minimumPayment);
  const projections = result.projections;

  if (projections.length <= numPoints) {
    return projections.map((p) => ({
      month: p.month,
      balance: p.remainingBalance,
    }));
  }

  // Sample evenly distributed points
  const interval = Math.floor(projections.length / numPoints);
  const points: { month: number; balance: number }[] = [];

  for (let i = 0; i < projections.length; i += interval) {
    const projection = projections[i];
    points.push({
      month: projection.month,
      balance: projection.remainingBalance,
    });
  }

  // Always include the final point
  if (points[points.length - 1].month !== projections[projections.length - 1].month) {
    points.push({
      month: projections[projections.length - 1].month,
      balance: 0,
    });
  }

  return points;
}
