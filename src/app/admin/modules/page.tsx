import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ModuleManagerClient } from "./ModuleManagerClient";

export default async function ModulesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch modules with their parent course
  const { data: modules } = await supabase
    .from("modules")
    .select("*, courses(title, internships(title))")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  // Fetch all courses for the dropdown assignment
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, internships(title)")
    .order("title", { ascending: true });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ModuleManagerClient modules={modules || []} courses={courses || []} />
    </div>
  );
}
