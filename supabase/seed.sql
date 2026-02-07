-- DebtShift MVP Seed Data
-- Version: 001
-- Created: 2026-02-08

-- ============================================
-- Expense Categories
-- ============================================

INSERT INTO expense_categories (name, icon, is_essential, sort_order) VALUES
  ('Rent/Mortgage', 'home', true, 1),
  ('Utilities', 'zap', true, 2),
  ('Groceries', 'shopping-cart', true, 3),
  ('Transport', 'car', true, 4),
  ('Insurance', 'shield', true, 5),
  ('Healthcare', 'heart', true, 6),
  ('Childcare', 'baby', true, 7),
  ('Subscriptions', 'repeat', false, 8),
  ('Dining Out', 'utensils', false, 9),
  ('Entertainment', 'film', false, 10),
  ('Shopping', 'shopping-bag', false, 11),
  ('Personal Care', 'smile', false, 12),
  ('Gifts', 'gift', false, 13),
  ('Other', 'more-horizontal', false, 99);

-- ============================================
-- Lessons
-- ============================================

-- Basics Category
INSERT INTO lessons (category, title, duration_mins, content, sort_order, is_premium) VALUES
  ('basics', 'Understanding Your Debt', 5, E'# Understanding Your Debt\n\nDebt isn''t just a number—it''s a relationship with your future self. Understanding the types of debt you have is the first step to taking control.\n\n## Types of Debt\n\n**High-Interest Debt** (Credit Cards)\n- Usually 15-25% APR\n- Compounds daily\n- Priority to pay off first\n\n**Medium-Interest Debt** (Personal Loans, Auto)\n- Usually 5-15% APR\n- Fixed payments\n- Predictable timeline\n\n**Low-Interest Debt** (Student Loans, Mortgage)\n- Usually 3-8% APR\n- Tax advantages possible\n- Longest payoff horizon\n\n## Key Takeaway\n\nFocus on understanding where your money is going before trying to change everything at once.', 1, false),

  ('basics', 'The Power of Minimum Payments', 5, E'# The Power of Minimum Payments\n\nMinimum payments keep you in good standing, but they''re designed to extend your debt as long as possible.\n\n## The Math That Matters\n\nA $5,000 credit card at 20% APR:\n- Minimum payment ($100): 9+ years to pay off, $4,300 in interest\n- $200/month: 2.5 years, $1,000 in interest\n\n## Your Strategy\n\n1. **Always pay minimums** on all debts (protects your credit)\n2. **Extra money** goes to one debt at a time\n3. **Automate minimums** so you never miss\n\n## Key Takeaway\n\nMinimums are the floor, not the ceiling. Every dollar above minimum accelerates your freedom.', 2, false),

  ('basics', 'Snowball vs Avalanche: Which Strategy?', 7, E'# Snowball vs Avalanche: Which Strategy?\n\nBoth methods work—the best one is the one you''ll stick with.\n\n## The Avalanche Method\n\n**How it works:** Pay off highest APR first\n\n**Pros:**\n- Mathematically optimal\n- Saves the most money\n- Best for large, high-interest debts\n\n**Cons:**\n- Biggest debt might take longest\n- Requires patience\n\n## The Snowball Method\n\n**How it works:** Pay off smallest balance first\n\n**Pros:**\n- Quick wins boost motivation\n- Simplifies finances faster\n- Great for multiple small debts\n\n**Cons:**\n- May pay more interest overall\n- Can feel slow later\n\n## Key Takeaway\n\nChoose avalanche if you''re motivated by math. Choose snowball if you need wins to stay motivated. Both beat minimum payments by years.', 3, false);

-- Budgeting Category
INSERT INTO lessons (category, title, duration_mins, content, sort_order, is_premium) VALUES
  ('budgeting', 'The Safe-to-Extra Concept', 5, E'# The Safe-to-Extra Concept\n\nKnowing exactly how much you can safely throw at debt removes the guesswork and guilt.\n\n## The Formula\n\n```\nSafe to Extra = Income - Essentials - Minimums - Non-Essentials\n```\n\n## Why It Matters\n\n- **No more guessing** if you can afford extra\n- **Protects you** from overdrafting\n- **Adapts** to your real life\n- **Guilt-free** spending on what''s left\n\n## Variable Income?\n\nUse your *lowest* expected income for the month. Anything extra is a bonus for debt.\n\n## Key Takeaway\n\nYour safe-to-extra amount is YOUR number. It changes month to month, and that''s okay.', 1, false),

  ('budgeting', 'Essential vs Non-Essential', 5, E'# Essential vs Non-Essential\n\nBe honest with yourself—but also be kind.\n\n## Essentials (Can''t Skip)\n\n- Housing (rent/mortgage)\n- Utilities (electric, water, heat)\n- Groceries (not dining out)\n- Transportation to work\n- Insurance (health, auto)\n- Minimum debt payments\n- Medications\n\n## Non-Essentials (Can Reduce)\n\n- Dining out\n- Entertainment subscriptions\n- Shopping beyond basics\n- Premium services\n- Gym memberships (alternatives exist)\n\n## The Gray Area\n\nSome things feel essential but have cheaper alternatives:\n- Internet (essential, but fastest plan isn''t)\n- Phone (essential, but unlimited data isn''t)\n- Coffee (not essential, but $5/day adds up)\n\n## Key Takeaway\n\nThe goal isn''t to eliminate joy—it''s to make room for future freedom.', 2, false),

  ('budgeting', 'Handling Variable Income', 7, E'# Handling Variable Income\n\nVariable income isn''t a bug—it''s a feature you can work with.\n\n## The Buffer System\n\n1. **Build a one-month buffer** in your checking account\n2. **Pay yourself** a consistent "salary"\n3. **Excess goes** to debt or savings\n\n## Tracking Range Income\n\nDebtShift asks for three numbers:\n- **Minimum**: Your worst month\n- **Typical**: Your average month\n- **Maximum**: Your best month\n\nBudget from minimum, celebrate when you beat it.\n\n## Gig Economy Strategy\n\n- Track income by source\n- Identify your most reliable income\n- Plan for seasonality\n\n## Key Takeaway\n\nVariable income means variable debt attacks. Good months = aggressive payoff. Tough months = minimums only. No guilt either way.', 3, true);

-- Negotiation Category
INSERT INTO lessons (category, title, duration_mins, content, sort_order, is_premium) VALUES
  ('negotiation', 'Why Creditors Negotiate', 5, E'# Why Creditors Negotiate\n\nCreditors would rather get something than nothing. Understanding their incentives is your leverage.\n\n## What Creditors Fear\n\n1. **Bankruptcy** - They get pennies on the dollar\n2. **Default** - Costs money to collect\n3. **Charge-off** - Hits their books negatively\n\n## What You Offer\n\n- Commitment to pay\n- Avoiding costly collection\n- Maintaining relationship\n\n## Who Can Negotiate\n\n- **Current accounts**: Rate reductions, payment plans\n- **Behind accounts**: Hardship programs\n- **Collections**: Settlements (30-50% common)\n\n## Key Takeaway\n\nYou''re not begging—you''re offering a business solution. They want your money; you''re just negotiating terms.', 1, false),

  ('negotiation', 'The Rate Reduction Call', 10, E'# The Rate Reduction Call\n\nA single phone call could save you hundreds in interest.\n\n## Before You Call\n\n- Know your current rate\n- Know how long you''ve been a customer\n- Know your payment history\n- Have competitive offers ready (optional)\n\n## The Script\n\n*"Hi, I''ve been a customer for [X years] and have always paid on time. I''ve noticed my interest rate is [current rate], and I''m hoping to get that reduced. Is there anything you can do?"*\n\n## If They Say No\n\n- Ask for a supervisor\n- Mention you''re considering balance transfer\n- Ask what rate they CAN offer\n- Try again in 3 months\n\n## Success Rates\n\n- First call: 50% get a reduction\n- Persistent callers: 75%+ eventually succeed\n- Average reduction: 2-6% APR\n\n## Key Takeaway\n\nThe worst they can say is no. You lose nothing by asking.', 2, false),

  ('negotiation', 'Hardship Programs Explained', 8, E'# Hardship Programs Explained\n\nMost creditors have programs for customers facing temporary difficulty—but they don''t advertise them.\n\n## Common Hardship Options\n\n- **Reduced APR** (often to 0-5%)\n- **Waived fees** (late fees, over-limit)\n- **Lower minimum payments**\n- **Payment pause** (1-3 months)\n\n## Qualifying Situations\n\n- Job loss\n- Medical emergency\n- Divorce\n- Natural disaster\n- Income reduction\n\n## How to Apply\n\n1. Call customer service\n2. Say: "I''m experiencing financial hardship"\n3. Be honest about your situation\n4. Ask what programs are available\n5. Get terms IN WRITING\n\n## Watch Out For\n\n- Account closure (you can''t use the card)\n- Credit impact (may be reported)\n- Temporary vs permanent changes\n\n## Key Takeaway\n\nHardship programs are tools, not charity. Use them when you need them.', 3, true);

-- Mindset Category
INSERT INTO lessons (category, title, duration_mins, content, sort_order, is_premium) VALUES
  ('mindset', 'Debt is Temporary', 5, E'# Debt is Temporary\n\nYou won''t always feel this way. Let''s zoom out.\n\n## The Reality Check\n\n- Average American has $58,000 in debt\n- You''re not alone\n- You''re not broken\n- You''re taking action\n\n## The Math of Time\n\nEven with just minimum payments, your debt will end. With extra payments? Much sooner.\n\n## Reframe the Journey\n\n- Debt payoff is a skill you''re learning\n- Every payment is progress\n- Setbacks are data, not failure\n- Your past doesn''t define your future\n\n## Daily Reminder\n\nYou are not your debt. You are someone working to become debt-free.\n\n## Key Takeaway\n\nThis is a chapter, not your whole story. Keep turning pages.', 1, false),

  ('mindset', 'Handling Setbacks', 7, E'# Handling Setbacks\n\nSetbacks don''t erase progress—they test your commitment.\n\n## Common Setbacks\n\n- Emergency expense\n- Missed payment\n- New debt\n- Income drop\n- Motivation loss\n\n## The Response Framework\n\n1. **Acknowledge** - Don''t pretend it didn''t happen\n2. **Assess** - What caused it? What can you control?\n3. **Adjust** - Update your plan if needed\n4. **Act** - Take one small step forward\n5. **Accept** - This is part of the journey\n\n## What NOT to Do\n\n- Don''t hide from your numbers\n- Don''t abandon your entire plan\n- Don''t compare to others\n- Don''t punish yourself with austerity\n\n## Key Takeaway\n\nA setback is not a start-over. You''re still ahead of where you''d be without trying.', 2, false),

  ('mindset', 'Celebrating Progress', 5, E'# Celebrating Progress\n\nYou''re doing something hard. That deserves recognition.\n\n## Why Celebration Matters\n\n- Reinforces positive behavior\n- Provides motivation fuel\n- Marks the journey, not just the destination\n- Combats burnout\n\n## Milestone Ideas\n\n**10% paid off:**\n- Share your win with someone\n- Write in your journal\n- Small treat (budget it!)\n\n**25% paid off:**\n- Upgrade one thing you''ve been putting off\n- Take a progress photo with your numbers\n\n**50% paid off:**\n- You''re halfway! Dinner out.\n- Update your "why I started"\n\n**75% paid off:**\n- Plan your debt-free celebration\n- Write a letter to your future self\n\n**100% paid off:**\n- CELEBRATE BIG\n- You earned it\n\n## Key Takeaway\n\nProgress without celebration is a grind. Progress with celebration is a journey worth remembering.', 3, false);

-- ============================================
-- Creditors (Sample Playbooks)
-- ============================================

INSERT INTO creditors (name, phone, best_call_times, hardship_program, rate_reduction_script, settlement_script, success_rate) VALUES
  ('Chase', '1-800-935-9935', 'Tuesday-Thursday, 10am-2pm ET',
   'Chase offers the "My Chase Plan" for splitting purchases into payments and "Hardship Programs" for temporary rate reductions and payment deferrals.',
   'Hi, I''ve been a Chase cardholder for [X years] and have maintained a good payment history. I noticed my APR is currently [current rate] and I''d like to see if there''s any way to get that reduced. I''ve seen offers from other cards at lower rates and would prefer to stay with Chase.',
   'I''m experiencing financial hardship and am unable to maintain my current payments. I''d like to discuss options for settling this account. I can offer a lump sum payment of [offer 30-40%] to resolve the account in full.',
   68),

  ('Bank of America', '1-800-732-9194', 'Wednesday-Friday, 9am-12pm ET',
   'BofA offers "Customer Assistance Programs" including reduced rates, waived fees, and temporary payment reduction for qualifying customers.',
   'Hello, I''m calling about my credit card account. I''ve been a Bank of America customer for [X years] and I''m hoping to get my interest rate lowered. My current rate is [current rate] and I''d like to discuss what options might be available.',
   'I''m facing financial difficulties and need to discuss options for this account. I''m prepared to settle this debt with a one-time payment of [offer 30-40%] of the balance if that would resolve the account.',
   65),

  ('Capital One', '1-800-955-7070', 'Monday-Wednesday, 2pm-5pm ET',
   'Capital One provides hardship programs through their "Account Assistance" team, offering rate reductions and modified payment plans.',
   'Hi there, I''ve been a Capital One customer for [X years]. I''m calling to request a lower interest rate on my card. My current APR is [current rate] and I''ve been a responsible cardholder. Is there anything you can do to help reduce my rate?',
   'I''m in a difficult financial situation and am exploring options to resolve my account. Would you be able to accept a settlement of [offer 30-40%] paid immediately to close this account?',
   62),

  ('Discover', '1-800-347-2683', 'Tuesday-Thursday, 11am-3pm ET',
   'Discover offers payment assistance programs and has a reputation for working with customers on rate reductions even without hardship.',
   'Hello, I''ve been a Discover cardholder for [X years] with consistent on-time payments. I''m calling to see if my interest rate can be reduced from [current rate]. I value my relationship with Discover and hope we can find a solution.',
   'I''m experiencing financial hardship and need to explore settling this account. I''m able to make a lump sum payment of [offer 30-40%] to resolve the balance. Is this something we can discuss?',
   72),

  ('American Express', '1-800-528-4800', 'Monday-Thursday, 9am-11am ET',
   'Amex offers "Financial Relief Programs" including payment plans, temporarily reduced rates, and hardship assistance for cardmembers.',
   'Hi, I''ve been an American Express member for [X years]. I''m reviewing my finances and noticed my APR is [current rate]. Given my history with Amex, I''m hoping you might be able to offer a lower rate.',
   'I''m going through financial difficulties and would like to discuss settling my account balance. I can offer [offer 40-50%] as a one-time payment. What options are available?',
   58),

  ('Citi', '1-800-950-5114', 'Wednesday-Friday, 1pm-4pm ET',
   'Citi offers "Citi Flex Plan" and hardship programs including APR reductions and modified payment terms.',
   'Hello, I''m calling about my Citi credit card. I''ve had this account for [X years] and have maintained good payment history. My current rate is [current rate] and I''m hoping to get that reduced. What can you offer?',
   'I''m facing financial challenges and need to discuss resolving my account. I''m prepared to settle with a payment of [offer 30-40%] of the current balance. Can we work something out?',
   60),

  ('Wells Fargo', '1-800-869-3557', 'Tuesday-Thursday, 10am-1pm ET',
   'Wells Fargo offers various assistance programs through their Customer Solutions team.',
   'Hi, I''ve been a Wells Fargo customer for [X years]. I''d like to request a lower interest rate on my credit card. My current rate is [current rate] and I believe my payment history supports a reduction.',
   'I''m experiencing hardship and would like to discuss settling my account. I can make a one-time payment of [offer 30-40%] to resolve this balance today. Is this possible?',
   55);

-- ============================================
-- Daily Quotes
-- ============================================

INSERT INTO daily_quotes (quote_type, text, author) VALUES
  -- Motivational Quotes
  ('quote', 'The secret of getting ahead is getting started.', 'Mark Twain'),
  ('quote', 'A journey of a thousand miles begins with a single step.', 'Lao Tzu'),
  ('quote', 'It does not matter how slowly you go as long as you do not stop.', 'Confucius'),
  ('quote', 'The only way to do great work is to love what you do.', 'Steve Jobs'),
  ('quote', 'Believe you can and you''re halfway there.', 'Theodore Roosevelt'),
  ('quote', 'Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill'),
  ('quote', 'The future depends on what you do today.', 'Mahatma Gandhi'),
  ('quote', 'Do what you can, with what you have, where you are.', 'Theodore Roosevelt'),
  ('quote', 'Progress, not perfection.', 'Unknown'),
  ('quote', 'Small daily improvements over time lead to stunning results.', 'Robin Sharma'),
  ('quote', 'Financial freedom is available to those who learn about it and work for it.', 'Robert Kiyosaki'),
  ('quote', 'Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn''t, pays it.', 'Albert Einstein'),
  ('quote', 'The goal isn''t more money. The goal is living life on your terms.', 'Chris Brogan'),
  ('quote', 'Every accomplishment starts with the decision to try.', 'John F. Kennedy'),
  ('quote', 'Don''t let yesterday take up too much of today.', 'Will Rogers'),

  -- Verses
  ('verse', 'The rich rule over the poor, and the borrower is slave to the lender.', 'Proverbs 22:7'),
  ('verse', 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', 'Jeremiah 29:11'),
  ('verse', 'Commit to the Lord whatever you do, and he will establish your plans.', 'Proverbs 16:3'),
  ('verse', 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', 'Joshua 1:9'),
  ('verse', 'I can do all things through Christ who strengthens me.', 'Philippians 4:13'),
  ('verse', 'But those who hope in the Lord will renew their strength.', 'Isaiah 40:31'),
  ('verse', 'For where your treasure is, there your heart will be also.', 'Matthew 6:21'),
  ('verse', 'A generous person will prosper; whoever refreshes others will be refreshed.', 'Proverbs 11:25'),
  ('verse', 'Dishonest money dwindles away, but whoever gathers money little by little makes it grow.', 'Proverbs 13:11'),
  ('verse', 'The plans of the diligent lead to profit as surely as haste leads to poverty.', 'Proverbs 21:5');
