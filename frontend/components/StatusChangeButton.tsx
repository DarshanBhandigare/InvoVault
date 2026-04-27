"use client";

import { useState } from "react";
import { CheckCircle, Clock, Loader2, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function StatusChangeButton({ invoiceId, currentStatus }: { invoiceId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoiceId);

    if (error) {
      alert(error.message);
    } else {
      setPrevStatus(currentStatus);
      router.refresh();
    }
    setLoading(false);
  };

  const handleUndo = () => {
    if (prevStatus) {
      handleStatusChange(prevStatus);
      setPrevStatus(null);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-500' },
    { value: 'paid', label: 'Paid', icon: CheckCircle, color: 'text-emerald-500' },
    { value: 'overdue', label: 'Overdue', icon: Clock, color: 'text-rose-500' },
    { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-slate-500' },
  ];

  return (
    <div className="flex items-center gap-3">
      {prevStatus && (
        <button
          onClick={handleUndo}
          className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <RotateCcw className="w-3 h-3" /> Undo
        </button>
      )}
      <div className="relative inline-block">
        <select
          disabled={loading}
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`appearance-none pl-6 pr-10 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 outline-none border cursor-pointer disabled:opacity-50 ${
            currentStatus === 'paid' ? 'bg-emerald-500 text-white border-emerald-600' :
            currentStatus === 'overdue' ? 'bg-rose-500 text-white border-rose-600' :
            currentStatus === 'rejected' ? 'bg-slate-500 text-white border-slate-600' :
            'bg-amber-500 text-white border-amber-600'
          }`}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
    </div>
  );
}

import { RotateCcw, XCircle } from "lucide-react";

