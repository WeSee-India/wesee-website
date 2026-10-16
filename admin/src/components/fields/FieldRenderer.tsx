import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { api, assetUrl } from "@/lib/api";
import { Markdown } from "@/lib/markdown";
import { emptyValues, plain } from "@/lib/schema";
import type { FieldDef, Item, Values } from "@/lib/types";
import { Button, cx, FieldShell, Input, Select, Switch, Textarea } from "../ui";
import { MediaPicker } from "./MediaPicker";

export interface FieldContext {
  /** Server validation errors keyed by dotted path, e.g. "results.0.metric". */
  errors: Record<string, string>;
  siteUrl: string;
  disabled?: boolean;
}

const join = (path: string, name: string | number) => (path ? `${path}.${name}` : String(name));

/** Lay out a set of fields; "half" fields pair up on wide screens. */
export function Fields({ fields, values, onChange, path = "", ctx }: { fields: FieldDef[]; values: Values; onChange(v: Values): void; path?: string; ctx: FieldContext }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={f.width === "half" ? "" : "md:col-span-2"}>
          <Field field={f} value={values?.[f.name]} onChange={(v) => onChange({ ...values, [f.name]: v })} path={join(path, f.name)} ctx={ctx} />
        </div>
      ))}
    </div>
  );
}

/** Shows how many nested errors a collapsed block hides. */
function nestedErrorCount(errors: Record<string, string>, path: string) {
  return Object.keys(errors).filter((k) => k === path || k.startsWith(`${path}.`)).length;
}

export function Field({ field, value, onChange, path, ctx }: { field: FieldDef; value: unknown; onChange(v: unknown): void; path: string; ctx: FieldContext }) {
  const id = useId();
  const error = ctx.errors[path];
  const describedBy = error ? `${id}-error` : field.help ? `${id}-help` : undefined;
  const common = { id, invalid: !!error, disabled: ctx.disabled, "aria-describedby": describedBy, "aria-required": field.required || undefined };
  const str = typeof value === "string" ? value : value == null ? "" : String(value);

  switch (field.type) {
    case "text": {
      const listId = field.suggestions ? `${id}-suggestions` : undefined;
      const counter = field.maxLength ? <CharCount value={str} max={field.maxLength} /> : null;
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} counter={counter}>
          {field.multiline ? (
            <Textarea {...common} rows={Math.min(8, Math.max(3, Math.ceil(str.length / 90)))} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
          ) : (
            <Input {...common} list={listId} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
          )}
          {field.suggestions && (
            <datalist id={listId}>
              {field.suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </FieldShell>
      );
    }
    case "markdown":
      return <MarkdownField field={field} value={str} onChange={onChange} id={id} error={error} common={common} />;
    case "url":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help ?? "A page path like /contact, or a full https:// link."} error={error}>
          <Input {...common} inputMode="url" value={str} placeholder={field.placeholder ?? "/page or https://…"} onChange={(e) => onChange(e.target.value)} />
        </FieldShell>
      );
    case "image":
      return <ImageField field={field} value={str} onChange={onChange} id={id} error={error} ctx={ctx} />;
    case "number":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error}>
          <Input
            {...common}
            type="number"
            min={field.min}
            max={field.max}
            step={field.integer ? 1 : "any"}
            value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
        </FieldShell>
      );
    case "boolean":
      return (
        <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-2.5">
          <Switch checked={!!value} onChange={onChange} label={field.label} disabled={ctx.disabled} />
          <div>
            <p className="text-[13px] font-medium">{field.label}</p>
            {field.help && <p className="text-[12.5px] text-neutral-500">{field.help}</p>}
          </div>
        </div>
      );
    case "select":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error}>
          <Select {...common} value={str} onChange={(e) => onChange(e.target.value || null)}>
            {(!field.required || !str) && <option value="">{field.required ? "Choose…" : "—"}</option>}
            {field.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </FieldShell>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset>
          <legend className="mb-1 text-[13px] font-medium">{field.label}</legend>
          <div className="flex flex-wrap gap-3">
            {field.options.map((o) => (
              <label key={o} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-[#9c7a1e]"
                  checked={selected.includes(o)}
                  disabled={ctx.disabled}
                  onChange={(e) => onChange(e.target.checked ? [...selected, o] : selected.filter((s) => s !== o))}
                />
                {o === "home" ? "Homepage" : o}
              </label>
            ))}
          </div>
          {error ? <p className="mt-1 text-[13px] text-red-600">{error}</p> : field.help && <p className="mt-1 text-[12.5px] text-neutral-500">{field.help}</p>}
        </fieldset>
      );
    }
    case "date":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error}>
          <Input {...common} type="date" value={str.slice(0, 10)} onChange={(e) => onChange(e.target.value || null)} />
        </FieldShell>
      );
    case "stringList":
      return <StringListField field={field} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} path={path} ctx={ctx} />;
    case "list":
      return <ListField field={field} value={Array.isArray(value) ? (value as Values[]) : []} onChange={onChange} path={path} ctx={ctx} />;
    case "object":
      return <ObjectField field={field} value={(value as Values | null) ?? null} onChange={onChange} path={path} ctx={ctx} />;
    case "reference":
      return <ReferenceField field={field} value={value} onChange={onChange} id={id} error={error} common={common} />;
  }
}

function CharCount({ value, max }: { value: string; max: number }) {
  const n = value.length;
  if (n < max * 0.7) return null;
  return <span className={cx("text-xs tabular-nums", n > max ? "text-red-600" : "text-neutral-500")}>{`${n}/${max}`}</span>;
}

function MarkdownField({ field, value, onChange, id, error, common }: { field: FieldDef; value: string; onChange(v: string): void; id: string; error?: string; common: object }) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  return (
    <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error}>
      <div className="mb-1.5 inline-flex rounded-lg bg-neutral-100 p-0.5 text-[13px]" role="tablist" aria-label={`${field.label} mode`}>
        {(["write", "preview"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cx("rounded-md px-2.5 py-1 capitalize", tab === t ? "bg-white shadow-sm" : "text-neutral-600")}>
            {t}
          </button>
        ))}
      </div>
      {tab === "write" ? (
        <Textarea {...common} rows={16} className="font-mono text-[13px]" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="prose-preview min-h-40 rounded-lg border border-neutral-200 bg-white p-4 text-sm">{value ? <Markdown source={value} /> : <p className="text-neutral-400">Nothing to preview yet.</p>}</div>
      )}
    </FieldShell>
  );
}

function ImageField({ field, value, onChange, id, error, ctx }: { field: FieldDef; value: string; onChange(v: string | null): void; id: string; error?: string; ctx: FieldContext }) {
  const [open, setOpen] = useState(false);
  const src = assetUrl(value, ctx.siteUrl);
  return (
    <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error}>
      <div className={cx("flex gap-3 rounded-lg border bg-white p-2", error ? "border-red-500" : "border-neutral-300")}>
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-neutral-100">
          {src ? <img src={src} alt="" className="size-full object-cover" /> : <ImagePlus className="size-5 text-neutral-400" aria-hidden />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <Input id={id} value={value} placeholder="Choose from the library, or paste a URL" disabled={ctx.disabled} onChange={(e) => onChange(e.target.value || null)} className="h-8 text-[13px]" />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setOpen(true)} disabled={ctx.disabled}>
              {value ? "Change" : "Choose image"}
            </Button>
            {value && (
              <Button size="sm" variant="ghost" onClick={() => onChange(null)} disabled={ctx.disabled}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
      <MediaPicker open={open} onOpenChange={setOpen} onSelect={(url) => onChange(url)} />
    </FieldShell>
  );
}

function ReferenceField({ field, value, onChange, id, error, common }: { field: Extract<FieldDef, { type: "reference" }>; value: unknown; onChange(v: unknown): void; id: string; error?: string; common: object }) {
  const q = useQuery({ queryKey: ["collection", field.collection, "options"], queryFn: () => api<{ items: Item[] }>(`/api/admin/collections/${field.collection}?take=500`) });
  const byNumber = field.valueField === "number";
  const str = value === null || value === undefined ? "" : String(value);
  return (
    <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error}>
      <Select {...common} value={str} onChange={(e) => onChange(e.target.value === "" ? null : byNumber ? Number(e.target.value) : e.target.value)}>
        <option value="">{q.isLoading ? "Loading…" : field.required ? "Choose…" : "—"}</option>
        {q.data?.items.map((i) => {
          const v = byNumber ? String(i.values.number) : i.id;
          const name = String(i.values.name ?? i.values.title ?? i.id);
          return (
            <option key={i.id} value={v}>
              {byNumber ? `${i.values.number}. ${name}` : name}
            </option>
          );
        })}
      </Select>
    </FieldShell>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  const next = [...arr];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

function ItemControls({ index, count, onMove, onRemove, onDuplicate, label, disabled }: { index: number; count: number; onMove(to: number): void; onRemove(): void; onDuplicate?: () => void; label: string; disabled?: boolean }) {
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30" disabled={disabled || index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="size-3.5" />
      </button>
      <button type="button" className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30" disabled={disabled || index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="size-3.5" />
      </button>
      {onDuplicate && (
        <button type="button" className="rounded p-1 text-neutral-500 hover:bg-neutral-100" disabled={disabled} onClick={onDuplicate} aria-label={`Duplicate ${label}`}>
          <Copy className="size-3.5" />
        </button>
      )}
      <button type="button" className="rounded p-1 text-neutral-500 hover:bg-red-50 hover:text-red-600" disabled={disabled} onClick={onRemove} aria-label={`Remove ${label}`}>
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function StringListField({ field, value, onChange, path, ctx }: { field: Extract<FieldDef, { type: "stringList" }>; value: string[]; onChange(v: string[]): void; path: string; ctx: FieldContext }) {
  const itemLabel = field.itemLabel ?? "Item";
  const full = !!field.maxItems && value.length >= field.maxItems;
  const error = ctx.errors[path];
  return (
    <fieldset>
      <legend className="mb-1 text-[13px] font-medium">
        {field.label}
        {field.required && <span className="text-red-600"> *</span>}
      </legend>
      {field.help && <p className="-mt-0.5 mb-1.5 text-[12.5px] text-neutral-500">{field.help}</p>}
      <ol className="space-y-1.5">
        {value.map((v, i) => {
          const itemError = ctx.errors[`${path}.${i}`];
          const long = (field.maxLength ?? 2000) > 300;
          return (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-2 w-5 shrink-0 text-right text-xs tabular-nums text-neutral-400">{i + 1}</span>
              <div className="min-w-0 flex-1">
                {long && v.length > 80 ? (
                  <Textarea aria-label={`${itemLabel} ${i + 1}`} rows={3} value={v} invalid={!!itemError} disabled={ctx.disabled} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
                ) : (
                  <Input aria-label={`${itemLabel} ${i + 1}`} value={v} invalid={!!itemError} disabled={ctx.disabled} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
                )}
                {itemError && <p className="mt-0.5 text-[12.5px] text-red-600">{itemError}</p>}
              </div>
              <ItemControls index={i} count={value.length} label={`${itemLabel.toLowerCase()} ${i + 1}`} disabled={ctx.disabled} onMove={(to) => onChange(move(value, i, to))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
            </li>
          );
        })}
      </ol>
      <Button size="sm" variant="ghost" className="mt-1.5" icon={<Plus className="size-3.5" />} disabled={ctx.disabled || full} onClick={() => onChange([...value, ""])}>
        Add {itemLabel.toLowerCase()}
      </Button>
      {error && <p className="mt-1 text-[13px] text-red-600">{error}</p>}
    </fieldset>
  );
}

function ListField({ field, value, onChange, path, ctx }: { field: Extract<FieldDef, { type: "list" }>; value: Values[]; onChange(v: Values[]): void; path: string; ctx: FieldContext }) {
  const itemLabel = field.itemLabel ?? "Item";
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const full = !!field.maxItems && value.length >= field.maxItems;
  const error = ctx.errors[path];
  return (
    <fieldset>
      <legend className="mb-1 text-[13px] font-medium">
        {field.label} <span className="font-normal text-neutral-400">({value.length})</span>
      </legend>
      {field.help && <p className="-mt-0.5 mb-1.5 text-[12.5px] text-neutral-500">{field.help}</p>}
      <ol className="space-y-1.5">
        {value.map((item, i) => {
          const open = openIndex === i;
          const errs = nestedErrorCount(ctx.errors, `${path}.${i}`);
          const title = plain(field.titleField ? item?.[field.titleField] : "") || `${itemLabel} ${i + 1}`;
          return (
            <li key={i} className={cx("rounded-lg border bg-white", errs ? "border-red-300" : "border-neutral-200")}>
              <div className="flex items-center gap-1 pl-1 pr-1.5">
                <button type="button" className="flex min-w-0 flex-1 items-center gap-1.5 px-1 py-2 text-left text-sm" aria-expanded={open} onClick={() => setOpenIndex(open ? null : i)}>
                  {open ? <ChevronDown className="size-4 shrink-0 text-neutral-400" /> : <ChevronRight className="size-4 shrink-0 text-neutral-400" />}
                  <span className="truncate">{title}</span>
                  {errs > 0 && <span className="shrink-0 text-xs text-red-600">{errs} to fix</span>}
                </button>
                <ItemControls
                  index={i}
                  count={value.length}
                  label={title}
                  disabled={ctx.disabled}
                  onMove={(to) => {
                    onChange(move(value, i, to));
                    setOpenIndex(open ? to : openIndex);
                  }}
                  onDuplicate={full ? undefined : () => onChange([...value.slice(0, i + 1), structuredClone(item), ...value.slice(i + 1)])}
                  onRemove={() => {
                    onChange(value.filter((_, j) => j !== i));
                    setOpenIndex(null);
                  }}
                />
              </div>
              {open && (
                <div className="border-t border-neutral-100 p-3">
                  <Fields fields={field.fields} values={item ?? {}} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} path={`${path}.${i}`} ctx={ctx} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <Button
        size="sm"
        variant="ghost"
        className="mt-1.5"
        icon={<Plus className="size-3.5" />}
        disabled={ctx.disabled || full}
        onClick={() => {
          onChange([...value, emptyValues(field.fields)]);
          setOpenIndex(value.length);
        }}
      >
        Add {itemLabel.toLowerCase()}
      </Button>
      {error && <p className="mt-1 text-[13px] text-red-600">{error}</p>}
    </fieldset>
  );
}

function ObjectField({ field, value, onChange, path, ctx }: { field: Extract<FieldDef, { type: "object" }>; value: Values | null; onChange(v: Values | null): void; path: string; ctx: FieldContext }) {
  if (!value) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium">{field.label}</p>
            {field.help && <p className="text-[12.5px] text-neutral-500">{field.help}</p>}
          </div>
          <Button size="sm" icon={<Plus className="size-3.5" />} disabled={ctx.disabled} onClick={() => onChange(emptyValues(field.fields))}>
            Add
          </Button>
        </div>
        {ctx.errors[path] && <p className="mt-1 text-[13px] text-red-600">{ctx.errors[path]}</p>}
      </div>
    );
  }
  return (
    <fieldset className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <legend className="text-[13px] font-medium">{field.label}</legend>
        {!field.required && (
          <Button size="sm" variant="ghost" disabled={ctx.disabled} onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
      {field.help && <p className="-mt-1 mb-2 text-[12.5px] text-neutral-500">{field.help}</p>}
      <Fields fields={field.fields} values={value} onChange={onChange} path={path} ctx={ctx} />
    </fieldset>
  );
}

