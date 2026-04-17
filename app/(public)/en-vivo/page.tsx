import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";

export const metadata = {
  title: "Eventos en Vivo",
  description: "Participa en clases en vivo y eventos especiales con nuestros instructores.",
};

export default function EnVivoPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          <Radio className="h-3.5 w-3.5 mr-1.5" />
          En Vivo
        </Badge>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
          Eventos en Vivo
        </h1>
        <p className="text-muted-foreground text-lg">
          Próximos eventos en vivo y grabaciones de sesiones pasadas.
        </p>
      </div>
      <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
        Los eventos en vivo se implementarán en la Fase 7.
      </div>
    </div>
  );
}
