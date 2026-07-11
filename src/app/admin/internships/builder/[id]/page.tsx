import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnifiedBuilderClient } from "./UnifiedBuilderClient";

export default async function InternshipBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the internship
  const { data: internship, error } = await supabase
    .from("internships")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !internship) {
    redirect("/admin/internships");
  }

  // Fetch the days associated with this internship
  // NOTE: This requires the SQL migration to add internship_id to days
  const { data: days } = await supabase
    .from("days")
    .select("*, lessons(*)")
    .eq("internship_id", id)
    .order("order_index", { ascending: true });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <UnifiedBuilderClient internship={internship} initialDays={days || []} />
    </div>
  );
}
