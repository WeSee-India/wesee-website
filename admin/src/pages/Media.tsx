import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, FileText, ImageIcon, Trash2, Upload, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { api, API_BASE } from "@/lib/api";
import { mediaQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { formatBytes, formatDateTime } from "@/lib/format";
import type { MediaAsset } from "@/lib/types";
import { ACCEPT, mediaSrc, uploadFiles } from "@/components/fields/MediaPicker";
import { Button, ConfirmDialog, EmptyState, ErrorState, FieldShell, Input, Modal, PageHeader, SearchInput, SegmentedControl, Skeleton } from "@/components/ui";

interface Usage {
  kind: string;
  id: string;
  label: string;
  title: string;
}

const usageHref = (u: Usage) => (u.kind === "page" ? `/pages/${u.id}` : u.kind === "setting" ? `/settings/${u.id}` : `/content/${u.kind}/${u.id}`);

export default function Media() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | "image" | "document">("");
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const list = useQuery(mediaQuery<{ items: MediaAsset[]; total: number }>(q, type));

  const upload = async (files: FileList | File[]) => {
    if (!can("media.upload")) return;
    setUploading(true);
    await uploadFiles(files);
    setUploading(false);
    qc.invalidateQueries({ queryKey: ["media"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <div
      onDragOver={(e) => {
        if (!can("media.upload")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
      }}
      className="relative min-h-[60vh]"
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-accent bg-accent-soft/80 backdrop-blur-[1px]">
          <p className="flex flex-col items-center gap-2 text-sm font-medium text-accent-ink">
            <UploadCloud className="size-8" aria-hidden /> Drop files to upload
          </p>
        </div>
      )}
      <PageHeader
        title="Media library"
        description="Images and documents used across the website. JPG, PNG, WebP, AVIF, GIF or PDF, up to 10 MB each. Drop files anywhere here to upload."
        actions={
          can("media.upload") && (
            <>
              <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => e.target.files && upload(e.target.files).then(() => (e.target.value = ""))} />
              <Button variant="primary" icon={<Upload className="size-4" />} loading={uploading} onClick={() => input.current?.click()}>
                Upload
              </Button>
            </>
          )
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SegmentedControl<"" | "image" | "document">
          label="File type"
          value={type}
          onChange={setType}
          options={[
            { key: "", label: "All" },
            { key: "image", label: "Images" },
            { key: "document", label: "Documents" },
          ]}
        />
        <SearchInput label="Search media" placeholder="Search by name or alt text" value={q} onChange={setQ} className="w-full sm:ml-auto sm:w-72" />
      </div>

      {list.isLoading ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5" role="status" aria-label="Loading">
          {Array.from({ length: 10 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[4/3] rounded-xl" />
            </li>
          ))}
        </ul>
      ) : list.error ? (
        <ErrorState error={list.error} retry={() => list.refetch()} />
      ) : !list.data?.items.length ? (
        <EmptyState title={q || type ? "Nothing matches" : "No files yet"} icon={<ImageIcon />}>{q || type ? "Try another search." : "Upload images here, then pick them from any image field."}</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {list.data.items.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => setSelected(m)} className="group w-full overflow-hidden rounded-xl border border-neutral-200 bg-white text-left shadow-xs transition-shadow hover:shadow-card hover:ring-2 hover:ring-accent/40">
                <div className="checker flex aspect-[4/3] items-center justify-center overflow-hidden">
                  {m.mimeType.startsWith("image/") ? <img src={mediaSrc(m)} alt={m.alt ?? ""} className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" /> : <FileText className="size-8 text-neutral-400" />}
                </div>
                <div className="border-t border-neutral-100 px-2.5 py-2">
                  <p className="truncate text-xs font-medium">{m.originalName}</p>
                  <p className="text-[11px] text-neutral-500">
                    {m.width && m.height ? `${m.width}×${m.height} · ` : ""}
                    {formatBytes(m.size)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected && <MediaDetails key={selected.id} asset={selected} onClose={() => setSelected(null)} onChange={(m) => setSelected(m)} />}
    </div>
  );
}

function MediaDetails({ asset, onClose, onChange }: { asset: MediaAsset; onClose(): void; onChange(m: MediaAsset): void }) {
  const { can } = useAuth();
  const qc = useQueryClient();
  const [alt, setAlt] = useState(asset.alt ?? "");
  const [name, setName] = useState(asset.originalName);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const replaceInput = useRef<HTMLInputElement>(null);
  const usage = useQuery({ queryKey: ["media", "usage", asset.id], queryFn: () => api<Usage[]>(`/api/admin/media/${asset.id}/usage`) });

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const save = async () => {
    setBusy(true);
    try {
      const m = await api<MediaAsset>(`/api/admin/media/${asset.id}`, { method: "PATCH", body: { alt: alt || null, originalName: name } });
      onChange(m);
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success("Details saved.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const replace = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    setBusy(true);
    try {
      const m = await api<MediaAsset>(`/api/admin/media/${asset.id}/replace`, { method: "POST", form });
      onChange(m);
      qc.invalidateQueries({ queryKey: ["media"] });
      toast.success("File replaced. Every page using it now shows the new version.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const force = (usage.data?.length ?? 0) > 0;
    await api(`/api/admin/media/${asset.id}${force ? "?force=true" : ""}`, { method: "DELETE" })
      .then(() => {
        toast.success("File deleted.");
        qc.invalidateQueries({ queryKey: ["media"] });
        onClose();
      })
      .catch((err) => toast.error(err.message));
  };

  const isImage = asset.mimeType.startsWith("image/");
  const fullUrl = `${API_BASE || window.location.origin}${asset.url}`;
  const used = usage.data ?? [];

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={asset.originalName} description={`${asset.mimeType} · ${formatBytes(asset.size)}${asset.width ? ` · ${asset.width}×${asset.height}` : ""}`} wide>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="checker flex items-center justify-center rounded-xl p-3 ring-1 ring-inset ring-neutral-200">
          {isImage ? <img src={mediaSrc(asset)} alt={asset.alt ?? ""} className="max-h-[60vh] object-contain" /> : <FileText className="size-16 text-neutral-400" />}
        </div>
        <div className="space-y-4">
          <FieldShell id="m-url" label="File address">
            <div className="flex gap-1.5">
              <Input id="m-url" readOnly value={asset.url} className="text-[13px]" />
              <Button
                aria-label="Copy address"
                icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                onClick={() => navigator.clipboard.writeText(fullUrl).then(() => setCopied(true))}
              />
            </div>
          </FieldShell>
          <FieldShell id="m-name" label="Name">
            <Input id="m-name" value={name} disabled={!can("media.upload")} onChange={(e) => setName(e.target.value)} />
          </FieldShell>
          {isImage && (
            <FieldShell id="m-alt" label="Default alt text" help="Describes the image for screen readers. Image fields on a page can override it.">
              <Input id="m-alt" value={alt} disabled={!can("media.upload")} onChange={(e) => setAlt(e.target.value)} />
            </FieldShell>
          )}
          {can("media.upload") && (
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={save} loading={busy} disabled={alt === (asset.alt ?? "") && name === asset.originalName}>
                Save details
              </Button>
              <input ref={replaceInput} type="file" accept={asset.mimeType} hidden onChange={(e) => e.target.files?.[0] && replace(e.target.files[0])} />
              <Button size="sm" onClick={() => replaceInput.current?.click()} disabled={busy}>
                Replace file
              </Button>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-[13px] font-medium">Used in</p>
            {usage.isLoading ? (
              <p className="text-sm text-neutral-500">Checking…</p>
            ) : !used.length ? (
              <p className="text-sm text-neutral-500">Not used anywhere yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {used.map((u) => (
                  <li key={`${u.kind}-${u.id}`}>
                    <Link href={usageHref(u)} className="hover:underline" onClick={onClose}>
                      {u.label}: {u.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-neutral-500">Uploaded {formatDateTime(asset.createdAt)}</p>

          {can("media.delete") && (
            <ConfirmDialog
              trigger={
                <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700" icon={<Trash2 className="size-4" />}>
                  Delete file
                </Button>
              }
              title="Delete this file?"
              description={
                used.length ? (
                  <>
                    <strong className="text-red-700">
                      It's used in {used.length} place{used.length === 1 ? "" : "s"}.
                    </strong>{" "}
                    Those pages will show a broken image until you choose another one. Consider replacing the file instead.
                  </>
                ) : (
                  "It isn't used anywhere. This can't be undone."
                )
              }
              confirmLabel={used.length ? "Delete anyway" : "Delete"}
              onConfirm={remove}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
