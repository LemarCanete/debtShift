import React, { useState } from 'react';
import { Plus, ChevronRight, ChevronLeft, TrendingDown, Target, Phone, Zap, Heart, CheckCircle, ArrowRight, Home, CreditCard, Trophy, User, Copy, Check, Flame, Award, Clock, Star, MessageSquare, Edit3, DollarSign, Wallet, BookOpen, Send, Bot, PlayCircle, Calendar, Bell, FileText, Smile, Frown, Meh, BarChart3, PieChart, Share2, RefreshCw, Calculator, Settings, Users, History, Gift, Building, TrendingUp, Lightbulb, Timer, UserCheck, Percent, Activity, AlertTriangle, Sliders, Sparkles, Crown, Lock, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const mockDebts = [
  { id: 1, name: 'Chase Sapphire', balance: 4850, original: 6200, rate: 24.99, min: 145, creditor: 'Chase', color: '#6366f1', due: 15 },
  { id: 2, name: 'Discover It', balance: 2340, original: 3100, rate: 22.49, min: 70, creditor: 'Discover', color: '#f59e0b', due: 22 },
  { id: 3, name: 'Student Loan', balance: 18500, original: 24000, rate: 5.5, min: 220, creditor: 'Navient', color: '#10b981', due: 1 },
];

const mockExpenses = [
  { id: 1, name: 'Rent', amount: 1450, category: 'Housing', essential: true },
  { id: 2, name: 'Utilities', amount: 120, category: 'Housing', essential: true },
  { id: 3, name: 'Groceries', amount: 400, category: 'Food', essential: true },
  { id: 4, name: 'Car Insurance', amount: 95, category: 'Transport', essential: true },
  { id: 5, name: 'Gas', amount: 150, category: 'Transport', essential: true },
  { id: 6, name: 'Subscriptions', amount: 45, category: 'Entertainment', essential: false },
];

const mockLessons = [
  { id: 1, category: 'Basics', title: 'Debt Snowball vs Avalanche', mins: 3, done: true },
  { id: 2, category: 'Basics', title: 'Understanding APR', mins: 2, done: true },
  { id: 3, category: 'Budgeting', title: 'The 50/30/20 Rule', mins: 3, done: false },
  { id: 4, category: 'Budgeting', title: 'Tracking Variable Income', mins: 4, done: false },
  { id: 5, category: 'Negotiation', title: 'How to Call Your Creditor', mins: 5, done: false },
  { id: 6, category: 'Mindset', title: 'Beating Debt Shame', mins: 3, done: false },
];

const mockChat = [
  { role: 'assistant', text: "Hey! I'm Shift, your debt coach. I can answer questions, explain strategies, or just help you stay motivated. What's on your mind?" },
];

const mockReminders = [
  { id: 1, title: 'Chase payment due', date: 'Feb 15', debt: 'Chase Sapphire', done: false },
  { id: 2, title: 'Call Discover about rate', date: 'Feb 10', debt: null, done: false },
  { id: 3, title: 'Weekly budget check-in', date: 'Every Sunday', debt: null, done: false },
];

const mockJournal = [
  { id: 1, type: 'win', title: 'Paid extra $55!', date: 'Jan 28', mood: 5 },
  { id: 2, type: 'call_log', title: 'Called Chase - denied rate reduction', date: 'Jan 20', mood: 2 },
  { id: 3, type: 'reflection', title: 'Feeling motivated after hitting 20%', date: 'Jan 15', mood: 4 },
];

const mockPlannedPayments = [
  { id: 1, debt: 'Chase Sapphire', amount: 145, date: 'Feb 15', isExtra: false },
  { id: 2, debt: 'Discover It', amount: 70, date: 'Feb 22', isExtra: false },
  { id: 3, debt: 'Chase Sapphire', amount: 100, date: 'Feb 28', isExtra: true },
];

const chartData = {
  progress: [
    { month: 'Sep', balance: 33300 },
    { month: 'Oct', balance: 31800 },
    { month: 'Nov', balance: 30200 },
    { month: 'Dec', balance: 28500 },
    { month: 'Jan', balance: 26800 },
    { month: 'Feb', balance: 25690 },
  ],
  payments: [
    { month: 'Sep', amount: 435 },
    { month: 'Oct', amount: 500 },
    { month: 'Nov', amount: 600 },
    { month: 'Dec', amount: 700 },
    { month: 'Jan', amount: 700 },
    { month: 'Feb', amount: 435 },
  ],
  breakdown: [
    { name: 'Credit Cards', value: 7190, color: '#6366f1' },
    { name: 'Student Loan', value: 18500, color: '#10b981' },
  ],
};

const dailyMotivation = [
  { type: 'quote', text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { type: 'verse', text: "The rich rule over the poor, and the borrower is slave to the lender.", author: "Proverbs 22:7" },
  { type: 'quote', text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
  { type: 'verse', text: "Owe no one anything, except to love each other.", author: "Romans 13:8" },
  { type: 'quote', text: "It's not your salary that makes you rich, it's your spending habits.", author: "Charles A. Jaffe" },
  { type: 'verse', text: "For which of you, desiring to build a tower, does not first sit down and count the cost?", author: "Luke 14:28" },
  { type: 'quote', text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
];

const mockContacts = [
  { id: 1, name: 'Chase Bank', phone: '1-800-935-9935', email: 'support@chase.com', account: '****4521', notes: 'Ask for retention dept' },
  { id: 2, name: 'Discover', phone: '1-800-347-2683', email: 'support@discover.com', account: '****8832', notes: 'Best rates on Tuesdays' },
  { id: 3, name: 'Navient', phone: '1-888-272-5543', email: 'help@navient.com', account: '****1199', notes: 'IDR application pending' },
];

const mockHistory = [
  { id: 1, type: 'payment', title: 'Paid Chase Sapphire', amount: 145, date: 'Feb 1, 2026' },
  { id: 2, type: 'milestone', title: 'Reached 20% paid off!', date: 'Jan 28, 2026' },
  { id: 3, type: 'payment', title: 'Paid Discover It', amount: 70, date: 'Jan 22, 2026' },
  { id: 4, type: 'negotiation', title: 'Called Chase - rate unchanged', date: 'Jan 20, 2026' },
  { id: 5, type: 'payment', title: 'Extra payment to Chase', amount: 55, date: 'Jan 15, 2026' },
];

const mockOffers = [
  { id: 1, type: 'balance_transfer', title: 'Citi Simplicity', desc: '0% APR for 21 months', savings: 890 },
  { id: 2, type: 'consolidation', title: 'SoFi Personal Loan', desc: '8.99% fixed rate', savings: 2400 },
  { id: 3, type: 'refinance', title: 'Earnest Student Refi', desc: '4.25% variable', savings: 3200 },
];

const mockOwedToMe = [
  { id: 1, name: 'John D.', amount: 150, reason: 'Concert tickets', date: 'Jan 5, 2026', status: 'pending' },
  { id: 2, name: 'Sarah M.', amount: 75, reason: 'Dinner', date: 'Dec 20, 2025', status: 'partial', paid: 25 },
];

const mockInsights = [
  { id: 1, type: 'win', text: 'You paid 15% more than minimum this month! Keep it up.' },
  { id: 2, type: 'tip', text: 'Your Chase card has the highest rate. Focus extra payments here.' },
  { id: 3, type: 'alert', text: 'Discover payment due in 3 days. Don\'t forget!' },
];

const scripts = {
  Chase: { phone: '1-800-935-9935', times: 'Tue-Thu 10am-2pm', rate: 67, script: "Hi, I've been a Chase customer for [X] years. My APR is [X]% and I'd like a lower rate. I've seen offers from competitors as low as 15%. Can you help me stay with Chase?" },
  Discover: { phone: '1-800-347-2683', times: 'Mon-Fri 9am-5pm', rate: 72, script: "Hi, I'm calling about my Discover card. I've been a loyal customer and I'm working to pay off my balance. My APR is [X]% - is there any way to get a lower rate?" },
  Navient: { phone: '1-888-272-5543', times: 'Mon-Fri 8am-9pm', rate: 45, script: "Hi, I'm having difficulty with my payments. Can you tell me about income-driven repayment plans or hardship programs?" },
};

export default function DebtShift() {
  const [screen, setScreen] = useState('onboarding');
  const [step, setStep] = useState(0);
  const [incomeType, setIncomeType] = useState(null);
  const [goal, setGoal] = useState(null);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [copied, setCopied] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(4200);
  const [chatMessages, setChatMessages] = useState(mockChat);
  const [chatInput, setChatInput] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const todayQuote = dailyMotivation[quoteIndex];
  
  // Subscription state
  const [plan, setPlan] = useState('free'); // 'free', 'pro', 'proplus', 'family'
  const [aiMessagesUsed, setAiMessagesUsed] = useState(3);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');
  
  const isPro = plan === 'pro' || plan === 'proplus' || plan === 'family';
  const isProPlus = plan === 'proplus' || plan === 'family';
  
  // Check if feature requires upgrade
  const checkAccess = (feature) => {
    const proFeatures = ['charts', 'allocate', 'offers', 'owedtome', 'insights', 'history', 'playbook'];
    const proPlusFeatures = ['accounts'];
    
    if (proFeatures.includes(feature) && !isPro) {
      setPaywallFeature(feature);
      setShowPaywall(true);
      return false;
    }
    if (proPlusFeatures.includes(feature) && !isProPlus) {
      setPaywallFeature(feature);
      setShowPaywall(true);
      return false;
    }
    return true;
  };
  
  // Smart Allocation state
  const [allocateAmount, setAllocateAmount] = useState('500');
  const [allocations, setAllocations] = useState([
    { debtId: 1, name: 'Chase Sapphire', amount: 300, percent: 60, color: '#6366f1' },
    { debtId: 2, name: 'Discover It', amount: 150, percent: 30, color: '#f59e0b' },
    { debtId: 3, name: 'Student Loan', amount: 50, percent: 10, color: '#10b981' },
  ]);
  const [autoAllocate, setAutoAllocate] = useState(false);
  
  // Calculator state
  const [calcDebt, setCalcDebt] = useState('25000');
  const [calcRate, setCalcRate] = useState('20');
  
  // Calculate payments for different timeframes
  const calculatePayment = (principal, annualRate, months) => {
    const r = (annualRate / 100) / 12;
    if (r === 0) return principal / months;
    const payment = principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(payment);
  };
  
  const calcResults = calcDebt && calcRate ? [
    { period: '6 months', months: 6, payment: calculatePayment(parseFloat(calcDebt), parseFloat(calcRate), 6) },
    { period: '1 year', months: 12, payment: calculatePayment(parseFloat(calcDebt), parseFloat(calcRate), 12) },
    { period: '2 years', months: 24, payment: calculatePayment(parseFloat(calcDebt), parseFloat(calcRate), 24) },
    { period: '3 years', months: 36, payment: calculatePayment(parseFloat(calcDebt), parseFloat(calcRate), 36) },
    { period: '5 years', months: 60, payment: calculatePayment(parseFloat(calcDebt), parseFloat(calcRate), 60) },
  ].map(r => ({ ...r, totalPaid: r.payment * r.months, interest: (r.payment * r.months) - parseFloat(calcDebt) })) : [];

  const total = mockDebts.reduce((s, d) => s + d.balance, 0);
  const totalOrig = mockDebts.reduce((s, d) => s + d.original, 0);
  const progress = Math.round(((totalOrig - total) / totalOrig) * 100);
  const totalMin = mockDebts.reduce((s, d) => s + d.min, 0);
  const totalEssentials = mockExpenses.filter(e => e.essential).reduce((s, e) => s + e.amount, 0);
  const totalNonEssentials = mockExpenses.filter(e => !e.essential).reduce((s, e) => s + e.amount, 0);
  const safeToExtra = Math.max(0, monthlyIncome - totalEssentials - totalMin - totalNonEssentials);

  const Nav = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-2 py-2 pb-6 flex justify-around">
      {[{ id: 'dashboard', icon: Home, label: 'Home' }, { id: 'budget', icon: DollarSign, label: 'Budget' }, { id: 'debts', icon: CreditCard, label: 'Debts' }, { id: 'companion', icon: Bot, label: 'Shift' }, { id: 'settings', icon: Settings, label: 'More' }].map(t => (
        <button key={t.id} onClick={() => { setScreen(t.id); setSelectedDebt(null); }} className={`flex flex-col items-center p-1 ${screen === t.id ? 'text-amber-400' : 'text-zinc-500'}`}>
          <t.icon size={20} />
          <span className="text-[10px] mt-1">{t.label}</span>
        </button>
      ))}
    </div>
  );

  // Paywall Modal
  const PaywallModal = () => {
    if (!showPaywall) return null;
    
    const featureNames = {
      charts: 'Charts & Visualizations',
      allocate: 'Smart Allocation',
      offers: 'Money Saving Offers',
      owedtome: 'Who Owes Me',
      insights: 'AI Insights',
      history: 'Full History',
      playbook: 'Negotiation Playbooks',
      accounts: 'Bank Sync',
      ai: 'Unlimited AI Chat',
    };

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
        <div className="bg-zinc-900 rounded-t-3xl w-full max-w-md p-6 pb-10">
          <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-zinc-500"><X size={24} /></button>
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Crown size={32} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white text-center mb-2">Unlock {featureNames[paywallFeature]}</h2>
          <p className="text-zinc-400 text-center text-sm mb-6">Upgrade to Pro to access this feature and supercharge your debt payoff journey.</p>

          <div className="bg-zinc-800 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-medium">Pro Plan</span>
              <div className="text-right">
                <span className="text-amber-400 text-xl font-bold">$9.99</span>
                <span className="text-zinc-500 text-sm">/month</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {['Unlimited debts', 'Unlimited AI chat', 'All charts & insights', 'Smart allocation', 'Negotiation playbooks', 'No ads'].map(f => (
                <div key={f} className="flex items-center gap-2 text-zinc-300">
                  <Check size={14} className="text-emerald-400" /> {f}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => { setPlan('pro'); setShowPaywall(false); }}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold mb-3"
          >
            Start 7-Day Free Trial
          </button>
          
          <p className="text-zinc-500 text-xs text-center">Cancel anytime. No commitment.</p>
          
          <button onClick={() => setScreen('upgrade')} className="w-full text-amber-400 text-sm mt-4">
            Compare all plans →
          </button>
        </div>
      </div>
    );
  };

  // UPGRADE / PRICING SCREEN
  if (screen === 'upgrade') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('settings')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white mb-1">Choose Your Plan</h1>
          <p className="text-zinc-500 text-sm">Unlock your full debt-free potential</p>
        </div>

        {/* Current Plan Badge */}
        {plan !== 'free' && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 mb-4 text-center">
            <p className="text-amber-400 text-sm">Current plan: <span className="font-bold">{plan === 'pro' ? 'Pro' : plan === 'proplus' ? 'Pro+' : 'Family'}</span></p>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-3">
          {/* Free */}
          <div className={`border rounded-xl p-4 ${plan === 'free' ? 'border-zinc-600 bg-zinc-900' : 'border-zinc-800 bg-zinc-900/50'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Free</span>
              <span className="text-zinc-400">$0</span>
            </div>
            <p className="text-zinc-500 text-sm mb-3">Basic debt tracking</p>
            <div className="text-xs text-zinc-500 space-y-1">
              <p>• 3 debts max</p>
              <p>• 5 AI messages/month</p>
              <p>• Basic features</p>
            </div>
            {plan === 'free' && <p className="text-emerald-400 text-xs mt-2">✓ Current plan</p>}
          </div>

          {/* Pro - Highlighted */}
          <div className="border-2 border-amber-500 rounded-xl p-4 bg-amber-500/5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              Most Popular
            </div>
            <div className="flex justify-between items-center mb-2 mt-2">
              <span className="text-white font-bold">Pro</span>
              <div><span className="text-amber-400 text-xl font-bold">$9.99</span><span className="text-zinc-500 text-sm">/mo</span></div>
            </div>
            <p className="text-zinc-400 text-sm mb-3">Everything you need to crush debt</p>
            <div className="text-xs text-zinc-300 space-y-1 mb-3">
              <p>✓ Unlimited debts & AI chat</p>
              <p>✓ Charts, insights & smart allocation</p>
              <p>✓ Negotiation playbooks</p>
              <p>✓ Full history & data export</p>
            </div>
            <button 
              onClick={() => setPlan('pro')}
              className={`w-full py-2 rounded-lg font-medium ${plan === 'pro' ? 'bg-zinc-700 text-zinc-300' : 'bg-amber-500 text-white'}`}
            >
              {plan === 'pro' ? 'Current Plan' : 'Start Free Trial'}
            </button>
          </div>

          {/* Pro+ */}
          <div className={`border rounded-xl p-4 ${plan === 'proplus' ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-800 bg-zinc-900'}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Pro+</span>
                <Crown size={14} className="text-purple-400" />
              </div>
              <div><span className="text-purple-400 text-xl font-bold">$19.99</span><span className="text-zinc-500 text-sm">/mo</span></div>
            </div>
            <p className="text-zinc-500 text-sm mb-3">Maximum support & automation</p>
            <div className="text-xs text-zinc-400 space-y-1 mb-3">
              <p>✓ Everything in Pro</p>
              <p>✓ Bank sync (Plaid)</p>
              <p>✓ Credit score simulator</p>
              <p>✓ Priority AI & support</p>
            </div>
            <button 
              onClick={() => setPlan('proplus')}
              className={`w-full py-2 rounded-lg font-medium ${plan === 'proplus' ? 'bg-zinc-700 text-zinc-300' : 'bg-purple-500 text-white'}`}
            >
              {plan === 'proplus' ? 'Current Plan' : 'Upgrade to Pro+'}
            </button>
          </div>

          {/* Family */}
          <div className={`border rounded-xl p-4 ${plan === 'family' ? 'border-teal-500 bg-teal-500/5' : 'border-zinc-800 bg-zinc-900'}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Family</span>
                <Users size={14} className="text-teal-400" />
              </div>
              <div><span className="text-teal-400 text-xl font-bold">$29.99</span><span className="text-zinc-500 text-sm">/mo</span></div>
            </div>
            <p className="text-zinc-500 text-sm mb-3">Up to 5 family members</p>
            <div className="text-xs text-zinc-400 space-y-1 mb-3">
              <p>✓ Everything in Pro+</p>
              <p>✓ Shared household dashboard</p>
              <p>✓ Family goals & challenges</p>
            </div>
            <button 
              onClick={() => setPlan('family')}
              className={`w-full py-2 rounded-lg font-medium ${plan === 'family' ? 'bg-zinc-700 text-zinc-300' : 'bg-teal-500 text-white'}`}
            >
              {plan === 'family' ? 'Current Plan' : 'Upgrade to Family'}
            </button>
          </div>
        </div>

        {/* Annual Savings */}
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-emerald-400 text-sm">💡 Save up to 37% with annual billing</p>
        </div>

        <p className="text-zinc-600 text-xs text-center mt-4">All plans include 7-day free trial. Cancel anytime.</p>
      </div>
    </div>
  );

  // ONBOARDING
  if (screen === 'onboarding') {
    if (step === 0) return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">DebtShift</h1>
        <p className="text-zinc-400 mb-8">Your debt escape system</p>
        <div className="space-y-3 mb-10 text-left w-full max-w-xs">
          {[{ icon: TrendingDown, color: '#10b981', text: 'Adapts to your real income' }, { icon: Phone, color: '#6366f1', text: 'Scripts to negotiate lower rates' }, { icon: Heart, color: '#a855f7', text: 'Support when motivation dips' }].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: f.color + '20' }}>
                <f.icon size={18} style={{ color: f.color }} />
              </div>
              <span className="text-zinc-300 text-sm">{f.text}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setStep(1)} className="w-full max-w-xs py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
          Get Started <ArrowRight size={18} />
        </button>
      </div>
    );

    if (step === 1) return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <p className="text-amber-400 text-xs font-medium mb-1">Step 1 of 2</p>
        <h2 className="text-xl font-bold text-white mb-1">How's your income?</h2>
        <p className="text-zinc-500 text-sm mb-6">We'll adapt your plan accordingly</p>
        <div className="space-y-3 mb-6">
          {[{ id: 'steady', title: 'Steady paycheck', desc: 'Same amount each month' }, { id: 'variable', title: 'Variable income', desc: 'Gig work, freelance, commission' }, { id: 'mixed', title: 'Mix of both', desc: 'Base salary plus variable' }].map(o => (
            <button key={o.id} onClick={() => setIncomeType(o.id)} className={`w-full p-4 rounded-xl border text-left flex justify-between items-center ${incomeType === o.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
              <div><p className="text-white font-medium">{o.title}</p><p className="text-zinc-500 text-sm">{o.desc}</p></div>
              {incomeType === o.id && <CheckCircle size={20} className="text-amber-400" />}
            </button>
          ))}
        </div>
        <button onClick={() => incomeType && setStep(2)} disabled={!incomeType} className={`w-full py-3 rounded-xl font-semibold ${incomeType ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
          Continue
        </button>
      </div>
    );

    if (step === 2) return (
      <div className="min-h-screen bg-zinc-950 p-6">
        <button onClick={() => setStep(1)} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <p className="text-amber-400 text-xs font-medium mb-1">Step 2 of 2</p>
        <h2 className="text-xl font-bold text-white mb-1">What matters most?</h2>
        <p className="text-zinc-500 text-sm mb-6">We'll optimize for this goal</p>
        <div className="space-y-3 mb-6">
          {[{ id: 'fastest', title: 'Debt-free fastest', desc: 'Minimize time in debt' }, { id: 'interest', title: 'Save on interest', desc: 'Pay least total interest' }, { id: 'wins', title: 'Quick wins', desc: 'Build momentum with small victories' }].map(o => (
            <button key={o.id} onClick={() => setGoal(o.id)} className={`w-full p-4 rounded-xl border text-left flex justify-between items-center ${goal === o.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
              <div><p className="text-white font-medium">{o.title}</p><p className="text-zinc-500 text-sm">{o.desc}</p></div>
              {goal === o.id && <CheckCircle size={20} className="text-amber-400" />}
            </button>
          ))}
        </div>
        <button onClick={() => goal && setScreen('dashboard')} disabled={!goal} className={`w-full py-3 rounded-xl font-semibold ${goal ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
          Let's do this
        </button>
      </div>
    );
  }

  // DASHBOARD
  if (screen === 'dashboard') return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-zinc-500 text-sm">Good evening,</p><h1 className="text-xl font-bold text-white">Alex</h1></div>
          <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full">
            <Flame size={14} className="text-orange-400" /><span className="text-orange-400 text-sm font-medium">4 mo</span>
          </div>
        </div>

        {/* Daily Motivation */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 mb-5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-amber-400 text-xs font-medium">{todayQuote.type === 'verse' ? '📖 Daily Verse' : '💡 Daily Quote'}</p>
            <div className="flex gap-2">
              <button onClick={() => setQuoteIndex((quoteIndex + 1) % dailyMotivation.length)} className="text-zinc-500"><RefreshCw size={14} /></button>
              <button className="text-zinc-500"><Share2 size={14} /></button>
            </div>
          </div>
          <p className="text-white text-sm italic mb-1">"{todayQuote.text}"</p>
          <p className="text-zinc-500 text-xs">— {todayQuote.author}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-5">
          <p className="text-zinc-500 text-sm">Total Debt</p>
          <h2 className="text-3xl font-bold text-white mb-1">${total.toLocaleString()}</h2>
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-3"><TrendingDown size={14} /> $340 this month</div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-zinc-500 text-xs">{progress}% paid off</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Target size={20} className="text-emerald-400" /></div>
          <div><p className="text-zinc-500 text-sm">Debt-free in</p><p className="text-white font-bold">2 years, 4 months</p></div>
        </div>

        {/* Budget Snapshot */}
        <button onClick={() => setScreen('budget')} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-5 text-left">
          <div className="flex justify-between items-center mb-2">
            <p className="text-zinc-500 text-sm">This Month</p>
            <ChevronRight size={16} className="text-zinc-600" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-zinc-400 text-xs">Safe to pay extra</p>
              <p className="text-emerald-400 text-lg font-bold">${safeToExtra}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-400 text-xs">Income</p>
              <p className="text-white font-medium">${monthlyIncome.toLocaleString()}</p>
            </div>
          </div>
        </button>

        <button onClick={() => setScreen('debts')} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-3 flex items-center justify-center gap-2 mb-4">
          <Plus size={18} className="text-white" /><span className="text-white font-medium">Log Payment</span>
        </button>

        {/* Countdown */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4 mb-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-300 text-sm">Debt-Free Countdown</p>
              <p className="text-white text-2xl font-bold">856 days</p>
              <p className="text-zinc-400 text-xs">June 15, 2028</p>
            </div>
            <div className="text-right">
              <div className="flex gap-2">
                <div className="bg-zinc-800 rounded-lg px-2 py-1 text-center">
                  <p className="text-white font-bold">2</p>
                  <p className="text-zinc-500 text-[10px]">YRS</p>
                </div>
                <div className="bg-zinc-800 rounded-lg px-2 py-1 text-center">
                  <p className="text-white font-bold">4</p>
                  <p className="text-zinc-500 text-[10px]">MOS</p>
                </div>
                <div className="bg-zinc-800 rounded-lg px-2 py-1 text-center">
                  <p className="text-white font-bold">12</p>
                  <p className="text-zinc-500 text-[10px]">DAYS</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Row 1 */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          <button onClick={() => setScreen('planner')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center">
            <Calendar size={16} className="text-blue-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Planner</span>
          </button>
          <button onClick={() => setScreen('reminders')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center">
            <Bell size={16} className="text-purple-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Remind</span>
          </button>
          <button onClick={() => setScreen('journal')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center">
            <FileText size={16} className="text-emerald-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Journal</span>
          </button>
          <button onClick={() => checkAccess('charts') && setScreen('charts')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center relative">
            <BarChart3 size={16} className="text-pink-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Charts</span>
            {!isPro && <Lock size={8} className="absolute top-1 right-1 text-amber-400" />}
          </button>
          <button onClick={() => setScreen('calculator')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center">
            <Calculator size={16} className="text-amber-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Calc</span>
          </button>
        </div>

        {/* Quick Access Row 2 */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          <button onClick={() => setScreen('learn')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center">
            <BookOpen size={16} className="text-indigo-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Learn</span>
          </button>
          <button onClick={() => setScreen('contacts')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center">
            <Users size={16} className="text-cyan-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Contacts</span>
          </button>
          <button onClick={() => checkAccess('history') && setScreen('history')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center relative">
            <History size={16} className="text-orange-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">History</span>
            {!isPro && <Lock size={8} className="absolute top-1 right-1 text-amber-400" />}
          </button>
          <button onClick={() => checkAccess('offers') && setScreen('offers')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center relative">
            <Gift size={16} className="text-rose-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Offers</span>
            {!isPro && <Lock size={8} className="absolute top-1 right-1 text-amber-400" />}
          </button>
          <button onClick={() => checkAccess('owedtome') && setScreen('owedtome')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center relative">
            <UserCheck size={16} className="text-teal-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Owed Me</span>
            {!isPro && <Lock size={8} className="absolute top-1 right-1 text-amber-400" />}
          </button>
        </div>

        {/* Quick Access Row 3 */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button onClick={() => checkAccess('insights') && setScreen('insights')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center relative">
            <Lightbulb size={16} className="text-yellow-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Insights</span>
            {!isPro && <Lock size={8} className="absolute top-1 right-1 text-amber-400" />}
          </button>
          <button onClick={() => checkAccess('accounts') && setScreen('accounts')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex flex-col items-center relative">
            <Building size={16} className="text-slate-400 mb-1" />
            <span className="text-zinc-400 text-[9px]">Accounts</span>
            {!isProPlus && <Crown size={8} className="absolute top-1 right-1 text-purple-400" />}
          </button>
        </div>

        <PaywallModal />

        <h3 className="text-white font-semibold mb-2">Upcoming</h3>
        {mockDebts.slice(0, 2).map(d => (
          <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color + '20' }}><CreditCard size={16} style={{ color: d.color }} /></div>
              <div><p className="text-white text-sm font-medium">{d.name}</p><p className="text-zinc-500 text-xs">Due Feb {d.due}</p></div>
            </div>
            <p className="text-white font-semibold">${d.min}</p>
          </div>
        ))}
      </div>
      <Nav />
    </div>
  );

  // BUDGET
  if (screen === 'budget') return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-bold text-white">February Budget</h1>
          <button className="text-amber-400 text-sm">Edit</button>
        </div>

        {/* Income */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-zinc-500 text-sm">Monthly Income</p>
            <button className="text-amber-400 text-xs">+ Add</button>
          </div>
          <p className="text-2xl font-bold text-white">${monthlyIncome.toLocaleString()}</p>
          <p className="text-zinc-500 text-xs">Primary + Side hustle</p>
        </div>

        {/* Safe to Pay Extra - THE KEY FEATURE */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4 mb-4">
          <p className="text-emerald-300 text-sm mb-1">Safe to pay extra</p>
          <p className="text-3xl font-bold text-white mb-1">${safeToExtra.toLocaleString()}</p>
          <p className="text-zinc-400 text-xs">After essentials + minimums</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setScreen('allocate')} className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <Sparkles size={16} /> Smart Allocate
            </button>
            <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm">
              Manual
            </button>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <p className="text-white font-medium mb-3">Monthly Breakdown</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Income</span>
              <span className="text-emerald-400">+${monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Essential expenses</span>
              <span className="text-white">-${totalEssentials.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Debt minimums</span>
              <span className="text-white">-${totalMin}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Non-essentials</span>
              <span className="text-zinc-500">-${totalNonEssentials}</span>
            </div>
            <div className="border-t border-zinc-800 pt-2 flex justify-between text-sm">
              <span className="text-white font-medium">Available for extra</span>
              <span className="text-emerald-400 font-medium">${safeToExtra}</span>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="flex justify-between items-center mb-2">
          <p className="text-white font-medium">Expenses</p>
          <button className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center"><Plus size={14} className="text-white" /></button>
        </div>
        {mockExpenses.map(e => (
          <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2 flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">{e.name}</p>
              <p className="text-zinc-500 text-xs">{e.category} {e.essential && '• Essential'}</p>
            </div>
            <p className="text-white font-medium">${e.amount}</p>
          </div>
        ))}
      </div>
      <Nav />
    </div>
  );

  // DEBTS LIST
  if (screen === 'debts' && !selectedDebt) return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-bold text-white">Your Debts</h1>
          <button className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center"><Plus size={18} className="text-white" /></button>
        </div>
        {mockDebts.map(d => {
          const pct = Math.round(((d.original - d.balance) / d.original) * 100);
          return (
            <button key={d.id} onClick={() => setSelectedDebt(d)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3 text-left">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color + '20' }}><CreditCard size={18} style={{ color: d.color }} /></div>
                  <div><p className="text-white font-medium">{d.name}</p><p className="text-zinc-500 text-xs">{d.rate}% APR</p></div>
                </div>
                <ChevronRight size={18} className="text-zinc-600" />
              </div>
              <p className="text-xl font-bold text-white">${d.balance.toLocaleString()}</p>
              <div className="h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: d.color }} />
              </div>
              <p className="text-zinc-500 text-xs mt-1">{pct}% paid · ${d.min}/mo min</p>
            </button>
          );
        })}
      </div>
      <Nav />
    </div>
  );

  // DEBT DETAIL
  if (screen === 'debts' && selectedDebt) {
    const info = scripts[selectedDebt.creditor];
    return (
      <div className="min-h-screen bg-zinc-950 pb-6">
        <div className="p-6">
          <button onClick={() => setSelectedDebt(null)} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
          <h1 className="text-xl font-bold text-white mb-4">{selectedDebt.name}</h1>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
            <p className="text-zinc-500 text-sm">Balance</p>
            <p className="text-2xl font-bold text-white mb-2">${selectedDebt.balance.toLocaleString()}</p>
            <div className="flex gap-6">
              <div><p className="text-zinc-500 text-xs">APR</p><p className="text-white font-medium">{selectedDebt.rate}%</p></div>
              <div><p className="text-zinc-500 text-xs">Minimum</p><p className="text-white font-medium">${selectedDebt.min}/mo</p></div>
            </div>
          </div>

          {info && (
            <button onClick={() => setScreen('playbook')} className="w-full bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Phone size={18} className="text-blue-400" /></div>
                <div className="text-left"><p className="text-blue-300 font-medium">Negotiate Rate</p><p className="text-zinc-500 text-xs">{info.rate}% success rate</p></div>
              </div>
              <ChevronRight size={18} className="text-blue-400" />
            </button>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
            <p className="text-white font-medium mb-2">Payoff Projection</p>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Paid off by</span><span className="text-white">Oct 2027</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Interest</span><span className="text-orange-400">$1,240</span></div>
          </div>

          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-3 flex items-center justify-center gap-2">
            <Plus size={18} className="text-white" /><span className="text-white font-medium">Log Payment</span>
          </button>
        </div>
      </div>
    );
  }

  // SMART ALLOCATE
  if (screen === 'allocate') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('budget')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Smart Allocate</h1>
        <p className="text-zinc-500 text-sm mb-5">Divide your extra money wisely</p>

        {/* Amount Input */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <label className="text-zinc-400 text-sm mb-2 block">Amount to allocate</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xl">$</span>
            <input
              type="number"
              value={allocateAmount}
              onChange={e => setAllocateAmount(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-4 px-4 pl-10 text-white text-2xl font-bold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="flex gap-2 mb-4">
          {['Avalanche', 'Snowball', 'Balanced'].map(s => (
            <button key={s} className={`flex-1 py-2 rounded-lg text-sm font-medium ${s === 'Avalanche' ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* AI Suggestion Banner */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3 mb-4 flex items-center gap-3">
          <Sparkles size={20} className="text-purple-400" />
          <div className="flex-1">
            <p className="text-purple-300 text-sm font-medium">AI Suggestion</p>
            <p className="text-zinc-400 text-xs">Focus on Chase (highest APR) to save $240 in interest</p>
          </div>
        </div>

        {/* Allocation Sliders */}
        <p className="text-white font-medium mb-3">Allocation</p>
        {allocations.map((a, i) => (
          <div key={a.debtId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                <span className="text-white font-medium">{a.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">${a.amount}</span>
                <span className="text-zinc-500 text-sm">({a.percent}%)</span>
              </div>
            </div>
            {/* Slider */}
            <div className="relative h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="absolute h-full rounded-full transition-all" 
                style={{ width: `${a.percent}%`, backgroundColor: a.color }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={a.percent}
              onChange={e => {
                const newPercent = parseInt(e.target.value);
                const newAllocations = [...allocations];
                newAllocations[i].percent = newPercent;
                newAllocations[i].amount = Math.round((newPercent / 100) * parseFloat(allocateAmount || 0));
                setAllocations(newAllocations);
              }}
              className="w-full h-2 absolute top-0 opacity-0 cursor-pointer"
              style={{ marginTop: '-8px' }}
            />
            <div className="flex justify-between text-xs mt-2">
              <span className="text-zinc-500">{mockDebts.find(d => d.id === a.debtId)?.rate}% APR</span>
              <span className="text-emerald-400">Saves ~${Math.round(a.amount * 0.2)}/yr interest</span>
            </div>
          </div>
        ))}

        {/* Impact Preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <p className="text-white font-medium mb-2">Impact Preview</p>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-400">New debt-free date</span>
            <span className="text-emerald-400 font-medium">Mar 2028 (-3 months!)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Interest saved</span>
            <span className="text-emerald-400 font-medium">$892</span>
          </div>
        </div>

        {/* Auto-Allocate Toggle */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 flex justify-between items-center">
          <div>
            <p className="text-white font-medium">Auto-allocate monthly</p>
            <p className="text-zinc-500 text-xs">Automatically split extra income</p>
          </div>
          <button 
            onClick={() => setAutoAllocate(!autoAllocate)}
            className={`w-12 h-7 rounded-full transition-colors ${autoAllocate ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoAllocate ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 bg-zinc-800 text-white py-3 rounded-xl font-medium">
            Save Template
          </button>
          <button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-medium">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );

  // CALCULATOR
  if (screen === 'calculator') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Debt Calculator</h1>
        <p className="text-zinc-500 text-sm mb-5">See how fast you can be debt-free</p>

        {/* Input */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <div className="mb-4">
            <label className="text-zinc-400 text-sm mb-1 block">Total Debt Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <input
                type="number"
                value={calcDebt}
                onChange={e => setCalcDebt(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-3 px-4 pl-8 text-white text-lg font-medium focus:outline-none focus:border-amber-500"
                placeholder="25000"
              />
            </div>
          </div>
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Interest Rate (APR)</label>
            <div className="relative">
              <input
                type="number"
                value={calcRate}
                onChange={e => setCalcRate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-3 px-4 text-white text-lg font-medium focus:outline-none focus:border-amber-500"
                placeholder="20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">%</span>
            </div>
          </div>
        </div>

        {/* Results */}
        {calcResults.length > 0 && (
          <>
            <h3 className="text-white font-medium mb-3">Monthly Payment Options</h3>
            <div className="space-y-2 mb-4">
              {calcResults.map((r, i) => (
                <div key={i} className={`bg-zinc-900 border rounded-xl p-4 ${i === 1 ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{r.period}</span>
                    <span className="text-amber-400 text-xl font-bold">${r.payment.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Total paid</span>
                    <span className="text-zinc-300">${r.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Interest</span>
                    <span className="text-red-400">${r.interest.toLocaleString()}</span>
                  </div>
                  {i === 1 && <p className="text-amber-400 text-xs mt-2">⭐ Recommended</p>}
                </div>
              ))}
            </div>

            {/* Quick Insight */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-400 text-sm font-medium mb-1">💡 Quick Insight</p>
              <p className="text-zinc-300 text-sm">
                Paying off in 1 year vs 5 years saves you <span className="text-emerald-400 font-bold">${(calcResults[4]?.interest - calcResults[1]?.interest).toLocaleString()}</span> in interest!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // CHARTS
  if (screen === 'charts') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Your Progress</h1>
        <p className="text-zinc-500 text-sm mb-5">Visualize your debt journey</p>

        {/* Debt Over Time */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <p className="text-white font-medium mb-3">Debt Balance Over Time</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData.progress}>
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={(v) => [`$${v.toLocaleString()}`, 'Balance']} />
              <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-emerald-400 text-xs text-center mt-2">↓ $7,610 paid off since September</p>
        </div>

        {/* Monthly Payments */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <p className="text-white font-medium mb-3">Monthly Payments</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData.payments}>
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }} formatter={(v) => [`$${v}`, 'Paid']} />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Debt Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <p className="text-white font-medium mb-3">Debt Breakdown</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <RePieChart>
                <Pie data={chartData.breakdown} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={45}>
                  {chartData.breakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {chartData.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-400 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white text-sm font-medium">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">$1,840</p>
            <p className="text-zinc-500 text-xs">Interest Saved</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">23%</p>
            <p className="text-zinc-500 text-xs">Progress</p>
          </div>
        </div>
      </div>
    </div>
  );

  // PLANNER
  if (screen === 'planner') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Payment Planner</h1>
        <p className="text-zinc-500 text-sm mb-5">Schedule your debt payments</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <button className="text-zinc-400"><ChevronLeft size={20} /></button>
            <p className="text-white font-medium">February 2026</p>
            <button className="text-zinc-400"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['S','M','T','W','T','F','S'].map((d,i) => <span key={i} className="text-zinc-500">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {[...Array(28)].map((_, i) => {
              const day = i + 1;
              const hasPayment = [15, 22, 28].includes(day);
              return <div key={i} className={`py-2 rounded-lg ${hasPayment ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400'}`}>{day}</div>;
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-medium">Planned Payments</h3>
          <button className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center"><Plus size={14} className="text-white" /></button>
        </div>
        {mockPlannedPayments.map(p => (
          <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2 flex justify-between items-center">
            <div><p className="text-white font-medium">{p.debt}</p><p className="text-zinc-500 text-xs">{p.date} {p.isExtra && <span className="text-emerald-400">• Extra</span>}</p></div>
            <p className="text-white font-semibold">${p.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // REMINDERS
  if (screen === 'reminders') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Reminders</h1>
        <p className="text-zinc-500 text-sm mb-5">Never miss a payment</p>

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-medium">Active</h3>
          <button className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center"><Plus size={14} className="text-white" /></button>
        </div>
        {mockReminders.map(r => (
          <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><Bell size={18} className="text-purple-400" /></div>
            <div className="flex-1"><p className="text-white font-medium">{r.title}</p><p className="text-zinc-500 text-xs">{r.date}</p></div>
            <ChevronRight size={18} className="text-zinc-600" />
          </div>
        ))}
      </div>
    </div>
  );

  // JOURNAL
  if (screen === 'journal') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Journal</h1>
        <p className="text-zinc-500 text-sm mb-5">Track your debt journey</p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <button className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center"><Star size={20} className="text-amber-400 mb-1" /><span className="text-zinc-400 text-xs">Win</span></button>
          <button className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center"><Phone size={20} className="text-blue-400 mb-1" /><span className="text-zinc-400 text-xs">Call Log</span></button>
          <button className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center"><FileText size={20} className="text-purple-400 mb-1" /><span className="text-zinc-400 text-xs">Note</span></button>
        </div>

        <h3 className="text-white font-medium mb-3">Recent</h3>
        {mockJournal.map(e => (
          <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {e.type === 'win' && <Star size={14} className="text-amber-400" />}
                {e.type === 'call_log' && <Phone size={14} className="text-blue-400" />}
                {e.type === 'reflection' && <FileText size={14} className="text-purple-400" />}
                <p className="text-white font-medium text-sm">{e.title}</p>
              </div>
              {e.mood >= 4 ? <Smile size={14} className="text-emerald-400" /> : e.mood <= 2 ? <Frown size={14} className="text-red-400" /> : <Meh size={14} className="text-amber-400" />}
            </div>
            <p className="text-zinc-500 text-xs mt-1">{e.date}</p>
          </div>
        ))}

        <div className="mt-5 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-purple-300 text-sm font-medium mb-1">Why I Started</p>
          <p className="text-zinc-300 text-sm italic">"To buy a house and stop stressing about money."</p>
        </div>
      </div>
    </div>
  );

  // TACTICS
  if (screen === 'tactics') return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-1">Negotiation Tactics</h1>
        <p className="text-zinc-500 text-sm mb-5">Scripts to lower your rates</p>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-1"><Award size={18} className="text-emerald-400" /><p className="text-emerald-300 font-medium">Community Success</p></div>
          <p className="text-white text-xl font-bold">$2.4M+ saved</p>
          <p className="text-zinc-500 text-xs">Through rate negotiations this month</p>
        </div>

        <h3 className="text-white font-medium mb-3">Your Creditors</h3>
        {mockDebts.map(d => {
          const info = scripts[d.creditor];
          return (
            <button key={d.id} onClick={() => { setSelectedDebt(d); setScreen('playbook'); }} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color + '20' }}><Phone size={16} style={{ color: d.color }} /></div>
                <div className="text-left"><p className="text-white font-medium">{d.creditor}</p><p className="text-zinc-500 text-xs">{d.name}</p></div>
              </div>
              <div className="text-right"><p className="text-emerald-400 font-medium">{info?.rate}%</p><p className="text-zinc-600 text-xs">success</p></div>
            </button>
          );
        })}
      </div>
      <Nav />
    </div>
  );

  // PLAYBOOK
  if (screen === 'playbook' && selectedDebt) {
    const info = scripts[selectedDebt.creditor];
    return (
      <div className="min-h-screen bg-zinc-950 pb-6">
        <div className="p-6">
          <button onClick={() => { setScreen('tactics'); setSelectedDebt(null); }} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
          <h1 className="text-xl font-bold text-white mb-4">{selectedDebt.creditor} Playbook</h1>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-4 flex justify-between items-center">
            <div><p className="text-emerald-300 text-sm">Success Rate</p><p className="text-white text-2xl font-bold">{info.rate}%</p></div>
            <Award size={32} className="text-emerald-400" />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
            <p className="text-white font-medium mb-2">Contact</p>
            <div className="flex justify-between text-sm mb-1"><span className="text-zinc-500">Phone</span><span className="text-amber-400">{info.phone}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-500">Best times</span><span className="text-white">{info.times}</span></div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-white font-medium">Script</p>
              <button onClick={() => { navigator.clipboard?.writeText(info.script); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-amber-400 text-xs flex items-center gap-1">
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-zinc-400 text-sm italic">"{info.script}"</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-white font-medium mb-2">If they say no...</p>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>• Ask for a supervisor</li>
              <li>• Mention competitor offers</li>
              <li>• Ask about hardship programs</li>
              <li>• Request a callback</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // COMPANION (AI Chat)
  if (screen === 'companion') {
    const sendMessage = () => {
      if (!chatInput.trim()) return;
      
      // Check AI message limit for free users
      if (!isPro && aiMessagesUsed >= 5) {
        setPaywallFeature('ai');
        setShowPaywall(true);
        return;
      }
      
      setChatMessages([...chatMessages, { role: 'user', text: chatInput }]);
      setChatInput('');
      if (!isPro) setAiMessagesUsed(aiMessagesUsed + 1);
      
      // Simulate AI response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          text: "Based on your situation, I'd focus on the Discover card first - it has a higher success rate for negotiation (72%). Want me to walk you through the call script?" 
        }]);
      }, 1000);
    };

    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Shift</p>
                <p className="text-emerald-400 text-xs">Your debt coach</p>
              </div>
            </div>
            {!isPro && (
              <div className="bg-zinc-800 px-3 py-1 rounded-full">
                <span className="text-zinc-400 text-xs">{5 - aiMessagesUsed} msgs left</span>
              </div>
            )}
            {isPro && (
              <div className="bg-amber-500/20 px-3 py-1 rounded-full">
                <span className="text-amber-400 text-xs flex items-center gap-1"><Crown size={12} /> Pro</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-3">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-200'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompts */}
        <div className="absolute bottom-24 left-0 right-0 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Which debt first?', 'Should I negotiate?', 'Motivate me'].map(q => (
              <button key={q} onClick={() => setChatInput(q)} className="flex-shrink-0 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-full text-xs">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="absolute bottom-16 left-0 right-0 p-4 bg-zinc-950 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask Shift anything..."
              className="flex-1 bg-zinc-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button onClick={sendMessage} className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
        <Nav />
      </div>
    );
  }

  // LEARN
  if (screen === 'learn') {
    const completed = mockLessons.filter(l => l.done).length;
    const categories = [...new Set(mockLessons.map(l => l.category))];
    
    return (
      <div className="min-h-screen bg-zinc-950 pb-20">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white mb-1">Learn</h1>
          <p className="text-zinc-500 text-sm mb-5">Master your money in minutes a day</p>

          {/* Progress */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 mb-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-purple-300 font-medium">Your Progress</p>
              <div className="flex items-center gap-1 text-amber-400">
                <Flame size={14} /> <span className="text-sm font-medium">3 day streak</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(completed / mockLessons.length) * 100}%` }} />
              </div>
              <span className="text-white text-sm font-medium">{completed}/{mockLessons.length}</span>
            </div>
          </div>

          {/* Lessons by category */}
          {categories.map(cat => (
            <div key={cat} className="mb-5">
              <h3 className="text-white font-medium mb-2">{cat}</h3>
              {mockLessons.filter(l => l.category === cat).map(lesson => (
                <button key={lesson.id} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2 flex items-center gap-3 text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lesson.done ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                    {lesson.done ? <Check size={18} className="text-white" /> : <PlayCircle size={18} className="text-zinc-400" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${lesson.done ? 'text-zinc-400' : 'text-white'}`}>{lesson.title}</p>
                    <p className="text-zinc-500 text-xs">{lesson.mins} min</p>
                  </div>
                  {!lesson.done && <ChevronRight size={16} className="text-zinc-600" />}
                </button>
              ))}
            </div>
          ))}
        </div>
        <Nav />
      </div>
    );
  }

  // PROGRESS (moved tactics here, accessible from debt detail)
  if (screen === 'progress') return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-5">Your Progress</h1>
        
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3 mb-2">
            <Flame size={24} className="text-orange-400" />
            <div><p className="text-orange-300 font-medium">4 Month Streak!</p><p className="text-zinc-500 text-sm">Keep it going</p></div>
          </div>
        </div>

        <h3 className="text-white font-medium mb-3">Milestones</h3>
        {[{ pct: 10, done: true }, { pct: 25, done: false }, { pct: 50, done: false }, { pct: 75, done: false }, { pct: 100, done: false }].map(m => (
          <div key={m.pct} className={`bg-zinc-900 border rounded-xl p-3 mb-2 flex items-center gap-3 ${m.done ? 'border-emerald-500/30' : 'border-zinc-800'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${m.done ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
              {m.done ? <Check size={18} className="text-white" /> : <span className="text-zinc-500 text-sm">{m.pct}%</span>}
            </div>
            <div><p className={`font-medium ${m.done ? 'text-emerald-400' : 'text-white'}`}>{m.pct}% Paid Off</p><p className="text-zinc-500 text-xs">{m.done ? 'Achieved!' : `${m.pct - progress}% to go`}</p></div>
          </div>
        ))}
      </div>
      <Nav />
    </div>
  );

  // CONTACTS (Creditors)
  if (screen === 'contacts') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <div className="flex justify-between items-center mb-5">
          <div><h1 className="text-xl font-bold text-white">Contacts</h1><p className="text-zinc-500 text-sm">Your creditors</p></div>
          <button className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center"><Plus size={16} className="text-white" /></button>
        </div>
        {mockContacts.map(c => (
          <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"><Building size={18} className="text-blue-400" /></div>
                <div><p className="text-white font-medium">{c.name}</p><p className="text-zinc-500 text-xs">Acct: {c.account}</p></div>
              </div>
              <button className="text-zinc-500"><Edit3 size={16} /></button>
            </div>
            <div className="text-sm space-y-1 mb-2">
              <p className="text-zinc-400"><Phone size={12} className="inline mr-2" />{c.phone}</p>
              <p className="text-zinc-400"><MessageSquare size={12} className="inline mr-2" />{c.email}</p>
            </div>
            {c.notes && <p className="text-amber-400/80 text-xs bg-amber-500/10 px-2 py-1 rounded">📝 {c.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  // HISTORY
  if (screen === 'history') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">History</h1>
        <p className="text-zinc-500 text-sm mb-5">Your debt journey timeline</p>
        <div className="space-y-3">
          {mockHistory.map(h => (
            <div key={h.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${h.type === 'payment' ? 'bg-emerald-500/20' : h.type === 'milestone' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                  {h.type === 'payment' && <DollarSign size={14} className="text-emerald-400" />}
                  {h.type === 'milestone' && <Trophy size={14} className="text-amber-400" />}
                  {h.type === 'negotiation' && <Phone size={14} className="text-blue-400" />}
                </div>
                <div className="w-0.5 h-full bg-zinc-800 mt-2" />
              </div>
              <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-1">
                <p className="text-white font-medium text-sm">{h.title}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-zinc-500 text-xs">{h.date}</p>
                  {h.amount && <p className="text-emerald-400 font-medium">${h.amount}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // OFFERS
  if (screen === 'offers') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Money Saving Offers</h1>
        <p className="text-zinc-500 text-sm mb-5">Ways to reduce your interest</p>
        {mockOffers.map(o => (
          <div key={o.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${o.type === 'balance_transfer' ? 'bg-blue-500/20 text-blue-400' : o.type === 'consolidation' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {o.type === 'balance_transfer' ? 'Balance Transfer' : o.type === 'consolidation' ? 'Consolidation' : 'Refinance'}
                </span>
                <p className="text-white font-medium mt-2">{o.title}</p>
                <p className="text-zinc-500 text-sm">{o.desc}</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
              <div><p className="text-zinc-500 text-xs">Potential savings</p><p className="text-emerald-400 font-bold">${o.savings.toLocaleString()}</p></div>
              <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Learn More</button>
            </div>
          </div>
        ))}
        <p className="text-zinc-600 text-xs text-center mt-4">Partner offers. We may earn a commission.</p>
      </div>
    </div>
  );

  // WHO OWES ME
  if (screen === 'owedtome') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <div className="flex justify-between items-center mb-5">
          <div><h1 className="text-xl font-bold text-white">Who Owes Me</h1><p className="text-zinc-500 text-sm">Track money you've lent</p></div>
          <button className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center"><Plus size={16} className="text-white" /></button>
        </div>
        
        <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4 mb-5">
          <p className="text-teal-300 text-sm">Total Owed to You</p>
          <p className="text-white text-2xl font-bold">${mockOwedToMe.reduce((s, o) => s + o.amount - (o.paid || 0), 0)}</p>
        </div>

        {mockOwedToMe.map(o => (
          <div key={o.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center"><User size={18} className="text-zinc-400" /></div>
                <div><p className="text-white font-medium">{o.name}</p><p className="text-zinc-500 text-xs">{o.reason}</p></div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">${o.amount}</p>
                {o.paid && <p className="text-emerald-400 text-xs">${o.paid} paid</p>}
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-zinc-500 text-xs">{o.date}</p>
              <div className="flex gap-2">
                <button className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg">Remind</button>
                <button className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg">Mark Paid</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // INSIGHTS
  if (screen === 'insights') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Insights</h1>
        <p className="text-zinc-500 text-sm mb-5">AI-powered analysis</p>

        {/* Impact Score */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 mb-5">
          <div className="flex justify-between items-center">
            <div><p className="text-purple-300 text-sm">Financial Health Score</p><p className="text-white text-3xl font-bold">72</p><p className="text-emerald-400 text-xs">↑ 5 pts this month</p></div>
            <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center"><Activity size={24} className="text-purple-400" /></div>
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <p className="text-white font-medium mb-3">Quick Analysis</p>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-zinc-400 text-sm">Debt-to-Income</span><span className="text-amber-400 font-medium">34%</span></div>
            <div className="flex justify-between"><span className="text-zinc-400 text-sm">Credit Utilization</span><span className="text-red-400 font-medium">68%</span></div>
            <div className="flex justify-between"><span className="text-zinc-400 text-sm">Payment Consistency</span><span className="text-emerald-400 font-medium">100%</span></div>
          </div>
        </div>

        {/* Weekly Insights */}
        <p className="text-white font-medium mb-3">This Week</p>
        {mockInsights.map(i => (
          <div key={i.id} className={`rounded-xl p-3 mb-2 flex items-start gap-3 ${i.type === 'win' ? 'bg-emerald-500/10 border border-emerald-500/20' : i.type === 'tip' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
            {i.type === 'win' && <Trophy size={16} className="text-emerald-400 mt-0.5" />}
            {i.type === 'tip' && <Lightbulb size={16} className="text-blue-400 mt-0.5" />}
            {i.type === 'alert' && <AlertTriangle size={16} className="text-amber-400 mt-0.5" />}
            <p className="text-zinc-300 text-sm">{i.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ACCOUNTS
  if (screen === 'accounts') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('dashboard')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Accounts</h1>
        <p className="text-zinc-500 text-sm mb-5">All your linked accounts</p>

        <p className="text-white font-medium mb-3">Credit Cards</p>
        {mockDebts.filter(d => d.creditor !== 'Navient').map(d => (
          <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color + '20' }}><CreditCard size={18} style={{ color: d.color }} /></div>
              <div><p className="text-white font-medium">{d.name}</p><p className="text-zinc-500 text-xs">{d.rate}% APR</p></div>
            </div>
            <p className="text-white font-medium">${d.balance.toLocaleString()}</p>
          </div>
        ))}

        <p className="text-white font-medium mb-3 mt-5">Loans</p>
        {mockDebts.filter(d => d.creditor === 'Navient').map(d => (
          <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color + '20' }}><Building size={18} style={{ color: d.color }} /></div>
              <div><p className="text-white font-medium">{d.name}</p><p className="text-zinc-500 text-xs">{d.rate}% APR</p></div>
            </div>
            <p className="text-white font-medium">${d.balance.toLocaleString()}</p>
          </div>
        ))}

        <button className="w-full mt-4 border-2 border-dashed border-zinc-700 rounded-xl p-4 text-zinc-500 flex items-center justify-center gap-2">
          <Plus size={18} /> Connect Bank Account
        </button>
      </div>
    </div>
  );

  // ALLOCATION SETTINGS
  if (screen === 'allocation-settings') return (
    <div className="min-h-screen bg-zinc-950 pb-6">
      <div className="p-6">
        <button onClick={() => setScreen('settings')} className="text-zinc-500 text-sm flex items-center gap-1 mb-4"><ChevronLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-white mb-1">Smart Allocation</h1>
        <p className="text-zinc-500 text-sm mb-5">Configure automatic money distribution</p>

        {/* Master Toggle */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 flex justify-between items-center">
          <div>
            <p className="text-white font-medium">Enable Auto-Allocation</p>
            <p className="text-zinc-500 text-xs">Automatically divide extra income each month</p>
          </div>
          <button 
            onClick={() => setAutoAllocate(!autoAllocate)}
            className={`w-12 h-7 rounded-full transition-colors ${autoAllocate ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoAllocate ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Strategy */}
        <p className="text-white font-medium mb-3">Default Strategy</p>
        <div className="space-y-2 mb-5">
          {[
            { id: 'avalanche', title: 'Avalanche', desc: 'Highest interest first - saves most money' },
            { id: 'snowball', title: 'Snowball', desc: 'Smallest balance first - quick wins' },
            { id: 'balanced', title: 'Balanced', desc: 'Mix of both strategies' },
            { id: 'custom', title: 'Custom', desc: 'Your saved allocation template' },
          ].map(s => (
            <button key={s.id} className={`w-full p-4 rounded-xl border text-left ${s.id === 'avalanche' ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{s.title}</p>
                  <p className="text-zinc-500 text-sm">{s.desc}</p>
                </div>
                {s.id === 'avalanche' && <CheckCircle size={20} className="text-amber-400" />}
              </div>
            </button>
          ))}
        </div>

        {/* Saved Templates */}
        <p className="text-white font-medium mb-3">Saved Templates</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3 flex justify-between items-center">
          <div>
            <p className="text-white">Aggressive Chase Payoff</p>
            <p className="text-zinc-500 text-xs">60% Chase, 30% Discover, 10% Student</p>
          </div>
          <button className="text-amber-400 text-sm">Use</button>
        </div>
        <button className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-4 text-zinc-500 flex items-center justify-center gap-2">
          <Plus size={18} /> Create New Template
        </button>

        {/* Notification */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-5 flex justify-between items-center">
          <div>
            <p className="text-white font-medium">Monthly Reminder</p>
            <p className="text-zinc-500 text-xs">Remind me to allocate extra income</p>
          </div>
          <button className="w-12 h-7 rounded-full bg-emerald-500">
            <div className="w-5 h-5 rounded-full bg-white shadow translate-x-6" />
          </button>
        </div>
      </div>
    </div>
  );

  // SETTINGS
  if (screen === 'settings') return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-5">Settings</h1>
        
        {/* Profile */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-white text-xl font-bold">A</div>
          <div className="flex-1"><p className="text-white font-medium">Alex Johnson</p><p className="text-zinc-500 text-sm">alex@email.com</p></div>
          <button className="text-amber-400 text-sm">Edit</button>
        </div>

        {/* Subscription */}
        <button onClick={() => setScreen('upgrade')} className={`w-full rounded-xl p-4 mb-4 flex justify-between items-center ${isPro ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30' : 'bg-zinc-900 border border-zinc-800'}`}>
          <div className="flex items-center gap-3">
            <Crown size={20} className={isPro ? 'text-amber-400' : 'text-zinc-500'} />
            <div>
              <p className="text-white font-medium">{plan === 'free' ? 'Free Plan' : plan === 'pro' ? 'Pro Plan' : plan === 'proplus' ? 'Pro+ Plan' : 'Family Plan'}</p>
              <p className="text-zinc-500 text-sm">{isPro ? 'Manage subscription' : 'Upgrade for more features'}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-zinc-600" />
        </button>

        <p className="text-zinc-500 text-xs uppercase mb-2 mt-5">Preferences</p>
        {['Notifications', 'Payoff Strategy', 'Smart Allocation', 'Currency & Format', 'Theme'].map((item, i) => (
          <button key={i} onClick={() => item === 'Smart Allocation' && setScreen('allocation-settings')} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-2 flex justify-between items-center">
            <span className="text-white">{item}</span>
            <div className="flex items-center gap-2">
              {item === 'Smart Allocation' && <span className="text-emerald-400 text-sm">{autoAllocate ? 'On' : 'Off'}</span>}
              <ChevronRight size={18} className="text-zinc-600" />
            </div>
          </button>
        ))}

        <p className="text-zinc-500 text-xs uppercase mb-2 mt-5">Data</p>
        {['Accounts', 'Export Data', 'Import Data'].map((item, i) => (
          <button key={i} onClick={() => item === 'Accounts' && setScreen('accounts')} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-2 flex justify-between items-center">
            <span className="text-white">{item}</span>
            <ChevronRight size={18} className="text-zinc-600" />
          </button>
        ))}

        <p className="text-zinc-500 text-xs uppercase mb-2 mt-5">Support</p>
        {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item, i) => (
          <button key={i} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-2 flex justify-between items-center">
            <span className="text-white">{item}</span>
            <ChevronRight size={18} className="text-zinc-600" />
          </button>
        ))}

        <button className="w-full bg-zinc-900 border border-red-500/30 rounded-xl p-4 mt-4 flex justify-between items-center">
          <span className="text-red-400">Log Out</span>
        </button>

        <p className="text-zinc-600 text-xs text-center mt-6">DebtShift v1.0.0</p>
      </div>
      <Nav />
    </div>
  );

  return null;
}
