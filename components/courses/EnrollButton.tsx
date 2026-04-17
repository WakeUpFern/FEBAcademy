"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { enrollInCourse } from "@/app/actions/enrollment";
import {
  GraduationCap,
  CheckCircle2,
  Loader2,
  LogIn,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isAuthenticated: boolean;
  courseSlug: string;
}

export function EnrollButton({
  courseId,
  isEnrolled,
  isAuthenticated,
  courseSlug,
}: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const router = useRouter();

  if (enrolled) {
    return (
      <div className="space-y-2">
        <Button
          render={<Link href={`/aprender/${courseSlug}`} />}
          className="w-full gradient-brand text-white border-0 shadow-lg shadow-brand/25 hover:shadow-xl h-11"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Continuar Aprendiendo
        </Button>
        <p className="text-xs text-center text-emerald-600 flex items-center justify-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Ya estás inscrito
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        className="w-full gradient-brand text-white border-0 shadow-lg shadow-brand/25 hover:shadow-xl h-11"
        onClick={() => {
          // Redirect to auth with return URL
          const returnUrl = `/cursos/${courseSlug}`;
          router.push(`/auth/callback?returnTo=${encodeURIComponent(returnUrl)}`);
        }}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Inicia Sesión para Inscribirte
      </Button>
    );
  }

  const handleEnroll = () => {
    setError(null);
    startTransition(async () => {
      const result = await enrollInCourse(courseId);
      if (result.success) {
        setEnrolled(true);
      } else {
        setError(result.error || "Error desconocido");
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleEnroll}
        disabled={isPending}
        className="w-full gradient-brand text-white border-0 shadow-lg shadow-brand/25 hover:shadow-xl h-11"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Inscribiendo...
          </>
        ) : (
          <>
            <GraduationCap className="h-4 w-4 mr-2" />
            Inscribirme Gratis
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-center text-destructive">{error}</p>
      )}
    </div>
  );
}
