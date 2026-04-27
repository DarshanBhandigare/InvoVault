import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { cookies } from "next/headers";
import { Settings as SettingsIcon, Building, CreditCard, Save } from "lucide-react";
import BusinessProfileForm from "../../../components/BusinessProfileForm";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch business profile
  const { data: profile } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your business profile and payment details.</p>
      </header>

      {!profile && (
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 text-sm font-medium flex items-center gap-3">
          <Building className="w-5 h-5" />
          Please set up your business profile to start generating professional invoices.
        </div>
      )}

      <BusinessProfileForm initialData={profile} userId={user.id} />
    </div>
  );
}
