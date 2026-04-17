"use client";

import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Radio,
  FileText,
  Users,
  Mail,
  TrendingUp,
  Plus,
} from "lucide-react";

const quickActions = [
  {
    label: "Nuevo Curso",
    href: "/admin/cursos/nuevo",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "Nuevo Post",
    href: "/admin/blog/nuevo",
    icon: FileText,
    color: "bg-green-500/10 text-green-600",
  },
  {
    label: "Nuevo Evento",
    href: "/admin/en-vivo/nuevo",
    icon: Radio,
    color: "bg-purple-500/10 text-purple-600",
  },
];

const statsCards = [
  {
    label: "Cursos",
    value: "—",
    icon: BookOpen,
    href: "/admin/cursos",
    color: "text-blue-500",
  },
  {
    label: "Estudiantes",
    value: "—",
    icon: Users,
    href: "/admin/usuarios",
    color: "text-emerald-500",
  },
  {
    label: "Posts",
    value: "—",
    icon: FileText,
    href: "/admin/blog",
    color: "text-amber-500",
  },
  {
    label: "Suscriptores",
    value: "—",
    icon: Mail,
    href: "/admin/newsletter",
    color: "text-purple-500",
  },
];

export default function AdminDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            ¡Hola, {profile?.full_name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí tienes un resumen de tu plataforma.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
          Panel de Administración
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative p-5 rounded-xl border bg-card hover:bg-accent/30 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                Ver todo →
              </span>
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              render={<Link href={action.href} />}
              className="h-auto p-4 justify-start gap-3 hover:bg-accent/50 border-dashed"
            >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Crear nuevo contenido
                  </p>
                </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Placeholder for future widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Actividad Reciente</h3>
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Los datos de actividad aparecerán aquí cuando conectes Supabase.
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Cursos Populares</h3>
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            Las estadísticas de cursos aparecerán aquí cuando haya datos.
          </div>
        </div>
      </div>
    </div>
  );
}
