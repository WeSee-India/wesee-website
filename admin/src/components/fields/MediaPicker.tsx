import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Search, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { api, API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { MediaAsset } from "@/lib/types";
import { Button, cx, Input, Modal, Spinner } from "../ui";

export const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif,application/pdf";

/** Upload files to the library; reports per-file problems without failing the batch. */
export async function uploadFiles(files: FileList | File[]) {
  const form = new FormData();
  for (const f of Array.from(files)) form.append("files", f);
  const res = await api<{ items: MediaAsset[]; errors: { file: string; error: string }[] }>("/api/admin/media", { method: "POST", form }).catch((err) => {
    toast.error(err.message);
    return { items: [], errors: [] };
  });
  for (const e of res.errors) toast.error(`${e.file}: ${e.error}`);
  if (res.items.length) toast.success(`Uploaded ${res.items.length} file${res.items.length === 1 ? "" : "s"}.`);
  return res.items;
}

export const mediaSrc = (m: Pick<MediaAsset, "previewUrl">) => `${API_BASE}${m.previewUrl}`;

export function MediaPicker({ open, onOpenChange, onSelect }: { open: boolean; onOpenChange(o: boolean): void; onSelect(url: string, asset: MediaAsset): void }) {
  const qc = useQueryClient();
  const { can } = useAuth();
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useQuery({
    queryKey: ["media", "picker", q],
    queryFn: () => api<{ items: MediaAsset[] }>(`/api/admin/media?type=image&take=120${q ? `&q=${encodeURIComponent(q)}` : ""}`),
    enabled: open,
  });

  const pick = (m: MediaAsset) => {
    onSelect(m.url, m);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Choose an image" description="Pick from the media library or upload a new file." wide>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-neutral-400" aria-hidden />
          <Input aria-label="Search media" placeholder="Search by name or alt text" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {can("media.upload") && (
          <>
            <input
              ref={input}
              type="file"
              accept={ACCEPT}
              multiple
              hidden
              onChange={async (e) => {
                if (!e.target.files?.length) return;
                setUploading(true);
                const items = await uploadFiles(e.target.files);
                setUploading(false);
                e.target.value = "";
                qc.invalidateQueries({ queryKey: ["media"] });
                const firstImage = items.find((i) => i.mimeType.startsWith("image/"));
                if (items.length === 1 && firstImage) pick(firstImage);
              }}
            />
            <Button variant="primary" icon={<Upload className="size-4" />} loading={uploading} onClick={() => input.current?.click()}>
              Upload
            </Button>
          </>
        )}
      </div>
      {list.isLoading ? (
        <Spinner />
      ) : !list.data?.items.length ? (
        <p className="py-12 text-center text-sm text-neutral-500">{q ? "No images match that search." : "The library is empty. Upload an image to get started."}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {list.data.items.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => pick(m)} className={cx("group w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-left hover:border-accent-dark")}>
                <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100">
                  {m.mimeType.startsWith("image/") ? <img src={mediaSrc(m)} alt={m.alt ?? ""} className="size-full object-cover" loading="lazy" /> : <FileText className="size-6 text-neutral-400" />}
                </div>
                <p className="truncate px-2 py-1.5 text-xs">{m.originalName}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
