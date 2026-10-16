import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button, FieldShell, Input } from "@/components/ui";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign in. Try again.");
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-2xl font-semibold tracking-tight text-white">
          WeSee<span className="text-accent">.</span> <span className="font-normal text-neutral-400">Admin</span>
        </p>
        <form onSubmit={submit} noValidate className="space-y-4 rounded-xl bg-white p-6 shadow-xl">
          <h1 className="text-lg font-semibold">Sign in</h1>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <FieldShell id="email" label="Email">
            <Input id="email" type="email" autoComplete="username" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </FieldShell>
          <FieldShell id="password" label="Password">
            <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FieldShell>
          <Button type="submit" variant="primary" className="w-full" loading={busy}>
            Sign in
          </Button>
          <p className="text-center text-xs text-neutral-500">Forgot your password? Ask a site owner to reset it.</p>
        </form>
      </div>
    </main>
  );
}
