"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-full max-w-md text-center bg-card border border-border rounded-3xl p-10 shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Check your email</h2>
          <p className="text-muted-foreground mb-8">
            We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>. 
            Please verify your email to continue.
          </p>
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20 mb-4">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">Start managing invoices with AI</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajesh@business.com"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
