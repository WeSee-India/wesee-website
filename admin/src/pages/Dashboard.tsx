import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpen, Briefcase, CalendarClock, CheckCircle2, ChevronRight, CircleDashed, Clock, FileText, FolderKanban, Home, RefreshCw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "wouter";
import { dashboardQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { formatDateTime, timeAgo } from "@/lib/format";
import { navGroups } from "@/components/nav";
import { Avatar, Badge, Card, cx, ErrorState, PageHeader, Skeleton } from "@/components/ui";

interface DashboardData {
  counts: { key: string; label: string; publishable: boolean; draft: number; published: number; scheduled: number; pending: number }[];
  media: number;
  pagesPending: { id: string; title: string; updatedAt: string }[];
  scheduled: { id: string; title: string; publishedAt: string }[];
  recent: { id: string; action: string; summary: string; createdAt: string; user: string | null; entityType: string | null; entityId: string | null }[];
  rebuild: { configured: boolean; lastTriggeredAt: string | null; lastError: string | null; pending: boolean };
}

const quick: { href: string; label: string; hint: string; icon: LucideIcon }[] = [
  { href: "/content/blogPosts/new", label: "Write an article", hint: "Blog", icon: BookOpen },
  { href: "/content/projects/new", label: "Add a project", hint: "Portfolio", icon: FolderKanban },
  { href: "/content/jobs/new", label: "Post a job", hint: "Careers", icon: Briefcase },
  { href: "/pages", label: "Edit pages", hint: "Website", icon: Home },
];

const iconFor = (key: string): LucideIcon => navGroups.flatMap((g) => g.items).find((i) => i.href === `/content/${key}`)?.icon ?? FileText;

/** Where an activity entry links to, when the thing still exists. */
function activityHref(r: DashboardData["recent"][number]) {
  if (!r.entityType || !r.entityId || r.action.endsWith(".delete")) return null;
  if (r.entityType === "page") return `/pages/${r.entityId}`;
  if (r.entityType === "setting") return `/settings/${r.entityId}`;
  if (r.entityType === "user") return null;
  return `/content/${r.entityType}/${r.entityId}`;
}

const today = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" });

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Stat({ label, value, icon: Icon, tone, href, note }: { label: string; value: number; icon: LucideIcon; tone: string; href?: string; note?: ReactNode }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-neutral-500">{label}</p>
        <span className={cx("flex size-8 items-center justify-center rounded-lg", tone)}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      {note && <p className="mt-2 text-xs text-neutral-500">{note}</p>}
    </>
  );
  const cls = "block rounded-xl border border-neutral-200 bg-white p-4 shadow-card transition-colors";
  return href ? (
    <Link href={href} className={cx(cls, "hover:border-neutral-300 hover:bg-neutral-50/60")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[108px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const q = useQuery(dashboardQuery<DashboardData>());
  const d = q.data;

  const sum = (k: "draft" | "published" | "scheduled" | "pending") => d?.counts.reduce((n, c) => n + c[k], 0) ?? 0;
  const waiting = d ? d.pagesPending.length + d.counts.filter((c) => c.pending || c.draft).length : 0;

  return (
    <>
      <PageHeader
        title={
          <>
            <span className="mb-1 block text-[13px] font-medium tracking-normal text-accent-ink">{today.format(new Date())}</span>
            {greeting()}, {user?.name.split(" ")[0] ?? "there"}
          </>
        }
        description="What's on the website, what's waiting to be published, and what changed recently."
      />

      <ul className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {quick.map(({ href, label, hint, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="group flex h-full items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-xs transition-colors hover:border-accent/60 hover:bg-accent-soft/40">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink ring-1 ring-inset ring-accent/20">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[13.5px] font-medium">{label}</span>
                <span className="block text-xs text-neutral-500">{hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {q.isLoading ? (
        <DashboardSkeleton />
      ) : q.error ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : d ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Stat label="Live on the website" value={sum("published")} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" note="Published items across all content" />
            <Stat label="Drafts" value={sum("draft")} icon={CircleDashed} tone="bg-neutral-100 text-neutral-600" note="Not on the website yet" />
            <Stat label="Waiting to publish" value={sum("pending") + d.pagesPending.length} icon={Clock} tone="bg-amber-50 text-amber-600" note="Saved changes not live yet" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card title="Content" description="Everything the website is built from" flush>
                <ul className="divide-y divide-neutral-100">
                  {d.counts.map((c) => {
                    const Icon = iconFor(c.key);
                    const total = c.published + c.scheduled + c.draft;
                    return (
                      <li key={c.key}>
                        <Link href={`/content/${c.key}`} className="group flex items-center gap-3 px-4 py-3 hover:bg-neutral-50">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:text-accent-dark group-hover:ring-1 group-hover:ring-neutral-200">
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.label}</span>
                          {c.publishable && (
                            <span className="hidden flex-wrap justify-end gap-1 sm:flex">
                              {c.draft > 0 && <Badge>{c.draft} draft</Badge>}
                              {c.scheduled > 0 && <Badge tone="blue">{c.scheduled} scheduled</Badge>}
                              {c.pending > 0 && <Badge tone="amber">{c.pending} with changes</Badge>}
                            </span>
                          )}
                          <span className="w-10 text-right text-sm font-semibold tabular-nums">{total}</span>
                          <ChevronRight className="size-4 text-neutral-300 group-hover:text-neutral-500" aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card
                title="Recent changes"
                description="The latest edits by everyone"
                actions={
                  <Link href="/activity" className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-500 hover:text-ink">
                    View all <ArrowUpRight className="size-3.5" aria-hidden />
                  </Link>
                }
                flush
              >
                {!d.recent.length ? (
                  <p className="px-4 py-8 text-center text-sm text-neutral-500">No changes yet.</p>
                ) : (
                  <ol className="px-4 py-2">
                    {d.recent.map((r, i) => {
                      const href = activityHref(r);
                      return (
                        <li key={r.id} className="relative flex gap-3 py-2.5">
                          {i < d.recent.length - 1 && <span className="absolute left-3 top-9 -bottom-1 w-px bg-neutral-200" aria-hidden />}
                          <Avatar name={r.user ?? "System"} size="sm" className="relative mt-0.5" />
                          <div className="min-w-0 flex-1 text-sm">
                            <p className="text-neutral-800">
                              {href ? (
                                <Link href={href} className="hover:underline hover:underline-offset-2">
                                  {r.summary}
                                </Link>
                              ) : (
                                r.summary
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500">
                              {r.user ?? "System"} ·{" "}
                              <time dateTime={r.createdAt} title={formatDateTime(r.createdAt)}>
                                {timeAgo(r.createdAt)}
                              </time>
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Waiting to publish" icon={<Clock />} actions={waiting > 0 && <Badge tone="amber">{waiting}</Badge>} flush>
                {!waiting ? (
                  <p className="flex items-center gap-2 px-4 py-4 text-sm text-neutral-500">
                    <CheckCircle2 className="size-4 text-emerald-500" aria-hidden /> Everything is published.
                  </p>
                ) : (
                  <ul className="divide-y divide-neutral-100 text-sm">
                    {d.pagesPending.map((p) => (
                      <li key={p.id}>
                        <Link href={`/pages/${p.id}`} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-neutral-50">
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{p.title}</span>
                            <span className="text-xs text-neutral-500">Page · edited {timeAgo(p.updatedAt)}</span>
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-neutral-300" aria-hidden />
                        </Link>
                      </li>
                    ))}
                    {d.counts
                      .filter((c) => c.pending || c.draft)
                      .map((c) => (
                        <li key={c.key}>
                          <Link href={`/content/${c.key}?status=${c.pending ? "pending" : "draft"}`} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-neutral-50">
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{c.label}</span>
                              <span className="text-xs text-neutral-500">{[c.draft && `${c.draft} draft${c.draft === 1 ? "" : "s"}`, c.pending && `${c.pending} with changes`].filter(Boolean).join(", ")}</span>
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-neutral-300" aria-hidden />
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </Card>

              <Card title="Scheduled articles" icon={<CalendarClock />} flush>
                {!d.scheduled.length ? (
                  <p className="px-4 py-4 text-sm text-neutral-500">Nothing scheduled.</p>
                ) : (
                  <ul className="divide-y divide-neutral-100 text-sm">
                    {d.scheduled.map((s) => (
                      <li key={s.id}>
                        <Link href={`/content/blogPosts/${s.id}`} className="block px-4 py-2.5 hover:bg-neutral-50">
                          <span className="block truncate font-medium">{s.title}</span>
                          <span className="text-xs text-sky-700">{formatDateTime(s.publishedAt)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card
                title="Search-engine pages"
                icon={<RefreshCw />}
                actions={
                  d.rebuild.configured &&
                  (d.rebuild.lastError ? (
                    <Badge tone="red" dot>
                      Failed
                    </Badge>
                  ) : d.rebuild.pending ? (
                    <Badge tone="blue" dot>
                      Queued
                    </Badge>
                  ) : (
                    <Badge tone="green" dot>
                      Up to date
                    </Badge>
                  ))
                }
              >
                {d.rebuild.configured ? (
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {d.rebuild.pending
                      ? "A rebuild is queued and starts within a minute of your last change."
                      : d.rebuild.lastTriggeredAt
                        ? `Last rebuilt ${timeAgo(d.rebuild.lastTriggeredAt)}.`
                        : "Rebuilds automatically after you publish."}
                    {d.rebuild.lastError && <span className="mt-1 block text-red-600">Last rebuild failed: {d.rebuild.lastError}</span>}
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-neutral-600">Changes show on the site straight away. Titles and descriptions that search engines and link previews read refresh on the next site deploy (no deploy hook is set up).</p>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
