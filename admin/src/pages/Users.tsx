import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import type { Role } from "@/lib/types";
import { Badge, Button, ConfirmDialog, ErrorState, FieldShell, Input, Modal, PageHeader, Select, Spinner } from "@/components/ui";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_HELP: Record<Role, string> = {
  EDITOR: "Edits and publishes content and uploads media.",
  ADMIN: "Everything an editor can do, plus deleting, settings, page structure and the activity log.",
  OWNER: "Full access, including managing users.",
};

export default function Users() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["users"], queryFn: () => api<AdminUser[]>("/api/admin/users") });
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);

  const update = async (u: AdminUser, body: object, message: string) => {
    try {
      await api(`/api/admin/users/${u.id}`, { method: "PATCH", body });
      toast.success(message);
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Who can sign in to the admin, and what they can do."
        actions={
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setEditing("new")}>
            Add user
          </Button>
        }
      />
      {q.isLoading ? (
        <Spinner />
      ) : q.error ? (
        <ErrorState error={q.error} retry={() => q.refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[13px] text-neutral-600">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Last sign-in</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {q.data!.map((u) => (
                <tr key={u.id} className={u.isActive ? "" : "text-neutral-400"}>
                  <td className="px-4 py-2.5">
                    <p className="font-medium">
                      {u.name} {u.id === me?.id && <span className="font-normal text-neutral-500">(you)</span>}
                    </p>
                    <p className="text-[13px] text-neutral-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex gap-1">
                      <Badge tone={u.role === "OWNER" ? "amber" : u.role === "ADMIN" ? "blue" : "neutral"}>{u.role.toLowerCase()}</Badge>
                      {!u.isActive && <Badge tone="red">Deactivated</Badge>}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px]">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(u)}>
                        Edit
                      </Button>
                      {u.id !== me?.id && (
                        <ConfirmDialog
                          trigger={
                            <Button size="sm" variant="ghost">
                              {u.isActive ? "Deactivate" : "Reactivate"}
                            </Button>
                          }
                          title={u.isActive ? `Deactivate ${u.name}?` : `Reactivate ${u.name}?`}
                          description={u.isActive ? "They'll be signed out everywhere and can't sign in until reactivated. Their past activity stays in the log." : "They'll be able to sign in again with their existing password."}
                          confirmLabel={u.isActive ? "Deactivate" : "Reactivate"}
                          tone={u.isActive ? "danger" : "primary"}
                          onConfirm={() => update(u, { isActive: !u.isActive }, u.isActive ? "User deactivated." : "User reactivated.")}
                        />
                      )}
                      {u.id !== me?.id && (
                        <ConfirmDialog
                          trigger={
                            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                              Remove
                            </Button>
                          }
                          title={`Remove ${u.name}?`}
                          description="Their account is deleted. Content they created stays; their name is removed from the activity log. Deactivating keeps the account instead."
                          confirmLabel="Remove user"
                          onConfirm={() =>
                            api(`/api/admin/users/${u.id}`, { method: "DELETE" })
                              .then(() => {
                                toast.success("User removed.");
                                qc.invalidateQueries({ queryKey: ["users"] });
                              })
                              .catch((err) => toast.error(err.message))
                          }
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <UserDialog user={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function UserDialog({ user, onClose }: { user: AdminUser | null; onClose(): void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<Role>(user?.role ?? "EDITOR");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      if (user) await api(`/api/admin/users/${user.id}`, { method: "PATCH", body: { name, role, ...(password ? { password } : {}) } });
      else await api("/api/admin/users", { method: "POST", body: { name, email, role, password } });
      toast.success(user ? (password ? "Saved. They've been signed out and must use the new password." : "User updated.") : "User added. Share the password with them securely.");
      qc.invalidateQueries({ queryKey: ["users"] });
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields);
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={user ? `Edit ${user.name}` : "Add a user"}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FieldShell id="u-name" label="Name" required error={errors.name}>
          <Input id="u-name" value={name} invalid={!!errors.name} onChange={(e) => setName(e.target.value)} />
        </FieldShell>
        {!user && (
          <FieldShell id="u-email" label="Email" required error={errors.email}>
            <Input id="u-email" type="email" value={email} invalid={!!errors.email} onChange={(e) => setEmail(e.target.value)} />
          </FieldShell>
        )}
        <FieldShell id="u-role" label="Role" help={ROLE_HELP[role]} error={errors.role}>
          <Select id="u-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
          </Select>
        </FieldShell>
        <FieldShell
          id="u-password"
          label={user ? "Reset password" : "Password"}
          required={!user}
          help={user ? "Leave empty to keep their current password." : "At least 12 characters, mixing letters with numbers or symbols."}
          error={errors.password}
        >
          <Input id="u-password" type="password" autoComplete="new-password" value={password} invalid={!!errors.password} onChange={(e) => setPassword(e.target.value)} />
        </FieldShell>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={busy}>
            {user ? "Save" : "Add user"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
