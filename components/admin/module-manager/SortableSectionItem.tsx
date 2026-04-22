"use client";

import { useState, useTransition } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, Plus, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import type { CourseSection, Module } from "@/types/database";
import { createModule } from "@/app/actions/admin/courses";
import { useRouter } from "next/navigation";
import { SortableModuleItem } from "./SortableModuleItem";

export function SortableSectionItem({ 
  section, 
  modules,
  courseId
}: { 
  section: CourseSection; 
  modules: Module[];
  courseId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ 
    id: section.id
  });
  const [isPending, startTransition] = useTransition();
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="h-2 bg-muted-foreground/10 rounded-full my-8 mx-4" />
    );
  }

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await createModule(courseId, section.id, {
          title: newModuleTitle,
          content_type: "youtube_video",
          is_published: false,
          is_free_preview: false,
        });
        if (res && !res.success) {
          setError(res.error || "Error al crear la clase.");
        } else {
          setNewModuleTitle("");
          setIsAddingModule(false);
          router.refresh();
        }
      } catch (err: any) {
        setError(err.message || "Ocurrió un error inesperado.");
      }
    });
  };

  const moduleIds = modules.map(m => m.id);

  return (
    <div ref={setNodeRef} style={style} className="mb-10">
      <div className="flex items-center justify-between pb-4 border-b group mb-4">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab hover:bg-accent p-1.5 rounded-md transition-colors flex flex-col items-center gap-0.5 group/grip">
            <ChevronUp className="h-3 w-3 text-muted-foreground/50 group-hover/grip:text-primary transition-colors" />
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <ChevronDown className="h-3 w-3 text-muted-foreground/50 group-hover/grip:text-primary transition-colors" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">{section.title}</h3>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={() => setIsAddingModule(!isAddingModule)}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir Clase
          </Button>
        </div>
      </div>

      <div className="pl-8">
        <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {modules.map(mod => (
              <SortableModuleItem key={mod.id} module={mod} courseId={courseId} />
            ))}
            {modules.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No hay clases en esta sección.</p>
            )}
          </div>
        </SortableContext>

        <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b">
              <DialogTitle className="text-xl">Añadir Nueva Clase</DialogTitle>
              <DialogDescription>
                Ingresa el título para la nueva clase. Podrás configurar el video y contenido después.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <div className="space-y-3">
                <Label htmlFor={`module_title_${section.id}`} className="text-sm font-medium">Título de la Clase</Label>
                <Input 
                  id={`module_title_${section.id}`}
                  placeholder="Ej. Introducción al tema" 
                  value={newModuleTitle}
                  onChange={e => setNewModuleTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddModule()}
                  className="w-full"
                />
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
              </div>
            </div>
            <DialogFooter className="px-6 py-4 bg-muted/20 border-t">
              <Button variant="outline" onClick={() => setIsAddingModule(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddModule} disabled={isPending || !newModuleTitle.trim()}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Crear Clase"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
