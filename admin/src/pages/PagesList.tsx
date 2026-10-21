import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FilePlus2, FileText, Home, Layers, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { api, ApiError } from "@/lib/api";
import { pagesQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import type { AdminPage } from "@/lib/types";
import { Badge, Button, EmptyState, ErrorState, FieldShell, Input, ListSkeleton, Modal, PageHeader, StatusBadge } from "@/components/ui";

export default function PagesList() {
  const { can } = useAuth();
  const q = useQuery(pagesQuery<AdminPage[]>());
  const [open, setOpen] = useState(false);

  const group = (kind: AdminPage["kind"]) => q.data?.filter((p) => p.kind === kind) ?? [];

  const table = (pages: AdminPage[]) => (
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
      {pages.map((p) => (
        <li key={p.id}>
          <Link href={`/pages/${p.id}`} className="group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-neutral-50">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:text-accent-dark group-hover:ring-1 group-hover:ring-neutral-200">
              {p.state.path === "/" ? <Home className="size-4" aria-hidden /> : <FileText className="size-4" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="truncate">{p.state.title}</span>
                <code className="hidden shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[11.5px] font-normal text-neutral-600 sm:inline">{p.state.path}</code>
              </p>
              {p.description && <p className="mt-0.5 truncate text-[13px] text-neutral-500">{p.description}</p>}
            </div>
            <span className="hidden items-center gap-1 text-xs text-neutral-500 md:inline-flex">
              <Layers className="size-3.5" aria-hidden /> {p.state.sections.length}
            </span>
            <div className="hidden w-48 justify-end sm:flex">
              {p.kind === "SYSTEM" ? (
                <span className="inline-flex gap-1">
                  {p.hasPendingChanges ? (
                    <Badge tone="amber" dot>
                      Unpublished changes
                    </Badge>
                  ) : (
                    <Badge tone="green" dot>
                      Live
                    </Badge>
                  )}
                </span>
              ) : (
                <StatusBadge status={p.status} pending={p.hasPendingChanges} />
              )}
            </div>
            <span className="w-24 shrink-0 text-right text-xs text-neutral-500">{timeAgo(p.updatedAt)}</span>
            <ChevronRight className="size-4 shrink-0 text-neutral-300 group-hover:text-neutral-500" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <PageHeader
        title="Pages"
        description="Edit the text, images and buttons on each page, and choose which sections show and in what order. Changes stay private until you publish."
        actions={
          can("structure.edit") && (
            <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>
              New page
            </Button>
          )
        }
      />
      {q.isLoading ? (
        <ListSkeleton rows={8} />
      ) : q.error ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-neutral-700">
              Built-in pages <span className="font-normal text-neutral-400">{group("SYSTEM").length}</span>
            </h2>
            {table(group("SYSTEM"))}
          </section>
          <section>
            <h2 className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-neutral-700">
              Custom pages <span className="font-normal text-neutral-400">{group("CUSTOM").length}</span>
            </h2>
            {group("CUSTOM").length ? (
              table(group("CUSTOM"))
            ) : (
              <EmptyState
                title="No custom pages yet"
                icon={<FilePlus2 />}
                action={
                  can("structure.edit") && (
                    <Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>
                      New page
                    </Button>
                  )
                }
              >
                Create one for a campaign, event or partner page.
              </EmptyState>
            )}
          </section>
        </div>
      )}
      <NewPageDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function NewPageDialog({ open, onOpenChange }: { open: boolean; onOpenChange(o: boolean): void }) {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const suggested = `/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const page = await api<AdminPage>("/api/admin/pages", { method: "POST", body: { title, path: path || undefined } });
      toast.success("Page created as a draft.");
      onOpenChange(false);
      navigate(`/pages/${page.id}`);
    } catch (err) {
      if (err instanceof ApiError) setErrors({ ...err.fields, form: Object.keys(err.fields).length ? "" : err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New page" description="Custom pages are built from text, image, card, FAQ and call-to-action sections.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}
        <FieldShell id="np-title" label="Page name" required error={errors.title}>
          <Input id="np-title" value={title} invalid={!!errors.title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </FieldShell>
        <FieldShell id="np-path" label="Address" help={`Leave empty for ${title ? suggested : "an address based on the name"}.`} error={errors.path}>
          <Input id="np-path" value={path} invalid={!!errors.path} placeholder={title ? suggested : "/partners"} onChange={(e) => setPath(e.target.value)} />
        </FieldShell>
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" variant="primary" loading={busy}>
            Create page
          </Button>
        </div>
      </form>
    </Modal>
  );
}
