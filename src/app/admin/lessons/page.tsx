import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonManagerClient } from "./LessonManagerClient";

export default async function LessonsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch lessons with their parent day (and week)
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, days(title, weeks(title))")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  // Fetch all days for the dropdown assignment
  const { data: days } = await supabase
    .from("days")
    .select("id, title, weeks(title)")
    .order("title", { ascending: true });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <LessonManagerClient lessons={lessons || []} days={days || []} />
    </div>
  );
}
