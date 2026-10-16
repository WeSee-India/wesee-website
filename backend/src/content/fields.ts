import { z, type ZodType } from "zod";

/**
 * Editable-field definitions. Every piece of admin-managed content is described
 * with these, once. The backend turns them into Zod validators; the admin app
 * receives them as JSON (GET /api/admin/schema) and renders its forms from them.
 *
 * Content is always structured data. There is no raw-HTML field: text is plain
 * text, `markdown` is rendered by the client into React elements (no HTML
 * passthrough), and links/images are restricted to safe URL schemes.
 */

interface Base {
  name: string;
  label: string;
  required?: boolean;
  help?: string;
  /** Layout hint for the admin form. */
  width?: "full" | "half";
}

export type FieldDef =
  | (Base & { type: "text"; maxLength?: number; multiline?: boolean; placeholder?: string; suggestions?: string[] })
  | (Base & { type: "markdown"; maxLength?: number })
  | (Base & { type: "url"; placeholder?: string })
  | (Base & { type: "image" })
  | (Base & { type: "number"; min?: number; max?: number; integer?: boolean })
  | (Base & { type: "boolean" })
  | (Base & { type: "select"; options: readonly string[] })
  | (Base & { type: "multiselect"; options: readonly string[] })
  | (Base & { type: "date" })
  | (Base & { type: "stringList"; maxItems?: number; itemLabel?: string; maxLength?: number })
  | (Base & { type: "list"; fields: FieldDef[]; itemLabel?: string; titleField?: string; maxItems?: number })
  | (Base & { type: "object"; fields: FieldDef[] })
  | (Base & { type: "reference"; collection: string; valueField?: string });

/** Links: site-relative paths, anchors, http(s), mailto and tel. Blocks javascript: and data: URLs. */
const SAFE_URL = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;
/** Images: site-relative paths (public assets or /uploads) or http(s). */
const SAFE_IMAGE = /^(\/(?!\/)|https?:\/\/)/i;

const DEFAULT_TEXT_MAX = 2000;
const DEFAULT_MARKDOWN_MAX = 100_000;

/** Optional values arrive as "", null or missing; normalise all of them to null. */
function optional<T extends ZodType>(schema: T) {
  return z.preprocess((v) => (v === "" || v === undefined ? null : v), schema.nullable());
}

export function fieldSchema(field: FieldDef): ZodType {
  const req = field.required;
  const label = field.label;
  switch (field.type) {
    case "text":
    case "markdown": {
      const max = field.maxLength ?? (field.type === "markdown" ? DEFAULT_MARKDOWN_MAX : DEFAULT_TEXT_MAX);
      const base = z.string().trim().max(max, `${label} must be ${max.toLocaleString()} characters or fewer.`);
      return req ? base.min(1, `${label} is required.`) : optional(base);
    }
    case "url": {
      const base = z.string().trim().max(2000).regex(SAFE_URL, `${label} must start with /, #, https://, mailto: or tel:.`);
      return req ? base : optional(base);
    }
    case "image": {
      const base = z.string().trim().max(2000).regex(SAFE_IMAGE, `${label} must be an uploaded image or an https:// URL.`);
      return req ? base : optional(base);
    }
    case "number": {
      let base = z.coerce.number({ message: `${label} must be a number.` });
      if (field.integer) base = base.int(`${label} must be a whole number.`);
      if (field.min !== undefined) base = base.min(field.min, `${label} must be at least ${field.min}.`);
      if (field.max !== undefined) base = base.max(field.max, `${label} must be at most ${field.max}.`);
      return req ? base : optional(base);
    }
    case "boolean":
      return z.boolean().default(false);
    case "select": {
      const base = z.enum(field.options as [string, ...string[]], { message: `Choose a valid ${label.toLowerCase()}.` });
      return req ? base : optional(base);
    }
    case "multiselect":
      return z.array(z.enum(field.options as [string, ...string[]])).default([]);
    case "date": {
      const base = z.coerce.date({ message: `${label} must be a valid date.` });
      return req ? base : optional(base);
    }
    case "stringList": {
      const item = z.string().trim().min(1, `Remove empty ${(field.itemLabel ?? "item").toLowerCase()}s.`).max(field.maxLength ?? DEFAULT_TEXT_MAX);
      let base = z.array(item);
      if (field.maxItems) base = base.max(field.maxItems, `${label} can have at most ${field.maxItems} items.`);
      if (req) base = base.min(1, `Add at least one ${(field.itemLabel ?? "item").toLowerCase()}.`);
      return base.default([]);
    }
    case "list": {
      let base = z.array(objectSchema(field.fields));
      if (field.maxItems) base = base.max(field.maxItems, `${label} can have at most ${field.maxItems} items.`);
      if (req) base = base.min(1, `Add at least one ${(field.itemLabel ?? "item").toLowerCase()}.`);
      return base.default([]);
    }
    case "object": {
      const base = objectSchema(field.fields);
      return req ? base : optional(base);
    }
    case "reference": {
      const base = field.valueField === "number" ? z.coerce.number().int() : z.string().min(1);
      return req ? base : optional(base);
    }
  }
}

export function objectSchema(fields: FieldDef[]) {
  const shape: Record<string, ZodType> = {};
  for (const f of fields) shape[f.name] = fieldSchema(f);
  // strip unknown keys so only defined fields are ever stored
  return z.object(shape).strip();
}

/** Empty value for a new item, used to build default content. */
export function emptyValue(field: FieldDef): unknown {
  switch (field.type) {
    case "boolean":
      return false;
    case "stringList":
    case "list":
    case "multiselect":
      return [];
    default:
      return null;
  }
}

/** Every URL-ish string inside a value, used to find where a media file is used. */
export function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

// Small helpers to keep definitions readable.
export const text = (name: string, label: string, opts: Partial<Extract<FieldDef, { type: "text" }>> = {}): FieldDef => ({ type: "text", name, label, ...opts });
export const longText = (name: string, label: string, opts: Partial<Extract<FieldDef, { type: "text" }>> = {}): FieldDef => ({ type: "text", name, label, multiline: true, ...opts });
export const markdown = (name: string, label: string, opts: Partial<Base> = {}): FieldDef => ({ type: "markdown", name, label, ...opts });
export const url = (name: string, label: string, opts: Partial<Base> = {}): FieldDef => ({ type: "url", name, label, ...opts });
export const image = (name: string, label: string, opts: Partial<Base> = {}): FieldDef => ({ type: "image", name, label, ...opts });
export const bool = (name: string, label: string, opts: Partial<Base> = {}): FieldDef => ({ type: "boolean", name, label, ...opts });
export const select = (name: string, label: string, options: readonly string[], opts: Partial<Base> = {}): FieldDef => ({ type: "select", name, label, options, ...opts });
export const strings = (name: string, label: string, opts: Partial<Extract<FieldDef, { type: "stringList" }>> = {}): FieldDef => ({ type: "stringList", name, label, ...opts });
export const list = (name: string, label: string, fields: FieldDef[], opts: Partial<Extract<FieldDef, { type: "list" }>> = {}): FieldDef => ({ type: "list", name, label, fields, ...opts });
export const object = (name: string, label: string, fields: FieldDef[], opts: Partial<Base> = {}): FieldDef => ({ type: "object", name, label, fields, ...opts });
export const link = (name: string, label: string, opts: Partial<Base> = {}): FieldDef =>
  object(name, label, [text("label", "Label", { required: true, maxLength: 80, width: "half" }), url("href", "Link", { required: true, width: "half" })], opts);
export const imageWithAlt = (name: string, label: string, opts: Partial<Base> & { caption?: boolean } = {}): FieldDef =>
  object(
    name,
    label,
    [
      image("src", "Image", { required: true }),
      text("alt", "Alt text", { maxLength: 300, help: "Describe the image for screen readers. Leave empty if purely decorative." }),
      ...(opts.caption ? [text("caption", "Caption", { maxLength: 300 })] : []),
    ],
    opts,
  );
