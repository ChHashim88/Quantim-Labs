import { createClient } from './src/lib/supabase/client';

async function check() {
  const supabase = createClient();
  const { data, error } = await supabase.from('student_enrollments').select('enrolled_at').limit(1);
  console.log("enrolled_at error:", error);
}

check();
