import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime, toLocalInput } from "@/lib/format";
import { emptyValues, plain, useSchema } from "@/lib/schema";
import type { CollectionDef, Item, Values } from "@/lib/types";
import { useUnsavedChanges } from "@/lib/unsaved";
import { Fields } from "@/components/fields/FieldRenderer";
import { RevisionsPanel } from "@/components/Revisions";
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, FieldShell, Input, PageHeader, Spinner, StatusBadge } from "@/components/ui";

export default function CollectionEdit({ collectionKey, id }: { collectionKey: string; id: string }) {
  const schema = useSchema();
  const def = schema.data?.collections.find((c) => c.key === collectionKey);
  const isNew = id === "new";
  const item = useQuery({
    queryKey: ["item", collectionKey, id],
    queryFn: () => api<Item>(`/api/admin/collections/${collectionKey}/${id}`),
    enabled: !!def && !isNew,
  });

  if (schema.isLoading || (!isNew && item.isLoading)) return <Spinner />;
  if (!def) return <EmptyState title="Unknown content type" />;
  if (item.error) return <ErrorState error={item.error} retry={() => item.refetch()} />;
  return <Editor key={`${id}-${item.data?.updatedAt ?? "new"}`} def={def} item={isNew ? null : item.data!} siteUrl={schema.data!.siteUrl} />;
}

function Editor({ def, item, siteUrl }: { def: CollectionDef; item: Item | null; siteUrl: string }) {
  const { can } = useAuth();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const initial = useMemo<Values>(() => item?.values ?? { ...emptyValues(def.fields), ...(def.slugFrom ? { slug: "" } : {}) }, [item, def]);
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [publishAt, setPublishAt] = useState(toLocalInput(item?.scheduled ? item.publishedAt : null));

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  useUnsavedChanges(dirty);

  const editable = can(def.adminOnly ? "structure.edit" : "content.edit");
  const live = item?.status === "PUBLISHED";
  const title = plain(values[def.titleField]) || `New ${def.singular.toLowerCase()}`;
  const base = `/api/admin/collections/${def.key}`;

  // Keyboard save.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirty && !busy) void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const refresh = (next: Item) => {
    qc.setQueryData(["item", def.key, next.id], next);
    qc.invalidateQueries({ queryKey: ["collection", def.key] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["revisions"] });
  };

  async function run<T>(label: string, fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(label);
    try {
      return await fn();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields);
        toast.error(err.message);
      } else toast.error("Something went wrong.");
      return undefined;
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setErrors({});
    const res = await run("save", () => (item ? api<Item>(`${base}/${item.id}`, { method: "PUT", body: values }) : api<Item>(base, { method: "POST", body: values })));
    if (!res) return;
    if (!item) {
      toast.success(def.publishable ? "Draft created. Publish it when it's ready." : `${def.singular} created.`);
      navigate(`/content/${def.key}/${res.id}`, { replace: true });
    } else {
      toast.success(res.hasPendingChanges ? "Changes saved. They go live when you publish." : live || !def.publishable ? "Saved. The website is updated." : "Draft saved.");
    }
    refresh(res);
  }

  async function publish() {
    if (!item) return;
    if (dirty) {
      const saved = await run("publish", () => api<Item>(`${base}/${item.id}`, { method: "PUT", body: values }));
      if (!saved) return;
    }
    const when = publishAt ? new Date(publishAt) : null;
    const res = await run("publish", () => api<Item>(`${base}/${item.id}/publish`, { method: "POST", body: { publishAt: when?.toISOString() ?? null } }));
    if (!res) return;
    toast.success(res.scheduled ? `Scheduled for ${formatDateTime(res.publishedAt)}.` : "Published. It's live on the website.");
    refresh(res);
  }

  async function action(name: "unpublish" | "discard", message: string) {
    if (!item) return;
    const res = await run(name, () => api<Item>(`${base}/${item.id}/${name}`, { method: "POST" }));
    if (res) {
      toast.success(message);
      refresh(res);
    }
  }

  async function preview() {
    if (!item) return;
    if (dirty) {
      const saved = await run("preview", () => api<Item>(`${base}/${item.id}`, { method: "PUT", body: values }));
      if (!saved) return;
      refresh(saved);
    }
    const res = await run("preview", () => api<{ url: string }>(`${base}/${item.id}/preview`, { method: "POST" }));
    if (res) window.open(res.url, "_blank", "noopener");
  }

  const back = (
    <Link href={`/content/${def.key}`} className="mb-2 inline-flex items-center gap-1 text-[13px] text-neutral-500 hover:text-ink">
      <ArrowLeft className="size-3.5" /> {def.label}
    </Link>
  );

  const errorCount = Object.keys(errors).length;

  return (
    <>
      <PageHeader
        back={back}
        title={title}
        description={item ? <StatusBadge status={item.status} scheduled={item.scheduled} pending={item.hasPendingChanges} /> : undefined}
        actions={
          <>
            {item && def.hasPublicPage && def.publishable && (
              <Button icon={<Eye className="size-4" />} onClick={preview} loading={busy === "preview"}>
                Preview
              </Button>
            )}
            {editable && (
              <Button variant={def.publishable && item ? "secondary" : "primary"} onClick={save} loading={busy === "save"} disabled={!dirty && !!item}>
                {item ? (live && def.publishable ? "Save changes" : "Save") : def.publishable ? "Create draft" : "Create"}
              </Button>
            )}
          </>
        }
      />

      {errorCount > 0 && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorCount === 1 ? "One field needs attention." : `${errorCount} fields need attention.`} Fix the highlighted fields, then save again.
        </p>
      )}
      {item?.hasPendingChanges && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This item has saved changes that aren't on the website yet. Preview them, then publish, or discard them to go back to the live version.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card>
          {def.slugFrom && (
            <div className="mb-4">
              <FieldShell id="slug" label="URL slug" help={`Leave empty to generate it from the ${def.fields.find((f) => f.name === def.slugFrom)?.label.toLowerCase()}. Changing it changes the page address.`} error={errors.slug}>
                <Input id="slug" invalid={!!errors.slug} value={String(values.slug ?? "")} disabled={!editable} placeholder="generated-from-the-title" onChange={(e) => setValues({ ...values, slug: e.target.value })} />
              </FieldShell>
            </div>
          )}
          <Fields fields={def.fields} values={values} onChange={setValues} ctx={{ errors, siteUrl, disabled: !editable }} />
        </Card>

        <div className="space-y-4">
          {item && def.publishable && (
            <Card title="Publishing">
              <div className="space-y-3 text-sm">
                <p className="text-neutral-600">
                  {item.status === "DRAFT"
                    ? "Not on the website."
                    : item.scheduled
                      ? `Goes live ${formatDateTime(item.publishedAt)}.`
                      : `Live since ${formatDateTime(item.publishedAt)}.`}
                </p>
                {can("content.publish") && (
                  <>
                    {def.ordering === "publishedAt" && (
                      <FieldShell id="publishAt" label="Publish date" help="Leave empty to publish now. A future date schedules it.">
                        <Input id="publishAt" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
                      </FieldShell>
                    )}
                    <Button variant="accent" className="w-full" onClick={publish} loading={busy === "publish"} disabled={live && !item.hasPendingChanges && !dirty && !publishAt}>
                      {publishAt && new Date(publishAt) > new Date() ? "Schedule" : live ? (item.hasPendingChanges || dirty ? "Publish changes" : "Published") : "Publish"}
                    </Button>
                    {item.hasPendingChanges && (
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" className="w-full">
                            Discard changes
                          </Button>
                        }
                        title="Discard unpublished changes?"
                        description="Your saved edits will be thrown away and the editor goes back to what's live on the website. Published versions stay in the history."
                        confirmLabel="Discard changes"
                        onConfirm={() => action("discard", "Changes discarded.")}
                      />
                    )}
                    {live && (
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" className="w-full">
                            Unpublish
                          </Button>
                        }
                        title={`Unpublish this ${def.singular.toLowerCase()}?`}
                        description="It will disappear from the website straight away. You can publish it again at any time."
                        confirmLabel="Unpublish"
                        onConfirm={() => action("unpublish", "Unpublished. It's no longer on the website.")}
                      />
                    )}
                  </>
                )}
              </div>
            </Card>
          )}

          {item && (
            <RevisionsPanel
              url={`${base}/${item.id}/revisions`}
              canRestore={editable}
              live={!!live && def.publishable}
              onRestore={async (revisionId) => {
                const res = await api<Item>(`${base}/${item.id}/revisions/${revisionId}/restore`, { method: "POST" });
                toast.success(res.hasPendingChanges ? "Version restored as unpublished changes." : "Version restored.");
                refresh(res);
              }}
            />
          )}

          {item && can(def.adminOnly ? "structure.edit" : "content.delete") && (
            <ConfirmDialog
              trigger={
                <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50" icon={<Trash2 className="size-4" />}>
                  Delete {def.singular.toLowerCase()}
                </Button>
              }
              title={`Delete “${title}”?`}
              description={`This removes it from the admin${live ? " and the website" : ""}. This can't be undone from here.`}
              confirmLabel="Delete"
              onConfirm={async () => {
                const ok = await run("delete", () => api(`${base}/${item.id}`, { method: "DELETE" }));
                if (ok === undefined) return;
                toast.success("Deleted.");
                qc.invalidateQueries({ queryKey: ["collection", def.key] });
                setValues(initial);
                navigate(`/content/${def.key}`);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
