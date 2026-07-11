import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InternshipManagerClient } from "./InternshipManagerClient";

export default async function InternshipsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch internships
  const { data: internships } = await supabase
    .from("internships")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <InternshipManagerClient internships={internships || []} />
    </div>
  );
}
