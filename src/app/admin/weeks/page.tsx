import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WeekManagerClient } from "./WeekManagerClient";

export default async function WeeksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch weeks with their parent module
  const { data: weeks } = await supabase
    .from("weeks")
    .select("*, modules(title, courses(title))")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  // Fetch all modules for the dropdown assignment
  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, courses(title)")
    .order("title", { ascending: true });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <WeekManagerClient weeks={weeks || []} modules={modules || []} />
    </div>
  );
}
