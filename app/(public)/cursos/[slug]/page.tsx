import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ModuleList } from "@/components/courses/ModuleList";
import { EnrollButton } from "@/components/courses/EnrollButton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  GraduationCap,
  Globe,
  BarChart3,
  CheckCircle2,
  Play,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Course, Profile, Category, CourseSection, Module } from "@/types/database";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type CourseDetail = Course & {
  instructor: Pick<Profile, "id" | "full_name" | "avatar_url" | "bio"> | null;
  category: Pick<Category, "name" | "slug"> | null;
};

type SectionWithModules = CourseSection & { modules: Module[] };

async function getCourse(slug: string) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url, bio),
      category:categories!courses_category_id_fkey(name, slug)
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single<CourseDetail>();

  if (!course) return null;

  const courseId = course.id;

  // Get sections with modules
  const { data: sections } = await supabase
    .from("course_sections")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  // Group modules by section
  const sectionsWithModules: SectionWithModules[] =
    (sections || []).map((section) => ({
      ...(section as unknown as CourseSection),
      modules: ((modules as unknown as Module[]) || []).filter(
        (mod) => mod.section_id === (section as unknown as CourseSection).id
      ),
    }));

  // Modules without a section
  const orphanModules = ((modules as unknown as Module[]) || []).filter(
    (mod) => !mod.section_id
  );
  if (orphanModules.length > 0) {
    sectionsWithModules.push({
      id: "general",
      course_id: courseId,
      title: "General",
      description: null,
      sort_order: 999,
      created_at: "",
      updated_at: "",
      modules: orphanModules,
    });
  }

  // Get enrollment count
  const { count: enrollmentCount } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("status", "active");

  // Get review stats
  const { data: reviewStats } = await supabase
    .from("course_reviews")
    .select("rating")
    .eq("course_id", courseId)
    .eq("is_visible", true);

  const averageRating =
    reviewStats && reviewStats.length > 0
      ? reviewStats.reduce((acc, r) => acc + (r as unknown as { rating: number }).rating, 0) /
        reviewStats.length
      : 0;

  // Check if current user is enrolled
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("status", "active")
      .single<{ id: string }>();

    isEnrolled = !!enrollment;
  }

  // Count total duration
  const totalDuration = ((modules as unknown as Module[]) || []).reduce(
    (acc, mod) => acc + (mod.duration_seconds || 0),
    0
  );

  return {
    course: course as unknown as CourseDetail,
    sections: sectionsWithModules,
    enrollmentCount: enrollmentCount || 0,
    averageRating,
    reviewCount: reviewStats?.length || 0,
    isEnrolled,
    isAuthenticated: !!user,
    totalModules: (modules || []).length,
    totalDurationMinutes: Math.ceil(totalDuration / 60),
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCourse(slug);

  if (!data) {
    return { title: "Curso no encontrado" };
  }

  const { course } = data;
  return {
    title: course.meta_title || course.title,
    description:
      course.meta_description || course.short_description || course.description,
    openGraph: {
      title: course.meta_title || course.title,
      description:
        course.meta_description ||
        course.short_description ||
        "Curso en FEBAcademy",
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
      type: "website",
    },
  };
}

const levelLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
  all: "Todos los niveles",
};

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCourse(slug);

  if (!data) {
    notFound();
  }

  const {
    course,
    sections,
    enrollmentCount,
    averageRating,
    reviewCount,
    isEnrolled,
    isAuthenticated,
    totalModules,
    totalDurationMinutes,
  } = data;

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background border-b">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <a href="/cursos" className="hover:text-foreground transition-colors">
                  Cursos
                </a>
                <span>/</span>
                {course.category && (
                  <>
                    <a
                      href={`/cursos?categoria=${course.category.slug}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {course.category.name}
                    </a>
                    <span>/</span>
                  </>
                )}
                <span className="text-foreground truncate">{course.title}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-balance">
                {course.title}
              </h1>

              {/* Short description */}
              {course.short_description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {course.short_description}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {averageRating > 0 && (
                  <span className="flex items-center gap-1 font-medium text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    {averageRating.toFixed(1)}
                    <span className="text-muted-foreground font-normal">
                      ({reviewCount})
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {enrollmentCount} estudiantes
                </span>
                {totalModules > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Play className="h-4 w-4" />
                    {totalModules} clases
                  </span>
                )}
                {totalDurationMinutes > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDuration(totalDurationMinutes)}
                  </span>
                )}
                {course.level && (
                  <Badge variant="secondary" className="text-xs">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    {levelLabels[course.level] || course.level}
                  </Badge>
                )}
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  {course.language === "es" ? "Español" : course.language}
                </span>
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-3 pt-2">
                  {course.instructor.avatar_url ? (
                    <Image
                      src={course.instructor.avatar_url}
                      alt={course.instructor.full_name || "Instructor"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {course.instructor.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar card */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-xl border bg-card shadow-lg overflow-hidden">
                {/* Thumbnail */}
                {course.thumbnail_url && (
                  <div className="relative aspect-video">
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    {course.trailer_youtube_id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                          <Play className="h-6 w-6 text-primary ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    {course.is_free ? (
                      <span className="text-3xl font-bold text-emerald-500">
                        Gratis
                      </span>
                    ) : course.price ? (
                      <>
                        <span className="text-3xl font-bold">
                          ${course.price}
                        </span>
                        <span className="text-sm text-muted-foreground uppercase">
                          {course.currency}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-emerald-500">
                        Gratis
                      </span>
                    )}
                  </div>

                  {/* Enroll button */}
                  <EnrollButton
                    courseId={course.id}
                    isEnrolled={isEnrolled}
                    isAuthenticated={isAuthenticated}
                    courseSlug={course.slug}
                  />

                  {/* Quick info */}
                  <div className="space-y-3 pt-4 border-t text-sm">
                    {totalModules > 0 && (
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{totalModules} clases</span>
                      </div>
                    )}
                    {totalDurationMinutes > 0 && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{formatDuration(totalDurationMinutes)} de contenido</span>
                      </div>
                    )}
                    {course.level && (
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{levelLabels[course.level] || course.level}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{course.language === "es" ? "Español" : course.language}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="lg:max-w-3xl">
          <Tabs defaultValue="descripcion">
            <TabsList>
              <TabsTrigger value="descripcion">Descripción</TabsTrigger>
              <TabsTrigger value="modulos">
                Módulos ({totalModules})
              </TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>

            {/* Description tab */}
            <TabsContent value="descripcion" className="mt-6 space-y-8">
              {/* What you'll learn */}
              {course.what_you_learn && course.what_you_learn.length > 0 && (
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Lo que aprenderás
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.what_you_learn.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full description */}
              {course.description && (
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-3">
                    Acerca del curso
                  </h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Requisitos</h3>
                  <ul className="space-y-2">
                    {course.requirements.map((req, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-muted-foreground/50 mt-0.5">
                          •
                        </span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            {/* Modules tab */}
            <TabsContent value="modulos" className="mt-6">
              <ModuleList sections={sections} isEnrolled={isEnrolled} />
            </TabsContent>

            {/* Instructor tab */}
            <TabsContent value="instructor" className="mt-6">
              {course.instructor && (
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-start gap-4">
                    {course.instructor.avatar_url ? (
                      <Image
                        src={course.instructor.avatar_url}
                        alt={course.instructor.full_name || "Instructor"}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {course.instructor.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Instructor
                      </p>
                      {course.instructor.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {course.instructor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
