import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Blog",
  description: "Artículos, tutoriales y novedades sobre tecnología y aprendizaje.",
};

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          Blog
        </Badge>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
          Blog
        </h1>
        <p className="text-muted-foreground text-lg">
          Artículos, tutoriales y novedades del mundo tech.
        </p>
      </div>
      <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
        El blog se implementará en la Fase 5.
      </div>
    </div>
  );
}
