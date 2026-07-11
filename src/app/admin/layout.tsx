import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from('profiles').select('role, first_name, last_name').eq('id', user.id).single();

  const role = profile?.role?.toUpperCase().replace(' ', '_');

  // Merge the email from the auth user metadata
  const profileWithEmail = profile ? { ...profile, email: user.email } : null;

  // Removed strict role redirect for development purposes so you can always access it
  // if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
  //  redirect("/student");
  // }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <AdminSidebar profile={profileWithEmail} />
      <main className="flex-1 overflow-y-auto bg-muted/30 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
