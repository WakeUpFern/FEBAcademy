"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Radio,
  FileText,
  Users,
  Mail,
  FileStack,
  LogOut,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Cursos",
    href: "/admin/cursos",
    icon: BookOpen,
  },
  {
    title: "Eventos en Vivo",
    href: "/admin/en-vivo",
    icon: Radio,
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    title: "Páginas",
    href: "/admin/paginas",
    icon: FileStack,
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  const roleLabel =
    profile?.role === "admin" ? "Administrador" : "Instructor";

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-base"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white shadow-sm flex-shrink-0">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="truncate">
              FEBA<span className="text-sidebar-primary">dmin</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-lg gradient-brand text-white shadow-sm">
            <GraduationCap className="h-4 w-4" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0",
            collapsed && "mx-auto mt-2"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-3" />

      {/* View site link */}
      <div className="p-3">
        <Link
          href="/"
          target="_blank"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Ver Sitio" : undefined}
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Ver Sitio</span>}
        </Link>
      </div>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "flex-col"
          )}
        >
          <Avatar className="h-9 w-9 ring-2 ring-sidebar-primary/20 flex-shrink-0">
            <AvatarImage
              src={profile?.avatar_url || undefined}
              alt={profile?.full_name || "Admin"}
            />
            <AvatarFallback className="bg-sidebar-primary/10 text-sidebar-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || "Admin"}
              </p>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {roleLabel}
              </Badge>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0",
              collapsed && "mt-1"
            )}
            onClick={signOut}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
