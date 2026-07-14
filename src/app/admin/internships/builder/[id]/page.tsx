import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UnifiedBuilderClient } from "./UnifiedBuilderClient";

export default async function InternshipBuilderPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ setup_weeks?: string }>;
}) {
  const { id } = await params;
  const { setup_weeks } = await searchParams;
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
  const { data: existingDays } = await supabase
    .from("days")
    .select("id")
    .eq("internship_id", id);

  // Auto-generate weeks if setup_weeks is provided and no days exist yet
  const numWeeks = parseInt(setup_weeks || "0");
  if (numWeeks > 0 && (!existingDays || existingDays.length === 0)) {
    const weeksToInsert = Array.from({ length: numWeeks }, (_, i) => ({
      internship_id: id,
      title: `Week ${i + 1}`,
      order_index: i + 1,
    }));
    await supabase.from("days").insert(weeksToInsert);
  }

  // Fetch days (after potential auto-generation)
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
