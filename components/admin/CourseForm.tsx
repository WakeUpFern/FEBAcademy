"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { createCourse, updateCourse } from "@/app/actions/admin/courses";
import type { Course } from "@/types/database";

const courseSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  slug: z.string().min(3, "El slug debe tener al menos 3 caracteres"),
  type: z.enum(["recorded", "live"]),
  status: z.enum(["draft", "published", "archived"]),
  short_description: z.string().optional(),
  description: z.string().optional(),
  thumbnail_url: z.string().url("URL inválida").optional().or(z.literal("")),
  trailer_youtube_id: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced", "all"]).optional(),
  language: z.string().default("es"),
  is_free: z.boolean().default(false),
  price: z.coerce.number().min(0).optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialData?: Course;
}

export function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          type: initialData.type,
          status: initialData.status,
          short_description: initialData.short_description || "",
          description: initialData.description || "",
          thumbnail_url: initialData.thumbnail_url || "",
          trailer_youtube_id: initialData.trailer_youtube_id || "",
          level: initialData.level || "all",
          language: initialData.language || "es",
          is_free: initialData.is_free,
          price: initialData.price || 0,
        }
      : {
          title: "",
          slug: "",
          type: "recorded",
          status: "draft",
          short_description: "",
          description: "",
          thumbnail_url: "",
          trailer_youtube_id: "",
          language: "es",
          level: "all",
          is_free: false,
          price: 0,
        },
  });

  const generateSlug = () => {
    const title = watch("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug);
    }
  };

  const isFree = watch("is_free");

  const onSubmit = (data: any) => {
    setError(null);
    startTransition(async () => {
      if (isEditing) {
        const res = await updateCourse(initialData.id, data);
        if (res.success) {
          router.push("/admin/cursos");
        } else {
          setError(res.error || "Error al actualizar");
        }
      } else {
        const res = await createCourse(data);
        if (res.success) {
          router.push(`/admin/cursos/${res.course.id}/modulos`); // Redirige a agregar módulos
        } else {
          setError(res.error || "Error al crear");
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

      <div className="space-y-8 max-w-3xl">
        {/* Información Básica */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2">Información Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Curso</Label>
              <Input id="title" {...register("title")} placeholder="Ej. Curso de Next.js" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">URL Slug</Label>
                <Button type="button" variant="link" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary" onClick={generateSlug}>
                  Generar desde título
                </Button>
              </div>
              <Input id="slug" {...register("slug")} placeholder="curso-de-nextjs" />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Descripción Corta</Label>
            <Input id="short_description" {...register("short_description")} placeholder="Un resumen breve para las tarjetas de cursos" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Completa</Label>
            <Textarea id="description" {...register("description")} placeholder="Describe lo que aprenderán los estudiantes..." className="h-32" />
          </div>
        </div>

        {/* Configuración */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2">Configuración</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Curso</Label>
              <Select onValueChange={(value) => setValue("type", value as any)} defaultValue={watch("type")}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recorded">Grabado (VOD)</SelectItem>
                  <SelectItem value="live">En Vivo (Streaming)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nivel</Label>
              <Select onValueChange={(value) => setValue("level", value as any)} defaultValue={watch("level") || "all"}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Selecciona el nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select onValueChange={(value) => setValue("status", value as any)} defaultValue={watch("status")}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Medios y Precio */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium border-b pb-2">Medios y Precio</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Miniatura del Curso</Label>
              <ImageUpload 
                value={watch("thumbnail_url") || ""} 
                onChange={(url) => setValue("thumbnail_url", url, { shouldValidate: true })} 
                onRemove={() => setValue("thumbnail_url", "", { shouldValidate: true })}
              />
              {errors.thumbnail_url && <p className="text-xs text-destructive">{errors.thumbnail_url?.message as string}</p>}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="trailer_youtube_id">ID del Trailer en YouTube</Label>
                <Input id="trailer_youtube_id" {...register("trailer_youtube_id")} placeholder="dQw4w9WgXcQ" />
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_free" {...register("is_free")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <Label htmlFor="is_free" className="font-medium">El curso es gratuito</Label>
                </div>

                {!isFree && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="price">Precio (USD)</Label>
                    <Input id="price" type="number" step="0.01" {...register("price")} className="max-w-[200px]" />
                    {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t pt-6">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Guardar Cambios" : "Crear y Continuar"}
        </Button>
      </div>
    </form>
  );
}
