import { createClient } from "@/lib/supabase/server";
import { OfferLetterClient } from "./OfferLetterClient";
import { redirect } from "next/navigation";

export default async function OfferLetterPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  const studentName = profile ? `${profile.first_name} ${profile.last_name}` : "Student";
  
  let programName = "Technology Internship";
  
  // Await searchParams in Next.js 15+
  const params = await searchParams;
  const programId = params?.programId as string | undefined;
  
  if (programId) {
    const { data: program } = await supabase
      .from('internships')
      .select('title')
      .eq('id', programId)
      .single();
      
    if (program) {
      programName = program.title;
    }
  }

  // Get current date for the letter
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <OfferLetterClient 
      studentName={studentName} 
      programName={programName} 
      fallbackDate={date}
      programId={programId}
    />
  );
}
