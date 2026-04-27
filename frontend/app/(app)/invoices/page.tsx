import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Download, 
  MoreVertical,
  FileText,
  Filter
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import InvoiceTable from "../../../components/InvoiceTable";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch invoices with client names
  let query = supabase
    .from('invoices')
    .select('*, clients(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (status && status !== 'All') {
    query = query.eq('status', status.toLowerCase());
  }

  const { data: invoices } = await query;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage and track all your outgoing bills in one place.</p>
        </div>
        <Link 
          href="/invoices/new"
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
        >
          <Plus className="w-5 h-5" />
          New Invoice
        </Link>
      </header>

      {/* Filters & Search - This will be handled in a client component or via URL params */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border w-full md:w-auto overflow-x-auto">
          {['All', 'Paid', 'Pending', 'Overdue', 'Rejected'].map((f) => (
            <Link
              key={f}
              href={`/invoices${f === 'All' ? '' : `?status=${f}`}`}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                (status || 'All') === f 
                  ? "bg-card text-primary shadow-sm border border-border" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </Link>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Search clients..." 
            className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {invoices?.length === 0 ? (
        <div className="bg-card border border-border rounded-[2rem] p-24 text-center">
          <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No invoices found</h3>
          <p className="text-muted-foreground mb-10 max-w-sm mx-auto">
            {status 
              ? `You don't have any ${status.toLowerCase()} invoices yet.` 
              : "Start by creating your first invoice to get paid faster."}
          </p>
          <Link 
            href="/invoices/new"
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            Create your first invoice <Plus className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <InvoiceTable invoices={invoices || []} />
      )}
    </div>
  );
}
