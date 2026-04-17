import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import type { Course, Profile, Category } from "@/types/database";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Explora nuestro catálogo de cursos en línea sobre tecnología, diseño y más. Aprende a tu ritmo.",
  openGraph: {
    title: "Cursos | FEBAcademy",
    description:
      "Explora nuestro catálogo de cursos en línea sobre tecnología, diseño y más.",
  },
};

type CourseWithRelations = Course & {
  instructor?: Pick<Profile, "full_name" | "avatar_url"> | null;
  category?: Pick<Category, "name" | "slug"> | null;
  enrollment_count?: number;
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    tipo?: string;
    page?: string;
  }>;
}

async function fetchCourses(searchParams: {
  q?: string;
  categoria?: string;
  tipo?: string;
  page?: string;
}): Promise<{ courses: CourseWithRelations[]; total: number }> {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || "1", 10);
  const perPage = 12;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(full_name, avatar_url),
      category:categories!courses_category_id_fkey(name, slug)
    `,
      { count: "exact" }
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  // Type filter
  if (searchParams.tipo && searchParams.tipo !== "all") {
    query = query.eq(
      "type",
      searchParams.tipo as "recorded" | "live"
    );
  }

  // Category filter
  if (searchParams.categoria && searchParams.categoria !== "all") {
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", searchParams.categoria)
      .single<{ id: string }>();

    if (catData) {
      query = query.eq("category_id", catData.id);
    }
  }

  // Search filter
  if (searchParams.q) {
    query = query.or(
      `title.ilike.%${searchParams.q}%,short_description.ilike.%${searchParams.q}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching courses:", error);
    return { courses: [], total: 0 };
  }

  return {
    courses: (data as unknown as CourseWithRelations[]) || [],
    total: count || 0,
  };
}

async function fetchCategories(): Promise<
  Pick<Category, "id" | "name" | "slug">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });

  return (data as Pick<Category, "id" | "name" | "slug">[]) || [];
}

function CoursesLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 pt-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CursosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [{ courses, total }, categories] = await Promise.all([
    fetchCourses(params),
    fetchCategories(),
  ]);

  const page = parseInt(params.page || "1", 10);
  const perPage = 12;
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          Catálogo
        </Badge>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
          Cursos
        </h1>
        <p className="text-muted-foreground text-lg">
          Explora nuestro catálogo y encuentra el curso perfecto para ti.
          {total > 0 && (
            <span className="text-sm ml-2">
              ({total} {total === 1 ? "curso" : "cursos"})
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
          <CourseFilters categories={categories} />
        </Suspense>
      </div>

      {/* Course grid */}
      <Suspense fallback={<CoursesLoading />}>
        <CourseGrid
          courses={courses}
          emptyMessage={
            params.q || params.categoria || params.tipo
              ? "No se encontraron cursos con esos filtros. Intenta con otros criterios."
              : "Aún no hay cursos publicados. ¡Próximamente!"
          }
        />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const params2 = new URLSearchParams();
            if (params.q) params2.set("q", params.q);
            if (params.categoria) params2.set("categoria", params.categoria);
            if (params.tipo) params2.set("tipo", params.tipo);
            if (pageNum > 1) params2.set("page", String(pageNum));

            return (
              <a
                key={pageNum}
                href={`/cursos?${params2.toString()}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  page === pageNum
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                {pageNum}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
