import { supabase } from './supabase';
import type { User } from '@/types/database';

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResult<T = void> {
  data: T | null;
  error: AuthError | null;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResult<{ userId: string }>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  if (!data.user) {
    return {
      data: null,
      error: { message: 'Failed to create user account' },
    };
  }

  return {
    data: { userId: data.user.id },
    error: null,
  };
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<{ userId: string }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  if (!data.user) {
    return {
      data: null,
      error: { message: 'Failed to sign in' },
    };
  }

  return {
    data: { userId: data.user.id },
    error: null,
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

/**
 * Send a password reset email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'debtshift://reset-password',
  });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResult<User>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return {
      data: null,
      error: { message: authError.message, code: authError.code },
    };
  }

  if (!user) {
    return {
      data: null,
      error: null,
    };
  }

  // Fetch the user profile from our users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return {
      data: null,
      error: { message: profileError.message, code: profileError.code },
    };
  }

  return {
    data: profile,
    error: null,
  };
}

/**
 * Update user password
 */
export async function updatePassword(
  newPassword: string
): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<User>
): Promise<AuthResult<User>> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: data,
    error: null,
  };
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (userId: string | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user?.id ?? null);
  });

  return () => subscription.unsubscribe();
}
