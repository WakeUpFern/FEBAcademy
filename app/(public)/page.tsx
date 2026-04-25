"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { BackgroundText } from "@/components/layout/BackgroundText";
import {
  GraduationCap,
  Play,
  BookOpen,
  Radio,
  Users,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Desarrollo Acelerado con IA",
    description:
      "Aprende a crear aplicaciones completas en tiempo récord integrando asistentes, agentes de código y las últimas herramientas de Inteligencia Artificial.",
  },
  {
    icon: BookOpen,
    title: "Cursos 100% Gratuitos",
    description:
      "Por nuestro lanzamiento, todo el contenido es gratuito. Nuestra misión es democratizar el acceso a la nueva era del desarrollo de software.",
  },
  {
    icon: Sparkles,
    title: "Tecnologías de Vanguardia",
    description:
      "Olvídate del stack obsoleto. Te enseñamos a usar las tecnologías exactas que las startups más innovadoras están adoptando hoy.",
  },
  {
    icon: Users,
    title: "Experiencia Real de Startup",
    description:
      "Todo el material es creado por los ingenieros de FEBAcode. Te enseñamos los flujos de trabajo reales que utilizamos en nuestro día a día.",
  },
  {
    icon: Radio,
    title: "Proyectos 100% Prácticos",
    description:
      "Menos teoría, más código. Construye proyectos útiles desde cero resolviendo problemas reales y optimizando con IA.",
  },
  {
    icon: Globe,
    title: "Multiplica tu Productividad",
    description:
      "Domina las nuevas herramientas y conviértete en un perfil altamente cotizado. Un desarrollador potenciado por IA vale por diez.",
  },
];

const stats = [
  { value: "Gratis", label: "Cursos de Lanzamiento" },
  { value: "10x", label: "Más Rápido con IA" },
  { value: "100%", label: "Proyectos Prácticos" },
  { value: "Top", label: "Herramientas Modernas" },
];

export default function HomePage() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
  <BackgroundText />
        {/* Background gradient decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-brand-light/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/2 w-[600px] h-64 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 pt-20 pb-28 lg:pt-32 lg:pb-36">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm font-medium"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Plataforma de aprendizaje en línea
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1] mb-6">
              Domina el Código con{" "}
              <span className="gradient-text">Inteligencia Artificial</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
              Crea aplicaciones increíbles usando IA. Cursos 100% gratuitos impulsados por <strong>FEBAcode</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Button render={<Link href="/dashboard" />} size="lg" className="gradient-brand text-white border-0 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 transition-all h-12 px-8 text-base">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Ir a Mi Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => signInWithGoogle()}
                  className="gradient-brand text-white border-0 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 transition-all h-12 px-8 text-base"
                >
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Comenzar Gratis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              <Button
                render={<Link href="/cursos" />}
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base border-2"
              >
                  <Play className="h-4 w-4 mr-2" />
                  Explorar Cursos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card/50">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center animate-slide-up">
                <p className="text-3xl lg:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 px-3 py-1 text-xs font-medium"
            >
              Características
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-balance">
              Todo lo que necesitas para{" "}
              <span className="gradient-text">aprender</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Una plataforma completa diseñada para ofrecerte la mejor
              experiencia de aprendizaje.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border bg-card hover:bg-accent/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-brand opacity-[0.03]" />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-balance">
              ¿Listo para comenzar tu{" "}
              <span className="gradient-text">viaje de aprendizaje</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Únete a nuestra primera generación y descubre cómo la Inteligencia Artificial puede multiplicar tu velocidad de desarrollo. Todo nuestro contenido actual es gratuito.
            </p>
            {!user && (
              <Button
                size="lg"
                onClick={() => signInWithGoogle()}
                className="gradient-brand text-white border-0 shadow-lg shadow-brand/25 hover:shadow-xl transition-all h-12 px-10 text-base"
              >
                <GraduationCap className="h-5 w-5 mr-2" />
                Crear Cuenta Gratis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
