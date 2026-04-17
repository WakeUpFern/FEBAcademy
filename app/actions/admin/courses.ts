"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCourse(data: any) {
  const supabase = await createClient();
  
  // Get user to verify admin/instructor role and set instructor_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    return { success: false, error: "No autorizado" };
  }

  const insertData = {
    ...data,
    instructor_id: user.id, // Assign the creator as the instructor initially
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: course, error } = await (supabase.from("courses") as any)
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating course:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cursos");
  return { success: true, course };
}

export async function updateCourse(id: string, data: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("courses") as any)
    .update(data)
    .eq("id", id);

  if (error) {
    console.error("Error updating course:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cursos");
  revalidatePath(`/admin/cursos/${id}`);
  return { success: true };
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("courses") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting course:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cursos");
  return { success: true };
}

// Module actions
export async function createSection(courseId: string, title: string) {
  const supabase = await createClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: section, error } = await (supabase.from("course_sections") as any)
    .insert({ course_id: courseId, title, sort_order: 999 })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath(`/admin/cursos/${courseId}/modulos`);
  return { success: true, section };
}

export async function createModule(courseId: string, sectionId: string | null, data: any) {
  const supabase = await createClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: module, error } = await (supabase.from("modules") as any)
    .insert({ ...data, course_id: courseId, section_id: sectionId, sort_order: 999 })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath(`/admin/cursos/${courseId}/modulos`);
  return { success: true, module };
}

export async function updateModule(id: string, courseId: string, data: any) {
  const supabase = await createClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("modules") as any)
    .update(data)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath(`/admin/cursos/${courseId}/modulos`);
  return { success: true };
}

export async function deleteModule(id: string, courseId: string) {
  const supabase = await createClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("modules") as any)
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  
  revalidatePath(`/admin/cursos/${courseId}/modulos`);
  return { success: true };
}

export async function updateSectionsOrder(courseId: string, sectionsOrder: { id: string; sort_order: number }[]) {
    const supabase = await createClient();
    
    // Simplistic batch update
    for (const item of sectionsOrder) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("course_sections") as any).update({ sort_order: item.sort_order }).eq("id", item.id);
    }
    
    revalidatePath(`/admin/cursos/${courseId}/modulos`);
    return { success: true };
}

export async function updateModulesOrder(courseId: string, modulesOrder: { id: string; section_id: string | null; sort_order: number }[]) {
    const supabase = await createClient();
    
    for (const item of modulesOrder) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("modules") as any).update({ sort_order: item.sort_order, section_id: item.section_id }).eq("id", item.id);
    }
    
    revalidatePath(`/admin/cursos/${courseId}/modulos`);
    return { success: true };
}
