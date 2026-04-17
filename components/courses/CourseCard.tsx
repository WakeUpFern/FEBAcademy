import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Radio,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Course, Profile, Category } from "@/types/database";

interface CourseCardProps {
  course: Course & {
    instructor?: Pick<Profile, "full_name" | "avatar_url"> | null;
    category?: Pick<Category, "name" | "slug"> | null;
    enrollment_count?: number;
    average_rating?: number;
  };
}

const levelLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
  all: "Todos los niveles",
};

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-500/10 text-emerald-600",
  intermediate: "bg-amber-500/10 text-amber-600",
  advanced: "bg-red-500/10 text-red-600",
  all: "bg-blue-500/10 text-blue-600",
};

export function CourseCard({ course }: CourseCardProps) {
  const isLive = course.type === "live";

  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <BookOpen className="h-12 w-12 text-primary/30" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          {isLive ? (
            <Badge className="bg-red-500 text-white border-0 shadow-sm">
              <Radio className="h-3 w-3 mr-1 animate-pulse" />
              En Vivo
            </Badge>
          ) : (
            <Badge variant="secondary" className="shadow-sm backdrop-blur-sm bg-background/80">
              <Play className="h-3 w-3 mr-1" />
              Grabado
            </Badge>
          )}
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          {course.is_free ? (
            <Badge className="bg-emerald-500 text-white border-0 shadow-sm">
              Gratis
            </Badge>
          ) : course.price ? (
            <Badge variant="secondary" className="shadow-sm backdrop-blur-sm bg-background/80 font-bold">
              ${course.price} {course.currency.toUpperCase()}
            </Badge>
          ) : null}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category + Level */}
        <div className="flex items-center gap-2 mb-2">
          {course.category && (
            <span className="text-xs font-medium text-muted-foreground">
              {course.category.name}
            </span>
          )}
          {course.category && course.level && (
            <span className="text-muted-foreground/40">·</span>
          )}
          {course.level && (
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 ${levelColors[course.level] || ""}`}
            >
              {levelLabels[course.level] || course.level}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        {course.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {course.short_description}
          </p>
        )}

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Instructor */}
        {course.instructor && (
          <div className="flex items-center gap-2 mb-3">
            {course.instructor.avatar_url ? (
              <Image
                src={course.instructor.avatar_url}
                alt={course.instructor.full_name || "Instructor"}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-primary">
                  {course.instructor.full_name?.charAt(0) || "I"}
                </span>
              </div>
            )}
            <span className="text-xs text-muted-foreground truncate">
              {course.instructor.full_name}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
          {course.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(course.duration_minutes)}
            </span>
          )}
          {typeof course.enrollment_count === "number" && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.enrollment_count}
            </span>
          )}
          {typeof course.average_rating === "number" && course.average_rating > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              {course.average_rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
