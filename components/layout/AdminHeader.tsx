"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import {
  LayoutDashboard,
  BookOpen,
  Radio,
  FileText,
  Users,
  Mail,
  FileStack,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { AnimatedLogoText } from "@/components/ui/animated-logo";

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

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center flex-shrink-0 justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <MobileMenu side="left" triggerClassName="h-9 w-9">
            <div className="flex h-16 items-center px-6 border-b">
              <Link
                href="/admin"
                className="flex items-center gap-3.5 font-bold text-xl tracking-tight group"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                  <Image
                    src="/logopx2.svg"
                    alt="FEBAcademy"
                    fill
                    sizes="40px"
                    className="object-contain"
                    priority
                  />
                </div>
                <span>
                  FEBA<AnimatedLogoText />
                </span>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
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
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-foreground/70 hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-colors w-full"
              >
                <ExternalLink className="h-4.5 w-4.5 flex-shrink-0" />
                <span>Ver Sitio</span>
              </Link>
            </div>
        </MobileMenu>

        <Link
          href="/admin"
          className="flex items-center gap-3.5 font-bold tracking-tight group"
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-lg transition-transform group-hover:scale-105 hidden sm:block">
            <Image
              src="/logopx2.svg"
              alt="FEBAcademy"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </div>
          <span className="hidden sm:inline-flex items-center text-lg">
            FEBA<AnimatedLogoText />
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <UserProfileMenu showName={false} />
      </div>
    </header>
  );
}
