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
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, Plus, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import type { CourseSection, Module } from "@/types/database";
import { createSection, updateSectionsOrder, updateModulesOrder } from "@/app/actions/admin/courses";
import { useRouter } from "next/navigation";
import { getCustomCollisionDetection } from "./module-manager/utils";
import { SortableSectionItem } from "./module-manager/SortableSectionItem";

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
