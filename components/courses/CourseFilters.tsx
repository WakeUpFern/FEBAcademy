"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/types/database";

interface CourseFiltersProps {
  categories: Pick<Category, "id" | "name" | "slug">[];
}

const courseTypes = [
  { value: "all", label: "Todos" },
  { value: "recorded", label: "Grabados" },
  { value: "live", label: "En Vivo" },
];

export function CourseFilters({ categories }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentCategory = searchParams.get("categoria") || "all";
  const currentType = searchParams.get("tipo") || "all";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Reset to page 1 on filter change
      params.delete("page");

      startTransition(() => {
        router.push(`/cursos?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push("/cursos");
    });
  }, [router]);

  const hasActiveFilters =
    currentSearch || currentCategory !== "all" || currentType !== "all";

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const value = e.target.value;
              // Debounce: only update after user stops typing
              const timeout = setTimeout(() => updateParams("q", value), 400);
              return () => clearTimeout(timeout);
            }}
            className="pl-10 h-10"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="h-10 px-3 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm text-muted-foreground mr-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros:
        </span>

        {/* Type filter */}
        {courseTypes.map((type) => (
          <Badge
            key={type.value}
            variant={currentType === type.value ? "default" : "secondary"}
            className={`cursor-pointer transition-colors ${
              currentType === type.value
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            } ${isPending ? "opacity-50" : ""}`}
            onClick={() => updateParams("tipo", type.value)}
          >
            {type.label}
          </Badge>
        ))}

        {/* Category separator */}
        {categories.length > 0 && (
          <span className="text-muted-foreground/30 mx-1">|</span>
        )}

        {/* Category filter */}
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={currentCategory === cat.slug ? "default" : "secondary"}
            className={`cursor-pointer transition-colors ${
              currentCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            } ${isPending ? "opacity-50" : ""}`}
            onClick={() =>
              updateParams(
                "categoria",
                currentCategory === cat.slug ? "all" : cat.slug
              )
            }
          >
            {cat.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
