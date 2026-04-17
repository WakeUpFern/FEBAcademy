import { Badge } from "@/components/ui/badge";
import {
  Play,
  FileText,
  Lock,
  Eye,
  Clock,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { CourseSection, Module } from "@/types/database";

interface ModuleListProps {
  sections: (CourseSection & { modules: Module[] })[];
  isEnrolled?: boolean;
}

export function ModuleList({ sections, isEnrolled = false }: ModuleListProps) {
  if (sections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Este curso aún no tiene módulos publicados.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => (
        <div key={section.id} className="rounded-xl border bg-card overflow-hidden">
          {/* Section header */}
          <div className="px-4 py-3 bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">
                <span className="text-muted-foreground mr-2">
                  Sección {sectionIndex + 1}:
                </span>
                {section.title}
              </h4>
              <span className="text-xs text-muted-foreground">
                {section.modules.length}{" "}
                {section.modules.length === 1 ? "clase" : "clases"}
              </span>
            </div>
            {section.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {section.description}
              </p>
            )}
          </div>

          {/* Modules list */}
          <ul className="divide-y">
            {section.modules.map((mod, modIndex) => {
              const canAccess = isEnrolled || mod.is_free_preview;
              const isVideo =
                mod.content_type === "youtube_video" ||
                mod.content_type === "youtube_live";

              return (
                <li
                  key={mod.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  {/* Index number */}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium flex-shrink-0">
                    {modIndex + 1}
                  </span>

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {isVideo ? (
                      <Play className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm ${
                        canAccess
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {mod.title}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {mod.is_free_preview && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600"
                      >
                        <Eye className="h-2.5 w-2.5 mr-0.5" />
                        Preview
                      </Badge>
                    )}
                    {!canAccess && (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                    {mod.duration_seconds && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(mod.duration_seconds)}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
