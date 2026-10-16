import { useQuery } from "@tanstack/react-query";
import { BookOpen, Briefcase, FolderKanban, Home, ImagePlus, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime, timeAgo } from "@/lib/format";
import { Badge, Card, ErrorState, PageHeader, Spinner } from "@/components/ui";

interface DashboardData {
  counts: { key: string; label: string; publishable: boolean; draft: number; published: number; scheduled: number; pending: number }[];
  media: number;
  pagesPending: { id: string; title: string; updatedAt: string }[];
  scheduled: { id: string; title: string; publishedAt: string }[];
  recent: { id: string; action: string; summary: string; createdAt: string; user: string | null; entityType: string | null; entityId: string | null }[];
  rebuild: { configured: boolean; lastTriggeredAt: string | null; lastError: string | null; pending: boolean };
}

const quick = [
  { href: "/content/blogPosts/new", label: "Write an article", icon: BookOpen },
  { href: "/content/projects/new", label: "Add a project", icon: FolderKanban },
  { href: "/content/jobs/new", label: "Post a job", icon: Briefcase },
  { href: "/pages", label: "Edit pages", icon: Home },
  { href: "/media", label: "Upload media", icon: ImagePlus },
];

/** Where an activity entry links to, when the thing still exists. */
function activityHref(r: DashboardData["recent"][number]) {
  if (!r.entityType || !r.entityId || r.action.endsWith(".delete")) return null;
  if (r.entityType === "page") return `/pages/${r.entityId}`;
  if (r.entityType === "setting") return `/settings/${r.entityId}`;
  if (r.entityType === "media") return "/media";
  if (r.entityType === "user") return null;
  return `/content/${r.entityType}/${r.entityId}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => api<DashboardData>("/api/admin/dashboard") });

  return (
    <>
      <PageHeader title={`Hello, ${user?.name.split(" ")[0] ?? "there"}`} description="What's on the website, what's waiting to be published, and what changed recently." />
      <div className="mb-6 flex flex-wrap gap-2">
        {quick.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium hover:border-accent-dark">
            <Icon className="size-4 text-accent-dark" aria-hidden /> {label}
          </Link>
        ))}
      </div>

      {q.isLoading ? (
        <Spinner />
      ) : q.error ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : q.data ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title="Content">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {q.data.counts.map((c) => (
                  <li key={c.key}>
                    <Link href={`/content/${c.key}`} className="block rounded-lg border border-neutral-200 p-3 hover:border-accent-dark">
                      <p className="text-[13px] text-neutral-500">{c.label}</p>
                      <p className="text-2xl font-semibold tabular-nums">{c.published + c.scheduled + c.draft}</p>
                      {c.publishable && (
                        <p className="mt-1 flex flex-wrap gap-1">
                          {c.draft > 0 && <Badge>{c.draft} draft</Badge>}
                          {c.scheduled > 0 && <Badge tone="blue">{c.scheduled} scheduled</Badge>}
                          {c.pending > 0 && <Badge tone="amber">{c.pending} with changes</Badge>}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/media" className="block rounded-lg border border-neutral-200 p-3 hover:border-accent-dark">
                    <p className="text-[13px] text-neutral-500">Media files</p>
                    <p className="text-2xl font-semibold tabular-nums">{q.data.media}</p>
                  </Link>
                </li>
              </ul>
            </Card>

            <Card title="Recent changes">
              {!q.data.recent.length ? (
                <p className="text-sm text-neutral-500">No changes yet.</p>
              ) : (
                <ol className="divide-y divide-neutral-100">
                  {q.data.recent.map((r) => {
                    const href = activityHref(r);
                    return (
                      <li key={r.id} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                        <span className="min-w-0">
                          {href ? (
                            <Link href={href} className="hover:underline">
                              {r.summary}
                            </Link>
                          ) : (
                            r.summary
                          )}
                          <span className="text-neutral-500"> · {r.user ?? "System"}</span>
                        </span>
                        <time dateTime={r.createdAt} title={formatDateTime(r.createdAt)} className="shrink-0 text-xs text-neutral-500">
                          {timeAgo(r.createdAt)}
                        </time>
                      </li>
                    );
                  })}
                </ol>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Waiting to publish">
              {!q.data.pagesPending.length && !q.data.counts.some((c) => c.pending || c.draft) ? (
                <p className="text-sm text-neutral-500">Everything is published.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {q.data.pagesPending.map((p) => (
                    <li key={p.id}>
                      <Link href={`/pages/${p.id}`} className="hover:underline">
                        Page: {p.title}
                      </Link>
                      <span className="text-neutral-500"> · {timeAgo(p.updatedAt)}</span>
                    </li>
                  ))}
                  {q.data.counts
                    .filter((c) => c.pending || c.draft)
                    .map((c) => (
                      <li key={c.key}>
                        <Link href={`/content/${c.key}?status=${c.pending ? "pending" : "draft"}`} className="hover:underline">
                          {c.label}
                        </Link>
                        <span className="text-neutral-500">
                          {" "}
                          · {[c.draft && `${c.draft} draft${c.draft === 1 ? "" : "s"}`, c.pending && `${c.pending} with changes`].filter(Boolean).join(", ")}
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </Card>

            <Card title="Scheduled articles">
              {!q.data.scheduled.length ? (
                <p className="text-sm text-neutral-500">Nothing scheduled.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {q.data.scheduled.map((s) => (
                    <li key={s.id}>
                      <Link href={`/content/blogPosts/${s.id}`} className="hover:underline">
                        {s.title}
                      </Link>
                      <p className="text-xs text-neutral-500">{formatDateTime(s.publishedAt)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card
              title={
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="size-4" aria-hidden /> Search-engine pages
                </span>
              }
            >
              {q.data.rebuild.configured ? (
                <p className="text-sm text-neutral-600">
                  {q.data.rebuild.pending
                    ? "A rebuild is queued and starts within a minute of your last change."
                    : q.data.rebuild.lastTriggeredAt
                      ? `Last rebuilt ${timeAgo(q.data.rebuild.lastTriggeredAt)}.`
                      : "Rebuilds automatically after you publish."}
                  {q.data.rebuild.lastError && <span className="mt-1 block text-red-600">Last rebuild failed: {q.data.rebuild.lastError}</span>}
                </p>
              ) : (
                <p className="text-sm text-neutral-600">Changes show on the site straight away. Titles and descriptions that search engines and link previews read refresh on the next site deploy (no deploy hook is set up).</p>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
