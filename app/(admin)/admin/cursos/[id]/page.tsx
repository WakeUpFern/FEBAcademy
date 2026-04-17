import { CourseForm } from "@/components/admin/CourseForm";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, LayoutList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
          <Button variant="ghost" size="icon" render={<Link href="/admin/cursos" />} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Badge variant="secondary">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Editar
          </Badge>
        </div>
        
        <Button variant="outline" render={<Link href={`/admin/cursos/${id}/modulos`} />}>
          <LayoutList className="h-4 w-4 mr-2" />
          Gestionar Currículum
        </Button>
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
