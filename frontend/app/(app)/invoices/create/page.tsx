"use client";

import { useState } from 'react';
import { 
  Zap, 
  Loader2, 
  Plus, 
  Trash2, 
  FileText, 
  Check,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoiceApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CreateInvoice() {
  const router = useRouter();
  const [aiInput, setAiInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>({
    client_name: '',
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    line_items: [{ description: '', quantity: 1, price: 0, amount: 0 }],
    notes: '',
    subtotal: 0,
    total_amount: 0
  });

  const handleAiExtract = async () => {
    if (!aiInput.trim()) return;
    setIsExtracting(true);
    try {
      const res = await invoiceApi.extractInvoice(aiInput);
      const data = res.data;
      setInvoiceData({
        ...invoiceData,
        client_name: data.client_name,
        line_items: data.line_items,
        total_amount: data.total_amount,
        subtotal: data.total_amount, // Simplified
        notes: data.notes || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceData.line_items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].price;
    }
    
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    setInvoiceData({ ...invoiceData, line_items: newItems, subtotal, total_amount: subtotal });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      line_items: [...invoiceData.line_items, { description: '', quantity: 1, price: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = invoiceData.line_items.filter((_: any, i: number) => i !== index);
    const subtotal = newItems.reduce((sum: number, item: any) => sum + item.amount, 0);
    setInvoiceData({ ...invoiceData, line_items: newItems, subtotal, total_amount: subtotal });
  };

  const handleSubmit = async () => {
    try {
      // First, create or find client (simplified: always create for now or just send name)
      // In a real app, we'd have a client picker
      const clientRes = await invoiceApi.createClient({ name: invoiceData.client_name });
      const invoiceRes = await invoiceApi.createInvoice({
        ...invoiceData,
        client_id: clientRes.data.id
      });
      router.push(`/invoices/${invoiceRes.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Create Invoice</h2>
        <p className="text-muted-foreground">Type what you want to bill, and let AI do the heavy lifting.</p>
      </header>

      {/* AI Input Section */}
      <div className="p-6 rounded-2xl bg-card border-2 border-primary/20 shadow-xl shadow-primary/5 relative">
        <div className="flex items-center gap-2 mb-4 text-primary font-bold">
          <Zap className="w-5 h-5 fill-primary" />
          <span>AI Quick Create</span>
        </div>
        <div className="relative">
          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder='e.g. "Bill Ramesh ₹4500 for 3 logo designs, due in 10 days"'
            className="w-full h-24 bg-muted/50 border-none rounded-xl p-4 text-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
          />
          <button 
            onClick={handleAiExtract}
            disabled={isExtracting || !aiInput.trim()}
            className="absolute bottom-3 right-3 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            Extract
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tip: You can mention items, prices, quantities, and due dates in plain English.
        </p>
      </div>

      {/* Manual Form Section */}
      <div className="p-8 rounded-2xl bg-card border border-border shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Client Name</label>
            <input
              type="text"
              value={invoiceData.client_name}
              onChange={(e) => setInvoiceData({...invoiceData, client_name: e.target.value})}
              placeholder="Who are you billing?"
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Due Date</label>
            <input
              type="date"
              value={invoiceData.due_date}
              onChange={(e) => setInvoiceData({...invoiceData, due_date: e.target.value})}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Line Items</h3>
            <button 
              onClick={addItem}
              className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors font-semibold text-sm"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          
          <div className="space-y-3">
            {invoiceData.line_items.map((item: any, index: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={index} 
                className="grid grid-cols-12 gap-3 items-end"
              >
                <div className="col-span-6 space-y-1">
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                </div>
                <div className="col-span-1 py-2 text-sm font-bold text-right">
                  ₹{item.amount}
                </div>
                <div className="col-span-1 flex justify-center pb-2">
                  <button 
                    onClick={() => removeItem(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-border flex justify-between items-start">
          <div className="w-1/2 space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Notes (Optional)</label>
            <textarea
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
              placeholder="Any extra info for the client..."
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
            />
          </div>
          <div className="w-1/3 space-y-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{invoiceData.subtotal}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t border-border pt-4">
              <span>Total</span>
              <span className="text-primary">₹{invoiceData.total_amount}</span>
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Generate & Save Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
