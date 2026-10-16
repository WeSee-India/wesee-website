/** Mirrors backend/src/content/fields.ts and the admin API responses. */

interface Base {
  name: string;
  label: string;
  required?: boolean;
  help?: string;
  width?: "full" | "half";
}

export type FieldDef =
  | (Base & { type: "text"; maxLength?: number; multiline?: boolean; placeholder?: string; suggestions?: string[] })
  | (Base & { type: "markdown"; maxLength?: number })
  | (Base & { type: "url"; placeholder?: string })
  | (Base & { type: "image" })
  | (Base & { type: "number"; min?: number; max?: number; integer?: boolean })
  | (Base & { type: "boolean" })
  | (Base & { type: "select"; options: string[] })
  | (Base & { type: "multiselect"; options: string[] })
  | (Base & { type: "date" })
  | (Base & { type: "stringList"; maxItems?: number; itemLabel?: string; maxLength?: number })
  | (Base & { type: "list"; fields: FieldDef[]; itemLabel?: string; titleField?: string; maxItems?: number })
  | (Base & { type: "object"; fields: FieldDef[] })
  | (Base & { type: "reference"; collection: string; valueField?: string });

export type Values = Record<string, unknown>;

export type Role = "OWNER" | "ADMIN" | "EDITOR";
export type Permission =
  | "content.edit"
  | "content.publish"
  | "content.delete"
  | "structure.edit"
  | "media.upload"
  | "media.delete"
  | "settings.edit"
  | "audit.view"
  | "users.manage";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
}

export interface CollectionDef {
  key: string;
  model: string;
  label: string;
  singular: string;
  description: string;
  titleField: string;
  subtitleField?: string;
  publishable: boolean;
  slugFrom: string | null;
  ordering: "manual" | "publishedAt";
  fields: FieldDef[];
  listColumns?: string[];
  adminOnly?: boolean;
  hasPublicPage: boolean;
}

export interface SectionTypeDef {
  type: string;
  label: string;
  description?: string;
  fields: FieldDef[];
  generic?: boolean;
}

export interface SystemPageDef {
  key: string;
  path: string;
  title: string;
  description: string;
  sections: { key: string; type: string; label: string }[];
}

export interface SettingDef {
  key: string;
  label: string;
  description: string;
  fields: FieldDef[];
}

export interface Schema {
  siteUrl: string;
  collections: CollectionDef[];
  sectionTypes: SectionTypeDef[];
  systemPages: SystemPageDef[];
  pageFields: FieldDef[];
  settings: SettingDef[];
}

export type Status = "DRAFT" | "PUBLISHED";

export interface Item {
  id: string;
  status: Status;
  publishedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  hasPendingChanges: boolean;
  scheduled: boolean;
  values: Values;
  publicPath?: string | null;
}

export interface SectionState {
  key: string;
  type: string;
  label: string | null;
  visible: boolean;
  content: Values;
}

export interface PageState {
  title: string;
  path: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  noindex: boolean;
  sections: SectionState[];
}

export interface AdminPage {
  id: string;
  key: string;
  kind: "SYSTEM" | "CUSTOM";
  status: Status;
  publishedAt: string | null;
  updatedAt: string;
  description: string | null;
  hasPendingChanges: boolean;
  hasDraft: boolean;
  state: PageState;
}

export interface Revision {
  id: string;
  action: string;
  createdAt: string;
  user: string | null;
  data: Values;
}

export interface MediaAsset {
  id: string;
  url: string;
  previewUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}
