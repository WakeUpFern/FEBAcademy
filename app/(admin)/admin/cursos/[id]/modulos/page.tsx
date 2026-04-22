import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ModuleManager } from "@/components/admin/ModuleManager";
import type { Course, CourseSection, Module } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Settings } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Gestionar Módulos | FEBAcademy Admin",
};

export default async function ManageModulesPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", id)
    .single<{ id: string; title: string }>();

  if (courseError || !course) {
    notFound();
  }

  // Fetch sections
  const { data: sections } = await supabase
    .from("course_sections")
    .select("*")
    .eq("course_id", id)
    .order("sort_order", { ascending: true });

  // Fetch modules
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cursos" className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Badge variant="secondary">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Contenido
          </Badge>
        </div>
        <Link href={`/admin/cursos/${id}`} className={buttonVariants({ variant: "outline" })}>
          <Settings className="h-4 w-4 mr-2" />
          Configuración Básica
        </Link>
      </div>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Contenido: {course.title}</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona las secciones y clases del curso. Arrastra y suelta para reordenar.
        </p>
      </div>

      <div className="mt-8">
        <ModuleManager
          courseId={course.id}
          initialSections={(sections as unknown as CourseSection[]) || []}
          initialModules={(modules as unknown as Module[]) || []}
        />
      </div>
    </div>
  );
}
