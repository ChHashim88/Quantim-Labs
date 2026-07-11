import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VideoManagerClient } from "./VideoManagerClient";

export default async function VideosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <VideoManagerClient videos={videos || []} />
    </div>
  );
}
