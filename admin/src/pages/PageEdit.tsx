import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronRight, Clock, Eye, EyeOff, Plus, Send, Settings2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { emptyValues, plain, useSchema } from "@/lib/schema";
import type { AdminPage, PageState, Schema, SectionState } from "@/lib/types";
import { useUnsavedChanges } from "@/lib/unsaved";
import { Fields } from "@/components/fields/FieldRenderer";
import { RevisionsPanel } from "@/components/Revisions";
import { SortableList } from "@/components/Sortable";
import { Badge, Button, Card, ConfirmDialog, cx, ErrorState, FieldShell, Input, Modal, Notice, PageHeader, Spinner, StatusBadge } from "@/components/ui";

export default function PageEdit({ id }: { id: string }) {
  const schema = useSchema();
  const page = useQuery({ queryKey: ["page", id], queryFn: () => api<AdminPage>(`/api/admin/pages/${id}`) });
  if (schema.isLoading || page.isLoading) return <Spinner />;
  if (page.error) return <ErrorState error={page.error} retry={() => page.refetch()} />;
  return <Editor key={page.data!.updatedAt} page={page.data!} schema={schema.data!} />;
}

/** A stable id per section for drag and drop (keys may be edited on custom pages). */
type Row = SectionState & { _id: string };
let uid = 0;
const withIds = (sections: SectionState[]): Row[] => sections.map((s) => ({ ...s, _id: `s${uid++}` }));
type EditState = Omit<PageState, "sections"> & { sections: Row[] };
const strip = (rows: Row[]): SectionState[] => rows.map(({ _id: _x, ...s }) => s);

function Editor({ page, schema }: { page: AdminPage; schema: Schema }) {
  const { can } = useAuth();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const initial = useMemo(() => ({ ...page.state, sections: withIds(page.state.sections) }), [page]);
  const [state, setState] = useState<EditState>(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const payload = () => ({ ...state, sections: strip(state.sections) });
  const dirty = JSON.stringify(payload()) !== JSON.stringify(page.state);
  useUnsavedChanges(dirty);

  const editable = can("content.edit");
  const custom = page.kind === "CUSTOM";
  const typeDef = (type: string) => schema.sectionTypes.find((t) => t.type === type);
  const base = `/api/admin/pages/${page.id}`;

  const refresh = (next: AdminPage) => {
    qc.setQueryData(["page", page.id], next);
    qc.invalidateQueries({ queryKey: ["pages"] });
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
        // Open the first section with a problem.
        const m = Object.keys(err.fields)[0]?.match(/^sections\.(\d+)\./);
        if (m) setOpen(state.sections[Number(m[1])]?._id ?? null);
      } else toast.error("Something went wrong.");
      return undefined;
    } finally {
      setBusy(null);
    }
  }

  const save = async () => {
    setErrors({});
    const res = await run("save", () => api<AdminPage>(base, { method: "PUT", body: payload() }));
    if (res) {
      toast.success("Saved. Preview it, then publish to update the website.");
      refresh(res);
    }
    return res;
  };

  const publish = async () => {
    if (dirty && !(await save())) return;
    const res = await run("publish", () => api<AdminPage>(`${base}/publish`, { method: "POST" }));
    if (res) {
      toast.success("Published. The website is updated.");
      refresh(res);
    }
  };

  const preview = async () => {
    if (dirty && !(await save())) return;
    const res = await run("preview", () => api<{ url: string }>(`${base}/preview`, { method: "POST" }));
    if (res) window.open(res.url, "_blank", "noopener");
  };

  const simple = async (name: "discard" | "unpublish", message: string) => {
    const res = await run(name, () => api<AdminPage>(`${base}/${name}`, { method: "POST" }));
    if (res) {
      toast.success(message);
      refresh(res);
    }
  };

  const setSection = (i: number, patch: Partial<SectionState>) => setState((s) => ({ ...s, sections: s.sections.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
  const sectionErrors = (i: number) => Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith(`sections.${i}.content.`)).map(([k, v]) => [k.replace(`sections.${i}.content.`, ""), v]));

  return (
    <>
      <PageHeader
        back={
          <Link href="/pages" className="group mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 hover:text-ink">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> Pages
          </Link>
        }
        title={state.title || "Untitled page"}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[12px] text-neutral-600">{state.path}</code>
            {custom ? <StatusBadge status={page.status} pending={page.hasPendingChanges} /> : page.hasDraft && <Badge tone="amber">Unpublished changes</Badge>}
          </span>
        }
        actions={
          <>
            <Button icon={<Eye className="size-4" />} onClick={preview} loading={busy === "preview"}>
              Preview
            </Button>
            {editable && (
              <Button onClick={save} loading={busy === "save"} disabled={!dirty}>
                Save
              </Button>
            )}
            {can("content.publish") && (
              <Button variant="accent" onClick={publish} loading={busy === "publish"} disabled={!dirty && !page.hasDraft}>
                {page.status === "PUBLISHED" ? "Publish changes" : "Publish"}
              </Button>
            )}
          </>
        }
      />

      {page.hasDraft && !dirty && (
        <Notice icon={<Clock />}>{page.status === "PUBLISHED" ? "This page has saved changes that aren't on the website yet." : "This page is a draft and isn't on the website yet."}</Notice>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">
              Sections <span className="ml-1 font-normal text-neutral-400">{state.sections.length}</span>
            </h2>
            <p className="text-xs text-neutral-500">Drag to reorder · hide sections you don't want shown</p>
          </div>
          <SortableList items={state.sections} getId={(s) => s._id} onReorder={(sections) => setState((s) => ({ ...s, sections }))} disabled={!editable}>
            {(section, handle, i) => {
              const def = typeDef(section.type);
              const isOpen = open === section._id;
              const errs = Object.keys(sectionErrors(i)).length;
              return (
                <div className={cx("mb-2 rounded-xl border shadow-xs transition-shadow", errs ? "border-red-300" : isOpen ? "border-neutral-300 shadow-card" : "border-neutral-200 hover:border-neutral-300", section.visible ? "bg-white" : "bg-neutral-50")}>
                  <div className="flex items-center gap-1 px-2 py-1.5">
                    {handle}
                    <button type="button" className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : section._id)}>
                      {isOpen ? <ChevronDown className="size-4 shrink-0 text-neutral-400" /> : <ChevronRight className="size-4 shrink-0 text-neutral-400" />}
                      <span className={cx("truncate text-sm font-medium", !section.visible && "text-neutral-400 line-through decoration-neutral-300")}>{section.label || def?.label || section.type}</span>
                      {!section.visible && <Badge>Hidden</Badge>}
                      {errs > 0 && <span className="text-xs text-red-600">{errs} to fix</span>}
                      <span className="hidden truncate text-[13px] text-neutral-400 sm:inline">{plain(section.content.heading ?? section.content.title ?? "")}</span>
                    </button>
                    <button
                      type="button"
                      className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-ink"
                      disabled={!editable}
                      onClick={() => setSection(i, { visible: !section.visible })}
                      aria-label={section.visible ? `Hide ${section.label ?? def?.label}` : `Show ${section.label ?? def?.label}`}
                      title={section.visible ? "Hide on the website" : "Show on the website"}
                    >
                      {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                    {custom && editable && (
                      <ConfirmDialog
                        trigger={
                          <button type="button" className="rounded-md p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${section.label ?? def?.label}`}>
                            <Trash2 className="size-4" />
                          </button>
                        }
                        title="Remove this section?"
                        description="Its content will be removed from the page when you save. You can restore earlier published versions from History."
                        confirmLabel="Remove section"
                        onConfirm={() => setState((s) => ({ ...s, sections: s.sections.filter((_, j) => j !== i) }))}
                      />
                    )}
                  </div>
                  {isOpen && def && (
                    <div className="border-t border-neutral-100 px-4 pb-5 pt-4">
                      {def.description && <p className="mb-3 text-[13px] text-neutral-500">{def.description}</p>}
                      <Fields fields={def.fields} values={section.content} onChange={(content) => setSection(i, { content })} ctx={{ errors: sectionErrors(i), siteUrl: schema.siteUrl, disabled: !editable }} />
                    </div>
                  )}
                </div>
              );
            }}
          </SortableList>
          {custom && editable && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 py-3 text-sm font-medium text-neutral-600 transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-ink"
            >
              <Plus className="size-4" /> Add section
            </button>
          )}
        </div>

        <div className="space-y-4">
          <Card title="Page details" icon={<Settings2 />}>
            <div className="space-y-4">
              <FieldShell id="pg-title" label="Page name" error={errors.title}>
                <Input id="pg-title" value={state.title} disabled={!editable} onChange={(e) => setState({ ...state, title: e.target.value })} />
              </FieldShell>
              {custom && (
                <FieldShell id="pg-path" label="Address" error={errors.path}>
                  <Input id="pg-path" value={state.path} invalid={!!errors.path} disabled={!can("structure.edit")} onChange={(e) => setState({ ...state, path: e.target.value })} />
                </FieldShell>
              )}
              <Fields
                fields={schema.pageFields.filter((f) => f.name !== "title")}
                values={state as unknown as Record<string, unknown>}
                onChange={(v) => setState({ ...state, ...(v as Partial<EditState>) })}
                ctx={{ errors, siteUrl: schema.siteUrl, disabled: !editable }}
              />
            </div>
          </Card>

          {(page.hasDraft || custom) && can("content.publish") && (
            <Card title="Publishing" icon={<Send />}>
              <div className="space-y-2">
                {page.hasDraft && page.status === "PUBLISHED" && (
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" className="w-full">
                        Discard changes
                      </Button>
                    }
                    title="Discard unpublished changes?"
                    description="The editor goes back to what's live on the website."
                    confirmLabel="Discard changes"
                    onConfirm={() => simple("discard", "Changes discarded.")}
                  />
                )}
                {custom && page.status === "PUBLISHED" && (
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" className="w-full">
                        Unpublish page
                      </Button>
                    }
                    title="Unpublish this page?"
                    description={`${state.path} will stop working straight away. You can publish it again later.`}
                    confirmLabel="Unpublish"
                    onConfirm={() => simple("unpublish", "Page unpublished.")}
                  />
                )}
              </div>
            </Card>
          )}

          <RevisionsPanel
            url={`${base}/revisions`}
            canRestore={editable}
            live={page.status === "PUBLISHED"}
            onRestore={async (revisionId) => {
              const res = await api<AdminPage>(`${base}/revisions/${revisionId}/restore`, { method: "POST" });
              toast.success("Version restored as unpublished changes.");
              refresh(res);
            }}
          />

          {custom && can("structure.edit") && (
            <ConfirmDialog
              trigger={
                <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700" icon={<Trash2 className="size-4" />}>
                  Delete page
                </Button>
              }
              title={`Delete “${state.title}”?`}
              description={`${state.path} will stop working${page.status === "PUBLISHED" ? " on the website" : ""}. This can't be undone from here.`}
              confirmLabel="Delete page"
              onConfirm={async () => {
                const ok = await run("delete", () => api(base, { method: "DELETE" }));
                if (ok === undefined) return;
                toast.success("Page deleted.");
                qc.invalidateQueries({ queryKey: ["pages"] });
                setState(initial);
                navigate("/pages");
              }}
            />
          )}
        </div>
      </div>

      <Modal open={adding} onOpenChange={setAdding} title="Add a section">
        <ul className="grid gap-2 sm:grid-cols-2">
          {schema.sectionTypes
            .filter((t) => t.generic)
            .map((t) => (
              <li key={t.type}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-xl border border-neutral-200 p-3 text-left text-sm font-medium shadow-xs transition-colors hover:border-accent/60 hover:bg-accent-soft/40"
                  onClick={() => {
                    const row: Row = { _id: `s${uid++}`, key: "", type: t.type, label: null, visible: true, content: emptyValues(t.fields) };
                    setState((s) => ({ ...s, sections: [...s.sections, row] }));
                    setOpen(row._id);
                    setAdding(false);
                  }}
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-500">
                    <Plus className="size-3.5" aria-hidden />
                  </span>
                  {t.label}
                </button>
              </li>
            ))}
        </ul>
      </Modal>
    </>
  );
}
