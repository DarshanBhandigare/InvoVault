"use client";

import { Check, Zap, Shield, Crown, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    description: 'Perfect for getting started.',
    features: ['5 invoices/month', 'Basic PDF generation', 'Email support'],
    icon: Zap,
    color: 'bg-slate-500',
    cta: 'Get Started'
  },
  {
    name: 'Starter',
    price: '₹299',
    period: '/mo',
    description: 'For growing freelancers.',
    features: ['Unlimited invoices', 'AI payment reminders', 'Custom PDF branding', 'Priority support'],
    icon: Shield,
    color: 'bg-indigo-600',
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Pro',
    price: '₹799',
    period: '/mo',
    description: 'For busy micro-SMEs.',
    features: ['GST reports', 'Client portal', 'Payment link integration', 'WhatsApp automation', 'Team access (3)'],
    icon: Crown,
    color: 'bg-violet-600',
    cta: 'Go Pro'
  },
  {
    name: 'Business',
    price: '₹1999',
    period: '/mo',
    description: 'Complete billing solution.',
    features: ['Multi-user access', 'Accountant login', 'Tally/ERP sync', 'API access', 'Dedicated manager'],
    icon: Building2,
    color: 'bg-slate-900',
    cta: 'Contact Sales'
  }
];

export default function Pricing() {
  return (
    <div className="space-y-12 pb-20">
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-4xl font-black tracking-tight">Simple Pricing for Indian SMEs</h2>
        <p className="text-xl text-muted-foreground">
          No hidden fees. Choose a plan that scales with your business.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={plan.name}
            className={`relative p-8 rounded-3xl border border-border bg-card flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            
            <div className="space-y-4 mb-8">
              <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center`}>
                <plan.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${
              plan.popular 
                ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}>
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="p-12 rounded-[40px] bg-slate-900 text-white text-center space-y-6 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-bold">Trusted by 5000+ Indian Small Businesses</h3>
          <p className="text-slate-400 max-w-xl mx-auto">
            From freelancers to retailers, InvoiceZap is the first AI-native choice for professional invoicing in India.
          </p>
          <div className="flex justify-center gap-8 grayscale opacity-50">
             {/* Mock Logos */}
             <div className="font-black italic text-xl">RAZORPAY</div>
             <div className="font-black italic text-xl">ZOMATO</div>
             <div className="font-black italic text-xl">SWIGGY</div>
             <div className="font-black italic text-xl">RELIANCE</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] -ml-32 -mb-32" />
      </div>
    </div>
  );
}
