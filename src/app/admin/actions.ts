"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- User Management ---

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/users');
  return { success: true };
}

// Note: Real deletion of auth.users requires Admin API or edge functions, 
// so we typically soft-delete or block via a custom field. Here we'll just delete the profile.
export async function deleteUserProfile(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/users');
  return { success: true };
}

// --- Course Builder ---

export async function createInternship(formData: FormData) {
  const supabase = await createClient();
  
  // Extract all potential fields
  const payload: any = {
    title: formData.get('title') as string,
    program_code: formData.get('program_code') as string,
    category: formData.get('category') as string,
    description: formData.get('short_description') as string || formData.get('full_description') as string,
    short_description: formData.get('short_description') as string,
    full_description: formData.get('full_description') as string,
    program_type: formData.get('program_type') as string || 'ONLINE',
    difficulty_level: formData.get('difficulty_level') as string,
    duration_weeks: formData.get('duration_weeks') ? parseInt(formData.get('duration_weeks') as string) : null,
    duration_unit: formData.get('duration_unit') as string || 'Days',
    start_date: formData.get('start_date') ? formData.get('start_date') as string : null,
    end_date: formData.get('end_date') ? formData.get('end_date') as string : null,
    max_students: formData.get('max_students') ? parseInt(formData.get('max_students') as string) : null,
    waitlist_enabled: formData.get('waitlist_enabled') === 'on',
    thumbnail_url: formData.get('thumbnail_url') as string,
    banner_url: formData.get('cover_banner_url') as string,
    promo_video_url: formData.get('promo_video_url') as string,
    theme_color: formData.get('theme_color') as string,
    minimum_watch_percentage: formData.get('minimum_watch_percentage') ? parseInt(formData.get('minimum_watch_percentage') as string) : 90,
    passing_percentage: formData.get('passing_percentage') ? parseInt(formData.get('passing_percentage') as string) : 70,
    certificate_enabled: formData.get('certificate_enabled') === 'on',
    strict_unlock_flow: formData.get('strict_unlock_flow') === 'on',
    meta_title: formData.get('meta_title') as string,
    meta_description: formData.get('meta_description') as string,
    status: 'PUBLISHED', // or DRAFT based on action
  };

  // Clean up empty fields
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
      delete payload[key];
    }
  });

  if (!payload.title) return { error: "Title is required" };

  const { error } = await supabase
    .from('internships')
    .insert([payload]);

  if (error) {
    console.error("DB Insert Error:", error);
    return { error: error.message };
  }
  
  revalidatePath('/admin/internships');
  return { success: true };
}

export async function updateInternship(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const payload: any = {
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    description: formData.get('short_description') as string || formData.get('full_description') as string,
    short_description: formData.get('short_description') as string,
    full_description: formData.get('full_description') as string,
    program_type: formData.get('program_type') as string || 'ONLINE',
    difficulty_level: formData.get('difficulty_level') as string,
    duration_weeks: formData.get('duration_weeks') ? parseInt(formData.get('duration_weeks') as string) : null,
    duration_unit: formData.get('duration_unit') as string || 'Days',
    start_date: formData.get('start_date') ? formData.get('start_date') as string : null,
    end_date: formData.get('end_date') ? formData.get('end_date') as string : null,
    max_students: formData.get('max_students') ? parseInt(formData.get('max_students') as string) : null,
    waitlist_enabled: formData.get('waitlist_enabled') === 'on',
    thumbnail_url: formData.get('thumbnail_url') as string,
    banner_url: formData.get('cover_banner_url') as string,
    promo_video_url: formData.get('promo_video_url') as string,
    theme_color: formData.get('theme_color') as string,
    minimum_watch_percentage: formData.get('minimum_watch_percentage') ? parseInt(formData.get('minimum_watch_percentage') as string) : 90,
    passing_percentage: formData.get('passing_percentage') ? parseInt(formData.get('passing_percentage') as string) : 70,
    certificate_enabled: formData.get('certificate_enabled') === 'on',
    strict_unlock_flow: formData.get('strict_unlock_flow') === 'on',
    meta_title: formData.get('meta_title') as string,
    meta_description: formData.get('meta_description') as string,
    status: 'PUBLISHED', 
  };

  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
      delete payload[key];
    }
  });

  if (!payload.title) return { error: "Title is required" };

  const { error } = await supabase
    .from('internships')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error("DB Update Error:", error);
    return { error: error.message };
  }

  
  revalidatePath('/admin/internships');
  return { success: true };
}

export async function deleteInternship(internshipId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('internships')
    .delete()
    .eq('id', internshipId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/internships');
  return { success: true };
}

// --- Courses Builder ---

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  
  const payload: any = {
    internship_id: formData.get('internship_id') as string,
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string,
    difficulty: formData.get('difficulty') as string || 'Beginner',
    category: formData.get('category') as string,
    language: formData.get('language') as string || 'English',
    thumbnail_url: formData.get('thumbnail_url') as string,
    banner_url: formData.get('banner_url') as string,
    duration_hours: formData.get('duration_hours') ? parseInt(formData.get('duration_hours') as string) : null,
    certificate_enabled: formData.get('certificate_enabled') === 'on',
    status: 'PUBLISHED'
  };

  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
      delete payload[key];
    }
  });

  if (!payload.title || !payload.internship_id) return { error: "Title and Parent Internship are required" };

  const { error } = await supabase
    .from('courses')
    .insert([payload]);

  if (error) {
    console.error("DB Insert Error:", error);
    if (error.message.includes("schema cache")) {
      console.warn("PostgREST cache error. Fallback to basic insert.");
      const { error: fbError } = await supabase.from('courses').insert([{ 
        title: payload.title, 
        description: payload.description,
        internship_id: payload.internship_id
      }]);
      if (fbError) return { error: fbError.message };
    } else {
      return { error: error.message };
    }
  }
  
  revalidatePath('/admin/courses');
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/courses');
  return { success: true };
}

// --- Modules Builder ---

export async function createModule(formData: FormData) {
  const supabase = await createClient();
  
  const payload = {
    course_id: formData.get('course_id') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    order_index: parseInt(formData.get('order_index') as string) || 1,
  };

  if (!payload.title || !payload.course_id) return { error: "Title and Parent Course are required" };

  const { error } = await supabase
    .from('modules')
    .insert([payload]);

  if (error) {
    console.error("DB Insert Error:", error);
    if (error.message.includes("schema cache") || error.message.includes("column")) {
      console.warn("PostgREST cache or missing column error. Fallback to basic insert.");
      const { error: fbError } = await supabase.from('modules').insert([{ 
        title: payload.title, 
        course_id: payload.course_id,
        order_index: payload.order_index
      }]);
      if (fbError) return { error: fbError.message };
    } else {
      return { error: error.message };
    }
  }
  
  revalidatePath('/admin/modules');
  return { success: true };
}

export async function deleteModule(moduleId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('modules')
    .delete()
    .eq('id', moduleId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/modules');
  return { success: true };
}

// --- Weeks Builder ---

export async function createWeek(formData: FormData) {
  const supabase = await createClient();
  
  const payload = {
    module_id: formData.get('module_id') as string,
    title: formData.get('title') as string,
    order_index: parseInt(formData.get('order_index') as string) || 1,
  };

  if (!payload.title || !payload.module_id) return { error: "Title and Parent Module are required" };

  const { error } = await supabase
    .from('weeks')
    .insert([payload]);

  if (error) {
    console.error("DB Insert Error:", error);
    return { error: error.message };
  }
  
  revalidatePath('/admin/weeks');
  return { success: true };
}

export async function deleteWeek(weekId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('weeks')
    .delete()
    .eq('id', weekId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/weeks');
  return { success: true };
}

// --- Days Builder ---

export async function createDay(formData: FormData) {
  const supabase = await createClient();
  
  const payload = {
    week_id: formData.get('week_id') as string,
    title: formData.get('title') as string,
    order_index: parseInt(formData.get('order_index') as string) || 1,
  };

  if (!payload.title || !payload.week_id) return { error: "Title and Parent Week are required" };

  const { error } = await supabase
    .from('days')
    .insert([payload]);

  if (error) {
    console.error("DB Insert Error:", error);
    return { error: error.message };
  }
  
  revalidatePath('/admin/days');
  return { success: true };
}

export async function deleteDay(dayId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('days')
    .delete()
    .eq('id', dayId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/days');
  return { success: true };
}

// --- Lessons Builder ---

export async function createLesson(formData: FormData) {
  const supabase = await createClient();
  
  const payload = {
    day_id: formData.get('day_id') as string,
    title: formData.get('title') as string,
    content_type: formData.get('content_type') as string || 'VIDEO',
    video_url: formData.get('video_url') as string,
    html_notes: formData.get('html_notes') as string,
    order_index: parseInt(formData.get('order_index') as string) || 1,
    is_locked_by_default: formData.get('is_locked_by_default') === 'on',
  };

  // Clean empty strings
  if (!payload.video_url) delete (payload as any).video_url;
  if (!payload.html_notes) delete (payload as any).html_notes;

  if (!payload.title || !payload.day_id) return { error: "Title and Parent Day are required" };

  const { error } = await supabase
    .from('lessons')
    .insert([payload]);

  if (error) {
    console.error("DB Insert Error:", error);
    return { error: error.message };
  }
  
  revalidatePath('/admin/lessons');
  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/lessons');
  return { success: true };
}

// --- Video Library ---

export async function createVideo(formData: FormData) {
  const supabase = await createClient();
  
  const payload = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    video_url: formData.get('video_url') as string,
    thumbnail_url: formData.get('thumbnail_url') as string,
    provider: formData.get('provider') as string || 'YOUTUBE',
    duration_seconds: formData.get('duration_seconds') ? parseInt(formData.get('duration_seconds') as string) : null,
  };

  if (!payload.title || !payload.video_url) return { error: "Title and Video URL are required" };

  const { error } = await supabase
    .from('videos')
    .insert([payload]);

  if (error) {
    console.error("DB Insert Error:", error);
    return { error: error.message };
  }
  
  revalidatePath('/admin/videos');
  return { success: true };
}

export async function deleteVideo(videoId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/videos');
  return { success: true };
}

// --- Audio Library ---

export async function createAudio(formData: FormData) {
  const supabase = await createClient();
  
  const payload = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    audio_url: formData.get('audio_url') as string,
    provider: formData.get('provider') as string || 'SUPABASE',
    duration_seconds: formData.get('duration_seconds') ? parseInt(formData.get('duration_seconds') as string) : null,
  };

  if (!payload.title || !payload.audio_url) return { error: "Title and Audio URL are required" };

  const { error } = await supabase
    .from('audios')
    .insert([payload]);

  if (error) {
    console.error("DB Insert Error:", error);
    if (error.message.includes("schema cache")) {
      return { error: "Schema Cache Error! Please go to Supabase Dashboard -> Project Settings -> API -> click 'Reload schema cache' at the bottom." };
    }
    return { error: error.message };
  }
  
  revalidatePath('/admin/audio');
  return { success: true };
}

export async function deleteAudio(audioId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('audios')
    .delete()
    .eq('id', audioId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/audio');
  return { success: true };
}

// --- Document Library ---

export async function createDocument(formData: FormData) {
  const supabase = await createClient();
  
  const payload = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    document_url: formData.get('document_url') as string,
    file_type: formData.get('file_type') as string || 'PDF',
  };

  if (!payload.title || !payload.document_url) return { error: "Title and Document URL are required" };

  const { error } = await supabase
    .from('documents')
    .insert([payload]);

  if (error) {
    console.error("DB Insert Error:", error);
    return { error: error.message };
  }
  
  revalidatePath('/admin/documents');
  return { success: true };
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath('/admin/documents');
  return { success: true };
}
