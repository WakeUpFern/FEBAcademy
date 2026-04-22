"use client";

import { useState, useTransition } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { GripVertical, Plus, Edit, Trash, Video, FileText, Loader2, Save } from "lucide-react";
import type { CourseSection, Module } from "@/types/database";
import { createSection, createModule, updateSectionsOrder, updateModulesOrder, updateModule, deleteModule } from "@/app/actions/admin/courses";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

interface ModuleManagerProps {
  courseId: string;
  initialSections: CourseSection[];
  initialModules: Module[];
}

// Extract YouTube ID from URL or return the ID if already an ID
function extractYoutubeId(input: string): string {
  if (!input) return "";
  // Si ya parece un ID de 11 caracteres (ej. dQw4w9WgXcQ)
  if (input.length === 11 && !input.includes("/")) return input;
  
  const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : input;
}

// Draggable Module Item
function SortableModuleItem({ module, courseId }: { module: Module; courseId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editYoutubeInput, setEditYoutubeInput] = useState(module.youtube_video_id ? `https://youtube.com/watch?v=${module.youtube_video_id}` : "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isVideo = module.content_type === "youtube_video" || module.content_type === "youtube_live";

  const handleUpdate = () => {
    if (!editTitle.trim()) return;
    
    const extractedId = extractYoutubeId(editYoutubeInput);
    
    startTransition(async () => {
      await updateModule(module.id, courseId, {
        title: editTitle,
        youtube_video_id: extractedId || null,
        youtube_url: editYoutubeInput || null,
        is_published: true, // Auto publish for now when they add video
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
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 mb-2 bg-background border rounded-md shadow-sm group">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1 rounded">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
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

// Draggable Section Item
function SortableSectionItem({ 
  section, 
  modules,
  courseId
}: { 
  section: CourseSection; 
  modules: Module[];
  courseId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const [isPending, startTransition] = useTransition();
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        }
      } catch (err: any) {
        setError(err.message || "Ocurrió un error inesperado.");
      }
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-6 bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 bg-muted/30 border-b group">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1 rounded">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">{section.title}</h3>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={() => setIsAddingModule(!isAddingModule)}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir Clase
          </Button>
        </div>
      </div>

      <div className="p-4 bg-muted/10">
        <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
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

export function ModuleManager({ courseId, initialSections, initialModules }: ModuleManagerProps) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [modules, setModules] = useState(initialModules);
  const [isPending, startTransition] = useTransition();
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync state when props change (after router.refresh())
  useEffect(() => {
    setSections(initialSections);
    setModules(initialModules);
  }, [initialSections, initialModules]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Check if dragging a section
    const isSectionDrag = sections.some(s => s.id === active.id);
    
    if (isSectionDrag) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      setSections(arrayMove(sections, oldIndex, newIndex));
      setHasUnsavedChanges(true);
    } else {
      // It's a module drag (simplified to only allow within same section for now)
      const oldIndex = modules.findIndex(m => m.id === active.id);
      const newIndex = modules.findIndex(m => m.id === over.id);
      
      const activeModule = modules[oldIndex];
      const overModule = modules[newIndex];
      
      // Only allow reordering within the same section for this simple implementation
      if (activeModule.section_id === overModule.section_id) {
        setModules(arrayMove(modules, oldIndex, newIndex));
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await createSection(courseId, newSectionTitle);
        if (res.success && res.section) {
          setSections([...sections, res.section]);
          setNewSectionTitle("");
          setIsAddingSection(false);
          router.refresh();
        } else {
          setError(res.error || "Ocurrió un error al crear la sección.");
        }
      } catch (err: any) {
        setError(err.message || "Ocurrió un error inesperado.");
      }
    });
  };

  const saveOrder = () => {
    startTransition(async () => {
      // Prepare sections order
      const sectionsOrder = sections.map((s, index) => ({ id: s.id, sort_order: index }));
      await updateSectionsOrder(courseId, sectionsOrder);

      // Prepare modules order
      const modulesOrder = modules.map((m, index) => ({ id: m.id, section_id: m.section_id, sort_order: index }));
      await updateModulesOrder(courseId, modulesOrder);

      setHasUnsavedChanges(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
        <div>
          <h2 className="text-lg font-semibold">Secciones y Clases</h2>
          <p className="text-sm text-muted-foreground">Estructura el contenido de tu curso</p>
        </div>
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Button onClick={saveOrder} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Orden
            </Button>
          )}
          <Button onClick={() => setIsAddingSection(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Sección
          </Button>
        </div>
      </div>

      <Dialog open={isAddingSection} onOpenChange={setIsAddingSection}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b">
            <DialogTitle className="text-xl">Nueva Sección</DialogTitle>
            <DialogDescription>
              Crea una nueva sección para organizar las clases de tu curso.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-3">
              <Label htmlFor="section_title" className="text-sm font-medium">Título de la Sección</Label>
              <Input 
                id="section_title" 
                placeholder="Ej. Introducción al curso" 
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSection()}
                className="w-full"
              />
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>
          </div>
          <DialogFooter className="px-6 py-4 bg-muted/20 border-t">
            <Button variant="outline" onClick={() => setIsAddingSection(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSection} disabled={isPending || !newSectionTitle.trim()}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Crear Sección"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isMounted && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sections.map(section => (
                <SortableSectionItem 
                  key={section.id} 
                  section={section} 
                  modules={modules.filter(m => m.section_id === section.id)}
                  courseId={courseId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {sections.length === 0 && !isAddingSection && (
        <div className="text-center py-12 border rounded-xl border-dashed">
          <h3 className="text-lg font-medium">Contenido Vacío</h3>
          <p className="text-muted-foreground mt-1 mb-4">Comienza creando tu primera sección.</p>
          <Button onClick={() => setIsAddingSection(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Sección
          </Button>
        </div>
      )}
    </div>
  );
}
