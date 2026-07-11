import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseManagerClient } from "./CourseManagerClient";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch courses with their parent internship
  const { data: courses } = await supabase
    .from("courses")
    .select("*, internships(title)")
    .order("created_at", { ascending: false });

  // Fetch all internships for the dropdown assignment
  const { data: internships } = await supabase
    .from("internships")
    .select("id, title")
    .order("title", { ascending: true });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CourseManagerClient courses={courses || []} internships={internships || []} />
    </div>
  );
}
