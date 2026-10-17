import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Avatar, Badge, Button, Card, FieldShell, Input } from "@/components/ui";

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
      <div className="mb-8 flex items-center gap-4">
        <Avatar name={user?.name} size="lg" className="size-14 text-lg" />
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight sm:text-2xl">{user?.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            {user?.email}
            <Badge tone="gold">
              <span className="capitalize">{user?.role.toLowerCase()}</span>
            </Badge>
          </p>
        </div>
      </div>
      <div className="grid max-w-3xl gap-6">
        <Card title="Details" description="Your name appears in the activity log">
          <form onSubmit={saveName} className="space-y-4" noValidate>
            <FieldShell id="p-name" label="Name">
              <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
            </FieldShell>
            <Button type="submit" variant="primary" loading={busy === "name"} disabled={!name.trim() || name === user?.name}>
              Save
            </Button>
          </form>
        </Card>
        <Card title="Change password" description="Other devices are signed out when you change it">
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
