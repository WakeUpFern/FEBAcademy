"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, Edit, Trash, Video, FileText, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import type { Module } from "@/types/database";
import { updateModule, deleteModule } from "@/app/actions/admin/courses";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { extractYoutubeId } from "./utils";

export function SortableModuleItem({ module, courseId }: { module: Module; courseId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ 
    id: module.id
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editYoutubeInput, setEditYoutubeInput] = useState(module.youtube_video_id ? `https://youtube.com/watch?v=${module.youtube_video_id}` : "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="h-1.5 bg-muted-foreground/20 rounded-full my-4 ml-8 mr-4" />
    );
  }

  const isVideo = module.content_type === "youtube_video" || module.content_type === "youtube_live";

  const handleUpdate = () => {
    if (!editTitle.trim()) return;
    const extractedId = extractYoutubeId(editYoutubeInput);
    startTransition(async () => {
      await updateModule(module.id, courseId, {
        title: editTitle,
        youtube_video_id: extractedId || null,
        youtube_url: editYoutubeInput || null,
        is_published: true,
      });
      setIsEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar esta clase?")) {
      startTransition(async () => {
        await deleteModule(module.id, courseId);
        router.refresh();
      });
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-2 group hover:bg-accent/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-accent p-1.5 rounded-md transition-colors flex flex-col items-center gap-0.5 group/grip">
          <ChevronUp className="h-3 w-3 text-muted-foreground/50 group-hover/grip:text-primary transition-colors" />
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <ChevronDown className="h-3 w-3 text-muted-foreground/50 group-hover/grip:text-primary transition-colors" />
        </div>
        <div className="flex items-center justify-center h-8 w-8 rounded bg-muted overflow-hidden relative shrink-0">
          {module.youtube_video_id ? (
            <Image 
              src={`https://img.youtube.com/vi/${module.youtube_video_id}/default.jpg`} 
              alt="Thumbnail"
              fill
              className="object-cover"
            />
          ) : (
            isVideo ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />
          )}
        </div>
        <span className="font-medium text-sm">{module.title}</span>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={handleDelete} disabled={isPending}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Clase</DialogTitle>
            <DialogDescription>
              Configura el contenido de esta clase.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`edit_title_${module.id}`}>Título</Label>
              <Input 
                id={`edit_title_${module.id}`}
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit_youtube_${module.id}`}>URL del Video en YouTube</Label>
              <Input 
                id={`edit_youtube_${module.id}`}
                value={editYoutubeInput}
                onChange={e => setEditYoutubeInput(e.target.value)}
                placeholder="Ej: https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground">Pega la URL completa del video.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={isPending || !editTitle.trim()}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
