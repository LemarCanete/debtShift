import { supabase } from './supabase';

export interface Quote {
  id: string;
  text: string;
  author: string;
  quote_type: 'quote' | 'verse';
}

export interface QuoteError {
  message: string;
  code?: string;
}

export interface QuoteResult<T = void> {
  data: T | null;
  error: QuoteError | null;
}

/**
 * Get daily quote based on current date
 * Uses date as seed to rotate quotes deterministically
 * T091: Create services/quotes.ts with getDailyQuote function
 */
export async function getDailyQuote(): Promise<QuoteResult<Quote>> {
  // Get all quotes
  const { data: quotes, error } = await supabase
    .from('daily_quotes')
    .select('id, text, author, quote_type');

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  if (!quotes || quotes.length === 0) {
    // Return a default quote if none in database
    return {
      data: {
        id: 'default',
        text: 'The journey of a thousand miles begins with a single step.',
        author: 'Lao Tzu',
        quote_type: 'quote',
      },
      error: null,
    };
  }

  // Use today's date as seed to pick a quote
  const today = new Date();
  const dayOfYear = getDayOfYear(today);
  const index = dayOfYear % quotes.length;

  return {
    data: quotes[index] as Quote,
    error: null,
  };
}

/**
 * Get a random quote (for refresh functionality)
 */
export async function getRandomQuote(): Promise<QuoteResult<Quote>> {
  const { data: quotes, error } = await supabase
    .from('daily_quotes')
    .select('id, text, author, quote_type');

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  if (!quotes || quotes.length === 0) {
    return {
      data: {
        id: 'default',
        text: 'The journey of a thousand miles begins with a single step.',
        author: 'Lao Tzu',
        quote_type: 'quote',
      },
      error: null,
    };
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);

  return {
    data: quotes[randomIndex] as Quote,
    error: null,
  };
}

/**
 * Get all quotes
 */
export async function getAllQuotes(): Promise<QuoteResult<Quote[]>> {
  const { data, error } = await supabase
    .from('daily_quotes')
    .select('id, text, author, quote_type')
    .order('created_at', { ascending: true });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: (data || []) as Quote[],
    error: null,
  };
}

/**
 * Helper: Get day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
