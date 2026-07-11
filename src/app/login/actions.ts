"use server";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Retrieve user role from profiles without modifying it
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile) {
      const role = profile.role?.toUpperCase().replace(' ', '_');
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        return { success: true, redirect: "/admin" };
      }
    }
    return { success: true, redirect: "/student" };
  }

  return { success: true, redirect: "/" };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  // New profiles default to STUDENT and redirect to the student dashboard.
  return { success: true, redirect: "/student" };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}
