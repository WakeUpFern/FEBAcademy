import { CourseForm } from "@/components/admin/CourseForm";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Nuevo Curso | FEBAcademy Admin",
};

export default function NewCoursePage() {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/cursos" className="flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
          Cursos
        </Link>
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
