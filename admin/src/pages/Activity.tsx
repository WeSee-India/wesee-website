import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { Button, cx, ErrorState, PageHeader, Spinner } from "@/components/ui";

interface Entry {
  id: string;
  action: string;
  summary: string;
  entityType: string | null;
  ip: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

const FILTERS = [
  { key: "", label: "Everything" },
  { key: "content.publish", label: "Publishing" },
  { key: "content", label: "Content" },
  { key: "page", label: "Pages" },
  { key: "media", label: "Media" },
  { key: "settings", label: "Settings" },
  { key: "user", label: "Users" },
  { key: "auth", label: "Sign-ins" },
];

const PAGE = 50;

export default function Activity() {
  const [action, setAction] = useState("");
  const [skip, setSkip] = useState(0);
  const q = useQuery({
    queryKey: ["audit", action, skip],
    queryFn: () => api<{ items: Entry[]; total: number }>(`/api/admin/audit?take=${PAGE}&skip=${skip}${action ? `&action=${action}` : ""}`),
  });

  return (
    <>
      <PageHeader title="Activity log" description="Every important change in the admin: who did it and when." />
      <div className="mb-4 flex flex-wrap gap-1" role="group" aria-label="Filter activity">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={action === f.key}
            onClick={() => {
              setAction(f.key);
              setSkip(0);
            }}
            className={cx("rounded-lg px-2.5 py-1 text-[13px]", action === f.key ? "bg-ink text-white" : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50")}
          >
            {f.label}
          </button>
        ))}
      </div>
      {q.isLoading ? (
        <Spinner />
      ) : q.error ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[13px] text-neutral-600">
                <tr>
                  <th className="px-4 py-2 font-medium">When</th>
                  <th className="px-4 py-2 font-medium">Who</th>
                  <th className="px-4 py-2 font-medium">What</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {q.data!.items.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-[13px] text-neutral-600">{formatDateTime(e.createdAt)}</td>
                    <td className="px-4 py-2 text-[13px]">{e.user?.name ?? <span className="text-neutral-400">{e.action === "auth.login_failed" ? "Unknown" : "Removed user"}</span>}</td>
                    <td className={cx("px-4 py-2", e.action === "auth.login_failed" && "text-red-700")}>
                      {e.summary}
                      {e.ip && <span className="ml-2 text-xs text-neutral-400">{e.ip}</span>}
                    </td>
                  </tr>
                ))}
                {!q.data!.items.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                      Nothing logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-neutral-500">
            <span>
              {q.data!.total ? `${skip + 1}–${Math.min(skip + PAGE, q.data!.total)} of ${q.data!.total}` : ""}
            </span>
            <div className="flex gap-2">
              <Button size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - PAGE))}>
                Newer
              </Button>
              <Button size="sm" disabled={skip + PAGE >= q.data!.total} onClick={() => setSkip(skip + PAGE)}>
                Older
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
