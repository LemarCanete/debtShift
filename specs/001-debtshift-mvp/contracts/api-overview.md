# API Contracts: DebtShift MVP

**Branch**: `001-debtshift-mvp` | **Date**: 2026-02-08

## Overview

DebtShift uses Supabase as the backend, which provides:
- **Direct Database Access**: Supabase client SDK for CRUD operations
- **Edge Functions**: Custom serverless functions for complex logic
- **Authentication**: Supabase Auth for user management

This document defines the API contracts organized by domain.

## Authentication

All API calls require authentication via Supabase Auth JWT token in the `Authorization` header.

```
Authorization: Bearer <supabase_access_token>
```

## Response Format

### Success Response

```json
{
  "data": { ... },
  "error": null
}
```

### Error Response

```json
{
  "data": null,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Auth Endpoints

### POST /auth/signup

Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (201):
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "...",
      "refresh_token": "..."
    }
  }
}
```

### POST /auth/login

Authenticate existing user.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200):
```json
{
  "data": {
    "user": { ... },
    "session": { ... }
  }
}
```

### POST /auth/logout

End current session.

**Response** (200):
```json
{
  "data": { "message": "Logged out successfully" }
}
```

### POST /auth/reset-password

Request password reset email.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "data": { "message": "Reset email sent" }
}
```

---

## User Profile

### GET /users/me

Get current user profile.

**Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "income_type": "variable",
    "income_min": 3000.00,
    "income_typical": 4500.00,
    "income_max": 6000.00,
    "payoff_strategy": "avalanche",
    "why_i_started": "I want to be debt-free by 35",
    "onboarding_completed": true,
    "subscription_tier": "free",
    "ai_messages_used": 3,
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

### PATCH /users/me

Update user profile.

**Request Body** (partial update):
```json
{
  "income_type": "steady",
  "income_typical": 5000.00,
  "payoff_strategy": "snowball"
}
```

**Response** (200):
```json
{
  "data": { ... }
}
```

---

## Debts

### GET /debts

List all user debts.

**Query Parameters**:
- `is_active` (boolean): Filter by active status
- `order` (string): Sort field (balance, apr, due_day, created_at)
- `limit` (int): Max results (default 50)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Chase Sapphire",
      "creditor": "Chase",
      "debt_type": "credit_card",
      "balance": 4850.00,
      "original_balance": 6200.00,
      "apr": 24.99,
      "minimum_payment": 145.00,
      "due_day": 15,
      "color": "#6366f1",
      "is_active": true,
      "paid_off_at": null,
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### POST /debts

Create a new debt.

**Request Body**:
```json
{
  "name": "Discover It",
  "creditor": "Discover",
  "debt_type": "credit_card",
  "balance": 2340.00,
  "original_balance": 3100.00,
  "apr": 22.49,
  "minimum_payment": 70.00,
  "due_day": 22,
  "color": "#f59e0b"
}
```

**Response** (201):
```json
{
  "data": { ... }
}
```

### GET /debts/:id

Get debt details with payment history.

**Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "name": "Chase Sapphire",
    ...
    "payments": [
      {
        "id": "uuid",
        "amount": 145.00,
        "payment_date": "2026-02-01",
        "is_extra": false
      }
    ],
    "planned_payments": [
      {
        "id": "uuid",
        "planned_amount": 100.00,
        "planned_date": "2026-02-15",
        "is_extra": true,
        "is_completed": false
      }
    ]
  }
}
```

### PATCH /debts/:id

Update debt details.

**Request Body** (partial update):
```json
{
  "balance": 4700.00,
  "minimum_payment": 150.00
}
```

**Response** (200):
```json
{
  "data": { ... }
}
```

### DELETE /debts/:id

Soft delete (archive) a debt.

**Response** (200):
```json
{
  "data": { "message": "Debt archived" }
}
```

---

## Payments

### GET /payments

List payments with optional filters.

**Query Parameters**:
- `debt_id` (uuid): Filter by debt
- `from_date` (date): Start date
- `to_date` (date): End date
- `is_extra` (boolean): Filter extra payments
- `limit` (int): Max results (default 50)
- `cursor` (string): Pagination cursor

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "debt_id": "uuid",
      "debt_name": "Chase Sapphire",
      "amount": 145.00,
      "payment_date": "2026-02-01",
      "is_extra": false,
      "created_at": "2026-02-01T14:30:00Z"
    }
  ],
  "next_cursor": "..."
}
```

### POST /payments

Log a new payment. Automatically updates debt balance.

**Request Body**:
```json
{
  "debt_id": "uuid",
  "amount": 200.00,
  "payment_date": "2026-02-08",
  "is_extra": true,
  "notes": "Tax refund extra payment"
}
```

**Response** (201):
```json
{
  "data": {
    "payment": { ... },
    "debt": {
      "id": "uuid",
      "new_balance": 4650.00,
      "progress_percent": 25.00
    },
    "milestone_achieved": {
      "type": "progress_25",
      "message": "You've paid off 25% of your debt!"
    }
  }
}
```

---

## Budget

### GET /income

List income logs.

**Query Parameters**:
- `month` (date): Filter by month (YYYY-MM-01)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "month": "2026-02-01",
      "amount": 4200.00,
      "source": "primary",
      "notes": "Regular paycheck"
    }
  ]
}
```

### POST /income

Log monthly income.

**Request Body**:
```json
{
  "month": "2026-02-01",
  "amount": 800.00,
  "source": "side_hustle",
  "notes": "Freelance project"
}
```

**Response** (201):
```json
{
  "data": { ... }
}
```

### GET /expenses

List all expenses.

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "category": { "id": "uuid", "name": "Housing", "icon": "home" },
      "name": "Rent",
      "amount": 1450.00,
      "is_essential": true,
      "is_recurring": true,
      "due_day": 1
    }
  ]
}
```

### POST /expenses

Create expense.

**Request Body**:
```json
{
  "category_id": "uuid",
  "name": "Car Insurance",
  "amount": 95.00,
  "is_essential": true,
  "is_recurring": true,
  "due_day": 15
}
```

### PATCH /expenses/:id

Update expense.

### DELETE /expenses/:id

Delete expense.

### GET /budget/:month

Get monthly budget summary.

**Response** (200):
```json
{
  "data": {
    "month": "2026-02-01",
    "total_income": 5000.00,
    "total_essentials": 2215.00,
    "total_non_essentials": 45.00,
    "total_minimums": 435.00,
    "safe_to_extra": 2305.00,
    "actual_extra_paid": 200.00,
    "breakdown": {
      "income_by_source": [
        { "source": "primary", "amount": 4200.00 },
        { "source": "side_hustle", "amount": 800.00 }
      ],
      "expenses_by_category": [
        { "category": "Housing", "amount": 1570.00, "is_essential": true }
      ]
    }
  }
}
```

### GET /budget/safe-to-extra

Quick calculation of current month's safe-to-extra.

**Response** (200):
```json
{
  "data": {
    "safe_to_extra": 2305.00,
    "suggested_debt": {
      "id": "uuid",
      "name": "Chase Sapphire",
      "reason": "Highest APR (avalanche strategy)"
    }
  }
}
```

---

## Planner

### GET /planner/calendar/:month

Get calendar view for month.

**Response** (200):
```json
{
  "data": {
    "month": "2026-02-01",
    "events": [
      {
        "date": "2026-02-15",
        "items": [
          {
            "type": "due_date",
            "debt_id": "uuid",
            "debt_name": "Chase Sapphire",
            "amount": 145.00
          },
          {
            "type": "planned_payment",
            "id": "uuid",
            "debt_name": "Chase Sapphire",
            "amount": 100.00,
            "is_extra": true,
            "is_completed": false
          }
        ]
      }
    ]
  }
}
```

### GET /planner/payments

List planned payments.

### POST /planner/payments

Schedule a planned payment.

**Request Body**:
```json
{
  "debt_id": "uuid",
  "planned_date": "2026-02-28",
  "planned_amount": 100.00,
  "is_extra": true
}
```

### PATCH /planner/payments/:id

Update planned payment.

### PATCH /planner/payments/:id/complete

Mark planned payment as complete. Creates actual payment record.

**Response** (200):
```json
{
  "data": {
    "planned_payment": { "is_completed": true, "completed_at": "..." },
    "payment": { ... },
    "debt": { "new_balance": ... }
  }
}
```

### DELETE /planner/payments/:id

Delete planned payment.

### GET /planner/timeline

Get payoff projection timeline.

**Query Parameters**:
- `strategy` (string): snowball or avalanche (defaults to user preference)
- `extra_monthly` (decimal): Additional monthly payment to simulate

**Response** (200):
```json
{
  "data": {
    "debt_free_date": "2028-06-15",
    "total_interest": 4532.00,
    "monthly_projections": [
      {
        "month": "2026-02",
        "total_balance": 25690.00,
        "debts": [
          { "id": "uuid", "name": "Chase", "balance": 4850.00 }
        ]
      }
    ]
  }
}
```

---

## Reminders

### GET /reminders

List reminders.

**Query Parameters**:
- `is_completed` (boolean): Filter by status
- `from_date` (date): Start date

### POST /reminders

Create reminder.

**Request Body**:
```json
{
  "debt_id": "uuid",
  "title": "Chase payment due",
  "reminder_date": "2026-02-12",
  "reminder_time": "09:00:00",
  "repeat": "monthly"
}
```

### PATCH /reminders/:id

Update reminder.

### PATCH /reminders/:id/complete

Mark reminder as completed.

### DELETE /reminders/:id

Delete reminder.

---

## Journal

### GET /journal

List journal entries.

**Query Parameters**:
- `entry_type` (string): Filter by type
- `debt_id` (uuid): Filter by debt
- `limit` (int): Max results
- `cursor` (string): Pagination

### POST /journal

Create journal entry.

**Request Body**:
```json
{
  "entry_type": "call_log",
  "title": "Called Chase about rate reduction",
  "content": "Spoke with Sarah, was offered 0% for 6 months...",
  "mood": 4,
  "debt_id": "uuid",
  "creditor_name": "Chase",
  "rep_name": "Sarah",
  "call_outcome": "partial_success"
}
```

### PATCH /journal/:id

Update entry.

### DELETE /journal/:id

Delete entry.

---

## Learn

### GET /lessons

List all lessons.

**Query Parameters**:
- `category` (string): Filter by category

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "category": "basics",
      "title": "Debt Snowball vs Avalanche",
      "duration_mins": 3,
      "is_premium": false,
      "is_completed": true,
      "completed_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

### GET /lessons/:id

Get lesson content.

**Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "content": "# Lesson content in markdown...",
    "next_lesson": { "id": "uuid", "title": "..." }
  }
}
```

### POST /lessons/:id/complete

Mark lesson as completed.

**Response** (201):
```json
{
  "data": {
    "progress": { ... },
    "streak": {
      "current": 5,
      "message": "5 day learning streak!"
    }
  }
}
```

---

## AI Companion (Edge Function)

### POST /functions/v1/ai-companion

Send message to AI companion.

**Request Body**:
```json
{
  "message": "Should I pay off my Chase card or student loan first?"
}
```

**Response** (200):
```json
{
  "data": {
    "response": "Based on your current debts, I'd recommend focusing on your Chase Sapphire card first. Here's why:\n\n1. It has the highest APR at 24.99%...",
    "suggested_questions": [
      "How much interest will I save?",
      "What about the snowball method?"
    ],
    "ai_messages_remaining": 2
  }
}
```

**Error** (429 - Rate Limited):
```json
{
  "error": {
    "code": "AI_LIMIT_REACHED",
    "message": "You've used all 5 free AI messages this month. Upgrade to Pro for unlimited access.",
    "upgrade_url": "/settings/upgrade"
  }
}
```

---

## Creditors

### GET /creditors

List creditor playbooks.

**Query Parameters**:
- `search` (string): Search by name

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Chase",
      "phone": "1-800-935-9935",
      "best_call_times": "Tue-Thu 10am-2pm",
      "hardship_program": "Available upon request...",
      "rate_reduction_script": "Hi, I've been a Chase customer for...",
      "success_rate": 67
    }
  ]
}
```

### GET /creditors/:id

Get specific creditor playbook.

---

## Calculator (Edge Function)

### POST /functions/v1/calculate-payoff

Calculate payoff projections.

**Request Body**:
```json
{
  "debts": [
    { "id": "uuid", "balance": 4850, "apr": 24.99, "minimum": 145 },
    { "id": "uuid", "balance": 2340, "apr": 22.49, "minimum": 70 }
  ],
  "strategy": "avalanche",
  "extra_monthly": 200
}
```

**Response** (200):
```json
{
  "data": {
    "payoff_date": "2027-08-15",
    "total_interest": 2156.00,
    "total_paid": 9346.00,
    "months_to_payoff": 18,
    "schedule": [
      {
        "month": "2026-02",
        "payments": [
          { "debt_id": "uuid", "amount": 345, "to_principal": 245, "to_interest": 100 }
        ]
      }
    ],
    "comparison": {
      "snowball": { "payoff_date": "2027-09-15", "total_interest": 2342.00 },
      "avalanche": { "payoff_date": "2027-08-15", "total_interest": 2156.00 }
    }
  }
}
```

---

## Milestones

### GET /milestones

List user achievements.

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "milestone_type": "progress_25",
      "value": null,
      "achieved_at": "2026-01-28T10:00:00Z",
      "display": {
        "title": "25% Paid Off!",
        "icon": "trophy",
        "description": "You've paid off a quarter of your debt!"
      }
    }
  ]
}
```

---

## Daily Quote

### GET /daily-quote

Get today's motivational quote.

**Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "quote_type": "verse",
    "text": "The rich rule over the poor, and the borrower is slave to the lender.",
    "author": "Proverbs 22:7"
  }
}
```
