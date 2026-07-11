import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAttendance(programId?: string | null) {
  useEffect(() => {
    async function logAttendance() {
      if (!programId || typeof window === "undefined") return;
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Use local timezone date in ISO format YYYY-MM-DD
        const dateObj = new Date();
        const today = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        
        await supabase.from('student_attendance').insert({
          student_id: user.id,
          internship_id: programId,
          date: today
        });
        
        // Supabase will automatically ignore duplicates if we have the unique constraint in place.
        // If there's an error (e.g. 23505 unique_violation), we simply ignore it since they already checked in today!
      } catch (e) {
        // Silently ignore to prevent interrupting user flow
      }
    }
    
    // Slight delay to ensure it doesn't block critical render path
    const timer = setTimeout(logAttendance, 2000);
    return () => clearTimeout(timer);
  }, [programId]);
}
