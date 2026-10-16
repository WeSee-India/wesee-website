import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Revision } from "@/lib/types";
import { Button, Card, ConfirmDialog } from "./ui";

const ACTION_LABEL: Record<string, string> = { published: "Published", saved: "Saved", deleted: "Deleted" };

/** Earlier published versions; restoring loads one as unpublished changes to review first. */
export function RevisionsPanel({ url, onRestore, canRestore, live }: { url: string; onRestore(revisionId: string): Promise<unknown>; canRestore: boolean; live: boolean }) {
  const q = useQuery({ queryKey: ["revisions", url], queryFn: () => api<Revision[]>(url) });
  return (
    <Card
      title={
        <span className="inline-flex items-center gap-1.5">
          <History className="size-4" aria-hidden /> History
        </span>
      }
    >
      {q.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : !q.data?.length ? (
        <p className="text-sm text-neutral-500">Versions appear here each time this is published.</p>
      ) : (
        <ol className="space-y-2">
          {q.data.slice(0, 12).map((r, i) => (
            <li key={r.id} className="flex items-center justify-between gap-2 text-[13px]">
              <div className="min-w-0">
                <p className="font-medium">
                  {ACTION_LABEL[r.action] ?? r.action}
                  {i === 0 && r.action === "published" && <span className="ml-1 font-normal text-neutral-500">(current)</span>}
                </p>
                <p className="truncate text-neutral-500">
                  {formatDateTime(r.createdAt)}
                  {r.user ? ` · ${r.user}` : ""}
                </p>
              </div>
              {canRestore && !(i === 0 && r.action === "published") && (
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="ghost">
                      Restore
                    </Button>
                  }
                  title="Restore this version?"
                  description={live ? "The content from this version will be loaded as unpublished changes. Nothing on the live site changes until you publish." : "The content from this version will replace the current draft."}
                  confirmLabel="Restore"
                  tone="primary"
                  onConfirm={() => onRestore(r.id).then(() => q.refetch())}
                />
              )}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
