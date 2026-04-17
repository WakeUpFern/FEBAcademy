import { CourseCard } from "@/components/courses/CourseCard";
import type { Course, Profile, Category } from "@/types/database";

type CourseWithRelations = Course & {
  instructor?: Pick<Profile, "full_name" | "avatar_url"> | null;
  category?: Pick<Category, "name" | "slug"> | null;
  enrollment_count?: number;
  average_rating?: number;
};

interface CourseGridProps {
  courses: CourseWithRelations[];
  emptyMessage?: string;
}

export function CourseGrid({
  courses,
  emptyMessage = "No se encontraron cursos.",
}: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
