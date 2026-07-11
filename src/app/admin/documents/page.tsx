import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumentManagerClient } from "./DocumentManagerClient";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch documents with try-catch for schema cache issues
  let documents = [];
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (!error && data) {
      documents = data;
    }
  } catch (err) {
    console.warn("Supabase schema cache warming up for documents...", err);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DocumentManagerClient documents={documents} />
    </div>
  );
}
