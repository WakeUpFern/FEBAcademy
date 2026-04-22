import { CourseForm } from "@/components/admin/CourseForm";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, LayoutList } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Course } from "@/types/database";

export const metadata = {
  title: "Editar Curso | FEBAcademy Admin",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !course) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cursos" className="flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Cursos
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Editar Curso</h1>
        <p className="text-muted-foreground mt-1">
          Modifica la información básica del curso.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <CourseForm initialData={course as unknown as Course} />
      </div>
    </div>
  );
}
