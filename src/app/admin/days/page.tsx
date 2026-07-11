import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DayManagerClient } from "./DayManagerClient";

export default async function DaysPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch days with their parent week (and module)
  const { data: days } = await supabase
    .from("days")
    .select("*, weeks(title, modules(title))")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  // Fetch all weeks for the dropdown assignment
  const { data: weeks } = await supabase
    .from("weeks")
    .select("id, title, modules(title)")
    .order("title", { ascending: true });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DayManagerClient days={days || []} weeks={weeks || []} />
    </div>
  );
}
