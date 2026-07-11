import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditInternshipClient } from "./EditInternshipClient";

export default async function EditInternshipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: internship, error } = await supabase
    .from("internships")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !internship) {
    redirect("/admin/internships");
  }

  return (
    <EditInternshipClient internship={internship} />
  );
}
