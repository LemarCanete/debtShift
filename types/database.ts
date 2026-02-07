export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      creditors: {
        Row: {
          best_call_times: string | null;
          created_at: string | null;
          hardship_program: string | null;
          id: string;
          name: string;
          phone: string | null;
          rate_reduction_script: string | null;
          settlement_script: string | null;
          success_rate: number | null;
        };
        Insert: {
          best_call_times?: string | null;
          created_at?: string | null;
          hardship_program?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          rate_reduction_script?: string | null;
          settlement_script?: string | null;
          success_rate?: number | null;
        };
        Update: {
          best_call_times?: string | null;
          created_at?: string | null;
          hardship_program?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          rate_reduction_script?: string | null;
          settlement_script?: string | null;
          success_rate?: number | null;
        };
        Relationships: [];
      };
      daily_quotes: {
        Row: {
          author: string;
          created_at: string | null;
          id: string;
          quote_type: string;
          text: string;
        };
        Insert: {
          author: string;
          created_at?: string | null;
          id?: string;
          quote_type: string;
          text: string;
        };
        Update: {
          author?: string;
          created_at?: string | null;
          id?: string;
          quote_type?: string;
          text?: string;
        };
        Relationships: [];
      };
      debts: {
        Row: {
          apr: number;
          balance: number;
          color: string | null;
          created_at: string | null;
          creditor: string;
          debt_type: string;
          due_day: number;
          id: string;
          is_active: boolean | null;
          minimum_payment: number;
          name: string;
          original_balance: number;
          paid_off_at: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          apr: number;
          balance: number;
          color?: string | null;
          created_at?: string | null;
          creditor: string;
          debt_type: string;
          due_day: number;
          id?: string;
          is_active?: boolean | null;
          minimum_payment: number;
          name: string;
          original_balance: number;
          paid_off_at?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          apr?: number;
          balance?: number;
          color?: string | null;
          created_at?: string | null;
          creditor?: string;
          debt_type?: string;
          due_day?: number;
          id?: string;
          is_active?: boolean | null;
          minimum_payment?: number;
          name?: string;
          original_balance?: number;
          paid_off_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'debts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      expense_categories: {
        Row: {
          icon: string;
          id: string;
          is_essential: boolean | null;
          name: string;
          sort_order: number | null;
        };
        Insert: {
          icon: string;
          id?: string;
          is_essential?: boolean | null;
          name: string;
          sort_order?: number | null;
        };
        Update: {
          icon?: string;
          id?: string;
          is_essential?: boolean | null;
          name?: string;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount: number;
          category_id: string | null;
          created_at: string | null;
          due_day: number | null;
          id: string;
          is_essential: boolean | null;
          is_recurring: boolean | null;
          name: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          category_id?: string | null;
          created_at?: string | null;
          due_day?: number | null;
          id?: string;
          is_essential?: boolean | null;
          is_recurring?: boolean | null;
          name: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          created_at?: string | null;
          due_day?: number | null;
          id?: string;
          is_essential?: boolean | null;
          is_recurring?: boolean | null;
          name?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'expense_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expenses_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      income_logs: {
        Row: {
          amount: number;
          created_at: string | null;
          id: string;
          month: string;
          notes: string | null;
          source: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          id?: string;
          month: string;
          notes?: string | null;
          source: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          id?: string;
          month?: string;
          notes?: string | null;
          source?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'income_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      journal_entries: {
        Row: {
          call_outcome: string | null;
          content: string | null;
          created_at: string | null;
          creditor_name: string | null;
          debt_id: string | null;
          entry_type: string;
          id: string;
          mood: number | null;
          rep_name: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          call_outcome?: string | null;
          content?: string | null;
          created_at?: string | null;
          creditor_name?: string | null;
          debt_id?: string | null;
          entry_type: string;
          id?: string;
          mood?: number | null;
          rep_name?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          call_outcome?: string | null;
          content?: string | null;
          created_at?: string | null;
          creditor_name?: string | null;
          debt_id?: string | null;
          entry_type?: string;
          id?: string;
          mood?: number | null;
          rep_name?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'journal_entries_debt_id_fkey';
            columns: ['debt_id'];
            isOneToOne: false;
            referencedRelation: 'debts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'journal_entries_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      lesson_progress: {
        Row: {
          completed_at: string | null;
          id: string;
          lesson_id: string;
          quiz_score: number | null;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          id?: string;
          lesson_id: string;
          quiz_score?: number | null;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          id?: string;
          lesson_id?: string;
          quiz_score?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lesson_progress_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lesson_progress_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      lessons: {
        Row: {
          category: string;
          content: string;
          created_at: string | null;
          duration_mins: number;
          id: string;
          is_premium: boolean | null;
          sort_order: number | null;
          title: string;
        };
        Insert: {
          category: string;
          content: string;
          created_at?: string | null;
          duration_mins: number;
          id?: string;
          is_premium?: boolean | null;
          sort_order?: number | null;
          title: string;
        };
        Update: {
          category?: string;
          content?: string;
          created_at?: string | null;
          duration_mins?: number;
          id?: string;
          is_premium?: boolean | null;
          sort_order?: number | null;
          title?: string;
        };
        Relationships: [];
      };
      milestones: {
        Row: {
          achieved_at: string | null;
          id: string;
          milestone_type: string;
          user_id: string;
          value: number | null;
        };
        Insert: {
          achieved_at?: string | null;
          id?: string;
          milestone_type: string;
          user_id: string;
          value?: number | null;
        };
        Update: {
          achieved_at?: string | null;
          id?: string;
          milestone_type?: string;
          user_id?: string;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'milestones_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      monthly_budgets: {
        Row: {
          actual_extra_paid: number | null;
          created_at: string | null;
          id: string;
          month: string;
          safe_to_extra: number | null;
          total_essentials: number | null;
          total_income: number | null;
          total_minimums: number | null;
          total_non_essentials: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          actual_extra_paid?: number | null;
          created_at?: string | null;
          id?: string;
          month: string;
          safe_to_extra?: number | null;
          total_essentials?: number | null;
          total_income?: number | null;
          total_minimums?: number | null;
          total_non_essentials?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          actual_extra_paid?: number | null;
          created_at?: string | null;
          id?: string;
          month?: string;
          safe_to_extra?: number | null;
          total_essentials?: number | null;
          total_income?: number | null;
          total_minimums?: number | null;
          total_non_essentials?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'monthly_budgets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string | null;
          debt_id: string;
          id: string;
          is_extra: boolean | null;
          notes: string | null;
          payment_date: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          debt_id: string;
          id?: string;
          is_extra?: boolean | null;
          notes?: string | null;
          payment_date: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          debt_id?: string;
          id?: string;
          is_extra?: boolean | null;
          notes?: string | null;
          payment_date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_debt_id_fkey';
            columns: ['debt_id'];
            isOneToOne: false;
            referencedRelation: 'debts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      planned_payments: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          debt_id: string;
          id: string;
          is_completed: boolean | null;
          is_extra: boolean | null;
          planned_amount: number;
          planned_date: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          debt_id: string;
          id?: string;
          is_completed?: boolean | null;
          is_extra?: boolean | null;
          planned_amount: number;
          planned_date: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          debt_id?: string;
          id?: string;
          is_completed?: boolean | null;
          is_extra?: boolean | null;
          planned_amount?: number;
          planned_date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'planned_payments_debt_id_fkey';
            columns: ['debt_id'];
            isOneToOne: false;
            referencedRelation: 'debts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'planned_payments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      reminders: {
        Row: {
          created_at: string | null;
          debt_id: string | null;
          id: string;
          is_completed: boolean | null;
          push_token: string | null;
          reminder_date: string;
          reminder_time: string | null;
          repeat: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          debt_id?: string | null;
          id?: string;
          is_completed?: boolean | null;
          push_token?: string | null;
          reminder_date: string;
          reminder_time?: string | null;
          repeat?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          debt_id?: string | null;
          id?: string;
          is_completed?: boolean | null;
          push_token?: string | null;
          reminder_date?: string;
          reminder_time?: string | null;
          repeat?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reminders_debt_id_fkey';
            columns: ['debt_id'];
            isOneToOne: false;
            referencedRelation: 'debts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reminders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      users: {
        Row: {
          ai_messages_reset_at: string | null;
          ai_messages_used: number | null;
          created_at: string | null;
          email: string;
          id: string;
          income_max: number | null;
          income_min: number | null;
          income_type: string | null;
          income_typical: number | null;
          onboarding_completed: boolean | null;
          payoff_strategy: string | null;
          subscription_tier: string | null;
          updated_at: string | null;
          why_i_started: string | null;
        };
        Insert: {
          ai_messages_reset_at?: string | null;
          ai_messages_used?: number | null;
          created_at?: string | null;
          email: string;
          id: string;
          income_max?: number | null;
          income_min?: number | null;
          income_type?: string | null;
          income_typical?: number | null;
          onboarding_completed?: boolean | null;
          payoff_strategy?: string | null;
          subscription_tier?: string | null;
          updated_at?: string | null;
          why_i_started?: string | null;
        };
        Update: {
          ai_messages_reset_at?: string | null;
          ai_messages_used?: number | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          income_max?: number | null;
          income_min?: number | null;
          income_type?: string | null;
          income_typical?: number | null;
          onboarding_completed?: boolean | null;
          payoff_strategy?: string | null;
          subscription_tier?: string | null;
          updated_at?: string | null;
          why_i_started?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_debt_progress: { Args: { p_user_id: string }; Returns: number };
      calculate_safe_to_extra: {
        Args: { p_month: string; p_user_id: string };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience type aliases
export type User = Tables<'users'>;
export type Debt = Tables<'debts'>;
export type Payment = Tables<'payments'>;
export type Expense = Tables<'expenses'>;
export type ExpenseCategory = Tables<'expense_categories'>;
export type IncomeLog = Tables<'income_logs'>;
export type MonthlyBudget = Tables<'monthly_budgets'>;
export type PlannedPayment = Tables<'planned_payments'>;
export type Reminder = Tables<'reminders'>;
export type JournalEntry = Tables<'journal_entries'>;
export type ChatMessage = Tables<'chat_messages'>;
export type Lesson = Tables<'lessons'>;
export type LessonProgress = Tables<'lesson_progress'>;
export type Creditor = Tables<'creditors'>;
export type Milestone = Tables<'milestones'>;
export type DailyQuote = Tables<'daily_quotes'>;
