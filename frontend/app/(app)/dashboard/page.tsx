import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { generateInsights, type InsightData } from "../../../lib/ai";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch real data from Supabase
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, clients(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Calculate stats
  const totalInvoices = invoices?.length || 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  const paidInvoices = invoices?.filter((inv: any) => inv.status === 'paid') || [];
  const rejectedInvoices = invoices?.filter((inv: any) => inv.status === 'rejected') || [];
  
  // An invoice is overdue if status is 'overdue' OR (status is 'pending' AND due_date < today)
  const overdueInvoices = invoices?.filter((inv: any) => {
    if (inv.status === 'paid' || inv.status === 'rejected') return false;
    if (inv.status === 'overdue') return true;
    const dueDate = new Date(inv.due_date);
    return dueDate < now;
  }) || [];

  // An invoice is pending ONLY if status is 'pending' AND due_date >= today
  const pendingInvoices = invoices?.filter((inv: any) => {
    if (inv.status !== 'pending') return false;
    const dueDate = new Date(inv.due_date);
    return dueDate >= now;
  }) || [];

  const pendingAmount = pendingInvoices.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);
  const overdueAmount = overdueInvoices.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);
  const totalOutstanding = pendingAmount + overdueAmount;
  
  const totalPaidMonth = paidInvoices.reduce((acc: number, inv: any) => {
    const invDate = new Date(inv.issued_date);
    const today = new Date();
    if (invDate.getMonth() === today.getMonth() && invDate.getFullYear() === today.getFullYear()) {
      return acc + Number(inv.amount);
    }
    return acc;
  }, 0);

  const recentInvoices = invoices?.slice(0, 5) || [];

  // Generate Smart Insights
  const insights = generateInsights({
    totalInvoices,
    totalOutstanding,
    totalPaidMonth,
    overdueCount: overdueInvoices.length,
    rejectedCount: rejectedInvoices.length,
    pendingCount: pendingInvoices.length,
    paidCount: paidInvoices.length,
    pendingAmount,
    overdueAmount,
    recentInvoices: recentInvoices.map(inv => ({
      client: inv.clients?.name,
      amount: inv.amount,
      status: inv.status,
      date: inv.issued_date
    }))
  });

  const typeColors: Record<string, string> = {
    urgent: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };

  const typeBadgeLabels: Record<string, string> = {
    urgent: "Action Required",
    warning: "Heads Up",
    info: "Info",
    success: "Good News",
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {businesses?.name || user.email}!
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/invoices/new"
            className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-medium text-sm flex items-center gap-2"
          >
            Create Invoice
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          label="Total Invoices" 
          value={totalInvoices.toString()} 
          icon={TrendingUp} 
          color="text-indigo-500" 
        />
        <StatCard 
          label="Outstanding" 
          value={`₹${totalOutstanding.toLocaleString()}`} 
          icon={Clock} 
          color="text-amber-500" 
        />
        <StatCard 
          label="Paid (This Month)" 
          value={`₹${totalPaidMonth.toLocaleString()}`} 
          icon={CheckCircle2} 
          color="text-emerald-500" 
        />
        <StatCard 
          label="Overdue" 
          value={overdueInvoices.length.toString()} 
          icon={AlertCircle} 
          color="text-rose-500" 
        />
        <StatCard 
          label="Rejected" 
          value={rejectedInvoices.length.toString()} 
          icon={AlertCircle} 
          color="text-slate-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-card border border-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Invoices</h3>
            <Link href="/invoices" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-4">
            {recentInvoices.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No invoices yet.</p>
            ) : (
              recentInvoices.map((inv: any) => (
                <Link 
                  key={inv.id} 
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors group cursor-pointer border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                      {inv.clients?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{inv.clients?.name || 'Unknown Client'}</p>
                      <p className="text-xs text-muted-foreground">{inv.invoice_number}</p>
                    </div>
                  </div>
                  
                  {/* Items Display */}
                  <div className="hidden md:block flex-1 px-8">
                    {Array.isArray(inv.line_items) && inv.line_items[0] && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted/80 px-2 py-1 rounded-md truncate max-w-[150px]">
                          {inv.line_items[0].description}
                        </span>
                        {inv.line_items.length > 1 && (
                          <span className="text-[9px] font-bold text-primary/60">
                            +{inv.line_items.length - 1} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{Number(inv.amount).toLocaleString()}</p>
                    {(() => {
                      const isOverdue = inv.status === 'overdue' || (inv.status === 'pending' && new Date(inv.due_date) < now);
                      return (
                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
                          inv.status === 'paid' ? 'text-emerald-500' : 
                          isOverdue ? 'text-rose-500' : 'text-amber-500'
                        }`}>
                          {isOverdue ? 'overdue' : inv.status}
                        </p>
                      );
                    })()}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <Sparkles className="w-8 h-8 mb-3 relative z-10" />
            <h3 className="text-lg font-bold mb-4 relative z-10">AI Insights</h3>
            
            <div className="space-y-3 relative z-10 mb-6">
              {insights.map((insight, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{insight.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 border ${typeColors[insight.type]}`}>
                      {typeBadgeLabels[insight.type]}
                    </span>
                    <p className="text-sm text-indigo-50 leading-relaxed">{insight.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link 
              href="/invoices"
              className="inline-block w-full text-center py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors relative z-10"
            >
              Review Financials
            </Link>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-8 -top-8 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-muted/50`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{label}</p>
        <h4 className="text-2xl font-black mt-1">{value}</h4>
      </div>
    </div>
  );
}
