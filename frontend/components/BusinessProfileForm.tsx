"use client";

import { useState } from "react";
import { Building, CreditCard, Save, Loader2, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function BusinessProfileForm({ initialData, userId }: { initialData: any, userId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    gstin: initialData?.gstin || "",
    bank_name: initialData?.bank_name || "",
    account_number: initialData?.account_number || "",
    ifsc: initialData?.ifsc || ""
  });
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from('businesses')
      .upsert({
        ...formData,
        user_id: userId,
      }, { onConflict: 'user_id' });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Business Info */}
      <section className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">General Information</h3>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Business Name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
              placeholder="e.g. Acme Solutions Pvt Ltd"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
              placeholder="billing@acme.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Phone Number</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
              placeholder="+91 90000 00000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">GSTIN</label>
            <input
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
              placeholder="27AAAAA0000A1Z5"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Business Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all min-h-[100px] font-medium"
              placeholder="Street, Building, Area, City, PIN"
            />
          </div>
        </div>
      </section>

      {/* Bank Details */}
      <section className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">Payment Details</h3>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Bank Name</label>
            <input
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
              placeholder="HDFC Bank"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Account Number</label>
            <input
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
              placeholder="50100012345678"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">IFSC Code</label>
            <input
              value={formData.ifsc}
              onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
              className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-bold uppercase"
              placeholder="HDFC0001234"
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-10 py-5 rounded-2xl font-black text-lg shadow-2xl flex items-center gap-3 transition-all active:scale-95 ${
            success 
              ? "bg-emerald-500 text-white shadow-emerald-500/30" 
              : "bg-primary text-white shadow-primary/30 hover:bg-primary/90"
          }`}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : success ? <><Check className="w-6 h-6" /> Profile Saved!</> : <><Save className="w-6 h-6" /> Save Profile</>}
        </button>
      </div>
    </form>
  );
}
