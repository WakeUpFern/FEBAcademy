"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, ArrowRight, Trophy, Clock } from "lucide-react";

export default function StudentDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Mi Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido de vuelta,{" "}
            {profile?.full_name?.split(" ")[0] || "Estudiante"} 🎓
          </p>
        </div>
        <Button render={<Link href="/cursos" />} className="w-fit gradient-brand text-white border-0 shadow-md shadow-brand/25">
            <BookOpen className="h-4 w-4 mr-2" />
            Explorar Cursos
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Cursos Inscritos</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">
                Cursos Completados
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">0h</p>
              <p className="text-sm text-muted-foreground">
                Horas de Estudio
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled courses (empty state) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mis Cursos</h2>
        </div>
        <div className="rounded-xl border bg-card p-12 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Aún no tienes cursos
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Explora nuestro catálogo y encuentra el curso perfecto para ti.
            ¡Tu primer curso te está esperando!
          </p>
          <Button render={<Link href="/cursos" />}>
              Explorar Catálogo
              <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Badges placeholder */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Logros</h2>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-sm opacity-50"
          >
            🎯 Primer Curso — Completa tu primer curso
          </Badge>
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-sm opacity-50"
          >
            🔥 Racha de 7 días — Estudia 7 días seguidos
          </Badge>
          <Badge
            variant="secondary"
            className="px-3 py-1.5 text-sm opacity-50"
          >
            ⭐ Reseñista — Deja tu primera reseña
          </Badge>
        </div>
      </div>
    </div>
  );
}
