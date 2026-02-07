import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.32.1";

/**
 * AI Companion "Shift" Edge Function
 * T092: Create supabase/functions/ai-companion/index.ts with Claude API integration
 * T093: Add system prompt with user context injection
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UserContext {
  debts: Array<{
    name: string;
    creditor: string;
    balance: number;
    original_balance: number;
    apr: number;
    minimum_payment: number;
  }>;
  totalDebt: number;
  totalOriginal: number;
  progressPercent: number;
  payoffStrategy: string;
  whyIStarted: string | null;
  safeToExtra: number | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory: ChatMessage[];
  userContext: UserContext;
}

function buildSystemPrompt(context: UserContext): string {
  const debtSummary = context.debts
    .map(
      (d) =>
        `- ${d.name} (${d.creditor}): $${d.balance.toLocaleString()} balance, ${d.apr}% APR, $${d.minimum_payment}/mo minimum`
    )
    .join("\n");

  const progressMessage =
    context.progressPercent > 0
      ? `They've already paid off ${context.progressPercent.toFixed(1)}% of their original debt!`
      : "They're just getting started on their debt-free journey.";

  const strategyExplainer =
    context.payoffStrategy === "avalanche"
      ? "They're using the avalanche method (highest APR first) - mathematically optimal for saving on interest."
      : "They're using the snowball method (smallest balance first) - great for building momentum with quick wins.";

  const safeToExtraMessage =
    context.safeToExtra !== null && context.safeToExtra > 0
      ? `They have $${context.safeToExtra.toLocaleString()} available this month for extra payments.`
      : context.safeToExtra !== null && context.safeToExtra < 0
        ? `This is a tough month - they're running $${Math.abs(context.safeToExtra).toLocaleString()} over budget. Focus on compassion, not pressure.`
        : "";

  const motivationMessage = context.whyIStarted
    ? `Their personal motivation: "${context.whyIStarted}"`
    : "";

  return `You are Shift, a warm, encouraging AI companion helping users on their debt-free journey. You're part financial coach, part supportive friend.

## Your Personality
- Warm and conversational, never robotic or preachy
- Celebrate small wins enthusiastically
- Meet setbacks with compassion, not judgment
- Use shame-free language (say "balance" not "what you owe")
- Be concise but personable (2-3 short paragraphs max)
- Occasionally use encouraging phrases like "You've got this!" or "Every payment counts!"

## User's Financial Snapshot
Total debt: $${context.totalDebt.toLocaleString()} (originally $${context.totalOriginal.toLocaleString()})
${progressMessage}

### Their Debts:
${debtSummary || "No debts added yet - they're in setup mode."}

### Strategy:
${strategyExplainer}

${safeToExtraMessage}

${motivationMessage}

## Guidelines
1. Reference their specific debts by name when relevant
2. If they have extra money available, gently suggest which debt to prioritize based on their strategy
3. Never shame them for spending or slow progress
4. If they ask about something you don't know, admit it rather than guessing
5. Celebrate milestones: first payment, 10%/25%/50%/75%/100% progress, paying off a debt
6. If they're stressed, acknowledge feelings before offering advice
7. Keep math simple - round to whole dollars
8. Remember: you're a companion, not a calculator

## What You CAN Help With
- Emotional support and motivation
- Explaining debt payoff strategies
- Suggesting which debt to focus extra payments on
- Celebrating progress and wins
- Providing encouragement during tough months
- General financial literacy questions

## What You Should NOT Do
- Give specific investment or tax advice
- Promise specific timelines or outcomes
- Access external websites or make calculations beyond basic math
- Store or remember information beyond this conversation`;
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

    // Get user profile for message limit check
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("subscription_tier, ai_messages_used, ai_messages_reset_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch user profile" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check message limits based on subscription tier
    const tier = userProfile.subscription_tier || "free";
    const limits: Record<string, number> = {
      free: 5,
      pro: 50,
      proplus: 200,
      family: 200,
    };
    const monthlyLimit = limits[tier] || 5;

    // Check if we need to reset the counter (new month)
    const now = new Date();
    const resetAt = userProfile.ai_messages_reset_at
      ? new Date(userProfile.ai_messages_reset_at)
      : null;
    const shouldReset =
      !resetAt ||
      resetAt.getMonth() !== now.getMonth() ||
      resetAt.getFullYear() !== now.getFullYear();

    let messagesUsed = shouldReset ? 0 : userProfile.ai_messages_used || 0;

    if (messagesUsed >= monthlyLimit) {
      return new Response(
        JSON.stringify({
          error: "Monthly message limit reached",
          limit: monthlyLimit,
          used: messagesUsed,
          tier,
          resetAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { message, conversationHistory, userContext } = body;

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Anthropic client
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });

    // Build conversation messages
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    // Add conversation history (limit to last 10 messages for context window)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add the new message
    messages.push({ role: "user", content: message });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: buildSystemPrompt(userContext),
      messages,
    });

    // Extract response text
    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Increment message count
    const newMessagesUsed = messagesUsed + 1;
    await supabase
      .from("users")
      .update({
        ai_messages_used: newMessagesUsed,
        ai_messages_reset_at: shouldReset ? now.toISOString() : userProfile.ai_messages_reset_at,
      })
      .eq("id", user.id);

    // Save messages to chat history
    const messagesToInsert = [
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: assistantMessage },
    ];

    await supabase.from("chat_messages").insert(messagesToInsert);

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        messagesUsed: newMessagesUsed,
        messagesRemaining: monthlyLimit - newMessagesUsed,
        monthlyLimit,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("AI Companion error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
