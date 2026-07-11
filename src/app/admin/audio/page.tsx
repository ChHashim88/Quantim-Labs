import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AudioManagerClient } from "./AudioManagerClient";

export default async function AudioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch audios with try-catch for schema cache issues
  let audios = [];
  try {
    const { data, error } = await supabase
      .from("audios")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      audios = data;
    }
  } catch (err) {
    console.warn("Supabase schema cache warming up for audios...", err);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AudioManagerClient audios={audios} />
    </div>
  );
}
