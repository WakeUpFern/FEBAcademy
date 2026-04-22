import { closestCorners } from "@dnd-kit/core";
import type { CourseSection, Module } from "@/types/database";

export function extractYoutubeId(input: string): string {
  if (!input) return "";
  if (input.length === 11 && !input.includes("/")) return input;
  
  const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : input;
}

export function getCustomCollisionDetection(sections: CourseSection[], modules: Module[], activeType: string | null) {
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
