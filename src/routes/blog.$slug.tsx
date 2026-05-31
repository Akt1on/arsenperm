import { createFileRoute, Link, useParams, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { CallbackForm } from "@/components/site/CallbackForm";
import { fetchPost } from "@/lib/site-data";

const BASE = "https://permasfalt59.ru";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPost(params.slug);
    if (!post || !post.is_published) throw notFound();
    return { post };
  },
  notFoundComponent: () => (
    <div className="container-x py-32 text-center">
      Статья не найдена. <Link to="/blog" className="text-primary">В блог</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-x py-32 text-center text-muted-foreground">{error.message}</div>
  ),
  component: PostPage,
});

function PostPage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const { data: post } = useQuery({ queryKey: ["post", slug], queryFn: () => fetchPost(slug) });
  const initial = Route.useLoaderData().post;
  const p = post ?? initial;

  return (
    <main>
      <article className="container-x py-12 max-w-3xl" itemScope itemType="https://schema.org/Article">
        <nav aria-label="Хлебные крошки" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <Link to="/" itemProp="item" className="hover:text-primary transition"><span itemProp="name">Главная</span></Link>
              <meta itemProp="position" content="1" />
            </li>
            <span>/</span>
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <Link to="/blog" itemProp="item" className="hover:text-primary transition"><span itemProp="name">Блог</span></Link>
              <meta itemProp="position" content="2" />
            </li>
            <span>/</span>
            <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
              <span itemProp="name" className="text-foreground truncate max-w-[200px]">{p.title}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> К списку статей
        </Link>
        <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest mb-4">
          {p.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time itemProp="datePublished" dateTime={new Date(p.published_at).toISOString()}>
                {new Date(p.published_at).toLocaleDateString("ru-RU")}
              </time>
            </span>
          )}
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.read_minutes} мин чтения</span>
        </div>
        <h1 itemProp="headline" className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">{p.title}</h1>
        {p.excerpt && <p itemProp="description" className="text-xl text-muted-foreground mb-8 leading-relaxed">{p.excerpt}</p>}
        {p.cover_image && (
          <img
            itemProp="image"
            src={p.cover_image}
            alt={p.title}
            className="w-full aspect-video object-cover rounded-2xl mb-10"
            loading="lazy"
            width={800}
            height={450}
          />
        )}
        {p.content && (
          <div
            itemProp="articleBody"
            className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: renderContent(p.content) }}
          />
        )}
        <meta itemProp="author" content="Пермь Асфальт 59" />
        <meta itemProp="publisher" content="Пермь Асфальт 59" />
        <div className="mt-16 bg-white rounded-2xl border border-border shadow-[var(--shadow-card)] p-7">
          <h3 className="font-display text-2xl font-bold mb-2">Нужен расчёт по вашему объекту?</h3>
          <p className="text-sm text-muted-foreground mb-5">Замер и смета — бесплатно. Перезвоним в течение 15 минут.</p>
          <CallbackForm source={`blog:${slug}`} />
        </div>
      </article>
    </main>
  );
}

function renderContent(src: string): string {
  const lines = src.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const flushList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) { flushList(); continue; }
    if (l.startsWith("### ")) { flushList(); out.push(`<h3>${inline(l.slice(4))}</h3>`); continue; }
    if (l.startsWith("## ")) { flushList(); out.push(`<h2>${inline(l.slice(3))}</h2>`); continue; }
    if (l.startsWith("# ")) { flushList(); out.push(`<h1>${inline(l.slice(2))}</h1>`); continue; }
    if (l.startsWith("- ") || l.startsWith("* ")) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(l.slice(2))}</li>`);
      continue;
    }
    flushList();
    // Не пропускаем сырой HTML — рендерим как текст для защиты от XSS
    out.push(`<p>${inline(l)}</p>`);
  }
  flushList();
  return out.join("\n");
}
function inline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}
