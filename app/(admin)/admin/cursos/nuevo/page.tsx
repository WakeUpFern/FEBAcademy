import { CourseForm } from "@/components/admin/CourseForm";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Nuevo Curso | FEBAcademy Admin",
};

export default function NewCoursePage() {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" render={<Link href="/admin/cursos" />} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Badge variant="secondary">
          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          Crear
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Nuevo Curso</h1>
        <p className="text-muted-foreground mt-1">
          Completa la información básica del curso para comenzar. Podrás agregar los módulos después.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <CourseForm />
      </div>
    </div>
  );
}
