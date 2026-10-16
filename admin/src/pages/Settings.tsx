import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useSchema } from "@/lib/schema";
import type { SettingDef, Values } from "@/lib/types";
import { useUnsavedChanges } from "@/lib/unsaved";
import { Fields } from "@/components/fields/FieldRenderer";
import { Button, Card, cx, ErrorState, PageHeader, Spinner } from "@/components/ui";

export default function Settings({ settingKey }: { settingKey?: string }) {
  const schema = useSchema();
  const all = useQuery({ queryKey: ["settings"], queryFn: () => api<Record<string, Values>>("/api/admin/settings") });
  if (schema.isLoading || all.isLoading) return <Spinner />;
  if (all.error) return <ErrorState error={all.error} retry={() => all.refetch()} />;
  const defs = schema.data!.settings;
  const active = defs.find((d) => d.key === settingKey) ?? defs[0];

  return (
    <>
      <PageHeader title="Settings" description="Site-wide content and configuration. Saved changes apply to the website straight away, and every change is kept in the activity log." />
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto lg:flex-col">
          {defs.map((d) => (
            <Link key={d.key} href={`/settings/${d.key}`} aria-current={d.key === active.key ? "page" : undefined} className={cx("whitespace-nowrap rounded-lg px-3 py-1.5 text-sm", d.key === active.key ? "bg-white font-medium shadow-sm ring-1 ring-neutral-200" : "text-neutral-600 hover:bg-neutral-200/50")}>
              {d.label}
            </Link>
          ))}
        </nav>
        <SettingForm key={active.key} def={active} value={all.data![active.key] ?? {}} siteUrl={schema.data!.siteUrl} />
      </div>
    </>
  );
}

function SettingForm({ def, value, siteUrl }: { def: SettingDef; value: Values; siteUrl: string }) {
  const { can } = useAuth();
  const qc = useQueryClient();
  const [values, setValues] = useState(value);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(value);
  useUnsavedChanges(dirty);
  const editable = can("settings.edit");

  const save = async () => {
    setBusy(true);
    setErrors({});
    try {
      const saved = await api<Values>(`/api/admin/settings/${def.key}`, { method: "PUT", body: values });
      qc.setQueryData(["settings"], (old: Record<string, Values> | undefined) => ({ ...old, [def.key]: saved }));
      toast.success(`${def.label} saved. The website is updated.`);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title={def.label}
      actions={
        editable && (
          <div className="flex gap-2">
            {dirty && (
              <Button size="sm" variant="ghost" onClick={() => setValues(value)}>
                Undo changes
              </Button>
            )}
            <Button size="sm" variant="primary" onClick={save} loading={busy} disabled={!dirty}>
              Save
            </Button>
          </div>
        )
      }
    >
      <p className="mb-4 text-sm text-neutral-500">{def.description}</p>
      {!editable && <p className="mb-4 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-600">Only admins and owners can change settings.</p>}
      <Fields fields={def.fields} values={values} onChange={setValues} ctx={{ errors, siteUrl, disabled: !editable }} />
    </Card>
  );
}
