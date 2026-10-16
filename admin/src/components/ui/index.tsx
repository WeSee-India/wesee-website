import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { Loader2, X } from "lucide-react";
import { forwardRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export { clsx as cx };

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-black disabled:bg-neutral-400",
  accent: "bg-accent text-ink hover:bg-[#b8973f] disabled:opacity-50",
  secondary: "bg-white text-ink border border-neutral-300 hover:bg-neutral-50 disabled:text-neutral-400",
  ghost: "text-neutral-700 hover:bg-neutral-200/60 disabled:text-neutral-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
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
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed whitespace-nowrap",
        size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-9 px-3.5 text-sm",
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
  "w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:bg-neutral-100";
const inputBorder = (invalid?: boolean) => (invalid ? "border-red-500" : "border-neutral-300 focus:border-accent-dark");

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(function Input({ invalid, className, ...rest }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={clsx(inputBase, inputBorder(invalid), "h-9", className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(function Textarea({ invalid, className, ...rest }, ref) {
  return <textarea ref={ref} aria-invalid={invalid || undefined} className={clsx(inputBase, inputBorder(invalid), "py-2 leading-relaxed", className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(function Select({ invalid, className, ...rest }, ref) {
  return <select ref={ref} aria-invalid={invalid || undefined} className={clsx(inputBase, inputBorder(invalid), "h-9 pr-8", className)} {...rest} />;
});

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange(v: boolean): void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx("relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50", checked ? "bg-accent-dark" : "bg-neutral-300")}
    >
      <span className={clsx("inline-block size-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

const badgeTones = {
  neutral: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  red: "bg-red-50 text-red-700 ring-red-200",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap", badgeTones[tone])}>{children}</span>;
}

/** Status for a publishable item, in plain words. */
export function StatusBadge({ status, scheduled, pending }: { status: "DRAFT" | "PUBLISHED"; scheduled?: boolean; pending?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {status === "DRAFT" ? <Badge>Draft</Badge> : scheduled ? <Badge tone="blue">Scheduled</Badge> : <Badge tone="green">Published</Badge>}
      {pending && <Badge tone="amber">Unpublished changes</Badge>}
    </span>
  );
}

export function Card({ children, className, title, actions }: { children: ReactNode; className?: string; title?: ReactNode; actions?: ReactNode }) {
  return (
    <section className={clsx("rounded-xl border border-neutral-200 bg-white", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden /> {label}…
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {error instanceof Error ? error.message : "Something went wrong."}
      {retry && (
        <button type="button" onClick={retry} className="ml-2 font-medium underline">
          Try again
        </button>
      )}
    </div>
  );
}

export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
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
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl">
          <AlertDialog.Title className="text-base font-semibold">{title}</AlertDialog.Title>
          <AlertDialog.Description asChild>
            <div className="mt-2 text-sm text-neutral-600">{description}</div>
          </AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className={clsx(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-xl",
            wide ? "w-[min(96vw,1000px)]" : "w-[min(92vw,520px)]",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-0.5 text-sm text-neutral-500">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function FieldShell({ id, label, required, help, error, children, counter }: { id: string; label: string; required?: boolean; help?: string; error?: string; children: ReactNode; counter?: ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-neutral-800">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-[13px] text-red-600">
          {error}
        </p>
      ) : (
        help && (
          <p id={`${id}-help`} className="mt-1 text-[12.5px] text-neutral-500">
            {help}
          </p>
        )
      )}
    </div>
  );
}
