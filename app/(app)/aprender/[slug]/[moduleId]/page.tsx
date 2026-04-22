import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronLeft, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { unstable_cache } from "next/cache";

export const metadata = {
  title: "Aprender | FEBAcademy",
};

export default async function LearnModulePage(
  props: {
    params: Promise<{ slug: string; moduleId: string }>;
  }
) {
  const params = await props.params;
  const { slug, moduleId } = params;
  const supabase = await createClient();

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Get Course details by slug
  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("slug", slug)
    .single<any>();

  if (!course) notFound();

  // 3. Verify Enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", course.id)
    .eq("user_id", user.id)
    .single<any>();

  if (!enrollment) {
    // TODO: allow instructor
    redirect(`/cursos/${slug}`);
  }

  // 4. Fetch the full course curriculum (Cached for performance)
  const getCurriculum = unstable_cache(
    async (cid: string) => {
      // Usar un cliente anónimo sin cookies para que unstable_cache no falle
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      const anonSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: sections } = await anonSupabase
        .from("course_sections")
        .select("*")
        .eq("course_id", cid)
        .order("sort_order") as any;

      const { data: modules } = await anonSupabase
        .from("modules")
        .select("id, section_id, title, is_published, content_type, youtube_video_id, sort_order")
        .eq("course_id", cid)
        .eq("is_published", true)
        .order("sort_order") as any;
        
      return { sections, modules };
    },
    [`curriculum-${course.id}`],
    { revalidate: 60, tags: [`course-${course.id}-modules`] }
  );

  const { sections, modules } = await getCurriculum(course.id);

  if (!sections || !modules) notFound();

  // 5. Fetch current module details
  const { data: currentModule } = await supabase
    .from("modules")
    .select("*")
    .eq("id", moduleId)
    .single<any>();

  if (!currentModule || !currentModule.is_published) {
    // If invalid module, redirect to course entry which handles finding a valid one
    redirect(`/aprender/${slug}`);
  }

  // Define sidebar content
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver al Dashboard
        </Link>
        <h2 className="font-bold text-lg leading-tight">{course.title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sections.map((section: any) => {
          const sectionModules = modules.filter((m: any) => m.section_id === section.id);
          if (sectionModules.length === 0) return null;
          
          return (
            <div key={section.id} className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {sectionModules.map((mod: any) => {
                  const isActive = mod.id === moduleId;
                  // TODO: Fetch real progress
                  const isCompleted = false; 
                  
                  return (
                    <Link
                      key={mod.id}
                      href={`/aprender/${slug}/${mod.id}`}
                      className={`flex items-start gap-3 p-2 rounded-md transition-colors text-sm ${
                        isActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="line-clamp-2">{mod.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 border-r bg-card shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="font-medium truncate mr-4">{course.title}</div>
          <Sheet>
            <SheetTrigger className="p-2 border rounded-md">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Video Player & Info */}
        <div className="flex-1 w-full max-w-5xl mx-auto p-4 lg:p-8">
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg border mb-6">
            {currentModule.youtube_video_id ? (
              <iframe
                src={`https://www.youtube.com/embed/${currentModule.youtube_video_id}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Contenido no disponible en formato de video.
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold">{currentModule.title}</h1>
            <Button className="shrink-0 w-full md:w-auto">
              Marcar como completado
            </Button>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            {/* Description or Text Content can go here */}
          </div>
        </div>
      </main>
    </div>
  );
}
