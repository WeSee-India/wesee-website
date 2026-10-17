import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { LogIn, ShieldAlert } from "lucide-react";
import { Avatar, Button, cx, ErrorState, ListSkeleton, PageHeader, SegmentedControl } from "@/components/ui";

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
      <SegmentedControl
        className="mb-4"
        label="Filter activity"
        value={action}
        options={FILTERS}
        onChange={(k) => {
          setAction(k);
          setSkip(0);
        }}
      />
      {q.isLoading ? (
        <ListSkeleton rows={10} />
      ) : q.error ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Who</th>
                  <th>What</th>
                  <th className="text-right">When</th>
                </tr>
              </thead>
              <tbody>
                {q.data!.items.map((e) => (
                  <tr key={e.id}>
                    <td className="w-56">
                      <span className="flex items-center gap-2.5">
                        {e.user ? (
                          <Avatar name={e.user.name} size="sm" />
                        ) : (
                          <span className="flex size-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">{e.action === "auth.login_failed" ? <ShieldAlert className="size-3.5" /> : <LogIn className="size-3.5" />}</span>
                        )}
                        <span className="truncate text-[13px] font-medium">{e.user?.name ?? <span className="font-normal text-neutral-400">{e.action === "auth.login_failed" ? "Unknown" : "Removed user"}</span>}</span>
                      </span>
                    </td>
                    <td className={cx(e.action === "auth.login_failed" && "text-red-700")}>
                      {e.summary}
                      {e.ip && <span className="ml-2 font-mono text-[11.5px] text-neutral-400">{e.ip}</span>}
                    </td>
                    <td className="whitespace-nowrap text-right text-[13px] text-neutral-500">{formatDateTime(e.createdAt)}</td>
                  </tr>
                ))}
                {!q.data!.items.length && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-neutral-500">
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
