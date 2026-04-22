import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function LearnCoursePage(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const { slug } = params;
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Get course by slug
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .single<any>();

  if (!course) {
    notFound();
  }

  // 2. Check if user is enrolled or is admin/instructor
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", course.id)
    .eq("user_id", user.id)
    .single<any>();

  // TODO: Let instructors/admins preview without enrollment
  if (!enrollment) {
    redirect(`/cursos/${slug}`);
  }

  // 3. Find the first module of the course
  // Get sections first, ordered by sort_order
  const { data: sections } = await supabase
    .from("course_sections")
    .select("id")
    .eq("course_id", course.id)
    .order("sort_order") as any;

  if (!sections || sections.length === 0) {
    // No content yet
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Curso sin contenido</h2>
          <p className="text-muted-foreground">El instructor aún no ha publicado clases.</p>
        </div>
      </div>
    );
  }

  // Get the first module in the first section
  const firstSectionId = sections[0].id;
  
  const { data: firstModule } = await supabase
    .from("modules")
    .select("id")
    .eq("section_id", firstSectionId)
    .eq("is_published", true)
    .order("sort_order")
    .limit(1)
    .single<any>();

  if (!firstModule) {
    // Try to find ANY published module in the course
    const { data: anyModule } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", course.id)
      .eq("is_published", true)
      .order("sort_order")
      .limit(1)
      .single<any>();
      
    if (anyModule) {
      redirect(`/aprender/${slug}/${anyModule.id}`);
    }

    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Clases no publicadas</h2>
          <p className="text-muted-foreground">Pronto habrá contenido disponible.</p>
        </div>
      </div>
    );
  }

  // Redirect to the first module
  redirect(`/aprender/${slug}/${firstModule.id}`);
}
