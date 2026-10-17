import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { AlertTriangle, Inbox, Loader2, Search, X } from "lucide-react";
import { forwardRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export { clsx as cx };

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-xs hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none",
  accent: "bg-accent text-ink shadow-xs ring-1 ring-inset ring-black/5 hover:bg-[#bf9d3f] disabled:opacity-50",
  secondary: "bg-white text-ink shadow-xs ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 hover:ring-neutral-400 disabled:text-neutral-400 disabled:ring-neutral-200 disabled:hover:bg-white",
  ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-ink disabled:text-neutral-400 disabled:hover:bg-transparent",
  danger: "bg-red-600 text-white shadow-xs hover:bg-red-700 disabled:bg-red-300",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "secondary", size = "md", loading, icon, className, children, disabled, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={clsx(
        "inline-flex select-none items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-[background-color,box-shadow,color] duration-150 disabled:cursor-not-allowed",
        size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3.5 text-sm",
        !children && (size === "sm" ? "w-8 px-0" : "w-9 px-0"),
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

const inputBase =
  "w-full rounded-lg border bg-white px-3 text-sm text-ink shadow-xs placeholder:text-neutral-400 transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500";
const inputBorder = (invalid?: boolean) => (invalid ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-neutral-300 hover:border-neutral-400 focus:border-accent-dark focus:ring-accent/25");

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(function Input({ invalid, className, ...rest }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={clsx(inputBase, inputBorder(invalid), "h-9", className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(function Textarea({ invalid, className, ...rest }, ref) {
  return <textarea ref={ref} aria-invalid={invalid || undefined} className={clsx(inputBase, inputBorder(invalid), "py-2 leading-relaxed", className)} {...rest} />;
});

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2373726d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")`;

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(function Select({ invalid, className, style, ...rest }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={clsx(inputBase, inputBorder(invalid), "h-9 appearance-none bg-[length:16px] bg-[position:right_0.6rem_center] bg-no-repeat pr-9", className)}
      style={{ backgroundImage: chevron, ...style }}
      {...rest}
    />
  );
});

/** Search box with a leading icon and a clear button. */
export function SearchInput({ value, onChange, placeholder = "Search", label, className }: { value: string; onChange(v: string): void; placeholder?: string; label: string; className?: string }) {
  return (
    <div className={clsx("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" aria-hidden />
      <Input type="search" aria-label={label} placeholder={placeholder} className="pl-8 pr-8 [&::-webkit-search-cancel-button]:hidden" value={value} onChange={(e) => onChange(e.target.value)} />
      {value && (
        <button type="button" onClick={() => onChange("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-ink" aria-label="Clear search">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** A row of mutually exclusive filter buttons. */
export function SegmentedControl<T extends string>({ value, onChange, options, label, className }: { value: T; onChange(v: T): void; options: readonly { key: T; label: ReactNode; count?: number }[]; label: string; className?: string }) {
  return (
    <div className={clsx("inline-flex max-w-full overflow-x-auto rounded-lg bg-neutral-100 p-0.5 ring-1 ring-inset ring-neutral-200/70", className)} role="group" aria-label={label}>
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.key)}
            className={clsx(
              "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-[13px] transition-colors",
              active ? "bg-white font-medium text-ink shadow-xs ring-1 ring-neutral-200" : "text-neutral-600 hover:text-ink",
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={clsx("tabular-nums text-[11.5px]", active ? "text-neutral-500" : "text-neutral-400")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange(v: boolean): void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx("relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50", checked ? "bg-ink" : "bg-neutral-300")}
    >
      <span className={clsx("inline-block size-4 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

const badgeTones = {
  neutral: { pill: "bg-neutral-100 text-neutral-700 ring-neutral-200", dot: "bg-neutral-400" },
  green: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200/80", dot: "bg-emerald-500" },
  amber: { pill: "bg-amber-50 text-amber-800 ring-amber-200/80", dot: "bg-amber-500" },
  blue: { pill: "bg-sky-50 text-sky-700 ring-sky-200/80", dot: "bg-sky-500" },
  red: { pill: "bg-red-50 text-red-700 ring-red-200/80", dot: "bg-red-500" },
  gold: { pill: "bg-accent-soft text-accent-ink ring-accent/30", dot: "bg-accent" },
};

export type BadgeTone = keyof typeof badgeTones;

export function Badge({ tone = "neutral", dot, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex h-[22px] items-center gap-1.5 rounded-md px-2 text-xs font-medium ring-1 ring-inset whitespace-nowrap", badgeTones[tone].pill)}>
      {dot && <span className={clsx("size-1.5 rounded-full", badgeTones[tone].dot)} aria-hidden />}
      {children}
    </span>
  );
}

/** Status for a publishable item, in plain words. */
export function StatusBadge({ status, scheduled, pending }: { status: "DRAFT" | "PUBLISHED"; scheduled?: boolean; pending?: boolean }) {
  return (
    <span className="inline-flex flex-wrap justify-end gap-1">
      {status === "DRAFT" ? (
        <Badge dot>Draft</Badge>
      ) : scheduled ? (
        <Badge tone="blue" dot>
          Scheduled
        </Badge>
      ) : (
        <Badge tone="green" dot>
          Published
        </Badge>
      )}
      {pending && (
        <Badge tone="amber" dot>
          Unpublished changes
        </Badge>
      )}
    </span>
  );
}

export function Card({ children, className, title, description, actions, icon, flush }: { children: ReactNode; className?: string; title?: ReactNode; description?: ReactNode; actions?: ReactNode; icon?: ReactNode; flush?: boolean }) {
  return (
    <section className={clsx("rounded-xl border border-neutral-200 bg-white shadow-card", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 [&_svg]:size-4">{icon}</span>}
            <div className="min-w-0">
              {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
              {description && <p className="text-[12.5px] text-neutral-500">{description}</p>}
            </div>
          </div>
          {actions}
        </header>
      )}
      <div className={flush ? undefined : "p-4"}>{children}</div>
    </section>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500" role="status">
      <Loader2 className="size-4 animate-spin text-accent-dark" aria-hidden /> {label}…
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-md bg-neutral-200/70", className)} aria-hidden />;
}

/** Placeholder rows while a list loads, so the layout doesn't jump. */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-neutral-100 px-4 py-3.5 last:border-b-0">
          <Skeleton className="size-4" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className={clsx("h-3.5", i % 3 === 0 ? "w-2/5" : i % 3 === 1 ? "w-1/2" : "w-1/3")} />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, children, action, icon }: { title: string; children?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white/60 px-6 py-14 text-center">
      <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-white text-neutral-500 shadow-xs ring-1 ring-neutral-200 [&_svg]:size-5">{icon ?? <Inbox />}</span>
      <p className="font-medium tracking-tight">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        {error instanceof Error ? error.message : "Something went wrong."}
        {retry && (
          <button type="button" onClick={retry} className="ml-2 font-medium underline underline-offset-2">
            Try again
          </button>
        )}
      </p>
    </div>
  );
}

/** A one-line notice above a form or list. */
export function Notice({ tone = "amber", children, icon }: { tone?: "amber" | "red" | "neutral" | "blue"; children: ReactNode; icon?: ReactNode }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-800",
    neutral: "border-neutral-200 bg-neutral-50 text-neutral-700",
    blue: "border-sky-200 bg-sky-50 text-sky-900",
  };
  return (
    <div role={tone === "red" ? "alert" : undefined} className={clsx("mb-4 flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm", tones[tone])}>
      {icon && <span className="mt-0.5 shrink-0 [&_svg]:size-4">{icon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 flex-1">
        {back}
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-ink sm:text-2xl">{title}</h1>
        {description && <div className="mt-1.5 max-w-2xl text-sm text-neutral-500">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-neutral-200 bg-white px-1 font-sans text-[11px] font-medium text-neutral-500 shadow-xs">{children}</kbd>;
}

const avatarTones = ["bg-amber-100 text-amber-900", "bg-sky-100 text-sky-900", "bg-emerald-100 text-emerald-900", "bg-rose-100 text-rose-900", "bg-violet-100 text-violet-900", "bg-stone-200 text-stone-800"];

/** Initials in a colour picked from the name, so the same person always looks the same. */
export function Avatar({ name, size = "md", className }: { name: string | null | undefined; size?: "sm" | "md" | "lg"; className?: string }) {
  const label = name?.trim() || "?";
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const tone = avatarTones[[...label].reduce((n, c) => n + c.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      aria-hidden
      className={clsx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", tone, size === "sm" ? "size-6 text-[10px]" : size === "lg" ? "size-10 text-sm" : "size-8 text-xs", className)}
    >
      {initials}
    </span>
  );
}

/** A confirm step for destructive or far-reaching actions. Returns a trigger + dialog pair. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  tone = "danger",
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "danger" | "primary";
  onConfirm(): Promise<unknown> | void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <AlertDialog.Root open={open} onOpenChange={(o) => !busy && setOpen(o)}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-ink/40 backdrop-blur-[2px]" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 animate-pop-in rounded-2xl bg-white p-6 shadow-pop">
          <div className="flex gap-4">
            {tone === "danger" && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="size-[18px]" aria-hidden />
              </span>
            )}
            <div className="min-w-0">
              <AlertDialog.Title className="text-base font-semibold tracking-tight">{title}</AlertDialog.Title>
              <AlertDialog.Description asChild>
                <div className="mt-1.5 text-sm leading-relaxed text-neutral-600">{description}</div>
              </AlertDialog.Description>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button disabled={busy}>Cancel</Button>
            </AlertDialog.Cancel>
            <Button
              variant={tone}
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                  setOpen(false);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export function Modal({ open, onOpenChange, title, description, children, wide }: { open: boolean; onOpenChange(o: boolean): void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-ink/40 backdrop-blur-[2px]" />
        <Dialog.Content
          className={clsx(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] -translate-x-1/2 -translate-y-1/2 animate-pop-in flex-col overflow-hidden rounded-2xl bg-white shadow-pop",
            wide ? "w-[min(96vw,1000px)]" : "w-[min(92vw,520px)]",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-6 py-4">
            <div className="min-w-0">
              <Dialog.Title className="truncate text-base font-semibold tracking-tight">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-0.5 text-sm text-neutral-500">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="-mr-1.5 rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-ink" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function FieldShell({ id, label, required, help, error, children, counter }: { id: string; label: string; required?: boolean; help?: string; error?: string; children: ReactNode; counter?: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-neutral-800">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12.5px] text-red-600">
          {error}
        </p>
      ) : (
        help && (
          <p id={`${id}-help`} className="mt-1.5 text-[12.5px] leading-snug text-neutral-500">
            {help}
          </p>
        )
      )}
    </div>
  );
}
