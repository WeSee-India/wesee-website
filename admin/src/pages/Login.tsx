import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Layout";
import { Button, FieldShell, Input } from "@/components/ui";

const points = ["Edit every page, service and case study in one place", "Preview changes privately before they go live", "Every edit is versioned and can be restored"];

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
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_minmax(0,560px)]">
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between" aria-hidden>
        <div className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-24 size-[420px] rounded-full bg-accent/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]"
          style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        />
        <div className="relative">
          <Logo dark />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-[34px] font-semibold leading-[1.15] tracking-tight">
            Everything on the website, <span className="text-accent">managed in one place.</span>
          </h2>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px] text-neutral-300">
                <CheckCircle2 className="mt-0.5 size-[18px] shrink-0 text-accent" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-neutral-500">© {new Date().getFullYear()} WeSee. Authorised staff only.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-neutral-500">Welcome back. Sign in to manage the website.</p>
          <form onSubmit={submit} noValidate className="mt-8 space-y-5">
            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {error}
              </p>
            )}
            <FieldShell id="email" label="Email">
              <Input id="email" type="email" autoComplete="username" autoFocus placeholder="you@weseegpt.com" className="h-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FieldShell>
            <FieldShell id="password" label="Password">
              <Input id="password" type="password" autoComplete="current-password" className="h-10" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FieldShell>
            <Button type="submit" variant="primary" className="h-10 w-full" loading={busy}>
              Sign in
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-neutral-500">Forgot your password? Ask a site owner to reset it.</p>
        </div>
      </section>
    </main>
  );
}
