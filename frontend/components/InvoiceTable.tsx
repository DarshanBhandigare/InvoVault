"use client";

import { format } from "date-fns";
import { 
  ExternalLink, 
  Download, 
  Trash2, 
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface InvoiceTableProps {
  invoices: any[];
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  const supabase = createClient();
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setProcessingId(id);
    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      router.refresh();
    }
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    
    setProcessingId(id);
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      router.refresh();
    }
    setProcessingId(null);
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': 
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'overdue': 
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'rejected':
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: 
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-6">Invoice #</th>
              <th className="px-8 py-6">Client</th>
              <th className="px-8 py-6">Amount</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6">Due Date</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {invoices.map((inv) => (
              <tr 
                key={inv.id} 
                className={cn(
                  "hover:bg-muted/20 transition-colors group",
                  processingId === inv.id && "opacity-50 pointer-events-none"
                )}
              >
                <td className="px-8 py-6">
                  <span className="font-mono font-bold text-sm text-foreground">{inv.invoice_number}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                      {inv.clients?.name?.[0] || 'C'}
                    </div>
                    <span className="font-bold text-sm">{inv.clients?.name || 'Deleted Client'}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-black text-sm text-foreground">₹{Number(inv.amount).toLocaleString()}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                    getStatusStyles(inv.status)
                  )}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-medium text-muted-foreground">
                    {inv.due_date ? format(new Date(inv.due_date), 'dd MMM, yyyy') : '-'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {inv.status !== 'paid' && inv.status !== 'rejected' && (
                      <button 
                        onClick={() => handleStatusUpdate(inv.id, 'paid')}
                        title="Mark as Paid"
                        className="p-2.5 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 rounded-xl transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {inv.status !== 'rejected' && (
                      <button 
                        onClick={() => handleStatusUpdate(inv.id, 'rejected')}
                        title="Reject Invoice"
                        className="p-2.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-xl transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <Link 
                      href={`/invoices/${inv.id}`}
                      className="p-2.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(inv.id)}
                      className="p-2.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
