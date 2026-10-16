import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import type { AdminPage } from "@/lib/types";
import { Badge, Button, ErrorState, FieldShell, Input, Modal, PageHeader, Spinner, StatusBadge } from "@/components/ui";

export default function PagesList() {
  const { can } = useAuth();
  const q = useQuery({ queryKey: ["pages"], queryFn: () => api<AdminPage[]>("/api/admin/pages") });
  const [open, setOpen] = useState(false);

  const group = (kind: AdminPage["kind"]) => q.data?.filter((p) => p.kind === kind) ?? [];

  const table = (pages: AdminPage[]) => (
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {pages.map((p) => (
        <li key={p.id}>
          <Link href={`/pages/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{p.state.title}</p>
              <p className="truncate text-[13px] text-neutral-500">
                <code>{p.state.path}</code>
                {p.description && ` · ${p.description}`}
              </p>
            </div>
            <span className="hidden text-xs text-neutral-500 sm:block">{p.state.sections.length} sections</span>
            <div className="w-48 text-right">
              {p.kind === "SYSTEM" ? (
                <span className="inline-flex gap-1">
                  <Badge tone="green">Live</Badge>
                  {p.hasPendingChanges && <Badge tone="amber">Unpublished changes</Badge>}
                </span>
              ) : (
                <StatusBadge status={p.status} pending={p.hasPendingChanges} />
              )}
              <p className="mt-0.5 text-xs text-neutral-500">Edited {timeAgo(p.updatedAt)}</p>
            </div>
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
        <Spinner />
      ) : q.error ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-2 text-sm font-semibold text-neutral-700">Built-in pages</h2>
            {table(group("SYSTEM"))}
          </section>
          <section>
            <h2 className="mb-2 text-sm font-semibold text-neutral-700">Custom pages</h2>
            {group("CUSTOM").length ? table(group("CUSTOM")) : <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-center text-sm text-neutral-500">No custom pages yet. Create one for a campaign, event or partner page.</p>}
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
        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" variant="primary" loading={busy}>
            Create page
          </Button>
        </div>
      </form>
    </Modal>
  );
}
