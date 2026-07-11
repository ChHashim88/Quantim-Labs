import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MediaManagerClient } from "./MediaManagerClient";

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all media types in parallel safely (handling schema cache errors)
  const results = await Promise.allSettled([
    supabase.from("videos").select("*").order("created_at", { ascending: false }),
    supabase.from("audios").select("*").order("created_at", { ascending: false }),
    supabase.from("documents").select("*").order("created_at", { ascending: false })
  ]);

  const videosData = results[0].status === 'fulfilled' ? results[0].value.data || [] : [];
  const audiosData = results[1].status === 'fulfilled' ? results[1].value.data || [] : [];
  const docsData = results[2].status === 'fulfilled' ? results[2].value.data || [] : [];

  // Aggregate and normalize the data
  const media = [
    ...videosData.map((v: any) => ({ ...v, globalType: 'VIDEO', url: v.video_url })),
    ...audiosData.map((a: any) => ({ ...a, globalType: 'AUDIO', url: a.audio_url })),
    ...docsData.map((d: any) => ({ ...d, globalType: 'DOCUMENT', url: d.document_url }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <MediaManagerClient media={media} />
    </div>
  );
}
