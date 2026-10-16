import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Badge, Button, Card, FieldShell, Input, PageHeader } from "@/components/ui";

export default function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name ?? "");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    setBusy("name");
    try {
      await api("/api/auth/me", { method: "PATCH", body: { name } });
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Name updated.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (next !== confirm) return setErrors({ confirm: "The two new passwords don't match." });
    setBusy("password");
    try {
      await api("/api/auth/password", { method: "POST", body: { currentPassword: current, newPassword: next } });
      toast.success("Password changed. Other devices have been signed out.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader title="Your profile" description={user?.email} />
      <div className="grid max-w-3xl gap-6">
        <Card title="Details">
          <form onSubmit={saveName} className="space-y-4" noValidate>
            <FieldShell id="p-name" label="Name">
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
            </FieldShell>
            <p className="text-sm text-neutral-600">
              Role: <Badge>{user?.role.toLowerCase()}</Badge>
            </p>
            <Button type="submit" variant="primary" loading={busy === "name"} disabled={!name.trim() || name === user?.name}>
              Save
            </Button>
          </form>
        </Card>
        <Card title="Change password">
          <form onSubmit={savePassword} className="space-y-4" noValidate>
            <FieldShell id="p-current" label="Current password" error={errors.currentPassword}>
              <Input id="p-current" type="password" autoComplete="current-password" invalid={!!errors.currentPassword} value={current} onChange={(e) => setCurrent(e.target.value)} />
            </FieldShell>
            <FieldShell id="p-new" label="New password" help="At least 12 characters, mixing letters with numbers or symbols." error={errors.newPassword}>
              <Input id="p-new" type="password" autoComplete="new-password" invalid={!!errors.newPassword} value={next} onChange={(e) => setNext(e.target.value)} />
            </FieldShell>
            <FieldShell id="p-confirm" label="Repeat new password" error={errors.confirm}>
              <Input id="p-confirm" type="password" autoComplete="new-password" invalid={!!errors.confirm} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </FieldShell>
            <Button type="submit" variant="primary" loading={busy === "password"} disabled={!current || !next}>
              Change password
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
