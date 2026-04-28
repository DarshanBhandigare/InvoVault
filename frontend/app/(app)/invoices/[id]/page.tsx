import { redirect } from "next/navigation";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building,
  User,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import StatusChangeButton from "../../../../components/StatusChangeButton";
import DownloadPdfButton from "../../../../components/DownloadPdfButton";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch invoice details with joins
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(*)')
    .eq('id', id)
    .single();

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">Invoice not found</h2>
        <p className="text-muted-foreground mt-2 mb-8">The invoice you're looking for doesn't exist or you don't have access.</p>
        <Link href="/invoices" className="text-primary font-bold hover:underline">Back to Invoices</Link>
      </div>
    );
  }

  // Fetch business profile for "From" section
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const statusStyles = {
    paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    overdue: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{invoice.invoice_number}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusStyles[invoice.status as keyof typeof statusStyles]}`}>
                {invoice.status}
              </span>
              <span className="text-xs text-muted-foreground">Issued on {format(new Date(invoice.issued_date), 'dd MMM, yyyy')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusChangeButton invoiceId={invoice.id} currentStatus={invoice.status} />
          <DownloadPdfButton 
            invoice={invoice} 
            business={business} 
            filename={`Invoice-${invoice.invoice_number}.pdf`} 
          />
        </div>
      </header>

      <div id="invoice-document" className="bg-white text-slate-900 border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
        {/* Invoice Header Section */}
        <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-10">
          <div className="space-y-6 max-w-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">From</p>
              <h3 className="text-xl font-black text-indigo-600 mb-2">{business?.name || 'Your Business Name'}</h3>
              <div className="text-sm text-slate-600 space-y-1">
                {business?.address && <p>{business.address}</p>}
                {business?.email && <p>{business.email}</p>}
                {business?.phone && <p>{business.phone}</p>}
                {business?.gstin && <p className="font-bold text-slate-900 mt-2">GSTIN: {business.gstin}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6 max-w-sm md:text-right">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">To</p>
              <h3 className="text-xl font-black mb-2">{invoice.clients?.name}</h3>
              <div className="text-sm text-slate-600 space-y-1">
                {invoice.clients?.address && <p>{invoice.clients.address}</p>}
                {invoice.clients?.email && <p>{invoice.clients.email}</p>}
                {invoice.clients?.gstin && <p className="font-bold text-slate-900 mt-2">GSTIN: {invoice.clients.gstin}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
          <div className="p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Invoice #</p>
            <p className="font-bold text-sm text-slate-900">{invoice.invoice_number}</p>
          </div>
          <div className="p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Issued Date</p>
            <p className="font-bold text-sm text-slate-900">{format(new Date(invoice.issued_date), 'dd MMM, yyyy')}</p>
          </div>
          <div className="p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Due Date</p>
            <p className="font-bold text-sm text-rose-600">{format(new Date(invoice.due_date), 'dd MMM, yyyy')}</p>
          </div>
          <div className="p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Amount Due</p>
            <p className="font-black text-sm text-slate-900">₹{Number(invoice.amount).toLocaleString()}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-12">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Description</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Qty</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Price</th>
                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.isArray(invoice.line_items) && invoice.line_items.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="py-6 font-bold text-sm text-slate-900">{item.description}</td>
                  <td className="py-6 text-sm text-slate-600 text-center">{item.quantity}</td>
                  <td className="py-6 text-sm text-slate-600 text-right">₹{Number(item.price).toLocaleString()}</td>
                  <td className="py-6 font-black text-sm text-slate-900 text-right">₹{(item.quantity * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="mt-12 flex justify-end">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Subtotal</span>
                <span className="font-bold text-slate-900">₹{Number(invoice.subtotal || invoice.amount).toLocaleString()}</span>
              </div>
              {(invoice.tax_percent > 0) && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Tax / GST ({invoice.tax_percent}%)</span>
                  <span className="font-bold text-amber-600">+ ₹{Number(invoice.tax_amount || 0).toLocaleString()}</span>
                </div>
              )}
              {(!invoice.tax_percent || invoice.tax_percent === 0) && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Tax (0%)</span>
                  <span className="font-bold text-slate-900">₹0</span>
                </div>
              )}
              <div className="pt-4 border-t-2 border-indigo-600 flex justify-between">
                <span className="text-lg font-black text-slate-900 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-indigo-600">₹{Number(invoice.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {invoice.notes && (
            <div className="mt-16 pt-8 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Notes & Instructions</p>
              <p className="text-sm text-slate-600 leading-relaxed italic">{invoice.notes}</p>
            </div>
          )}

          {/* Bank Info */}
          {business?.bank_name && (
            <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Payment Instructions</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Bank:</span> <span className="font-bold text-slate-900">{business.bank_name}</span>
                </div>
                <div>
                  <span className="text-slate-500">A/C:</span> <span className="font-bold text-slate-900">{business.account_number}</span>
                </div>
                <div>
                  <span className="text-slate-500">IFSC:</span> <span className="font-bold text-slate-900">{business.ifsc}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
