import type { FieldDef } from "./fields.js";

export interface SectionTypeDef {
  type: string;
  label: string;
  description?: string;
  fields: FieldDef[];
  /** Generic types can be used on custom pages. */
  generic?: boolean;
}

export interface SystemPageDef {
  key: string;
  path: string;
  title: string;
  description: string;
  sections: { key: string; type: string; label: string }[];
}
