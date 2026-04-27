"use client";

import { Bell, Sparkles, MessageSquare, Clock, ArrowRight, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Reminders() {
  const overdueInvoices = [
    { id: 1, client: 'Ramesh Pawar', amount: '₹4,500', days: 5, status: 'Overdue' },
    { id: 2, client: 'Anjali Gupta', amount: '₹12,000', days: 12, status: 'Critical' },
    { id: 3, client: 'Tech Corp', amount: '₹8,900', days: 3, status: 'Overdue' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">AI Reminders</h2>
        <p className="text-muted-foreground">Smart payment follow-ups generated automatically for overdue bills.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" />
            Overdue Follow-ups
          </h3>
          
          <div className="space-y-4">
            {overdueInvoices.map((inv, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={inv.id}
                className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between group hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                    inv.status === 'Critical' ? 'bg-rose-500 text-white' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {inv.days}d
                  </div>
                  <div>
                    <h4 className="font-bold">{inv.client}</h4>
                    <p className="text-sm text-muted-foreground">{inv.amount} • Overdue by {inv.days} days</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />
                    WhatsApp Ready
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95">
                    Generate <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white space-y-6 shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/20 rounded-2xl w-fit">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Why use AI Reminders?</h3>
              <ul className="space-y-4 text-indigo-100 text-sm">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  Save 5+ hours weekly on manual chasing.
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  Maintain professional tone with 3 variations.
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  Get paid 30% faster on average.
                </li>
              </ul>
              <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold mt-4 hover:bg-indigo-50 transition-all">
                Upgrade for Automation
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
