import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { FieldDef, Schema, Values } from "./types";

export function useSchema() {
  return useQuery({ queryKey: ["schema"], queryFn: () => api<Schema>("/api/admin/schema"), staleTime: Infinity });
}

/** Default value for a new field, matching what the backend stores for "empty". */
export function emptyValue(field: FieldDef): unknown {
  switch (field.type) {
    case "boolean":
      return false;
    case "stringList":
    case "list":
    case "multiselect":
      return [];
    case "object":
      return field.required ? emptyValues(field.fields) : null;
    default:
      return null;
  }
}

export function emptyValues(fields: FieldDef[]): Values {
  return Object.fromEntries(fields.map((f) => [f.name, emptyValue(f)]));
}

/** Plain text for list rows and headings: the highlight markers (*word*) are an editing convention. */
export const plain = (v: unknown) => (typeof v === "string" ? v.replace(/\*/g, "") : v == null ? "" : String(v));
