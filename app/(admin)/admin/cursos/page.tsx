import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Plus, Edit, ListTree, MoreVertical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { Course, Category } from "@/types/database";

export const metadata = {
  title: "Gestión de Cursos | FEBAcademy Admin",
};

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select(`
      *,
      category:categories(name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
  }

  const courseList = (courses as unknown as (Course & { category: Pick<Category, "name"> | null })[]) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Cursos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el catálogo de cursos de la plataforma.
          </p>
        </div>
        <Button render={<Link href="/admin/cursos/nuevo" />}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Curso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No hay cursos registrados. Crea tu primer curso.
                </TableCell>
              </TableRow>
            ) : (
              courseList.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 relative rounded overflow-hidden bg-muted flex-shrink-0">
                        {course.thumbnail_url ? (
                          <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[200px]" title={course.title}>
                          {course.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {course.category?.name || "Sin categoría"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.status === "published" ? "default" : course.status === "draft" ? "secondary" : "destructive"}>
                      {course.status === "published" ? "Publicado" : course.status === "draft" ? "Borrador" : "Archivado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{course.type === "recorded" ? "Grabado" : "En Vivo"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {course.is_free ? "Gratis" : `$${course.price} ${course.currency}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(course.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" render={<Link href={`/admin/cursos/${course.id}/modulos`} />} title="Gestionar currículum">
                        <ListTree className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" render={<Link href={`/admin/cursos/${course.id}`} />} title="Editar configuración">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
