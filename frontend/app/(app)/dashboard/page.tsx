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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import Link from "next/link";

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
  const paidInvoices = invoices?.filter((inv: any) => inv.status === 'paid') || [];
  const pendingInvoices = invoices?.filter((inv: any) => inv.status === 'pending') || [];
  const overdueInvoices = invoices?.filter((inv: any) => inv.status === 'overdue') || [];

  const totalOutstanding = pendingInvoices.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0) + 
                          overdueInvoices.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);
  
  const totalPaidMonth = paidInvoices.reduce((acc: number, inv: any) => {
    const invDate = new Date(inv.issued_date);
    const now = new Date();
    if (invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear()) {
      return acc + Number(inv.amount);
    }
    return acc;
  }, 0);

  const recentInvoices = invoices?.slice(0, 5) || [];

  // Chart data (Simplified for now, could be improved with real grouping)
  const chartData = [
    { name: 'Jan', amount: 0 },
    { name: 'Feb', amount: 0 },
    { name: 'Mar', amount: 0 },
    { name: 'Apr', amount: 0 },
    { name: 'May', amount: 0 },
    { name: 'Jun', amount: 0 },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          value={invoices?.filter((inv: any) => inv.status === 'rejected').length.toString() || "0"} 
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
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors group cursor-pointer border border-transparent hover:border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                      {inv.clients?.name?.[0] || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{inv.clients?.name || 'Unknown Client'}</p>
                      <p className="text-xs text-muted-foreground">{inv.invoice_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{Number(inv.amount).toLocaleString()}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
                      inv.status === 'paid' ? 'text-emerald-500' : 
                      inv.status === 'overdue' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                      {inv.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / Nudge */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <Sparkles className="w-8 h-8 mb-4 relative z-10" />
            <h3 className="text-lg font-bold mb-2 relative z-10">AI Insights</h3>
            <p className="text-indigo-100 text-sm mb-6 relative z-10">
              {overdueInvoices.length > 0 
                ? `You have ${overdueInvoices.length} overdue invoices. Send a reminder to improve cash flow.`
                : "Your cash flow looks healthy! Keep up the good work."}
            </p>
            <Link 
              href="/invoices"
              className="inline-block w-full text-center py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors relative z-10"
            >
              Take Action
            </Link>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
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
