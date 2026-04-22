"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  DndContext, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners
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
import { GripVertical, Plus, Edit, Trash, Video, FileText, Loader2, Save, ChevronUp, ChevronDown } from "lucide-react";
import type { CourseSection, Module } from "@/types/database";
import { createSection, createModule, updateSectionsOrder, updateModulesOrder, updateModule, deleteModule } from "@/app/actions/admin/courses";
import { useRouter } from "next/navigation";
import Image from "next/image";

function extractYoutubeId(input: string): string {
  if (!input) return "";
  if (input.length === 11 && !input.includes("/")) return input;
  
  const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : input;
}

// Custom collision detection to handle dragging sections over modules
function getCustomCollisionDetection(sections: CourseSection[], modules: Module[], activeType: string | null) {
  return (args: any) => {
    const collisions = closestCorners(args);
    
    if (activeType === 'section' && collisions.length > 0) {
      return collisions.map(collision => {
        const isModule = modules.some(m => m.id === collision.id);
        if (isModule) {
          const module = modules.find(m => m.id === collision.id);
          if (module && module.section_id) {
            return {
              ...collision,
              id: module.section_id
            };
          }
        }
        return collision;
      });
    }
    
    return collisions;
  };
}

// Draggable Module Item
function SortableModuleItem({ module, courseId }: { module: Module; courseId: string }) {
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

export function ModuleManager({ 
  courseId, 
  initialSections, 
  initialModules 
}: { 
  courseId: string;
  initialSections: CourseSection[];
  initialModules: Module[];
}) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [modules, setModules] = useState(initialModules);
  const [isPending, startTransition] = useTransition();
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'section' | 'module' | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setSections(initialSections);
    setModules(initialModules);
  }, [initialSections, initialModules]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const isSection = sections.some(s => s.id === active.id);
    setActiveType(isSection ? 'section' : 'module');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveType(null);
    
    if (!over || active.id === over.id) return;
    
    // Check if dragging a section
    const isSectionDrag = sections.some(s => s.id === active.id);
    
    if (isSectionDrag) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      
      // If over.id is a module, find the section it belongs to
      let overId = over.id;
      if (!sections.some(s => s.id === overId)) {
        const overModule = modules.find(m => m.id === overId);
        if (overModule && overModule.section_id) {
          overId = overModule.section_id;
        }
      }

      const newIndex = sections.findIndex(s => s.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return;

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
      
      // Auto save order
      startTransition(async () => {
        const sectionsOrder = newSections.map((s, index) => ({ id: s.id, sort_order: index }));
        await updateSectionsOrder(courseId, sectionsOrder);
        router.refresh();
      });
    } else {
      // It's a module drag
      const oldIndex = modules.findIndex(m => m.id === active.id);
      const newIndex = modules.findIndex(m => m.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return;

      const activeModule = modules[oldIndex];
      const overModule = modules[newIndex];
      
      // Only allow reordering within the same section for this simple implementation
      if (activeModule && overModule && activeModule.section_id === overModule.section_id) {
        const newModules = arrayMove(modules, oldIndex, newIndex);
        setModules(newModules);
        
        // Auto save order
        startTransition(async () => {
          const modulesOrder = newModules.map((m, index) => ({ id: m.id, section_id: m.section_id, sort_order: index }));
          await updateModulesOrder(courseId, modulesOrder);
          router.refresh();
        });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between py-6 mb-8 border-b-2 border-primary/10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estructura del Curso</h2>
          <p className="text-muted-foreground">Gestiona secciones y clases sin fricción</p>
        </div>
        <div className="flex gap-2">
          {isPending && (
            <div className="flex items-center text-sm text-muted-foreground mr-4 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Guardando...
            </div>
          )}
          <Button onClick={() => setIsAddingSection(true)} className="gradient-brand text-white border-0 shadow-lg shadow-brand/20">
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
        <DndContext 
          sensors={sensors} 
          collisionDetection={getCustomCollisionDetection(sections, modules, activeType)} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
          
          <DragOverlay adjustScale={false}>
            {activeId && activeType === 'section' ? (
              <div className="bg-background border rounded-lg p-4 shadow-2xl opacity-90 cursor-grabbing w-full max-w-5xl">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <ChevronUp className="h-3 w-3 text-muted-foreground/50" />
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {sections.find(s => s.id === activeId)?.title}
                  </h3>
                </div>
              </div>
            ) : activeId && activeType === 'module' ? (
              <div className="bg-background border rounded-lg p-3 shadow-2xl opacity-90 cursor-grabbing w-full max-w-md">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <ChevronUp className="h-3 w-3 text-muted-foreground/50" />
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                  <span className="font-medium text-sm">
                    {modules.find(m => m.id === activeId)?.title}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
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
