"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  Save,
  ChevronDown,
  Percent
} from "lucide-react";
import Link from "next/link";

export default function NewInvoicePage() {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }, []);

  const [formData, setFormData] = useState({
    client_id: "",
    issued_date: todayStr,
    due_date: "",
    tax_percent: 0,
    notes: "",
    line_items: [{ description: "", quantity: 1, price: 0 }]
  });
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('clients')
          .select('id, name')
          .eq('user_id', user.id);
        setClients(data || []);
      }
    };
    fetchClients();
  }, [supabase]);

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [...formData.line_items, { description: "", quantity: 1, price: 0 }]
    });
  };

  const removeLineItem = (index: number) => {
    if (formData.line_items.length === 1) return;
    const newList = [...formData.line_items];
    newList.splice(index, 1);
    setFormData({ ...formData, line_items: newList });
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const newList = [...formData.line_items];
    (newList[index] as any)[field] = value;
    setFormData({ ...formData, line_items: newList });
  };

  const calculateSubtotal = () => {
    return formData.line_items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.tax_percent) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax();
    const totalAmount = calculateTotal();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error } = await supabase
      .from('invoices')
      .insert([
        {
          user_id: user.id,
          client_id: formData.client_id,
          invoice_number: invoiceNumber,
          amount: totalAmount,
          subtotal: subtotal,
          tax_percent: formData.tax_percent,
          tax_amount: taxAmount,
          issued_date: formData.issued_date,
          due_date: formData.due_date,
          notes: formData.notes,
          line_items: formData.line_items,
          status: 'pending'
        }
      ]);

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/invoices');
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href="/invoices" className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Invoice</h2>
          <p className="text-muted-foreground">Create a professional invoice and get paid.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client Selection */}
          <div className="p-8 bg-card border border-border rounded-[2rem] shadow-sm space-y-4">
            <h3 className="text-lg font-bold mb-4">Client Details</h3>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Select Client *</label>
              <div className="relative">
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary appearance-none transition-all font-bold"
                >
                  <option value="">Choose a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
              <Link href="/clients" className="text-xs text-primary font-bold hover:underline inline-block mt-2 ml-1">
                + Add new client
              </Link>
            </div>
          </div>

          {/* Invoice Dates & Tax */}
          <div className="p-8 bg-card border border-border rounded-[2rem] shadow-sm space-y-4">
            <h3 className="text-lg font-bold mb-4">Invoice Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Issued Date *</label>
                <input
                  type="date"
                  required
                  value={formData.issued_date}
                  onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Tax / GST %</label>
              <div className="relative">
                <select
                  value={formData.tax_percent}
                  onChange={(e) => setFormData({ ...formData, tax_percent: Number(e.target.value) })}
                  className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary appearance-none transition-all font-bold"
                >
                  <option value={0}>No Tax (0%)</option>
                  <option value={5}>GST @ 5%</option>
                  <option value={12}>GST @ 12%</option>
                  <option value={18}>GST @ 18%</option>
                  <option value={28}>GST @ 28%</option>
                </select>
                <Percent className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-[10px] text-muted-foreground ml-1">Or enter a custom rate:</p>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.tax_percent}
                onChange={(e) => setFormData({ ...formData, tax_percent: Number(e.target.value) })}
                placeholder="Custom %"
                className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-8 bg-card border border-border rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold">Line Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.line_items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="col-span-12 md:col-span-6 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                  <input
                    required
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder="Web Development Services"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                  />
                </div>
                <div className="col-span-4 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Qty</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                  />
                </div>
                <div className="col-span-5 md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={item.price}
                      onChange={(e) => updateLineItem(index, 'price', Number(e.target.value))}
                      className="w-full bg-muted/50 border border-border rounded-xl pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="col-span-3 md:col-span-1 pb-1">
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-border">
            <div className="flex flex-col items-end space-y-3">
              <div className="w-full max-w-xs flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-bold">₹{calculateSubtotal().toLocaleString()}</span>
              </div>
              {formData.tax_percent > 0 && (
                <div className="w-full max-w-xs flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Tax / GST ({formData.tax_percent}%)</span>
                  <span className="font-bold text-amber-500">+ ₹{calculateTax().toLocaleString()}</span>
                </div>
              )}
              <div className="w-full max-w-xs pt-3 border-t border-border flex justify-between">
                <span className="text-muted-foreground text-sm font-medium">Grand Total</span>
                <h2 className="text-3xl font-black text-foreground">₹{calculateTotal().toLocaleString()}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-8 bg-card border border-border rounded-[2rem] shadow-sm">
          <h3 className="text-lg font-bold mb-4">Additional Notes</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Bank transfer details, terms & conditions..."
            className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary transition-all min-h-[120px] font-medium"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Save & Create Invoice</>}
          </button>
        </div>
      </form>
    </div>
  );
}
