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
import { createSection, createModule, updateSectionsOrder, updateModulesOrder } from "@/app/actions/admin/courses";
import { useRouter } from "next/navigation";

interface ModuleManagerProps {
  courseId: string;
  initialSections: CourseSection[];
  initialModules: Module[];
}

// Draggable Module Item
function SortableModuleItem({ module }: { module: Module }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isVideo = module.content_type === "youtube_video" || module.content_type === "youtube_live";

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 mb-2 bg-background border rounded-md shadow-sm group">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1 rounded">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-center h-8 w-8 rounded bg-muted">
          {isVideo ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        </div>
        <span className="font-medium text-sm">{module.title}</span>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    startTransition(async () => {
      await createModule(courseId, section.id, {
        title: newModuleTitle,
        content_type: "youtube_video",
        is_published: false,
        is_free_preview: false,
      });
      setNewModuleTitle("");
      setIsAddingModule(false);
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
              <SortableModuleItem key={mod.id} module={mod} />
            ))}
            {modules.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No hay clases en esta sección.</p>
            )}
          </div>
        </SortableContext>

        <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nueva Clase</DialogTitle>
              <DialogDescription>
                Ingresa el título para la nueva clase. Podrás configurar el video y contenido después.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor={`module_title_${section.id}`}>Título de la Clase</Label>
                <Input 
                  id={`module_title_${section.id}`}
                  placeholder="Ej. Introducción al tema" 
                  value={newModuleTitle}
                  onChange={e => setNewModuleTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddModule()}
                />
              </div>
            </div>
            <DialogFooter>
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
    startTransition(async () => {
      const res = await createSection(courseId, newSectionTitle);
      if (res.success && res.section) {
        setSections([...sections, res.section]);
        setNewSectionTitle("");
        setIsAddingSection(false);
        router.refresh();
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Sección</DialogTitle>
            <DialogDescription>
              Crea una nueva sección para organizar las clases de tu curso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section_title">Título de la Sección</Label>
              <Input 
                id="section_title" 
                placeholder="Ej. Introducción al curso" 
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSection()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingSection(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSection} disabled={isPending || !newSectionTitle.trim()}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Crear Sección"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {sections.length === 0 && !isAddingSection && (
        <div className="text-center py-12 border rounded-xl border-dashed">
          <h3 className="text-lg font-medium">Currículum Vacío</h3>
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
