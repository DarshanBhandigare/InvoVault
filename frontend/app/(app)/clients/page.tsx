import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { Plus, Users, Mail, Phone, MapPin } from "lucide-react";
import ClientForm from "../../../components/ClientForm";
import ClientCardMenu from "../../../components/ClientCardMenu";
import Link from "next/link";

export default async function ClientsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch clients with invoice stats
  const { data: clients } = await supabase
    .from('clients')
    .select('*, invoices(amount, status)')
    .eq('user_id', user.id)
    .order('name');

  const clientStats = clients?.map((client: any) => {
    const invoices = client.invoices || [];
    const totalBilled = invoices.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);
    const totalOutstanding = invoices
      .filter((inv: any) => inv.status !== 'paid')
      .reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);
    
    return {
      ...client,
      invoiceCount: invoices.length,
      totalBilled,
      totalOutstanding
    };
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">Manage your customer database and track their billing history.</p>
        </div>
        <ClientForm />
      </header>

      {clientStats?.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-20 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No clients yet</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Add your first client to start creating invoices and tracking payments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientStats?.map((client: any) => (
            <div key={client.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-lg">
                  {client.name[0]}
                </div>
                <ClientCardMenu client={client} />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{client.name}</h3>
                <div className="space-y-2 mt-3">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Billed</p>
                  <p className="text-sm font-bold">₹{client.totalBilled.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Outstanding</p>
                  <p className="text-sm font-bold text-rose-500">₹{client.totalOutstanding.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">{client.invoiceCount} Invoices</span>
                <Link href={`/invoices?client=${client.id}`} className="text-primary font-bold hover:underline">
                  View History
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
