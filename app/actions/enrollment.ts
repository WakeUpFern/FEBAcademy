"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface EnrollResult {
  success: boolean;
  error?: string;
}

export async function enrollInCourse(courseId: string): Promise<EnrollResult> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión para inscribirte." };
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single<{ id: string }>();

  if (existing) {
    return { success: false, error: "Ya estás inscrito en este curso." };
  }

  // Check course exists and is published
  const { data: course } = await supabase
    .from("courses")
    .select("id, max_students, is_free, status")
    .eq("id", courseId)
    .single<{
      id: string;
      max_students: number | null;
      is_free: boolean;
      status: string;
    }>();

  if (!course) {
    return { success: false, error: "Curso no encontrado." };
  }

  if (course.status !== "published") {
    return { success: false, error: "Este curso no está disponible." };
  }

  // Check max_students limit
  if (course.max_students) {
    const { count } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("status", "active");

    if (count !== null && count >= course.max_students) {
      return {
        success: false,
        error: "Este curso ha alcanzado el máximo de estudiantes.",
      };
    }
  }

  // For now, only free enrollment. Stripe integration in the future.
  if (!course.is_free) {
    return {
      success: false,
      error: "Este curso requiere pago. Próximamente disponible.",
    };
  }

  // Create enrollment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("enrollments") as any).insert({
    user_id: user.id,
    course_id: courseId,
  });

  if (error) {
    console.error("Enrollment error:", error);
    return { success: false, error: "Error al inscribirte. Intenta de nuevo." };
  }

  revalidatePath(`/cursos`);
  revalidatePath(`/dashboard`);

  return { success: true };
}
