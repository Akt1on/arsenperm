import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin } from "lucide-react";
import { fetchProject, fetchProjectPhotos } from "@/lib/site-data";
import { CallbackForm } from "@/components/site/CallbackForm";

const BASE = "https://permasfalt59.ru";

export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ params }) => ({ project: await fetchProject(params.slug) }),
  component: ProjectPage,
});

function ProjectPage() {
  const { slug } = useParams({ from: "/portfolio/$slug" });
  const { data: project, isLoading } = useQuery({ queryKey: ["project", slug], queryFn: () => fetchProject(slug) });
  const { data: photos = [] } = useQuery({
    queryKey: ["project-photos", project?.id], queryFn: () => fetchProjectPhotos(project!.id), enabled: !!project?.id,
  });

  if (isLoading) return <div className="container-x py-32 text-center text-muted-foreground">Загрузка…</div>;
  if (!project) return <div className="container-x py-32 text-center">Проект не найден. <Link to="/portfolio" className="text-primary">К портфолио</Link></div>;

  const allPhotos = [
    ...(project.cover_image ? [{ id: "cover", image_url: project.cover_image, caption: project.title }] : []),
    ...photos,
  ];

  return (
    <>
      <nav aria-label="Хлебные крошки" className="container-x pt-6 pb-0">
        <ol className="flex items-center gap-2 text-xs text-muted-foreground">
          <li><Link to="/" className="hover:text-primary transition">Главная</Link></li>
          <span>/</span>
          <li><Link to="/portfolio" className="hover:text-primary transition">Портфолио</Link></li>
          <span>/</span>
          <li className="text-foreground truncate max-w-[200px]">{project.title}</li>
        </ol>
      </nav>

      <section className="relative overflow-hidden -mt-24 pt-32 pb-12">
        {project.cover_image && (
          <div className="absolute inset-0">
            <img
              src={project.cover_image}
              alt={`${project.title} — ${project.category ?? "проект"} в ${project.location ?? "Перми"}`}
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          </div>
        )}
        <div className="container-x relative z-10 pt-16">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4" /> Все объекты
          </Link>
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">{project.category}</div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">{project.title}</h1>
          {project.location && <div className="mt-4 flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {project.location}</div>}
        </div>
      </section>

      <section className="py-16">
        <div className="container-x grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {project.description && (
              <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] p-8 mb-8">
                <h2 className="font-display text-2xl font-bold mb-4">Описание объекта</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
              </div>
            )}
            {allPhotos.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {allPhotos.map((ph, idx) => (
                  <a key={ph.id} href={ph.image_url} target="_blank" rel="noreferrer" className="group block bg-white rounded-xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
                    <img
                      src={ph.image_url}
                      alt={ph.caption ?? `${project.title} — фото ${idx + 1}`}
                      className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      width={600}
                      height={450}
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
          <aside>
            <div className="bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] p-7 sticky top-28">
              <h3 className="font-display text-xl font-bold mb-4">Хотите похожий результат?</h3>
              <p className="text-sm text-muted-foreground mb-5">Оставьте заявку — посчитаем под ваш объект.</p>
              <CallbackForm source={`project:${project.slug}`} compact />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
