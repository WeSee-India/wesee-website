import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useSearch } from "wouter";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, timeAgo } from "@/lib/format";
import { plain, useSchema } from "@/lib/schema";
import type { Item } from "@/lib/types";
import { SortableList } from "@/components/Sortable";
import { Badge, Button, cx, EmptyState, ErrorState, Input, PageHeader, Spinner, StatusBadge } from "@/components/ui";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "pending", label: "With unpublished changes" },
] as const;

function cell(item: Item, column: string, categories: Map<number, string>) {
  const v = item.values[column];
  if (column === "categoryNumber") return categories.get(Number(v)) ?? String(v ?? "—");
  if (column === "featured") return v ? <Badge tone="blue">Featured</Badge> : null;
  if (Array.isArray(v)) return v.map((x) => (x === "home" ? "Homepage" : x)).join(", ") || "—";
  return plain(v) || "—";
}

export default function CollectionList({ collectionKey }: { collectionKey: string }) {
  const schema = useSchema();
  const def = schema.data?.collections.find((c) => c.key === collectionKey);
  const { can } = useAuth();
  const qc = useQueryClient();
  const params = new URLSearchParams(useSearch());
  const [status, setStatus] = useState<string>(params.get("status") ?? "all");
  const [q, setQ] = useState("");

  const list = useQuery({
    queryKey: ["collection", collectionKey, status, q],
    queryFn: () => api<{ items: Item[]; total: number }>(`/api/admin/collections/${collectionKey}?take=500&status=${status}${q ? `&q=${encodeURIComponent(q)}` : ""}`),
    enabled: !!def,
  });
  const cats = useQuery({
    queryKey: ["collection", "serviceCategories", "options"],
    queryFn: () => api<{ items: Item[] }>("/api/admin/collections/serviceCategories?take=500"),
    enabled: collectionKey === "services",
  });
  const categoryNames = new Map((cats.data?.items ?? []).map((c) => [Number(c.values.number), String(c.values.name)]));

  if (schema.isLoading) return <Spinner />;
  if (!def) return <EmptyState title="Unknown content type" />;

  const editable = can(def.adminOnly ? "structure.edit" : "content.edit");
  const canReorder = editable && def.ordering === "manual" && status === "all" && !q && (list.data?.items.length ?? 0) > 1;

  const reorder = async (next: Item[]) => {
    const key = ["collection", collectionKey, status, q];
    const previous = qc.getQueryData(key);
    qc.setQueryData(key, { items: next, total: next.length });
    try {
      await api(`/api/admin/collections/${collectionKey}/reorder`, { method: "POST", body: { ids: next.map((i) => i.id) } });
      toast.success("Order saved. The website shows the new order.");
    } catch (err) {
      qc.setQueryData(key, previous);
      toast.error((err as Error).message);
    }
  };

  const columns = def.listColumns ?? [];

  const row = (item: Item, handle: React.ReactNode) => (
    <div className="flex items-center gap-2 border-b border-neutral-100 bg-white px-2 py-2.5 last:border-b-0 hover:bg-neutral-50">
      <div className="w-6 shrink-0">{handle}</div>
      <Link href={`/content/${collectionKey}/${item.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{plain(item.values[def.titleField]) || "Untitled"}</p>
        {def.subtitleField && def.subtitleField !== "categoryNumber" && <p className="truncate text-[13px] text-neutral-500">{plain(item.values[def.subtitleField])}</p>}
      </Link>
      <div className="hidden min-w-0 items-center gap-4 text-[13px] text-neutral-600 md:flex">
        {columns.map((c) => (
          <span key={c} className="w-32 truncate">
            {cell(item, c, categoryNames)}
          </span>
        ))}
      </div>
      <div className="w-44 shrink-0 text-right">
        {def.publishable ? <StatusBadge status={item.status} scheduled={item.scheduled} pending={item.hasPendingChanges} /> : null}
        <p className="mt-0.5 text-xs text-neutral-500" title={formatDate(item.updatedAt)}>
          {def.ordering === "publishedAt" && item.publishedAt ? formatDate(item.publishedAt) : `Edited ${timeAgo(item.updatedAt)}`}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title={def.label}
        description={def.description}
        actions={
          editable && (
            <Link href={`/content/${collectionKey}/new`}>
              <Button variant="primary" icon={<Plus className="size-4" />}>
                New {def.singular.toLowerCase()}
              </Button>
            </Link>
          )
        }
      />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {def.publishable && (
          <div className="inline-flex rounded-lg bg-neutral-200/60 p-0.5" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" aria-pressed={status === f.key} onClick={() => setStatus(f.key)} className={cx("rounded-md px-2.5 py-1 text-[13px]", status === f.key ? "bg-white font-medium shadow-sm" : "text-neutral-600")}>
                {f.label}
              </button>
            ))}
          </div>
        )}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-neutral-400" aria-hidden />
          <Input aria-label={`Search ${def.label.toLowerCase()}`} placeholder="Search" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {canReorder && <p className="mb-2 text-xs text-neutral-500">Drag the handles to change the order on the website.</p>}

      {list.isLoading ? (
        <Spinner />
      ) : list.error ? (
        <ErrorState error={list.error} retry={() => list.refetch()} />
      ) : !list.data?.items.length ? (
        <EmptyState title={q || status !== "all" ? "Nothing matches" : `No ${def.label.toLowerCase()} yet`}>{q || status !== "all" ? "Try another search or filter." : undefined}</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <SortableList items={list.data.items} getId={(i) => i.id} onReorder={reorder} disabled={!canReorder}>
            {(item, handle) => row(item, handle)}
          </SortableList>
        </div>
      )}
      {list.data && <p className="mt-2 text-xs text-neutral-500">{list.data.total} total</p>}
    </>
  );
}
