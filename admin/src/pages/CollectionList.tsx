import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, GripVertical, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useSearch } from "wouter";
import { api } from "@/lib/api";
import { categoryOptionsQuery, collectionQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { formatDate, timeAgo } from "@/lib/format";
import { plain, useSchema } from "@/lib/schema";
import type { Item } from "@/lib/types";
import { SortableList } from "@/components/Sortable";
import { Badge, Button, EmptyState, ErrorState, ListSkeleton, PageHeader, SearchInput, SegmentedControl, Spinner, StatusBadge } from "@/components/ui";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "pending", label: "Unpublished changes" },
] as const;

type Filter = (typeof FILTERS)[number]["key"];

function cell(item: Item, column: string, categories: Map<number, string>) {
  const v = item.values[column];
  if (column === "categoryNumber") return categories.get(Number(v)) ?? String(v ?? "—");
  if (column === "featured") return v ? <Badge tone="gold">Featured</Badge> : null;
  if (Array.isArray(v)) return v.map((x) => (x === "home" ? "Homepage" : x)).join(", ") || "—";
  return plain(v) || "—";
}

export default function CollectionList({ collectionKey }: { collectionKey: string }) {
  const schema = useSchema();
  const def = schema.data?.collections.find((c) => c.key === collectionKey);
  const { can } = useAuth();
  const qc = useQueryClient();
  const params = new URLSearchParams(useSearch());
  const [status, setStatus] = useState<Filter>(FILTERS.find((f) => f.key === params.get("status"))?.key ?? "all");
  const [q, setQ] = useState("");

  const list = useQuery({ ...collectionQuery<{ items: Item[]; total: number }>(collectionKey, status, q), enabled: !!def });
  const cats = useQuery({ ...categoryOptionsQuery<{ items: Item[] }>(), enabled: collectionKey === "services" });
  const categoryNames = new Map((cats.data?.items ?? []).map((c) => [Number(c.values.number), String(c.values.name)]));

  if (schema.isLoading) return <Spinner />;
  if (!def) return <EmptyState title="Unknown content type" />;

  const editable = can(def.adminOnly ? "structure.edit" : "content.edit");
  const manual = def.ordering === "manual";
  const filtered = !!q || status !== "all";
  const canReorder = editable && manual && !filtered && (list.data?.items.length ?? 0) > 1;

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
  const label = (name: string, fallback: string) => def.fields.find((f) => f.name === name)?.label ?? fallback;
  const newButton = editable && (
    <Link href={`/content/${collectionKey}/new`}>
      <Button variant="primary" icon={<Plus className="size-4" />}>
        New {def.singular.toLowerCase()}
      </Button>
    </Link>
  );

  const row = (item: Item, handle: React.ReactNode, index: number) => (
    <div className="group flex items-center gap-3 border-b border-neutral-100 bg-white px-3 py-3 transition-colors last:border-b-0 hover:bg-neutral-50 sm:px-4">
      {canReorder && <div className="-ml-1 w-6 shrink-0">{handle}</div>}
      {manual && !filtered && <span className="hidden w-5 shrink-0 sm:block text-right text-xs tabular-nums text-neutral-400">{index + 1}</span>}
      <Link href={`/content/${collectionKey}/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3 outline-offset-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{plain(item.values[def.titleField]) || <span className="text-neutral-400">Untitled</span>}</p>
          {def.subtitleField && def.subtitleField !== "categoryNumber" && <p className="mt-0.5 truncate text-[13px] text-neutral-500">{plain(item.values[def.subtitleField])}</p>}
        </div>
        {columns.map((c) => (
          <span key={c} className="hidden w-36 truncate text-[13px] text-neutral-600 md:block">
            {cell(item, c, categoryNames)}
          </span>
        ))}
        {def.publishable && (
          <div className="hidden w-48 shrink-0 justify-end sm:flex">
            <StatusBadge status={item.status} scheduled={item.scheduled} pending={item.hasPendingChanges} />
          </div>
        )}
        <p className="hidden w-24 shrink-0 text-right sm:block text-xs text-neutral-500" title={formatDate(item.updatedAt)}>
          {def.ordering === "publishedAt" && item.publishedAt ? formatDate(item.publishedAt) : timeAgo(item.updatedAt)}
        </p>
        <ChevronRight className="size-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500" aria-hidden />
      </Link>
    </div>
  );

  return (
    <>
      <PageHeader title={def.label} description={def.description} actions={newButton} />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {def.publishable && <SegmentedControl<Filter> label="Filter by status" value={status} onChange={setStatus} options={FILTERS} />}
        <SearchInput label={`Search ${def.label.toLowerCase()}`} placeholder={`Search ${def.label.toLowerCase()}`} value={q} onChange={setQ} className="w-full sm:ml-auto sm:w-72" />
      </div>

      {list.isLoading ? (
        <ListSkeleton />
      ) : list.error ? (
        <ErrorState error={list.error} retry={() => list.refetch()} />
      ) : !list.data?.items.length ? (
        <EmptyState title={filtered ? "Nothing matches" : `No ${def.label.toLowerCase()} yet`} action={!filtered && newButton}>
          {filtered ? "Try another search or filter." : `Create the first ${def.singular.toLowerCase()} to see it here.`}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
          <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-[11.5px] font-medium uppercase tracking-[0.04em] text-neutral-500 sm:px-4" aria-hidden>
            {canReorder && <span className="-ml-1 w-6 shrink-0" />}
            {manual && !filtered && <span className="hidden w-5 shrink-0 text-right sm:block">#</span>}
            <span className="flex-1">{label(def.titleField, "Title")}</span>
            {columns.map((c) => (
              <span key={c} className="hidden w-36 truncate md:block">
                {label(c, c)}
              </span>
            ))}
            {def.publishable && <span className="hidden w-48 shrink-0 text-right sm:block">Status</span>}
            <span className="hidden w-24 shrink-0 text-right sm:block">{def.ordering === "publishedAt" ? "Published" : "Updated"}</span>
            <span className="w-4 shrink-0" />
          </div>
          <SortableList items={list.data.items} getId={(i) => i.id} onReorder={reorder} disabled={!canReorder}>
            {(item, handle, i) => row(item, handle, i)}
          </SortableList>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 bg-neutral-50 px-4 py-2.5 text-xs text-neutral-500">
            <span>
              {list.data.total} {list.data.total === 1 ? "item" : "items"}
              {filtered && " found"}
            </span>
            {canReorder && (
              <span className="inline-flex items-center gap-1">
                <GripVertical className="size-3.5" aria-hidden /> Drag to change the order on the website
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
