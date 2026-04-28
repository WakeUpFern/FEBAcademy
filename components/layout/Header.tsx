"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import {
  BookOpen,
  Radio,
  FileText,
} from "lucide-react";
import { AnimatedLogoText } from "@/components/ui/animated-logo";

const navLinks = [
  { href: "/cursos", label: "Cursos", icon: BookOpen },
  { href: "/en-vivo", label: "En Vivo", icon: Radio },
  { href: "/blog", label: "Blog", icon: FileText },
];

export function Header() {
  const { user, profile, isLoading, signInWithGoogle } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3.5 font-bold text-2xl tracking-tight group"
        >
          <div className="relative h-16 w-16 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
            <Image
              src="/logopx2.svg"
              alt="FEBAcademy"
              fill
              sizes="64px"
              className="object-contain"
              priority
            />
          </div>
          <span className="hidden sm:inline-block">
            FEBA<AnimatedLogoText />
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-accent"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user && profile ? (
            <UserProfileMenu showName={true} />
          ) : (
            <Button
              onClick={() => signInWithGoogle()}
              size="sm"
              className="bg-white text-black border border-border shadow-sm hover:bg-accent transition-colors"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Iniciar Sesión
            </Button>
          )}

          {/* Mobile menu */}
          <MobileMenu 
            side="right" 
            triggerClassName="h-9 w-9 md:hidden"
            contentClassName="w-[280px] p-0"
          >
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <Link
                    href="/"
                    className="flex items-center gap-3 font-bold text-2xl"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-brand text-white">
                      <div className="relative h-10 w-10">
                        <Image
                          src="/logopx2.svg"
                          alt="FEBAcademy"
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      </div>
                    </div>
                    FEBA<AnimatedLogoText />
                  </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-accent"
                    >
                      <link.icon className="h-4 w-4 text-muted-foreground" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
