import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Calculate Payoff Edge Function
 * T111: Create supabase/functions/calculate-payoff/index.ts for complex payoff projections
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimum_payment: number;
}

interface PayoffProjection {
  debtId: string;
  debtName: string;
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
  monthlyBreakdown: MonthlyBalance[];
}

interface MonthlyBalance {
  month: string;
  balance: number;
  interestPaid: number;
  principalPaid: number;
  payment: number;
}

interface ProjectionResult {
  strategy: "avalanche" | "snowball";
  projections: PayoffProjection[];
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  debtFreeDate: string;
  monthlyExtra: number;
}

interface RequestBody {
  strategy: "avalanche" | "snowball";
  monthlyExtra?: number;
  maxMonths?: number;
}

function calculatePayoff(
  debts: Debt[],
  strategy: "avalanche" | "snowball",
  monthlyExtra: number = 0,
  maxMonths: number = 360
): ProjectionResult {
  const projections: PayoffProjection[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let maxPayoffMonths = 0;

  // Clone debts to track balances
  const workingDebts = debts.map((d) => ({
    ...d,
    currentBalance: d.balance,
    monthlyBreakdown: [] as MonthlyBalance[],
    monthsToPayoff: 0,
    totalInterest: 0,
    totalPaid: 0,
    isPaidOff: false,
  }));

  // Sort debts by strategy
  const sortDebts = () => {
    if (strategy === "avalanche") {
      workingDebts.sort((a, b) => b.apr - a.apr);
    } else {
      workingDebts.sort((a, b) => a.currentBalance - b.currentBalance);
    }
  };

  const today = new Date();
  let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  for (let month = 0; month < maxMonths; month++) {
    // Check if all debts are paid off
    const activeDebts = workingDebts.filter((d) => !d.isPaidOff);
    if (activeDebts.length === 0) break;

    // Re-sort for avalanche/snowball priority
    sortDebts();

    let extraRemaining = monthlyExtra;

    for (const debt of workingDebts) {
      if (debt.isPaidOff) continue;

      // Calculate monthly interest
      const monthlyRate = debt.apr / 100 / 12;
      const interestCharge = debt.currentBalance * monthlyRate;

      // Minimum payment
      let payment = Math.min(debt.minimum_payment, debt.currentBalance + interestCharge);

      // Apply extra payment to priority debt
      if (extraRemaining > 0 && debt === activeDebts[0]) {
        const extraPayment = Math.min(
          extraRemaining,
          debt.currentBalance + interestCharge - payment
        );
        payment += extraPayment;
        extraRemaining -= extraPayment;
      }

      // Calculate principal paid
      const principalPaid = Math.min(payment - interestCharge, debt.currentBalance);
      const actualInterest = interestCharge;

      // Update balance
      debt.currentBalance = Math.max(0, debt.currentBalance - principalPaid);
      debt.totalInterest += actualInterest;
      debt.totalPaid += payment;

      // Record monthly breakdown
      debt.monthlyBreakdown.push({
        month: currentMonth.toISOString().slice(0, 7),
        balance: debt.currentBalance,
        interestPaid: actualInterest,
        principalPaid: principalPaid,
        payment: payment,
      });

      // Check if paid off
      if (debt.currentBalance <= 0.01) {
        debt.isPaidOff = true;
        debt.monthsToPayoff = month + 1;
        debt.currentBalance = 0;

        // Redistribute freed minimum payment to extra
        extraRemaining += debt.minimum_payment;
      }
    }

    // Distribute any remaining extra to other debts
    for (const debt of activeDebts) {
      if (extraRemaining <= 0) break;
      if (debt.isPaidOff) continue;

      const extraPayment = Math.min(extraRemaining, debt.currentBalance);
      debt.currentBalance -= extraPayment;
      debt.totalPaid += extraPayment;
      extraRemaining -= extraPayment;

      if (debt.currentBalance <= 0.01) {
        debt.isPaidOff = true;
        debt.monthsToPayoff = month + 1;
        debt.currentBalance = 0;
      }
    }

    // Move to next month
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    maxPayoffMonths = month + 1;
  }

  // Build projections
  for (const debt of workingDebts) {
    const payoffDate = new Date(today);
    payoffDate.setMonth(payoffDate.getMonth() + debt.monthsToPayoff);

    projections.push({
      debtId: debt.id,
      debtName: debt.name,
      monthsToPayoff: debt.monthsToPayoff,
      totalInterest: Math.round(debt.totalInterest * 100) / 100,
      totalPaid: Math.round(debt.totalPaid * 100) / 100,
      payoffDate: payoffDate.toISOString().slice(0, 10),
      monthlyBreakdown: debt.monthlyBreakdown,
    });

    totalInterest += debt.totalInterest;
    totalPaid += debt.totalPaid;
  }

  // Calculate overall debt-free date
  const finalPayoffMonths = Math.max(...projections.map((p) => p.monthsToPayoff));
  const debtFreeDate = new Date(today);
  debtFreeDate.setMonth(debtFreeDate.getMonth() + finalPayoffMonths);

  return {
    strategy,
    projections,
    totalMonths: finalPayoffMonths,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    debtFreeDate: debtFreeDate.toISOString().slice(0, 10),
    monthlyExtra,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { strategy = "avalanche", monthlyExtra = 0, maxMonths = 360 } = body;

    // Get user's active debts
    const { data: debts, error: debtsError } = await supabase
      .from("debts")
      .select("id, name, balance, apr, minimum_payment")
      .eq("is_active", true)
      .gt("balance", 0);

    if (debtsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch debts", details: debtsError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!debts || debts.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No active debts found",
          projections: [],
          totalMonths: 0,
          totalInterest: 0,
          totalPaid: 0,
          debtFreeDate: new Date().toISOString().slice(0, 10),
          monthlyExtra: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate payoff projections
    const result = calculatePayoff(
      debts as Debt[],
      strategy,
      monthlyExtra,
      maxMonths
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Calculate payoff error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to calculate payoff",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
